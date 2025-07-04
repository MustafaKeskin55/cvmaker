import { api } from '../api/apiClient';
import ENDPOINTS from '../api/endpoints';

/**
 * Metin işleme servisi
 */
export const textToolsService = {
  /**
   * Metni temizler ve düzenler
   * @param {string} text - İşlenecek metin
   * @param {object} options - Temizleme seçenekleri
   * @returns {Promise<string>} - Temizlenmiş metin
   */
  cleanText: async (text, options = {}) => {
    try {
      // Metin çok büyükse veya kompleks işlemler gerekiyorsa server kullan
      if (text.length > 10000 || options.useServer) {
        const response = await api.post(ENDPOINTS.TEXT_CLEAN, {
          text,
          options
        });
        return response.data.result;
      } else {
        return textToolsService.cleanTextClient(text, options);
      }
    } catch (error) {
      throw new Error(`Metin temizleme hatası: ${error.message}`);
    }
  },
  
  /**
   * Client tarafında metin temizleme işlemi yapar
   * @param {string} text - İşlenecek metin
   * @param {object} options - Temizleme seçenekleri
   * @returns {string} - Temizlenmiş metin
   */
  cleanTextClient: (text, options = {}) => {
    try {
      let result = text;
      
      // Gereksiz boşlukları temizle
      if (options.trimSpaces !== false) {
        result = result.replace(/\s+/g, ' ').trim();
      }
      
      // Satır başı karakterlerini düzenle
      if (options.normalizeLineBreaks) {
        result = result.replace(/\r\n|\r/g, '\n');
      }
      
      // Satır başlarındaki boşlukları kaldır
      if (options.trimLineStarts) {
        result = result.replace(/^\s+/gm, '');
      }
      
      // Boş satırları kaldır
      if (options.removeEmptyLines) {
        result = result.split('\n').filter(line => line.trim() !== '').join('\n');
      }
      
      // Özel karakterleri kaldır veya değiştir
      if (options.removeSpecialChars) {
        result = result.replace(/[^\w\s.,;:!?"'()[\]{}\-]/g, '');
      }
      
      // HTML etiketlerini kaldır
      if (options.stripHtml) {
        result = result.replace(/<[^>]*>/g, '');
      }
      
      return result;
    } catch (error) {
      throw new Error(`Client metin temizleme hatası: ${error.message}`);
    }
  },
  
  /**
   * Metni biçimlendirir
   * @param {string} text - Biçimlendirilecek metin
   * @param {string} format - Biçimlendirme türü (json, xml, sql vb.)
   * @param {object} options - Biçimlendirme seçenekleri
   * @returns {Promise<string>} - Biçimlendirilmiş metin
   */
  formatText: async (text, format, options = {}) => {
    try {
      // Bazı formatlar client-side yapılabilir
      if (format === 'json' && text.length < 10000) {
        return textToolsService.formatJsonClient(text, options);
      }
      
      // SQL, XML gibi karmaşık formatlar veya büyük metin için sunucu kullan
      const response = await api.post(ENDPOINTS.TEXT_FORMAT, {
        text,
        format,
        options
      });
      
      return response.data.result;
    } catch (error) {
      throw new Error(`Metin biçimlendirme hatası: ${error.message}`);
    }
  },
  
  /**
   * Client tarafında JSON metni biçimlendirir
   * @param {string} jsonText - Biçimlendirilecek JSON metni
   * @param {object} options - Biçimlendirme seçenekleri
   * @returns {string} - Biçimlendirilmiş JSON
   */
  formatJsonClient: (jsonText, options = {}) => {
    try {
      // JSON'ı parse et
      const jsonObj = JSON.parse(jsonText);
      
      // Girinti ayarı
      const indent = options.indent || 2;
      
      // JSON olarak formatla
      return JSON.stringify(jsonObj, null, indent);
    } catch (error) {
      throw new Error(`JSON biçimlendirme hatası: ${error.message}`);
    }
  },
  
  /**
   * Metin istatistikleri analizi yapar
   * @param {string} text - Analiz edilecek metin
   * @param {object} options - Analiz seçenekleri
   * @returns {Promise<object>} - Metin analizi sonuçları
   */
  analyzeText: async (text, options = {}) => {
    try {
      // Metin çok büyükse server kullan
      if (text.length > 10000 || options.advancedAnalysis) {
        const response = await api.post(ENDPOINTS.TEXT_ANALYZE, {
          text,
          options
        });
        return response.data;
      } else {
        return textToolsService.analyzeTextClient(text, options);
      }
    } catch (error) {
      throw new Error(`Metin analiz hatası: ${error.message}`);
    }
  },
  
  /**
   * Client tarafında metin analizi yapar
   * @param {string} text - Analiz edilecek metin
   * @param {object} options - Analiz seçenekleri
   * @returns {object} - Analiz sonuçları
   */
  analyzeTextClient: (text, options = {}) => {
    try {
      const result = {
        characters: {
          total: text.length,
          withoutSpaces: text.replace(/\s+/g, '').length
        },
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text.split('\n').length,
        sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
      };
      
      // Paragraf sayısı
      if (options.countParagraphs) {
        result.paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
      }
      
      // Kelime frekansı
      if (options.wordFrequency) {
        const wordMap = {};
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        
        words.forEach(word => {
          wordMap[word] = (wordMap[word] || 0) + 1;
        });
        
        result.wordFrequency = wordMap;
      }
      
      // Karakter frekansı
      if (options.charFrequency) {
        const charMap = {};
        const chars = text.split('');
        
        chars.forEach(char => {
          charMap[char] = (charMap[char] || 0) + 1;
        });
        
        result.charFrequency = charMap;
      }
      
      // Okuma süresi (ortalama 200 kelime/dakika)
      if (options.readingTime) {
        result.readingTime = {
          minutes: Math.ceil(result.words / 200),
          words: result.words
        };
      }
      
      return result;
    } catch (error) {
      throw new Error(`Client metin analizi hatası: ${error.message}`);
    }
  },
  
  /**
   * Metin dönüştürme işlemleri yapar (büyük/küçük harf dönüşümleri vb)
   * @param {string} text - Dönüştürülecek metin
   * @param {string} operation - Dönüştürme işlemi
   * @param {object} options - Dönüştürme seçenekleri
   * @returns {Promise<string>} - Dönüştürülmüş metin
   */
  transformText: async (text, operation, options = {}) => {
    try {
      switch (operation) {
        case 'uppercase':
          return text.toUpperCase();
          
        case 'lowercase':
          return text.toLowerCase();
          
        case 'capitalize':
          return text.replace(/\b\w/g, char => char.toUpperCase());
          
        case 'sentenceCase':
          return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, char => char.toUpperCase());
          
        case 'reverse':
          return text.split('').reverse().join('');
          
        case 'slug':
          return text
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+|-+$/g, '');
            
        default:
          // Diğer dönüşümler için server kullan
          const response = await api.post(`${ENDPOINTS.TEXT_FORMAT}/transform`, {
            text,
            operation,
            options
          });
          return response.data.result;
      }
    } catch (error) {
      throw new Error(`Metin dönüştürme hatası: ${error.message}`);
    }
  },
  
  /**
   * Farklı kodlamalar arasında metin dönüşümü yapar
   * @param {string} text - Dönüştürülecek metin
   * @param {string} sourceEncoding - Kaynak kodlama
   * @param {string} targetEncoding - Hedef kodlama
   * @returns {Promise<string>} - Dönüştürülmüş metin
   */
  convertEncoding: async (text, sourceEncoding, targetEncoding) => {
    try {
      // Kodlama dönüşümleri için sunucu kullan
      const response = await api.post(`${ENDPOINTS.TEXT_FORMAT}/encoding`, {
        text,
        sourceEncoding,
        targetEncoding
      });
      
      return response.data.result;
    } catch (error) {
      throw new Error(`Metin kodlama dönüştürme hatası: ${error.message}`);
    }
  }
};

export default textToolsService; 