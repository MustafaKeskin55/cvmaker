import { api } from '../api/apiClient';
import ENDPOINTS from '../api/endpoints';

/**
 * Resim dönüştürme servisi
 */
export const imageConverterService = {
  /**
   * Resim formatını değiştirir
   * @param {File} imageFile - Resim dosyası
   * @param {string} targetFormat - Hedef format (png, jpg, webp, vb.)
   * @param {object} options - Dönüştürme seçenekleri
   * @returns {Promise<Blob>} - Dönüştürülen resim
   */
  convertImageFormat: async (imageFile, targetFormat, options = {}) => {
    try {
      // Resim boyutu kontrolü
      if (imageFile.size > 2 * 1024 * 1024) { // 2MB'dan büyük ise
        return imageConverterService.convertImageServer(
          imageFile, 
          targetFormat, 
          { action: 'format', ...options }
        );
      } else {
        return imageConverterService.convertImageFormatClient(imageFile, targetFormat, options);
      }
    } catch (error) {
      throw new Error(`Resim formatı dönüştürme hatası: ${error.message}`);
    }
  },
  
  /**
   * Client tarafında resim formatını değiştirir (küçük boyutlu resimler için)
   * @param {File} imageFile - Resim dosyası
   * @param {string} targetFormat - Hedef format
   * @param {object} options - Dönüştürme seçenekleri
   * @returns {Promise<Blob>} - Dönüştürülen resim
   */
  convertImageFormatClient: async (imageFile, targetFormat, options = {}) => {
    return new Promise((resolve, reject) => {
      try {
        // Desteklenen formatları kontrol et
        const supportedFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
        if (!supportedFormats.includes(targetFormat.toLowerCase())) {
          throw new Error(`Desteklenmeyen hedef format: ${targetFormat}`);
        }
        
        // Dosya tipini doğrula
        if (!imageFile.type.startsWith('image/')) {
          throw new Error('Geçerli bir resim dosyası sağlamanız gerekiyor');
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = new Image();
          
          img.onload = () => {
            try {
              // Canvas oluştur
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              
              // Resmi canvas'a çiz
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              
              // Kalite ayarı
              const quality = options.quality ? options.quality / 100 : 0.9;
              
              // Dönüştür ve indir
              const mimeType = `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`;
              
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Resim dönüştürme başarısız oldu'));
                }
              }, mimeType, quality);
            } catch (error) {
              reject(new Error(`Resim dönüştürme hatası: ${error.message}`));
            }
          };
          
          img.onerror = () => {
            reject(new Error('Resim yüklenemedi'));
          };
          
          img.src = e.target.result;
        };
        
        reader.onerror = () => {
          reject(new Error('Dosya okuma hatası'));
        };
        
        reader.readAsDataURL(imageFile);
      } catch (error) {
        reject(new Error(`Resim formatı dönüştürme hatası: ${error.message}`));
      }
    });
  },
  
  /**
   * Sunucu tarafında resim dönüştürme işlemi yapar
   * @param {File} imageFile - Resim dosyası
   * @param {string} targetFormat - Hedef format veya işlem türü
   * @param {object} options - Dönüştürme seçenekleri
   * @returns {Promise<Blob>} - İşlenmiş resim
   */
  convertImageServer: async (imageFile, targetFormat, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('targetFormat', targetFormat);
      formData.append('options', JSON.stringify(options));
      
      const response = await api.upload(ENDPOINTS.IMAGE_CONVERT, formData);
      
      if (response.data && response.data.base64Data) {
        // Base64'ten blob'a dönüştür
        const byteString = atob(response.data.base64Data);
        const mimeType = response.data.mimeType || `image/${targetFormat}`;
        
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        return new Blob([ab], { type: mimeType });
      }
      
      return response.data;
    } catch (error) {
      throw new Error(`Sunucu resim dönüştürme hatası: ${error.message}`);
    }
  },
  
  /**
   * Resim boyutunu değiştirir
   * @param {File} imageFile - Resim dosyası
   * @param {object} dimensions - Yeni boyutlar { width, height }
   * @param {object} options - Boyutlandırma seçenekleri
   * @returns {Promise<Blob>} - Boyutlandırılmış resim
   */
  resizeImage: async (imageFile, dimensions, options = {}) => {
    try {
      if (!dimensions || (!dimensions.width && !dimensions.height)) {
        throw new Error('Geçerli boyut değerleri belirtmelisiniz');
      }
      
      // Boyut değişimleri için sunucu tercih edilir (daha doğru sonuç)
      if (imageFile.size > 1 * 1024 * 1024 || options.highQuality) { // 1MB
        return imageConverterService.convertImageServer(
          imageFile, 
          'resize', 
          { 
            action: 'resize',
            width: dimensions.width,
            height: dimensions.height,
            ...options 
          }
        );
      } else {
        return imageConverterService.resizeImageClient(imageFile, dimensions, options);
      }
    } catch (error) {
      throw new Error(`Resim boyutlandırma hatası: ${error.message}`);
    }
  },
  
  /**
   * Client tarafında resim boyutunu değiştirir
   * @param {File} imageFile - Resim dosyası
   * @param {object} dimensions - Yeni boyutlar { width, height }
   * @param {object} options - Boyutlandırma seçenekleri
   * @returns {Promise<Blob>} - Boyutlandırılmış resim
   */
  resizeImageClient: async (imageFile, dimensions, options = {}) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = new Image();
          
          img.onload = () => {
            try {
              // Orantılı boyutlandırma hesapla
              let newWidth, newHeight;
              
              if (dimensions.width && dimensions.height) {
                // Her iki boyut da belirtilmişse doğrudan kullan
                newWidth = dimensions.width;
                newHeight = dimensions.height;
              } else if (dimensions.width) {
                // Sadece genişlik belirtilmişse oranı koru
                const ratio = img.height / img.width;
                newWidth = dimensions.width;
                newHeight = Math.round(dimensions.width * ratio);
              } else {
                // Sadece yükseklik belirtilmişse oranı koru
                const ratio = img.width / img.height;
                newHeight = dimensions.height;
                newWidth = Math.round(dimensions.height * ratio);
              }
              
              // Canvas oluştur
              const canvas = document.createElement('canvas');
              canvas.width = newWidth;
              canvas.height = newHeight;
              
              // Resmi canvas'a çiz
              const ctx = canvas.getContext('2d');
              
              // Yumuşatma seçeneği
              if (options.smoothing !== false) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = options.quality || 'high';
              } else {
                ctx.imageSmoothingEnabled = false;
              }
              
              ctx.drawImage(img, 0, 0, newWidth, newHeight);
              
              // Dönüştür ve çözümle
              const format = options.format || imageFile.type.split('/')[1] || 'png';
              const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
              const quality = options.jpegQuality ? options.jpegQuality / 100 : 0.9;
              
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Resim boyutlandırma başarısız oldu'));
                }
              }, mimeType, quality);
            } catch (error) {
              reject(new Error(`Resim boyutlandırma hatası: ${error.message}`));
            }
          };
          
          img.onerror = () => {
            reject(new Error('Resim yüklenemedi'));
          };
          
          img.src = e.target.result;
        };
        
        reader.onerror = () => {
          reject(new Error('Dosya okuma hatası'));
        };
        
        reader.readAsDataURL(imageFile);
      } catch (error) {
        reject(new Error(`Client resim boyutlandırma hatası: ${error.message}`));
      }
    });
  },
  
  /**
   * Resmi optimize eder (sıkıştırma)
   * @param {File} imageFile - Resim dosyası
   * @param {object} options - Optimizasyon seçenekleri
   * @returns {Promise<Blob>} - Optimize edilmiş resim
   */
  optimizeImage: async (imageFile, options = {}) => {
    try {
      // Optimize işlemleri için sunucu tarafı tercih edilir
      return imageConverterService.convertImageServer(
        imageFile, 
        'optimize', 
        { action: 'optimize', ...options }
      );
    } catch (error) {
      throw new Error(`Resim optimizasyon hatası: ${error.message}`);
    }
  },
  
  /**
   * Toplu resim dönüştürme işlemi
   * @param {Array<File>} imageFiles - Resim dosyaları
   * @param {string} targetFormat - Hedef format
   * @param {object} options - Dönüştürme seçenekleri
   * @returns {Promise<Array<Blob>>} - Dönüştürülen resimler
   */
  batchConvertImages: async (imageFiles, targetFormat, options = {}) => {
    try {
      // Toplu işlemler için sunucu tercih edilir
      const formData = new FormData();
      
      imageFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      
      formData.append('targetFormat', targetFormat);
      formData.append('options', JSON.stringify({
        action: 'batchConvert',
        ...options
      }));
      
      const response = await api.upload(ENDPOINTS.IMAGE_CONVERT, formData);
      return response.data;
    } catch (error) {
      throw new Error(`Toplu resim dönüştürme hatası: ${error.message}`);
    }
  },
  
  /**
   * Resmi indirme yardımcı fonksiyonu
   * @param {Blob} imageBlob - Resim blob verisi
   * @param {string} fileName - İndirilecek dosya adı
   */
  downloadImage: (imageBlob, fileName) => {
    try {
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Resim indirme hatası: ${error.message}`);
    }
  }
};

export default imageConverterService; 
 
 