/**
 * PDF Sayfa Render Servisi
 * PDF.js kullanarak PDF sayfalarını render etme işlemlerini gerçekleştirir
 */
class PdfPageRenderer {
  /**
   * PDF dokümanını yükler
   * @param {Uint8Array} pdfData - PDF veri dizisi
   * @returns {Promise<Object>} - PDF.js doküman nesnesi
   */
  static async loadPdfDocument(pdfData) {
    try {
      // Worker'ın hazır olup olmadığını kontrol et
      if (window.PDFJS_WORKER && !window.PDFJS_WORKER.initialized) {
        if (window.initPdfWorker) {
          window.initPdfWorker();
        }
      }
      
      // PDF.js kütüphanesini kontrol et
      if (!window.pdfjsLib) {
        throw new Error('PDF.js kütüphanesi bulunamadı.');
      }
      
      // PDF'i yükle
      const loadingTask = window.pdfjsLib.getDocument({ data: pdfData });
      const pdfDoc = await loadingTask.promise;
      
      return pdfDoc;
    } catch (error) {
      console.error('PDF yükleme hatası:', error);
      
      // Worker hatası kontrolü
      if (error.message && (
        error.message.includes('Worker was destroyed') || 
        error.name === 'WorkerError' || 
        error.message.includes('worker')
      )) {
        // Worker'ı sıfırla
        if (window.resetPdfWorker) {
          window.resetPdfWorker();
        }
      }
      
      throw new Error(`PDF yüklenemedi: ${error.message}`);
    }
  }
  
  /**
   * PDF sayfasını render eder
   * @param {Object} pdfDoc - PDF.js doküman nesnesi
   * @param {number} pageNumber - Sayfa numarası
   * @param {number} scale - Ölçek faktörü
   * @param {HTMLCanvasElement} canvas - Render edilecek canvas
   * @returns {Promise<Object>} - Render bilgileri
   */
  static async renderPage(pdfDoc, pageNumber, scale, canvas) {
    try {
      // Sayfayı al
      const page = await pdfDoc.getPage(pageNumber);
      
      // Viewport oluştur
      const viewport = page.getViewport({ scale });
      
      // Canvas ayarları
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Basitleştirilmiş render parametreleri
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      // Render işlemi
      const renderTask = page.render(renderContext);
      await renderTask.promise;
      
      return {
        page,
        viewport,
        renderTask,
        dimensions: {
          width: viewport.width,
          height: viewport.height
        }
      };
    } catch (error) {
      console.error('Sayfa render hatası:', error);
      
      // Worker hatası kontrolü
      if (error.message && (
        error.message.includes('Worker was destroyed') || 
        error.name === 'WorkerError' || 
        error.message.includes('worker')
      )) {
        if (window.resetPdfWorker) {
          window.resetPdfWorker();
        }
      }
      
      throw new Error(`Sayfa render hatası: ${error.message}`);
    }
  }
  
  /**
   * PDF sayfasının küçük resmini oluşturur
   * @param {Object} pdfDoc - PDF.js doküman nesnesi
   * @param {number} pageNumber - Sayfa numarası
   * @param {number} scale - Ölçek faktörü (küçük bir değer olmalı, örn. 0.2)
   * @returns {Promise<string>} - Base64 formatında resim verisi
   */
  static async renderPageToThumbnail(pdfDoc, pageNumber, scale = 0.2) {
    try {
      // Sayfayı al
      const page = await pdfDoc.getPage(pageNumber);
      
      // Viewport oluştur (küçük ölçek)
      const viewport = page.getViewport({ scale });
      
      // Canvas oluştur
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Basitleştirilmiş render ayarları
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      // Render et
      const renderTask = page.render(renderContext);
      await renderTask.promise;
      
      // Küçük resmi düşük kalitede JPEG olarak döndür
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.5);
      
      // Belleği temizle
      canvas.width = 0;
      canvas.height = 0;
      
      return thumbnailUrl;
    } catch (error) {
      console.error('Küçük resim oluşturma hatası:', error);
      
      // Hata durumunda boş bir canvas döndür
      return '';
    }
  }
  
  /**
   * PDF sayfasından metin içeriğini çıkarır
   * @param {Object} pdfDoc - PDF.js doküman nesnesi
   * @param {number} pageNumber - Sayfa numarası
   * @returns {Promise<Array>} - Sayfadaki metin öğeleri
   */
  static async extractTextContent(pdfDoc, pageNumber) {
    try {
      // Sayfayı al
      const page = await pdfDoc.getPage(pageNumber);
      
      // Metin içeriğini çıkar
      const textContent = await page.getTextContent();
      
      // Viewport ölçüsünü al (metin konumları için)
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Metin öğelerini dönüştür
      const extractedText = textContent.items.map((item, index) => {
        // PDF koordinat sisteminden canvas koordinat sistemine dönüştür
        // PDF koordinatları sol alt köşeden başlar, canvas sol üst köşeden başlar
        return {
          id: `text_${pageNumber}_${index}`,
          text: item.str,
          position: {
            x: item.transform[4],
            y: item.transform[5]
          },
          width: item.width || (item.str.length * 5), // Tahmini genişlik
          height: Math.abs(item.transform[3] || 12), // Tahmini yükseklik
          fontSize: Math.abs(item.transform[0] || 12), // Tahmini font boyutu
          fontName: item.fontName || 'sans-serif',
          page: pageNumber
        };
      });
      
      return extractedText.filter(item => item.text.trim() !== '');
    } catch (error) {
      console.error('Metin çıkarma hatası:', error);
      return [];
    }
  }
  
  /**
   * PDF sayfasının boyutlarını döndürür
   * @param {Object} pdfDoc - PDF.js doküman nesnesi
   * @param {number} pageNumber - Sayfa numarası
   * @returns {Promise<Object>} - Sayfa boyutları
   */
  static async getPageDimensions(pdfDoc, pageNumber) {
    try {
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });
      
      return {
        width: viewport.width,
        height: viewport.height,
        rotation: viewport.rotation
      };
    } catch (error) {
      console.error('Sayfa boyutu alma hatası:', error);
      throw new Error(`Sayfa boyutu alınamadı: ${error.message}`);
    }
  }
}

export default PdfPageRenderer; 