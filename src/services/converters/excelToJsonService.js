import { api } from '../api/apiClient';
import ENDPOINTS from '../api/endpoints';
import * as XLSX from 'xlsx';

/**
 * Excel'den JSON'a dönüştürme servisi
 * Hem frontend hem de backend dönüşüm işlemlerini destekler
 */
export const excelToJsonService = {
  /**
   * Frontend'de Excel dosyasını JSON'a dönüştürür
   * @param {File} file - Excel dosyası
   * @param {object} options - Dönüştürme seçenekleri
   * @returns {Promise<object>} - JSON verisi
   */
  convertExcelToJsonClient: async (file, options = {}) => {
    return new Promise((resolve, reject) => {
      try {
        if (!file || !(file instanceof File)) {
          reject(new Error('Geçerli bir Excel dosyası sağlamanız gerekiyor.'));
          return;
        }

        // Geçerli dosya uzantılarını kontrol et
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExt)) {
          reject(new Error('Lütfen geçerli bir Excel dosyası seçin (.xlsx, .xls veya .csv)'));
          return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const result = {};
            
            // Her sayfayı ayrı dönüştür
            workbook.SheetNames.forEach((sheetName) => {
              // Sayfa verilerini al
              const worksheet = workbook.Sheets[sheetName];
              
              // Seçeneklere göre dönüşüm uygula
              const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: options.header || 1,
                range: options.range,
                raw: options.raw !== false, // Varsayılan olarak raw true
                dateNF: options.dateFormat || 'yyyy-mm-dd',
                defval: options.defaultValue || null
              });

              result[sheetName] = jsonData;
            });

            // Tek sayfa varsa ve teksayfa seçeneği açıksa, doğrudan veriyi döndür
            if (options.singleSheet && workbook.SheetNames.length === 1) {
              resolve(result[workbook.SheetNames[0]]);
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(new Error(`Excel verileri çözümlenemedi: ${error.message}`));
          }
        };

        reader.onerror = () => {
          reject(new Error('Dosya okuma hatası'));
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        reject(new Error(`Excel to JSON dönüştürme hatası: ${error.message}`));
      }
    });
  },

  /**
   * Backend API'sini kullanarak Excel dosyasını JSON'a dönüştürür
   * Büyük dosyalar için idealdir
   * @param {File} file - Excel dosyası
   * @param {object} options - Dönüştürme seçenekleri
   * @returns {Promise<object>} - JSON verisi
   */
  convertExcelToJsonServer: async (file, options = {}) => {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error('Geçerli bir Excel dosyası sağlamanız gerekiyor.');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      // Seçenekleri ekle
      Object.keys(options).forEach(key => {
        formData.append(key, JSON.stringify(options[key]));
      });

      // API isteği gönder
      const response = await api.upload(ENDPOINTS.EXCEL_TO_JSON, formData);
      
      return response.data;
    } catch (error) {
      throw new Error(`Excel to JSON sunucu dönüştürme hatası: ${error.message}`);
    }
  },

  /**
   * Dosya büyüklüğüne göre uygun dönüştürme metodunu seçer
   * @param {File} file - Excel dosyası
   * @param {object} options - Dönüştürme seçenekleri
   * @returns {Promise<object>} - JSON verisi
   */
  convertExcelToJson: async (file, options = {}) => {
    try {
      // 5MB'dan büyük dosyalar için backend'i kullan
      if (file.size > 5000000) {
        return excelToJsonService.convertExcelToJsonServer(file, options);
      }
      
      // Küçük dosyalar için client taraflı dönüşüm yap
      return excelToJsonService.convertExcelToJsonClient(file, options);
    } catch (error) {
      throw new Error(`Excel to JSON dönüştürme hatası: ${error.message}`);
    }
  }
};

export default excelToJsonService; 