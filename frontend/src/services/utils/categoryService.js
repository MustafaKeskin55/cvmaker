import { api } from '../api/apiClient';
import ENDPOINTS from '../api/endpoints';

/**
 * Kategori servisi
 * Ürün/İçerik kategorileri oluşturma ve yönetme işlemleri
 */
export const categoryService = {
  /**
   * Kategori yapısı oluşturur
   * @param {Array|object} data - Kategori verisi
   * @param {object} options - Oluşturma seçenekleri
   * @returns {Promise<object>} - Oluşturulan kategori yapısı
   */
  createCategoryStructure: async (data, options = {}) => {
    try {
      // Veri türü kontrolü
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error('Kategori yapısı oluşturmak için veri gereklidir');
      }
      
      // Veri formatına göre işlem yap
      if (options.mode === 'excel' || options.mode === 'csv') {
        // Bu durumda veri bir dosya olmalı
        if (!(data instanceof File)) {
          throw new Error('Excel/CSV modu için geçerli bir dosya sağlamanız gerekiyor');
        }
        
        return categoryService.createCategoryFromFile(data, options);
      } else {
        // JSON verisinden kategori yapısı oluştur
        return categoryService.createCategoryFromJson(data, options);
      }
    } catch (error) {
      throw new Error(`Kategori yapısı oluşturma hatası: ${error.message}`);
    }
  },
  
  /**
   * JSON verisinden kategori yapısı oluşturur
   * @param {Array|object} jsonData - JSON formatında kategori verisi
   * @param {object} options - Oluşturma seçenekleri
   * @returns {Promise<object>} - Oluşturulan kategori yapısı
   */
  createCategoryFromJson: async (jsonData, options = {}) => {
    try {
      // API isteği gönder
      const response = await api.post(ENDPOINTS.CATEGORY_CREATE, {
        data: jsonData,
        options
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`JSON'dan kategori yapısı oluşturma hatası: ${error.message}`);
    }
  },
  
  /**
   * Dosyadan kategori yapısı oluşturur (Excel, CSV)
   * @param {File} file - Excel veya CSV dosyası
   * @param {object} options - Oluşturma seçenekleri
   * @returns {Promise<object>} - Oluşturulan kategori yapısı
   */
  createCategoryFromFile: async (file, options = {}) => {
    try {
      // Dosya uzantısı kontrolü
      const fileName = file.name.toLowerCase();
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
      const isCsv = fileName.endsWith('.csv');
      
      if (!isExcel && !isCsv) {
        throw new Error('Desteklenmeyen dosya formatı. Lütfen .xlsx, .xls veya .csv dosyası yükleyin');
      }
      
      // Dosya yükle ve işle
      const formData = new FormData();
      formData.append('file', file);
      
      // Seçenekleri ekle
      Object.keys(options).forEach(key => {
        formData.append(key, 
          typeof options[key] === 'object' 
            ? JSON.stringify(options[key]) 
            : options[key]);
      });
      
      // İstek gönder
      const response = await api.upload(ENDPOINTS.CATEGORY_CREATE, formData);
      return response.data;
    } catch (error) {
      throw new Error(`Dosyadan kategori yapısı oluşturma hatası: ${error.message}`);
    }
  },
  
  /**
   * Kategori yapısını farklı formatlara dışa aktarır
   * @param {object} categoryData - Kategori yapısı
   * @param {string} format - Dışa aktarma formatı (json, excel, csv, xml)
   * @param {object} options - Dışa aktarma seçenekleri
   * @returns {Promise<Blob|object>} - Dışa aktarılan veri
   */
  exportCategoryStructure: async (categoryData, format = 'json', options = {}) => {
    try {
      // API isteği gönder
      const response = await api.post(ENDPOINTS.CATEGORY_EXPORT, {
        data: categoryData,
        format,
        options
      });
      
      // Format tipine göre işlem yap
      if (['excel', 'csv', 'xml'].includes(format)) {
        // Dosya indirme URL'si varsa
        if (response.data && response.data.downloadUrl) {
          await api.download(response.data.downloadUrl, `categories.${format === 'excel' ? 'xlsx' : format}`);
          return true;
        }
        
        // Base64 veri varsa
        if (response.data && response.data.base64Data) {
          let mimeType = 'application/octet-stream';
          let fileExt = '';
          
          // Formata göre MIME tipi belirle
          if (format === 'excel') {
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            fileExt = 'xlsx';
          } else if (format === 'csv') {
            mimeType = 'text/csv';
            fileExt = 'csv';
          } else if (format === 'xml') {
            mimeType = 'application/xml';
            fileExt = 'xml';
          }
          
          // Base64'ten blob oluştur
          const binaryString = window.atob(response.data.base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: mimeType });
          
          // Dosya indir
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `categories.${fileExt}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          return blob;
        }
      }
      
      // JSON veya diğer formatlar için doğrudan veriyi döndür
      return response.data;
    } catch (error) {
      throw new Error(`Kategori yapısı dışa aktarma hatası: ${error.message}`);
    }
  },
  
  /**
   * Kategori yapısını analiz eder
   * @param {object} categoryData - Kategori yapısı
   * @returns {Promise<object>} - Analiz sonuçları
   */
  analyzeCategoryStructure: async (categoryData) => {
    try {
      // API isteği gönder
      const response = await api.post(`${ENDPOINTS.CATEGORY_CREATE}/analyze`, {
        data: categoryData
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Kategori analiz hatası: ${error.message}`);
    }
  },
  
  /**
   * Kategori yapısını optimize eder
   * @param {object} categoryData - Kategori yapısı
   * @param {object} options - Optimizasyon seçenekleri
   * @returns {Promise<object>} - Optimize edilmiş kategori yapısı
   */
  optimizeCategoryStructure: async (categoryData, options = {}) => {
    try {
      // API isteği gönder
      const response = await api.post(`${ENDPOINTS.CATEGORY_CREATE}/optimize`, {
        data: categoryData,
        options
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Kategori yapısı optimizasyon hatası: ${error.message}`);
    }
  }
};

export default categoryService; 