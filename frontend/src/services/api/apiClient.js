import axios from 'axios';

// API İsteği için varsayılan yapılandırma
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Axios örneği oluştur
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// İstek interceptor'ı - tüm isteklerde çalışır
apiClient.interceptors.request.use(
  (config) => {
    // İstek öncesi işlemler (token ekleme vb)
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cevap interceptor'ı - tüm cevaplarda çalışır
apiClient.interceptors.response.use(
  (response) => {
    // Başarılı cevapları doğrudan döndür
    return response;
  },
  (error) => {
    // Hata durumununu yönet
    const { response } = error;
    
    if (response && response.status === 401) {
      // Oturum süresi dolmuş - yeniden login gerekiyor
      localStorage.removeItem('auth_token');
      // Kullanıcıyı login sayfasına yönlendirebiliriz
    }
    
    return Promise.reject(error);
  }
);

// API istekleri için yardımcı fonksiyonlar
export const api = {
  /**
   * GET isteği
   * @param {string} url - API endpoint
   * @param {object} params - URL parametreleri
   */
  get: (url, params) => apiClient.get(url, { params }),

  /**
   * POST isteği
   * @param {string} url - API endpoint
   * @param {object} data - Gönderilecek veri
   */
  post: (url, data) => apiClient.post(url, data),

  /**
   * PUT isteği
   * @param {string} url - API endpoint
   * @param {object} data - Güncellenecek veri
   */
  put: (url, data) => apiClient.put(url, data),

  /**
   * DELETE isteği
   * @param {string} url - API endpoint
   */
  delete: (url) => apiClient.delete(url),

  /**
   * Dosya yükleme POST isteği
   * @param {string} url - API endpoint
   * @param {FormData} formData - Yüklenecek dosya ve veriler
   */
  upload: (url, formData) => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Dosya indirme GET isteği
   * @param {string} url - API endpoint
   * @param {string} fileName - Kaydedilecek dosya adı
   */
  download: (url, fileName) => {
    return apiClient.get(url, { responseType: 'blob' })
      .then(response => {
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }
};

export default apiClient; 