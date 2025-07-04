import React, { forwardRef, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF görüntüleme canvas bileşeni
 * PDF sayfalarını canvas üzerinde render eder
 */
const PdfViewerCanvas = forwardRef(({ 
  pdfDocument,
  currentPage,
  scale,
  onRender,
  setError,
  setLoading
}, ref) => {
  const renderingRef = useRef(false);
  const pdfPageRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  // Canvas'ı temizle
  const clearCanvas = () => {
    const canvas = ref.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  // Kaynakları temizle
  const cleanupResources = () => {
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) {
        console.warn('Render task iptal edilemedi:', e);
      }
      renderTaskRef.current = null;
    }
    
    if (pdfPageRef.current) {
      try {
        pdfPageRef.current.cleanup();
      } catch (e) {
        console.warn('PDF sayfa temizleme hatası:', e);
      }
      pdfPageRef.current = null;
    }
    
    clearCanvas();
  };
  
  // PDF sayfasını render et
  useEffect(() => {
    // Eğer gerekli veriler yoksa işlem yapma
    if (!pdfDocument || !ref.current || currentPage < 1) {
      return;
    }
    
    // Önceki kaynakları temizle
    cleanupResources();
    
    // Eğer zaten render işlemi yapılıyorsa tekrar başlatma
    if (renderingRef.current) {
      return;
    }
    
    let isMounted = true;
    
    // Render işlemini başlat
    const renderPage = async () => {
      try {
        renderingRef.current = true;
        setLoading(true);
        
        // PDF sayfasını al
        const page = await pdfDocument.getPage(currentPage);
        pdfPageRef.current = page;
        
        if (!isMounted) {
          cleanupResources();
          return;
        }
        
        // Canvas'ı hazırla
        const canvas = ref.current;
        const context = canvas.getContext('2d');
        
        // Viewport hesapla
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Basitleştirilmiş render parametreleri - sürüm bağımsız
        const renderContext = {
          canvasContext: context,
          viewport: viewport
          // Ek parametreleri kaldırarak temel render işlemini kullan
        };
        
        // Render işlemini başlat
        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        
        if (!isMounted) {
          cleanupResources();
          return;
        }
        
        // Başarılı render sonrası retry sayısını sıfırla
        if (retryCount > 0) {
          setRetryCount(0);
        }
        
        // Render tamamlandı
        renderingRef.current = false;
        setLoading(false);
        
        // Render tamamlandı callback'i çağır
        if (onRender) {
          onRender(page, canvas);
        }
        
      } catch (error) {
        if (!isMounted) {
          return;
        }
        
        console.error('PDF render hatası:', error);
        
        // Worker hatası kontrolü
        const isWorkerError = error.message && (
          error.message.includes('Worker was destroyed') || 
          error.name === 'WorkerError' || 
          error.message.includes('worker')
        );
        
        // Worker hatası ise ve deneme limitini aşmadıysak tekrar dene
        if (isWorkerError && retryCount < maxRetries) {
          console.warn(`PDF worker hatası, tekrar deneniyor (${retryCount + 1}/${maxRetries})`);
          
          // Worker'ı resetle
          if (window.resetPdfWorker) {
            window.resetPdfWorker();
          }
          
          // Retry sayısını artır
          setRetryCount(prev => prev + 1);
          
          // Render durumunu sıfırla
          renderingRef.current = false;
          
          // Kaynakları temizle
          cleanupResources();
          
          // Biraz bekleyip tekrar dene
          setTimeout(() => {
            if (isMounted) renderPage();
          }, 1500);
          
          return;
        }
        
        // Hata mesajını göster
        if (error.name !== 'RenderingCancelledException') {
          setError(`PDF render hatası: ${error.message}`);
        }
        
        renderingRef.current = false;
        setLoading(false);
      }
    };
    
    // Render işlemini başlat
    renderPage();
    
    // Temizleme fonksiyonu
    return () => {
      isMounted = false;
      renderingRef.current = false;
      cleanupResources();
    };
  }, [pdfDocument, currentPage, scale, setError, setLoading, onRender, retryCount]);
  
  return (
    <canvas 
      ref={ref}
      className={styles.pdfCanvas}
      aria-label="PDF görüntüleyici"
    />
  );
});

PdfViewerCanvas.propTypes = {
  pdfDocument: PropTypes.object,
  currentPage: PropTypes.number.isRequired,
  scale: PropTypes.number.isRequired,
  onRender: PropTypes.func,
  setError: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired
};

PdfViewerCanvas.displayName = 'PdfViewerCanvas';

export default PdfViewerCanvas; 