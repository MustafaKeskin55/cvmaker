/**
 * PDF Açıklama ve Düzenleme Servisi
 * PDF-lib kullanarak PDF dosyalarında düzenleme işlemleri yapar
 */
class PdfAnnotationService {
  /**
   * PDF dosyasına açıklamalar uygular
   * @param {Uint8Array} pdfBytes - PDF veri dizisi
   * @param {Array} annotations - Uygulanacak açıklamalar
   * @returns {Promise<Uint8Array>} - Düzenlenmiş PDF veri dizisi
   */
  static async applyAnnotations(pdfBytes, annotations) {
    try {
      // PDF-lib kütüphanesini kontrol et
      if (!window.PDFLib) {
        throw new Error('PDF-lib kütüphanesi bulunamadı.');
      }
      
      const { PDFDocument, rgb, degrees, StandardFonts } = window.PDFLib;
      
      // PDF dokümanını yükle
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Metin fontunu yükle
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Her sayfayı düzenle
      const pageNumbers = [...new Set(annotations.map(a => a.page))];
      
      for (const pageNum of pageNumbers) {
        // Sayfa indeksi (0 tabanlı)
        const pageIndex = pageNum - 1;
        
        // Sayfa numarası geçerli mi kontrol et
        if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
          continue;
        }
        
        // Sayfayı al
        const page = pdfDoc.getPage(pageIndex);
        
        // Bu sayfadaki açıklamaları filtrele
        const pageAnnotations = annotations.filter(a => a.page === pageNum);
        
        // Her açıklamayı işle
        for (const annotation of pageAnnotations) {
          switch (annotation.type) {
            case 'text':
              // Metin ekle
              page.drawText(annotation.content, {
                x: annotation.position.x,
                y: annotation.position.y,
                size: annotation.fontSize || 12,
                font: font,
                color: this.parseColor(annotation.color, rgb)
              });
              break;
              
            case 'line':
              // Çizgi çiz
              page.drawLine({
                start: { x: annotation.start.x, y: annotation.start.y },
                end: { x: annotation.end.x, y: annotation.end.y },
                thickness: annotation.width || 1,
                color: this.parseColor(annotation.color, rgb)
              });
              break;
              
            case 'highlight':
              // Vurgulama (dikdörtgen)
              page.drawRectangle({
                x: annotation.position.x,
                y: annotation.position.y,
                width: annotation.width,
                height: annotation.height,
                color: this.parseColor(annotation.color, rgb, true)
              });
              break;
              
            case 'image':
              // Resim ekle
              try {
                let image;
                const imageData = annotation.imageData;
                
                // Base64 formatındaki resmi çözümle
                if (imageData.startsWith('data:image/png;base64,')) {
                  // PNG
                  const pngData = imageData.replace('data:image/png;base64,', '');
                  const pngBytes = this.base64ToUint8Array(pngData);
                  image = await pdfDoc.embedPng(pngBytes);
                } else if (imageData.startsWith('data:image/jpeg;base64,') || 
                           imageData.startsWith('data:image/jpg;base64,')) {
                  // JPEG
                  const jpgData = imageData.replace(/^data:image\/(jpeg|jpg);base64,/, '');
                  const jpgBytes = this.base64ToUint8Array(jpgData);
                  image = await pdfDoc.embedJpg(jpgBytes);
                } else {
                  // Desteklenmeyen format
                  console.warn('Desteklenmeyen resim formatı:', imageData.substring(0, 30) + '...');
                  continue;
                }
                
                // Resmi çiz
                page.drawImage(image, {
                  x: annotation.position.x,
                  y: annotation.position.y,
                  width: annotation.width,
                  height: annotation.height
                });
              } catch (imageError) {
                console.error('Resim ekleme hatası:', imageError);
              }
              break;
              
            case 'ellipse':
              // Elips (SVG ile)
              try {
                // SVG olarak elips oluştur
                const svgPath = this.createEllipseSvgPath(
                  annotation.position.x, 
                  annotation.position.y,
                  annotation.width || 100, 
                  annotation.height || 50
                );
                
                // SVG'yi PDF'e yerleştir
                await this.embedSvgPath(pdfDoc, page, svgPath, {
                  color: this.parseColor(annotation.color, rgb),
                  borderWidth: annotation.borderWidth || 1
                });
              } catch (ellipseError) {
                console.error('Elips ekleme hatası:', ellipseError);
              }
              break;
              
            case 'cross':
              // Çarpı işareti
              try {
                const x = annotation.position.x;
                const y = annotation.position.y;
                const size = annotation.size || 20;
                const color = this.parseColor(annotation.color, rgb);
                const thickness = annotation.width || 2;
                
                // Çarpı için iki çizgi çiz
                page.drawLine({
                  start: { x: x - size/2, y: y - size/2 },
                  end: { x: x + size/2, y: y + size/2 },
                  thickness: thickness,
                  color: color
                });
                
                page.drawLine({
                  start: { x: x - size/2, y: y + size/2 },
                  end: { x: x + size/2, y: y - size/2 },
                  thickness: thickness,
                  color: color
                });
              } catch (crossError) {
                console.error('Çarpı ekleme hatası:', crossError);
              }
              break;
              
            case 'check':
              // Onay işareti (tik)
              try {
                const x = annotation.position.x;
                const y = annotation.position.y;
                const size = annotation.size || 20;
                const color = this.parseColor(annotation.color, rgb);
                const thickness = annotation.width || 2;
                
                // Tik işareti için iki çizgi
                page.drawLine({
                  start: { x: x - size/2, y: y },
                  end: { x: x - size/4, y: y - size/3 },
                  thickness: thickness,
                  color: color
                });
                
                page.drawLine({
                  start: { x: x - size/4, y: y - size/3 },
                  end: { x: x + size/2, y: y + size/3 },
                  thickness: thickness,
                  color: color
                });
              } catch (checkError) {
                console.error('Onay işareti ekleme hatası:', checkError);
              }
              break;
              
            case 'signature':
              // İmza
              try {
                const sigData = annotation.imageData;
                
                // Base64 formatındaki imzayı çözümle (PNG olarak)
                if (sigData.startsWith('data:image/png;base64,')) {
                  const pngData = sigData.replace('data:image/png;base64,', '');
                  const pngBytes = this.base64ToUint8Array(pngData);
                  const image = await pdfDoc.embedPng(pngBytes);
                  
                  // İmzayı çiz
                  page.drawImage(image, {
                    x: annotation.position.x,
                    y: annotation.position.y,
                    width: annotation.width,
                    height: annotation.height
                  });
                }
              } catch (signatureError) {
                console.error('İmza ekleme hatası:', signatureError);
              }
              break;
              
            case 'comment':
              // Yorum balonu ekle
              try {
                const x = annotation.position.x;
                const y = annotation.position.y;
                const size = annotation.size || 24;
                const color = this.parseColor(annotation.color, rgb);
                
                // Yorum balonu için elips çiz
                page.drawEllipse({
                  x: x + size/2,
                  y: y + size/2,
                  xScale: size/2,
                  yScale: size/2,
                  color: color
                });
                
                // Açıklama metni
                if (annotation.content) {
                  page.drawText(annotation.content, {
                    x: x + size + 5,
                    y: y + size/2 - 6,
                    size: 10,
                    font: font,
                    color: rgb(0, 0, 0)
                  });
                }
              } catch (commentError) {
                console.error('Yorum ekleme hatası:', commentError);
              }
              break;
              
            case 'link':
              // Bağlantı ekle
              try {
                const url = annotation.url || '';
                
                if (url) {
                  // Bağlantı alanı
                  page.drawRectangle({
                    x: annotation.position.x,
                    y: annotation.position.y,
                    width: annotation.width || 100,
                    height: annotation.height || 20,
                    borderColor: rgb(0, 0, 0.5),
                    borderWidth: 1,
                    color: rgb(0, 0, 1, 0.1)
                  });
                  
                  // Bağlantı metni
                  page.drawText(annotation.content || url, {
                    x: annotation.position.x + 5,
                    y: annotation.position.y + 5,
                    size: 10,
                    font: font,
                    color: rgb(0, 0, 1)
                  });
                  
                  // PDF bağlantısı ekle
                  page.setURL(annotation.position.x, annotation.position.y, 
                              annotation.width || 100, annotation.height || 20, url);
                }
              } catch (linkError) {
                console.error('Bağlantı ekleme hatası:', linkError);
              }
              break;
              
            default:
              console.warn('Bilinmeyen açıklama tipi:', annotation.type);
              break;
          }
        }
      }
      
      // Düzenlenmiş PDF'i kaydet
      const modifiedPdfBytes = await pdfDoc.save();
      
      return modifiedPdfBytes;
    } catch (error) {
      console.error('PDF düzenleme hatası:', error);
      throw new Error(`PDF düzenleme hatası: ${error.message}`);
    }
  }
  
  /**
   * Renk değerini PDF-lib rgb formatına dönüştürür
   * @param {string} color - CSS renk değeri
   * @param {Function} rgbFunc - PDF-lib rgb fonksiyonu
   * @param {boolean} isHighlight - Vurgulama rengi mi?
   * @returns {Object} - PDF-lib renk nesnesi
   */
  static parseColor(color, rgbFunc, isHighlight = false) {
    if (!color) {
      return rgbFunc(0, 0, 0);
    }
    
    // Hex renk kodu
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;
      
      // Vurgulama için saydamlık ekle
      if (isHighlight) {
        return rgbFunc(r, g, b, 0.3);
      }
      
      return rgbFunc(r, g, b);
    }
    
    // rgba renk kodu
    if (color.startsWith('rgba')) {
      const rgba = color.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
      if (rgba) {
        const r = parseInt(rgba[1]) / 255;
        const g = parseInt(rgba[2]) / 255;
        const b = parseInt(rgba[3]) / 255;
        const a = parseFloat(rgba[4]);
        
        return rgbFunc(r, g, b, a);
      }
    }
    
    // rgb renk kodu
    if (color.startsWith('rgb')) {
      const rgb = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (rgb) {
        const r = parseInt(rgb[1]) / 255;
        const g = parseInt(rgb[2]) / 255;
        const b = parseInt(rgb[3]) / 255;
        
        // Vurgulama için saydamlık ekle
        if (isHighlight) {
          return rgbFunc(r, g, b, 0.3);
        }
        
        return rgbFunc(r, g, b);
      }
    }
    
    // Varsayılan değer
    return rgbFunc(0, 0, 0);
  }
  
  /**
   * Base64 formatındaki veriyi Uint8Array'e dönüştürür
   * @param {string} base64 - Base64 formatındaki veri
   * @returns {Uint8Array} - Byte dizisi
   */
  static base64ToUint8Array(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return bytes;
  }
  
  /**
   * Elips için SVG yolu oluşturur
   * @param {number} x - X koordinatı
   * @param {number} y - Y koordinatı
   * @param {number} width - Genişlik
   * @param {number} height - Yükseklik
   * @returns {string} - SVG yolu
   */
  static createEllipseSvgPath(x, y, width, height) {
    const rx = width / 2;
    const ry = height / 2;
    const cx = x + rx;
    const cy = y + ry;
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" stroke="black" stroke-width="1" fill="none" />
      </svg>
    `;
  }
  
  /**
   * SVG yolunu PDF'e yerleştirir
   * @param {Object} pdfDoc - PDF dokümanı
   * @param {Object} page - PDF sayfası
   * @param {string} svgPath - SVG yolu
   * @param {Object} options - Seçenekler
   * @returns {Promise<void>}
   */
  static async embedSvgPath(pdfDoc, page, svgPath, options = {}) {
    // PDF-lib henüz doğrudan SVG desteği içermiyor
    // Bu fonksiyon gelecekte SVG entegrasyonu için kullanılabilir
    
    // PDFLib'den rgb fonksiyonunu al
    const { PDFLib } = window;
    const rgb = PDFLib ? PDFLib.rgb : null;
    
    if (!rgb) {
      console.warn('PDF-lib rgb fonksiyonu bulunamadı, basit dikdörtgen çiziliyor');
    }
    
    // Şimdilik basitleştirilmiş davranış:
    page.drawRectangle({
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || 100,
      height: options.height || 50,
      borderColor: options.color || (rgb ? rgb(0, 0, 0) : undefined),
      borderWidth: options.borderWidth || 1,
      color: options.fillColor || undefined
    });
  }
}

export default PdfAnnotationService; 