/**
 * API endpoint tanımları
 * Tüm servis URL'lerini merkezi olarak burada tanımlıyoruz
 */

// Temel endpoint'ler
export const ENDPOINTS = {
  // JSON dönüştürme servisleri
  JSON_TO_EXCEL: '/converters/json-to-excel',
  EXCEL_TO_JSON: '/converters/excel-to-json',
  SQL_TO_JSON: '/converters/sql-to-json',
  
  // PDF servisleri
  PDF_PARSE: '/pdf/parse',
  PDF_EDIT: '/pdf/edit',
  PDF_DOWNLOAD: '/pdf/download',
  PDF_CONVERT: '/pdf/convert',
  
  // Resim işleme servisleri
  IMAGE_CONVERT: '/images/convert',
  IMAGE_OPTIMIZE: '/images/optimize',
  IMAGE_RESIZE: '/images/resize',
  
  // Metin araçları
  TEXT_FORMAT: '/text/format',
  TEXT_CLEAN: '/text/clean',
  TEXT_ANALYZE: '/text/analyze',
  
  // QR Kod
  QR_GENERATE: '/utils/qr-generate',
  
  // Kategori araçları
  CATEGORY_CREATE: '/utils/category-create',
  CATEGORY_EXPORT: '/utils/category-export',
};

/**
 * Endpoint oluşturucu
 * Parametre eklemek için yardımcı fonksiyon
 * @param {string} endpoint - Temel endpoint
 * @param {object} params - URL parametreleri
 * @returns {string} - Parametreli endpoint
 */
export const createEndpoint = (endpoint, params = {}) => {
  // ID ile endpoint oluştur
  if (params.id) {
    endpoint = `${endpoint}/${params.id}`;
    delete params.id;
  }
  
  // Diğer parametreleri URL query string olarak ekle
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined) {
      queryParams.append(key, params[key]);
    }
  });
  
  const queryString = queryParams.toString();
  if (queryString) {
    endpoint = `${endpoint}?${queryString}`;
  }
  
  return endpoint;
};

export default ENDPOINTS; 