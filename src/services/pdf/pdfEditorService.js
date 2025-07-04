import { api } from '../api/apiClient';
import ENDPOINTS from '../api/endpoints';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Worker'ın hazır olup olmadığını kontrol et
const isPdfWorkerReady = () => {
  return window.PDFJS_WORKER && window.PDFJS_WORKER.initialized;
};

// Worker'ın başlatılmasını sağla - bu fonksiyon worker'ı ilk başlatır veya hazır olup olmadığını kontrol eder
const ensurePdfWorkerIsReady = () => {
  // Global initPdfWorker fonksiyonu varsa kullan
  if (window.initPdfWorker && !isPdfWorkerReady()) {
    return window.initPdfWorker();
  }
  
  // Worker zaten hazır
  return isPdfWorkerReady();
};

// Servis başlatıldığında worker'ı hazırla
ensurePdfWorkerIsReady();

/**
 * PDF düzenleme servisi
 */
export const pdfEditorService = {
  /**
   * PDF dosyasını parse edip içeriğini çıkarır
   * @param {File} pdfFile - PDF dosyası
   * @returns {Promise<object>} - PDF içeriği (sayfalar, metinler, görseller)
   */
  parsePdf: async (pdfFile) => {
    try {
      // Worker'ın hazır olduğunu kontrol et
      ensurePdfWorkerIsReady();
      
      // Dosya kontrolü
      if (!pdfFile || !(pdfFile instanceof File)) {
        throw new Error('Geçerli bir PDF dosyası sağlamanız gerekiyor.');
      }
      
      // Tüm dosyalar için local parse işlemini kullan
      return pdfEditorService.parseLocalPdf(pdfFile);
    } catch (error) {
      throw new Error(`PDF parse hatası: ${error.message}`);
    }
  },
  
  /**
   * PDF dosyasını yerel olarak parse eder
   * @param {File} pdfFile - PDF dosyası
   * @returns {Promise<object>} - PDF içeriği
   */
  parseLocalPdf: async (pdfFile) => {
    return new Promise((resolve, reject) => {
      try {
        // Worker'ın hazır olduğunu kontrol et
        if (!ensurePdfWorkerIsReady()) {
          reject(new Error('PDF worker başlatılamadı. Lütfen sayfayı yenileyip tekrar deneyin.'));
          return;
        }
        
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            
            // ArrayBuffer'ı kopyala (detached olmasını önlemek için)
            const pdfJsBuffer = arrayBuffer.slice(0);
            const pdfLibBuffer = arrayBuffer.slice(0);
            
            // PDF.js ile PDF'i yükle
            const loadingTask = pdfjsLib.getDocument({ data: pdfJsBuffer });
            const pdfJsDoc = await loadingTask.promise;
            
            const pageCount = pdfJsDoc.numPages;
            const pages = [];
            
            // Her sayfayı işle
            for (let i = 1; i <= pageCount; i++) {
              const page = await pdfJsDoc.getPage(i);
              const viewport = page.getViewport({ scale: 1.0 });
              
              pages.push({
                pageNumber: i,
                width: viewport.width,
                height: viewport.height,
              });
            }
            
            try {
              // PDF-lib ile de aç (metadata için)
              const pdfDoc = await PDFDocument.load(pdfLibBuffer);
              
              resolve({
                pageCount,
                pages,
                documentInfo: {
                  title: pdfDoc.getTitle() || '',
                  author: pdfDoc.getAuthor() || '',
                  subject: pdfDoc.getSubject() || '',
                  keywords: pdfDoc.getKeywords() || '',
                  creator: pdfDoc.getCreator() || '',
                  producer: pdfDoc.getProducer() || '',
                  creationDate: pdfDoc.getCreationDate(),
                  modificationDate: pdfDoc.getModificationDate()
                }
              });
            } catch (metadataError) {
              // Metadata okunamasa bile PDF'i göster
              console.warn('Metadata okunamadı:', metadataError);
              resolve({
                pageCount,
                pages,
                documentInfo: {
                  title: '',
                  author: '',
                  subject: '',
                  keywords: '',
                  creator: '',
                  producer: ''
                }
              });
            }
          } catch (error) {
            console.error('PDF işleme hatası:', error);
            // Worker yıkıldıysa worker'ı yeniden başlat, ama sadece bir kez
            if (error.message && (error.message.includes('Worker was destroyed') || 
                error.message.includes('worker')) || 
                error.name === 'WorkerError') {
              console.warn('PDF Worker sıfırlanıyor...');
              
              // Worker'ı resetle (sadece bir kere dene)
              if (window.resetPdfWorker) {
                window.resetPdfWorker();
              }
              
              // Hata mesajı döndür
              reject(new Error('PDF işlenirken bir hata oluştu, lütfen tekrar deneyin.'));
            } else {
              reject(new Error(`PDF dosyası yüklenemedi: ${error.message}`));
            }
          }
        };
        
        reader.onerror = (error) => {
          console.error('Dosya okuma hatası:', error);
          reject(new Error('Dosya okuma hatası'));
        };
        
        reader.readAsArrayBuffer(pdfFile);
      } catch (error) {
        console.error('PDF parse başlangıç hatası:', error);
        reject(new Error(`PDF parse hatası: ${error.message}`));
      }
    });
  },
  
  /**
   * PDF dosyasını düzenler
   * @param {File|ArrayBuffer} pdfFile - PDF dosyası veya array buffer
   * @param {object} edits - Düzenleme işlemleri
   * @param {object} options - Seçenekler 
   * @returns {Promise<Blob>} - Düzenlenmiş PDF içeriği
   */
  editPdf: async (pdfFile, edits, options = {}) => {
    try {
      // Tüm dosyalar için local düzenleme kullan
      return pdfEditorService.editLocalPdf(pdfFile, edits, options);
    } catch (error) {
      throw new Error(`PDF düzenleme hatası: ${error.message}`);
    }
  },
  
  /**
   * PDF dosyasını yerel olarak düzenler
   * @param {File|ArrayBuffer} pdfSource - PDF dosyası veya array buffer
   * @param {object} edits - Düzenleme işlemleri 
   * @param {object} options - Seçenekler
   * @returns {Promise<Blob>} - Düzenlenmiş PDF içeriği
   */
  editLocalPdf: async (pdfSource, edits, options = {}) => {
    try {
      let arrayBuffer;
      
      // Dosya veya ArrayBuffer kontrolü
      if (pdfSource instanceof File) {
        try {
          arrayBuffer = await pdfSource.arrayBuffer();
        } catch (fileError) {
          console.error('Dosya okuma hatası:', fileError);
          throw new Error(`Dosya okunamadı: ${fileError.message}`);
        }
      } else if (pdfSource instanceof ArrayBuffer) {
        // ArrayBuffer'ı kopyala (detached olmasını önlemek için)
        arrayBuffer = pdfSource.slice(0);
      } else {
        throw new Error('PDF kaynağı geçersiz. Dosya veya ArrayBuffer sağlayın.');
      }
      
      // PDF dokümanını yükle
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } catch (loadError) {
        console.error('PDF yükleme hatası:', loadError);
        throw new Error(`PDF yüklenemedi: ${loadError.message}`);
      }
      
      // Metin eklemeleri
      if (edits.addText && edits.addText.length > 0) {
        try {
          // Standart font yükle
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          
          for (const textItem of edits.addText) {
            const { pageIndex, text, x, y, fontSize = 12, color = { r: 0, g: 0, b: 0 } } = textItem;
            
            if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
              continue;
            }
            
            const page = pdfDoc.getPage(pageIndex);
            page.drawText(text, {
              x,
              y,
              font,
              size: fontSize,
              color: rgb(color.r / 255, color.g / 255, color.b / 255)
            });
          }
        } catch (textError) {
          console.error('Metin ekleme hatası:', textError);
        }
      }
      
      // Resim eklemeleri
      if (edits.addImage && edits.addImage.length > 0) {
        for (const imageItem of edits.addImage) {
          const { pageIndex, imageData, x, y, width, height } = imageItem;
          
          if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount() || !imageData) {
            continue;
          }
          
          // Base64 formatındaki resmi çöz
          const imageBytes = Uint8Array.from(atob(imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')), c => c.charCodeAt(0));
          
          // Resim formatına göre işle
          let image;
          if (imageData.includes('image/png')) {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            image = await pdfDoc.embedJpg(imageBytes);
          }
          
          const page = pdfDoc.getPage(pageIndex);
          page.drawImage(image, {
            x,
            y,
            width: width || image.width,
            height: height || image.height
          });
        }
      }
      
      // Metadata düzenlemeleri
      if (edits.metadata) {
        const { title, author, subject, keywords, creator } = edits.metadata;
        
        if (title) pdfDoc.setTitle(title);
        if (author) pdfDoc.setAuthor(author);
        if (subject) pdfDoc.setSubject(subject);
        if (keywords) pdfDoc.setKeywords(keywords);
        if (creator) pdfDoc.setCreator(creator);
      }
      
      // Düzenlenen PDF'i kaydet
      try {
        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
      } catch (saveError) {
        console.error('PDF kaydetme hatası:', saveError);
        throw new Error(`PDF kaydedilemedi: ${saveError.message}`);
      }
    } catch (error) {
      console.error('PDF düzenleme ana hatası:', error);
      throw new Error(`Yerel PDF düzenleme hatası: ${error.message}`);
    }
  },
  
  /**
   * Düzenlenmiş PDF'i indirir
   * @param {Blob} pdfBlob - PDF blob verisi
   * @param {string} fileName - Dosya adı
   */
  downloadPdf: (pdfBlob, fileName = 'edited-document.pdf') => {
    try {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`PDF indirme hatası: ${error.message}`);
    }
  },
  
  /**
   * PDF dosyasından metin içeriğini çıkarır
   * @param {ArrayBuffer} pdfBytes - PDF verisi
   * @param {number} pageNumber - Sayfa numarası
   * @returns {Promise<Array>} - Çıkarılan metin öğeleri
   */
  extractTextContent: async (pdfBytes, pageNumber) => {
    return new Promise(async (resolve, reject) => {
      if (!pdfBytes || pdfBytes.length === 0) {
        return resolve([]);
      }
      
      // Worker hazır değilse işlemi yapma
      if (!ensurePdfWorkerIsReady()) {
        console.warn('PDF worker hazır değil, metin çıkarma atlanıyor');
        return resolve([]);
      }
      
      try {
        // PDF'i yükle
        const loadingTask = pdfjsLib.getDocument({data: pdfBytes});
        
        try {
          const pdf = await loadingTask.promise;
          
          // Sayfa sınırlarını kontrol et
          if (pageNumber < 1 || pageNumber > pdf.numPages) {
            throw new Error(`Geçersiz sayfa numarası: ${pageNumber}`);
          }
          
          // Sayfayı al
          const page = await pdf.getPage(pageNumber);
          
          // Metinleri çıkar
          const textContent = await page.getTextContent();
          
          const extractedItems = [];
          
          // Her bir metin öğesini işle
          textContent.items.forEach((item, index) => {
            if (item.str && item.str.trim() !== '') {
              const { str, transform, width, height, fontName } = item;
              
              // Metni ve konumunu kaydet
              extractedItems.push({
                id: `extracted_text_${pageNumber}_${index}`,
                text: str,
                position: {
                  x: transform[4], // x koordinatı
                  y: transform[5], // y koordinatı
                },
                width,
                height,
                fontSize: transform[0], // Font boyutu yaklaşık olarak transform[0] değeri
                fontName: fontName || 'unknown',
                page: pageNumber,
                isExtracted: true
              });
            }
          });
          
          // Kaynakları temizle
          page.cleanup();
          pdf.destroy();
          
          resolve(extractedItems);
        } catch (pageError) {
          console.error('PDF sayfası yükleme hatası:', pageError);
          
          // Sadece ciddi worker hatası durumunda worker'ı sıfırla
          if (pageError.message && 
              (pageError.message.includes('Worker was destroyed') || 
               pageError.name === 'WorkerError')) {
            
            console.warn('Worker hatası nedeniyle PDF işleme hatası');
            
            // Worker'ı bir kere resetlemeyi dene
            if (window.resetPdfWorker) {
              window.resetPdfWorker();
            }
          }
          
          // Boş sonuç döndür
          resolve([]);
        }
      } catch (error) {
        console.error('PDF metin çıkarma hatası:', error);
        resolve([]);
      }
    });
  },
  
  /**
   * PDF içindeki metni düzenler
   * @param {ArrayBuffer} pdfData - PDF array buffer verisi
   * @param {Array} originalTextItems - Orijinal metin öğeleri
   * @param {Array} editedTextItems - Düzenlenmiş metin öğeleri
   * @returns {Promise<Blob>} - Düzenlenmiş PDF verisi
   */
  editPdfText: async (pdfData, originalTextItems, editedTextItems) => {
    try {
      // ArrayBuffer kopya
      const pdfDataCopy = pdfData.slice(0);
      
      // Orijinal PDF'i yükle
      const pdfDoc = await PDFDocument.load(pdfDataCopy);
      
      // Düzenlenmiş metin öğelerini uygula
      for (const editedItem of editedTextItems) {
        // Orijinal öğeyi bul
        const originalItem = originalTextItems.find(item => item.id === editedItem.id);
        
        if (originalItem && originalItem.text !== editedItem.text) {
          // Metin farklıysa, orijinal metni gizle ve yeni metin ekle
          const pageIndex = editedItem.pageNum - 1;
          const page = pdfDoc.getPage(pageIndex);
          
          // Orijinal metni gizlemek için beyaz dikdörtgen ekle (örtme yöntemi)
          page.drawRectangle({
            x: originalItem.position.x,
            y: originalItem.position.y,
            width: originalItem.width,
            height: originalItem.height,
            color: rgb(1, 1, 1) // Beyaz
          });
          
          // Yeni metni ekle
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          page.drawText(editedItem.text, {
            x: editedItem.position.x,
            y: editedItem.position.y,
            font: font,
            size: editedItem.fontSize,
            color: rgb(0, 0, 0) // Siyah
          });
        }
      }
      
      // Düzenlenmiş PDF'i kaydet
      const pdfBytes = await pdfDoc.save();
      
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('PDF metin düzenleme hatası:', error);
      throw new Error(`PDF metin düzenleme hatası: ${error.message}`);
    }
  }
};

export default pdfEditorService; 