import { api } from '../api/apiClient';
import ENDPOINTS from '../api/endpoints';

/**
 * Dosya işleme servisi
 * Genel dosya işlemleri için ortak fonksiyonlar
 */
export const fileService = {
  /**
   * Dosya yüklemesi yapar
   * @param {File|Array<File>} files - Yüklenecek dosya veya dosyalar
   * @param {object} options - Yükleme seçenekleri
   * @returns {Promise<object>} - Yükleme sonuçları
   */
  uploadFile: async (files, options = {}) => {
    try {
      const formData = new FormData();
      
      // Tek dosya veya çoklu dosya kontrolü
      if (Array.isArray(files)) {
        files.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });
        formData.append('fileCount', files.length);
      } else {
        formData.append('file', files);
        formData.append('fileCount', 1);
      }
      
      // Seçenekleri ekle
      Object.keys(options).forEach(key => {
        if (typeof options[key] === 'object') {
          formData.append(key, JSON.stringify(options[key]));
        } else {
          formData.append(key, options[key]);
        }
      });
      
      // Upload endpointi varsa kullan, yoksa genel upload yap
      const endpoint = options.endpoint || '/files/upload';
      
      const response = await api.upload(endpoint, formData);
      return response.data;
    } catch (error) {
      throw new Error(`Dosya yükleme hatası: ${error.message}`);
    }
  },
  
  /**
   * Dosya indirme işlemi yapar
   * @param {string} fileId - İndirilecek dosya ID'si
   * @param {string} fileName - Kaydedilecek dosya adı
   * @param {object} options - İndirme seçenekleri
   * @returns {Promise<boolean>} - İndirme durumu
   */
  downloadFile: async (fileId, fileName, options = {}) => {
    try {
      // Download endpointi oluştur
      const endpoint = options.endpoint || `/files/download/${fileId}`;
      
      // Dosyayı indir
      await api.download(endpoint, fileName);
      
      return true;
    } catch (error) {
      throw new Error(`Dosya indirme hatası: ${error.message}`);
    }
  },
  
  /**
   * Blob verisinden dosya indirme
   * @param {Blob} blob - Dosya içeriği
   * @param {string} fileName - Dosya adı
   */
  downloadBlob: (blob, fileName) => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Blob indirme hatası: ${error.message}`);
    }
  },
  
  /**
   * Dosya boyutunu kontrol eder
   * @param {File} file - Kontrol edilecek dosya
   * @param {number} maxSize - Maksimum boyut (byte)
   * @returns {boolean} - Kontrol sonucu
   */
  checkFileSize: (file, maxSize) => {
    return file.size <= maxSize;
  },
  
  /**
   * Dosya tipini kontrol eder
   * @param {File} file - Kontrol edilecek dosya
   * @param {Array<string>} allowedTypes - İzin verilen tipler
   * @returns {boolean} - Kontrol sonucu
   */
  checkFileType: (file, allowedTypes) => {
    // Dosya uzantısını kontrol et
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowedExts = allowedTypes.map(type => type.toLowerCase());
    
    return allowedExts.includes(fileExt);
  },
  
  /**
   * Dosyayı Base64 formatına dönüştürür
   * @param {File} file - Dönüştürülecek dosya
   * @returns {Promise<string>} - Base64 formatında veri
   */
  fileToBase64: async (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = () => {
          resolve(reader.result);
        };
        
        reader.onerror = () => {
          reject(new Error('Dosya okuma hatası'));
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        reject(new Error(`Base64 dönüştürme hatası: ${error.message}`));
      }
    });
  },
  
  /**
   * Base64 verisini dosyaya dönüştürür
   * @param {string} base64Data - Base64 formatında veri
   * @param {string} fileName - Dosya adı
   * @param {string} mimeType - Dosya MIME tipi
   * @returns {File} - Oluşturulan dosya
   */
  base64ToFile: (base64Data, fileName, mimeType) => {
    try {
      // Base64 önekini kontrol et ve kaldır
      const base64Content = base64Data.includes('base64,') 
        ? base64Data.split('base64,')[1]
        : base64Data;
      
      // Binary veriyi oluştur
      const byteString = window.atob(base64Content);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      // Dosya oluştur
      return new File([ab], fileName, { type: mimeType });
    } catch (error) {
      throw new Error(`Base64'ten dosya oluşturma hatası: ${error.message}`);
    }
  },
  
  /**
   * Dosyayı text olarak okur
   * @param {File} file - Okunacak dosya
   * @returns {Promise<string>} - Dosya içeriği
   */
  readFileAsText: async (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = () => {
          resolve(reader.result);
        };
        
        reader.onerror = () => {
          reject(new Error('Dosya okuma hatası'));
        };
        
        reader.readAsText(file);
      } catch (error) {
        reject(new Error(`Dosya okuma hatası: ${error.message}`));
      }
    });
  },
  
  /**
   * Dosyaları sıkıştırır
   * @param {Array<File>} files - Sıkıştırılacak dosyalar
   * @param {string} zipName - Zip dosyası adı
   * @param {object} options - Sıkıştırma seçenekleri
   * @returns {Promise<Blob>} - Zip dosyası
   */
  compressFiles: async (files, zipName, options = {}) => {
    try {
      // Sıkıştırma işlemi server tarafında yapılır
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      
      formData.append('zipName', zipName);
      formData.append('options', JSON.stringify(options));
      
      const response = await api.upload('/files/compress', formData);
      
      // Yanıt blob tipindeyse doğrudan döndür
      if (response.data instanceof Blob) {
        return response.data;
      }
      
      // İndirme URL'si varsa indir
      if (response.data && response.data.downloadUrl) {
        await api.download(response.data.downloadUrl, `${zipName}.zip`);
        return true;
      }
      
      // Base64 veri varsa
      if (response.data && response.data.base64Data) {
        const binaryString = window.atob(response.data.base64Data);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        return new Blob([bytes], { type: 'application/zip' });
      }
      
      return response.data;
    } catch (error) {
      throw new Error(`Dosya sıkıştırma hatası: ${error.message}`);
    }
  },
  
  /**
   * Zip dosyasından içerik çıkarır
   * @param {File} zipFile - Zip dosyası
   * @param {object} options - Çıkarma seçenekleri
   * @returns {Promise<Array<object>>} - Çıkarılan dosyalar
   */
  extractZip: async (zipFile, options = {}) => {
    try {
      // Zip çıkarma işlemi tamamen server tarafında yapılır
      const formData = new FormData();
      formData.append('file', zipFile);
      formData.append('options', JSON.stringify(options));
      
      const response = await api.upload('/files/extract', formData);
      return response.data;
    } catch (error) {
      throw new Error(`Zip dosyası çıkarma hatası: ${error.message}`);
    }
  }
};

export default fileService; 