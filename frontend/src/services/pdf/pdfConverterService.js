import { api } from '../api/apiClient';
import ENDPOINTS from '../api/endpoints';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker'ını ayarla (önce global kontrol et)
if (!window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

/**
 * PDF dönüştürme servisi
 */
export const pdfConverterService = {
  /**
   * PDF'i görüntüye dönüştürür (PNG/JPG)
   * @param {File} pdfFile - PDF dosyası
   * @param {object} options - Dönüştürme seçenekleri
   * @returns {Promise<Array<string>>} - Base64 formatında görüntü listesi
   */
  convertPdfToImages: async (pdfFile, options = {}) => {
    try {
      // PDF.js ile PDF'i görsel olarak dönüştür
      const defaultOptions = {
        format: 'png',
        quality: 90,
        scale: 1.5,
        pageRange: 'all'
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const pageCount = pdf.numPages;
      const images = [];
      
      // Sayfa aralığını belirle
      let pageStart = 1;
      let pageEnd = pageCount;
      
      if (mergedOptions.pageRange !== 'all') {
        const range = mergedOptions.pageRange.split('-');
        pageStart = parseInt(range[0]) || 1;
        pageEnd = parseInt(range[1]) || pageCount;
        
        pageStart = Math.max(1, Math.min(pageStart, pageCount));
        pageEnd = Math.max(pageStart, Math.min(pageEnd, pageCount));
      }
      
      // Her sayfayı canvas olarak oluştur ve base64 görüntüye dönüştür
      for (let i = pageStart; i <= pageEnd; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: mergedOptions.scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Canvas'ı base64 formatına dönüştür
        const format = mergedOptions.format.toLowerCase();
        const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const quality = mergedOptions.quality / 100;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        images.push({
          pageNumber: i,
          dataUrl: dataUrl
        });
      }
      
      return images;
    } catch (error) {
      throw new Error(`PDF'i görüntüye dönüştürürken hata: ${error.message}`);
    }
  },
  
  /**
   * PDF'i metne dönüştürür
   * @param {File} pdfFile - PDF dosyası
   * @param {object} options - Dönüştürme seçenekleri
   * @returns {Promise<object>} - Metin verileri
   */
  convertPdfToText: async (pdfFile, options = {}) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const pageCount = pdf.numPages;
      const textContent = [];
      
      // PDF'in tüm sayfalarındaki metni çıkar
      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        let pageText = '';
        let lastY = null;
        
        // Metin parçalarını işle
        for (const item of content.items) {
          if (lastY !== item.transform[5] && lastY !== null) {
            pageText += '\n'; // Yeni satır
          }
          pageText += item.str;
          lastY = item.transform[5];
        }
        
        textContent.push({
          pageNumber: i,
          text: pageText
        });
      }
      
      return {
        pageCount,
        pages: textContent,
        fullText: textContent.map(page => page.text).join('\n\n-- Sayfa Sonu --\n\n')
      };
    } catch (error) {
      throw new Error(`PDF'i metne dönüştürürken hata: ${error.message}`);
    }
  },
  
  /**
   * PDF sayfaları birleştirir
   * @param {Array<File>} pdfFiles - Birleştirilecek PDF dosyaları 
   * @returns {Promise<Blob>} - Birleştirilmiş PDF
   */
  mergePdfFiles: async (pdfFiles) => {
    try {
      return pdfConverterService.mergeLocalPdfFiles(pdfFiles);
    } catch (error) {
      throw new Error(`PDF dosyalarını birleştirirken hata: ${error.message}`);
    }
  },
  
  /**
   * Yerel olarak PDF dosyalarını birleştirir
   * @param {Array<File>} pdfFiles - Birleştirilecek PDF dosyaları
   * @returns {Promise<Blob>} - Birleştirilmiş PDF
   */
  mergeLocalPdfFiles: async (pdfFiles) => {
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of pdfFiles) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        copiedPages.forEach(page => {
          mergedPdf.addPage(page);
        });
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      return new Blob([mergedPdfBytes], { type: 'application/pdf' });
    } catch (error) {
      throw new Error(`Yerel PDF birleştirme hatası: ${error.message}`);
    }
  },
  
  /**
   * PDF'i böler
   * @param {File} pdfFile - PDF dosyası
   * @param {Array<number>|object} splitInfo - Bölme bilgisi (sayfa numaraları veya aralık)
   * @returns {Promise<Array<Blob>>} - Bölünmüş PDF dosyaları
   */
  splitPdf: async (pdfFile, splitInfo) => {
    try {
      return pdfConverterService.splitLocalPdf(pdfFile, splitInfo);
    } catch (error) {
      throw new Error(`PDF dosyasını bölerken hata: ${error.message}`);
    }
  },
  
  /**
   * Yerel olarak PDF dosyasını böler
   * @param {File} pdfFile - PDF dosyası 
   * @param {Array<number>|object} splitInfo - Bölme bilgisi
   * @returns {Promise<Array<Blob>>} - Bölünmüş PDF dosyaları
   */
  splitLocalPdf: async (pdfFile, splitInfo) => {
    try {
      const fileBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const pageCount = pdf.getPageCount();
      const result = [];
      
      // Sayfa aralıklarını belirle
      let ranges = [];
      
      if (Array.isArray(splitInfo)) {
        // Belirli sayfalardan oluşan bir dizi verilmişse
        ranges = splitInfo.map(pageNum => [pageNum - 1, pageNum - 1]); // 0-tabanlı indeks
      } else if (typeof splitInfo === 'object') {
        if (splitInfo.mode === 'range') {
          // Aralık modu
          ranges = splitInfo.ranges.map(range => [
            Math.max(0, range.start - 1), 
            Math.min(pageCount - 1, range.end - 1)
          ]);
        } else if (splitInfo.mode === 'interval') {
          // Aralık modu (her N sayfa)
          const interval = splitInfo.interval || 1;
          for (let i = 0; i < pageCount; i += interval) {
            ranges.push([i, Math.min(i + interval - 1, pageCount - 1)]);
          }
        }
      }
      
      // Her aralık için yeni PDF oluştur
      for (const [start, end] of ranges) {
        const newPdf = await PDFDocument.create();
        
        // Aralıktaki sayfaları kopyala
        for (let i = start; i <= end; i++) {
          const [copiedPage] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(copiedPage);
        }
        
        const newPdfBytes = await newPdf.save();
        result.push(new Blob([newPdfBytes], { type: 'application/pdf' }));
      }
      
      return result;
    } catch (error) {
      throw new Error(`Yerel PDF bölme hatası: ${error.message}`);
    }
  },
  
  /**
   * PDF'i indir
   * @param {Blob} pdfBlob - PDF blob verisi
   * @param {string} fileName - Dosya adı
   */
  downloadPdf: (pdfBlob, fileName = 'document.pdf') => {
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
  }
};

export default pdfConverterService; 