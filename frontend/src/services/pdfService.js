import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.lazımsaburada.com/api';

/**
 * PDF işlemleri için servis fonksiyonları
 */
export const pdfService = {
  /**
   * PDF dosyasını yükler ve içeriğini parse eder
   * @param {File} file - Yüklenecek PDF dosyası
   * @returns {Promise<Object>} - PDF içeriği ve meta verileri
   */
  uploadAndParse: async (file) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await axios.post(`${API_URL}/pdf/parse`, formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
      
      return response.data;
    } catch (error) {
      console.error('PDF yükleme hatası:', error);
      throw error;
    }
  },
  
  /**
   * PDF içeriğini düzenler
   * @param {string} pdfId - Düzenlenecek PDF'in ID'si
   * @param {Object} edits - Yapılan düzenlemeler
   * @returns {Promise<Object>} - Düzenleme sonucu
   */
  savePdfEdits: async (pdfId, edits) => {
    try {
      const response = await axios.post(`${API_URL}/pdf/edit/${pdfId}`, edits);
      return response.data;
    } catch (error) {
      console.error('PDF düzenleme hatası:', error);
      throw error;
    }
  },
  
  /**
   * Düzenlenmiş PDF'i indirir
   * @param {string} pdfId - İndirilecek PDF'in ID'si
   * @returns {string} - PDF indirme URL'i
   */
  getEditedPdfUrl: (pdfId) => `${API_URL}/pdf/download/${pdfId}`,
  
  /**
   * PDF'i döndürür
   * @param {string} pdfId - Döndürülecek PDF'in ID'si
   * @param {number} angle - Döndürme açısı (derece)
   * @returns {Promise<Object>} - İşlem sonucu
   */
  rotatePdf: async (pdfId, angle) => {
    try {
      const response = await axios.post(`${API_URL}/pdf/rotate/${pdfId}`, { angle });
      return response.data;
    } catch (error) {
      console.error('PDF döndürme hatası:', error);
      throw error;
    }
  },
  
  /**
   * PDF'e metin ekler
   * @param {string} pdfId - PDF ID'si
   * @param {Object} textElement - Eklenecek metin elemanı
   * @returns {Promise<Object>} - İşlem sonucu
   */
  addTextToPdf: async (pdfId, textElement) => {
    try {
      const response = await axios.post(`${API_URL}/pdf/add-text/${pdfId}`, textElement);
      return response.data;
    } catch (error) {
      console.error('PDF metin ekleme hatası:', error);
      throw error;
    }
  },
  
  /**
   * PDF'e görsel ekler
   * @param {string} pdfId - PDF ID'si
   * @param {File} imageFile - Eklenecek görsel dosyası
   * @param {Object} position - Görselin konumu
   * @returns {Promise<Object>} - İşlem sonucu
   */
  addImageToPdf: async (pdfId, imageFile, position) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('position', JSON.stringify(position));
      
      const response = await axios.post(`${API_URL}/pdf/add-image/${pdfId}`, formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
      
      return response.data;
    } catch (error) {
      console.error('PDF görsel ekleme hatası:', error);
      throw error;
    }
  },
  
  /**
   * PDF'ten eleman siler
   * @param {string} pdfId - PDF ID'si
   * @param {string} elementId - Silinecek elemanın ID'si
   * @returns {Promise<Object>} - İşlem sonucu
   */
  deleteElementFromPdf: async (pdfId, elementId) => {
    try {
      const response = await axios.delete(`${API_URL}/pdf/delete-element/${pdfId}/${elementId}`);
      return response.data;
    } catch (error) {
      console.error('PDF eleman silme hatası:', error);
      throw error;
    }
  },
  
  /**
   * PDF sayfası siler
   * @param {string} pdfId - PDF ID'si
   * @param {number} pageNumber - Silinecek sayfa numarası
   * @returns {Promise<Object>} - İşlem sonucu
   */
  deletePageFromPdf: async (pdfId, pageNumber) => {
    try {
      const response = await axios.delete(`${API_URL}/pdf/delete-page/${pdfId}/${pageNumber}`);
      return response.data;
    } catch (error) {
      console.error('PDF sayfa silme hatası:', error);
      throw error;
    }
  },
  
  /**
   * PDF'i sıkıştırır
   * @param {string} pdfId - PDF ID'si
   * @param {string} quality - Sıkıştırma kalitesi (low, medium, high)
   * @returns {Promise<Object>} - İşlem sonucu
   */
  compressPdf: async (pdfId, quality = 'medium') => {
    try {
      const response = await axios.post(`${API_URL}/pdf/compress/${pdfId}`, { quality });
      return response.data;
    } catch (error) {
      console.error('PDF sıkıştırma hatası:', error);
      throw error;
    }
  }
};

export default pdfService; 