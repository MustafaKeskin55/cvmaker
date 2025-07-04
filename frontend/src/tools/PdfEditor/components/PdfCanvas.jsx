import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles.module.css';

/**
 * PDF canvas bileşeni
 */
const PdfCanvas = ({ 
  pdfBytes, 
  currentPage, 
  scale, 
  isEditMode, 
  onRender,
  onPageRendered,
  setLoading,
  setError
}) => {
  const canvasRef = useRef(null);
  const loadingTaskRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [retryCount, setRetryCount] = useState(0);
  // isRendering'i ref olarak kullan, böylece render döngüsü oluşturmaz
  const isRenderingRef = useRef(false);
  const renderTimeoutRef = useRef(null);
  const pdfDocRef = useRef(null);
  const maxRetries = 2;
  
  // Canvas'ı temizle
  const clearCanvas = () => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };
  
  // Tüm kaynakları temizle
  const cleanupResources = () => {
    // Önceki task'leri temizle
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) {
        console.warn('Render task iptal edilemedi:', e);
      }
      renderTaskRef.current = null;
    }
    
    if (loadingTaskRef.current) {
      try {
        loadingTaskRef.current.destroy();
      } catch (e) {
        console.warn('Loading task yok edilemedi:', e);
      }
      loadingTaskRef.current = null;
    }
    
    // PDF belgesini temizle
    if (pdfDocRef.current) {
      try {
        pdfDocRef.current.destroy();
      } catch (e) {
        console.warn('PDF destroy edilemedi:', e);
      }
      pdfDocRef.current = null;
    }
    
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
      renderTimeoutRef.current = null;
    }
    
    clearCanvas();
  };
  
  // PDF canvas üzerinde render et
  useEffect(() => {
    // PDF verisi veya canvas yoksa işlem yapma
    if (!pdfBytes || !canvasRef.current || !isEditMode) {
      return;
    }
    
    // Önceki işlemleri temizle
    cleanupResources();
    
    let isMounted = true;
    
    // Bir defaya mahsus render işlemini başlat
    const renderPdf = async () => {
      // Eğer zaten render yapılıyorsa yeni render başlatma
      if (isRenderingRef.current) {
        console.log('Render işlemi devam ediyor, yeni render atlanıyor');
        return;
      }
      
      // Render başlatıldı
      isRenderingRef.current = true;
      setLoading(true);
      
      try {
        if (!isMounted) return;
        
        // Worker hazır mı kontrol et
        const pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) {
          console.error('PDF.js kütüphanesi bulunamadı');
          setError('PDF.js kütüphanesi bulunamadı.');
          setLoading(false);
          isRenderingRef.current = false;
          return;
        }
        
        // Worker'ın hazır olduğundan emin ol - sadece bir kez yap
        if (window.PDFJS_WORKER && !window.PDFJS_WORKER.initialized && window.initPdfWorker) {
          window.initPdfWorker();
        }
        
        // PDF verilerini kontrol et
        if (!pdfBytes || pdfBytes.length === 0) {
          setError('PDF verisi geçersiz veya boş.');
          setLoading(false);
          isRenderingRef.current = false;
          return;
        }
        
        try {
          // Daima ArrayBuffer kopyası kullan
          const bufferCopy = pdfBytes.slice(0);
          
          // Yeni loading task oluştur ve referansını sakla
          loadingTaskRef.current = pdfjsLib.getDocument({data: bufferCopy});
          const pdf = await loadingTaskRef.current.promise;
          
          // PDF referansını sakla
          pdfDocRef.current = pdf;
          
          if (!isMounted) {
            cleanupResources();
            return;
          }
          
          // Geçerli sayfayı oluştur
          const page = await pdf.getPage(currentPage);
          const viewport = page.getViewport({scale});
          
          const canvas = canvasRef.current;
          if (!canvas || !isMounted) {
            // Canvas artık mevcut değilse işlemi iptal et
            page.cleanup();
            cleanupResources();
            return;
          }
          
          const context = canvas.getContext('2d');
          
          // Canvas boyutlarını ayarla
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            // Render performansını artır
            renderInteractiveForms: false
          };
          
          // Render işlemini başlat ve referansını sakla
          renderTaskRef.current = page.render(renderContext);
          await renderTaskRef.current.promise;
          
          if (!isMounted) {
            page.cleanup();
            cleanupResources();
            return;
          }
          
          // Render tamamlandıktan sonra render task referansını temizle
          renderTaskRef.current = null;
          
          // Başarılı render sonrası retry sayacını sıfırla
          if (retryCount > 0) {
            setRetryCount(0);
          }
          
          // Render tamamlandı bilgisini gönder
          if (onPageRendered && canvas) {
            onPageRendered(pdf, page, canvas);
          }
          
          // Render tamamlandı, loading kapatılabilir
          setLoading(false);
          isRenderingRef.current = false;
          
        } catch (renderError) {
          if (!isMounted) {
            isRenderingRef.current = false;
            return;
          }
          
          console.error('PDF render hatası:', renderError);
          
          // Ciddi worker hatası olup olmadığını kontrol et
          const isWorkerError = renderError.message && (
            renderError.message.includes('Worker was destroyed') || 
            renderError.name === 'WorkerError' || 
            renderError.message.includes('worker') || 
            renderError.message.includes('terminated')
          );
          
          // Worker hatası ve tekrar deneme limiti aşılmadıysa
          if (isWorkerError && retryCount < maxRetries) {
            console.warn(`PDF worker hatası oluştu, tekrar deneme ${retryCount + 1}/${maxRetries}`);
            
            // Worker'ı sıfırla - sadece gerçekten worker hatası olduğunda
            if (window.resetPdfWorker) {
              window.resetPdfWorker();
            }
            
            // Retry counter'ı arttır
            setRetryCount(prev => prev + 1);
            
            // Rendering durumunu sıfırla
            isRenderingRef.current = false;
            
            // Kaynakları temizle
            cleanupResources();
            
            // Kısa bir beklemeden sonra tekrar dene
            renderTimeoutRef.current = setTimeout(() => {
              if (isMounted) renderPdf();
            }, 2000);
            
            return;
          }
          
          // Eğer iptal edilme hatası değilse göster
          if (renderError.name !== 'RenderingCancelledException' && 
              renderError.message !== 'Rendering cancelled') {
            setError(`PDF render hatası: ${renderError.message}`);
          }
          
          setLoading(false);
          isRenderingRef.current = false;
          
          // Kaynakları temizle
          cleanupResources();
        }
      } catch (error) {
        if (!isMounted) {
          isRenderingRef.current = false;
          return;
        }
        
        // Eğer iptal edilme hatası değilse göster
        if (error.name !== 'RenderingCancelledException' && 
            error.message !== 'Rendering cancelled') {
          console.error('PDF işleme hatası:', error);
          setError(`PDF işleme hatası: ${error.message}`);
        }
        
        setLoading(false);
        isRenderingRef.current = false;
        
        // Kaynakları temizle
        cleanupResources();
      }
    };
    
    // Render işlemini sadece bir kez başlat
    renderPdf();
    
    // Temizleme fonksiyonu - bileşen kaldırıldığında çalışır
    return () => {
      isMounted = false;
      isRenderingRef.current = false;
      cleanupResources();
    };
  }, [pdfBytes, currentPage, scale, isEditMode, onPageRendered, setError, setLoading, retryCount]);

  return (
    <canvas 
      ref={canvasRef}
      className={styles.pdfCanvas}
    />
  );
};

export default PdfCanvas; 