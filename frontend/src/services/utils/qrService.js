import { api } from '../api/apiClient';
import ENDPOINTS from '../api/endpoints';

/**
 * QR Kod servisi
 */
export const qrService = {
  /**
   * QR Kod oluşturur
   * @param {string|object} content - QR Kod içeriği
   * @param {object} options - QR Kod seçenekleri
   * @returns {Promise<string>} - Base64 formatında QR Kodu
   */
  generateQRCode: async (content, options = {}) => {
    try {
      // Eğer içerik karmaşık ise JSON formatına dönüştür
      let qrContent = content;
      
      if (typeof content === 'object') {
        qrContent = JSON.stringify(content);
      }
      
      // Server tarafında QR oluştur (yüksek kalite, karmaşık içerik için)
      if (qrContent.length > 500 || options.highQuality || options.logo) {
        return qrService.generateQRCodeServer(qrContent, options);
      } else {
        // Client tarafında QR oluştur (hızlı, basit içerikler için)
        // Bu kısımda normalde qr kod client tarafında oluşturulur, 
        // ancak gerekli kütüphaneler (qrcode.js vs.) eklenmesi gerekir
        // Bu nedenle şimdilik server tarafına yönlendiriyoruz
        return qrService.generateQRCodeServer(qrContent, options);
      }
    } catch (error) {
      throw new Error(`QR Kod oluşturma hatası: ${error.message}`);
    }
  },
  
  /**
   * Server tarafında QR Kod oluşturur
   * @param {string} content - QR Kod içeriği
   * @param {object} options - QR Kod seçenekleri
   * @returns {Promise<string>} - Base64 formatında QR Kodu
   */
  generateQRCodeServer: async (content, options = {}) => {
    try {
      // Varsayılan ayarlar
      const defaultOptions = {
        errorCorrectionLevel: 'M', // L: Low, M: Medium, Q: Quartile, H: High
        type: 'png',
        size: 300,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      };
      
      // Seçenekleri birleştir
      const mergedOptions = { ...defaultOptions, ...options };
      
      // API isteği gönder
      const response = await api.post(ENDPOINTS.QR_GENERATE, {
        content,
        options: mergedOptions
      });
      
      if (response.data && response.data.qrCode) {
        return response.data.qrCode; // Base64 formatında QR kodu
      }
      
      throw new Error('QR kod oluşturulamadı');
    } catch (error) {
      throw new Error(`Server QR kod oluşturma hatası: ${error.message}`);
    }
  },
  
  /**
   * QR Kodunu dosya olarak indirir
   * @param {string} qrCodeBase64 - Base64 formatında QR Kodu
   * @param {string} fileName - Dosya adı
   * @param {string} fileType - Dosya türü (png, jpeg, svg)
   */
  downloadQRCode: (qrCodeBase64, fileName = 'qrcode', fileType = 'png') => {
    try {
      // Base64 önekini kontrol et
      let base64Data = qrCodeBase64;
      if (!base64Data.startsWith('data:')) {
        base64Data = `data:image/${fileType};base64,${qrCodeBase64}`;
      }
      
      // Dosya indirme işlemi
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = `${fileName}.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      throw new Error(`QR kod indirme hatası: ${error.message}`);
    }
  },
  
  /**
   * QR Kod okuma/çözme işlemi
   * @param {File|Blob} qrCodeImage - QR Kod görüntüsü
   * @returns {Promise<string>} - QR Kod içeriği
   */
  decodeQRCode: async (qrCodeImage) => {
    try {
      // QR Kod okuma tamamen server tarafında yapılır
      const formData = new FormData();
      formData.append('file', qrCodeImage);
      
      const response = await api.upload(`${ENDPOINTS.QR_GENERATE}/decode`, formData);
      
      if (response.data && response.data.content) {
        return response.data.content;
      }
      
      throw new Error('QR kod okunamadı');
    } catch (error) {
      throw new Error(`QR kod okuma hatası: ${error.message}`);
    }
  },
  
  /**
   * QR Kodu için özelleştirilmiş logo ve renkler ekler
   * @param {string|object} content - QR Kod içeriği
   * @param {File} logo - Logo dosyası
   * @param {object} options - QR Kod seçenekleri
   * @returns {Promise<string>} - Base64 formatında QR Kodu
   */
  generateCustomQRCode: async (content, logo, options = {}) => {
    try {
      // Özelleştirilmiş QR kod her zaman server tarafında oluşturulur
      const formData = new FormData();
      
      // Eğer içerik karmaşık ise JSON formatına dönüştür
      if (typeof content === 'object') {
        formData.append('content', JSON.stringify(content));
      } else {
        formData.append('content', content);
      }
      
      // Logo varsa ekle
      if (logo instanceof File) {
        formData.append('logo', logo);
      }
      
      // Seçenekleri ekle
      formData.append('options', JSON.stringify(options));
      
      const response = await api.upload(`${ENDPOINTS.QR_GENERATE}/custom`, formData);
      
      if (response.data && response.data.qrCode) {
        return response.data.qrCode;
      }
      
      throw new Error('Özelleştirilmiş QR kod oluşturulamadı');
    } catch (error) {
      throw new Error(`Özelleştirilmiş QR kod oluşturma hatası: ${error.message}`);
    }
  }
};

export default qrService; 