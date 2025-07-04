// API endpoint'leri için base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * API istekleri için yardımcı fonksiyon
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - API yanıtı
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API isteği başarısız:', error);
    throw error;
  }
}

/**
 * Ana sayfa için tüm verileri getirir
 * @returns {Promise<Object>} - Ana sayfa verileri
 */
export async function getHomePageData() {
  try {
    const response = await fetchAPI('/home');
    return response;
  } catch (error) {
    console.error('Ana sayfa verilerini alırken hata:', error);
    throw error;
  }
}

/**
 * Hero bölümü verilerini getirir
 * @returns {Promise<Object>} - Hero bölüm verileri
 */
export async function getHeroSection() {
  try {
    const response = await fetchAPI('/hero-section');
    return response;
  } catch (error) {
    console.error('Hero bölümü verilerini alırken hata:', error);
    throw error;
  }
}

/**
 * Özellik bölümü verilerini getirir
 * @returns {Promise<Object>} - Özellikler bölüm verileri
 */
export async function getFeaturesSection() {
  try {
    const response = await fetchAPI('/features');
    return response;
  } catch (error) {
    console.error('Özellikler bölümü verilerini alırken hata:', error);
    throw error;
  }
}

/**
 * Hizmetler bölümü verilerini getirir
 * @returns {Promise<Object>} - Hizmetler bölüm verileri
 */
export async function getServicesSection() {
  try {
    const response = await fetchAPI('/services');
    return response;
  } catch (error) {
    console.error('Hizmetler bölümü verilerini alırken hata:', error);
    throw error;
  }
}

/**
 * İletişim formu gönderir
 * @param {Object} formData - Form verileri
 * @returns {Promise<Object>} - API yanıtı
 */
export async function sendContactForm(formData) {
  try {
    const response = await fetchAPI('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    return response;
  } catch (error) {
    console.error('İletişim formu gönderirken hata:', error);
    throw error;
  }
} 