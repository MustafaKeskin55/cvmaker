import { api } from '../api/apiClient';
import ENDPOINTS from '../api/endpoints';

/**
 * SQL'den JSON'a dönüştürme servisi
 */
export const sqlToJsonService = {
  /**
   * SQL sorgusunu analiz eder ve JSON'a çevirir
   * @param {string} sqlQuery - SQL sorgusu
   * @param {object} options - Seçenekler
   * @returns {Promise<object>} - JSON formatında sonuçlar
   */
  parseSqlToJson: async (sqlQuery, options = {}) => {
    try {
      // SQL tipini belirle (SELECT, INSERT, DELETE, vb.)
      const sqlType = determineSqlType(sqlQuery);
      
      // Bu client-side bir analiz değil, tüm SQL'ler sunucuda çalışır
      // Büyük SQL sorguları sunucuda işlenir
      const response = await api.post(ENDPOINTS.SQL_TO_JSON, {
        query: sqlQuery,
        options: options
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`SQL to JSON dönüştürme hatası: ${error.message}`);
    }
  },
  
  /**
   * CREATE TABLE ifadelerini JSON yapısına dönüştürür
   * @param {string} createTableStatement - CREATE TABLE SQL ifadesi
   * @returns {Promise<object>} - Tablo yapısını temsil eden JSON
   */
  parseCreateTableToSchema: async (createTableStatement) => {
    try {
      // CREATE TABLE ifadesini sunucuya gönderip şema olarak al
      const response = await api.post(ENDPOINTS.SQL_TO_JSON, {
        query: createTableStatement,
        options: {
          mode: 'schema'
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`SQL şeması dönüştürme hatası: ${error.message}`);
    }
  },
  
  /**
   * JSON verilerini SQL sorgularına dönüştürür
   * @param {object} jsonData - JSON verisi
   * @param {string} tableName - Tablo adı
   * @param {object} options - Seçenekler
   * @returns {Promise<string>} - SQL sorguları
   */
  convertJsonToSql: async (jsonData, tableName, options = {}) => {
    try {
      if (!jsonData || !tableName) {
        throw new Error('JSON verileri ve tablo adı gereklidir');
      }
      
      // JSON'dan SQL'e dönüştürmek için API isteği gönder
      const response = await api.post(`${ENDPOINTS.SQL_TO_JSON}/to-sql`, {
        data: jsonData,
        tableName: tableName,
        options: options
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`JSON to SQL dönüştürme hatası: ${error.message}`);
    }
  },
  
  /**
   * SQL ile ilgili ek işlevler buraya eklenebilir
   */
};

/**
 * SQL sorgu tipini belirleyen yardımcı fonksiyon
 * @param {string} sqlQuery - SQL sorgusu
 * @returns {string} - SQL sorgu tipi
 */
function determineSqlType(sqlQuery) {
  if (!sqlQuery) {
    return 'UNKNOWN';
  }
  
  // Trim ve büyük harfe çevir
  const normalizedQuery = sqlQuery.trim().toUpperCase();
  
  if (normalizedQuery.startsWith('SELECT')) {
    return 'SELECT';
  } else if (normalizedQuery.startsWith('INSERT')) {
    return 'INSERT';
  } else if (normalizedQuery.startsWith('UPDATE')) {
    return 'UPDATE';
  } else if (normalizedQuery.startsWith('DELETE')) {
    return 'DELETE';
  } else if (normalizedQuery.startsWith('CREATE')) {
    return 'CREATE';
  } else if (normalizedQuery.startsWith('ALTER')) {
    return 'ALTER';
  } else if (normalizedQuery.startsWith('DROP')) {
    return 'DROP';
  } else {
    return 'OTHER';
  }
}

export default sqlToJsonService; 