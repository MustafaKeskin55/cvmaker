import { api } from '../api/apiClient';
import ENDPOINTS from '../api/endpoints';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * JSON to Excel dönüştürme servisi
 * Hem frontend hem de backend dönüşüm işlemlerini destekler
 */
export const jsonToExcelService = {
  /**
   * Frontend'de JSON'ı Excel'e dönüştürür
   * @param {object|array} jsonData - Dönüştürülecek JSON verisi
   * @param {string} fileName - İndirilecek dosya adı (.xlsx olmadan)
   * @param {object} options - Ek seçenekler
   * @returns {Promise<Blob>} Excel dosyası Blob nesnesi
   */
  convertJsonToExcelClient: async (jsonData, fileName = 'converted_data', options = {}) => {
    try {
      // JSON verisinin dizi olup olmadığını kontrol et
      if (!Array.isArray(jsonData) && typeof jsonData === 'object') {
        jsonData = [jsonData]; // Tek bir nesneyi diziye dönüştür
      }

      // JSON formatını kontrol et
      if (!Array.isArray(jsonData)) {
        throw new Error('Geçersiz JSON formatı. Lütfen geçerli bir JSON dizisi veya nesnesi sağlayın.');
      }

      // Excel çalışma kitabı oluştur
      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Veri");

      // Excel verilerini binary formatına çevir
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

      // Blob oluştur
      const excelBlob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Dosya indir seçeneği varsa dosyayı indir
      if (options.download) {
        saveAs(excelBlob, `${fileName}.xlsx`);
      }

      return excelBlob;
    } catch (error) {
      throw new Error(`JSON to Excel dönüştürme hatası: ${error.message}`);
    }
  },

  /**
   * Backend API'sini kullanarak JSON'ı Excel'e dönüştürür
   * Büyük dosyalar için idealdir
   * @param {object|array} jsonData - Dönüştürülecek JSON verisi  
   * @param {string} fileName - İndirilecek dosya adı
   * @returns {Promise} İndirme işlemi
   */
  convertJsonToExcelServer: async (jsonData, fileName = 'converted_data') => {
    try {
      // API isteği gönder
      const response = await api.post(ENDPOINTS.JSON_TO_EXCEL, {
        data: jsonData,
        fileName: fileName
      });

      // Yanıt olarak gelen download URL'sini kullan
      if (response.data && response.data.downloadUrl) {
        return api.download(response.data.downloadUrl, `${fileName}.xlsx`);
      }

      // Yanıt içinde blob varsa, doğrudan indir
      if (response.data) {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
      }

      throw new Error('Sunucudan dönüştürülen dosya alınamadı');
    } catch (error) {
      throw new Error(`JSON to Excel sunucu dönüştürme hatası: ${error.message}`);
    }
  },

  /**
   * Veri büyüklüğüne göre uygun dönüştürme metodunu seçer
   * @param {object|array} jsonData - Dönüştürülecek JSON verisi
   * @param {string} fileName - İndirilecek dosya adı
   * @param {object} options - İşlem seçenekleri
   * @returns {Promise} Dönüştürme işlemi
   */
  convertJsonToExcel: async (jsonData, fileName, options = {}) => {
    try {
      // Veri boyutunu değerlendir
      const dataSize = JSON.stringify(jsonData).length;
      
      // 5MB'dan büyük veri için backend'i kullan
      if (dataSize > 5000000) {
        return jsonToExcelService.convertJsonToExcelServer(jsonData, fileName);
      }
      
      // Küçük veri için client taraflı dönüşüm yap
      return jsonToExcelService.convertJsonToExcelClient(jsonData, fileName, {
        download: true,
        ...options
      });
    } catch (error) {
      throw new Error(`JSON to Excel dönüştürme hatası: ${error.message}`);
    }
  }
};

export default jsonToExcelService; 