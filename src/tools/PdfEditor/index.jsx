import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import styles from './styles.module.css';
import PdfViewerCanvas from './components/PdfViewerCanvas';
import PdfToolbar from './components/PdfToolbar';
import PdfPageNavigator from './components/PdfPageNavigator';
import PdfThumbnails from './components/PdfThumbnails';
import PdfPageRenderer from './services/PdfPageRenderer';
import PdfAnnotationService from './services/PdfAnnotationService';

// PDF düzenleme araçları
import TextTool from './tools/TextTool';
import LineTool from './tools/LineTool';
import HighlightTool from './tools/HighlightTool';
import PenTool from './tools/PenTool';
import ImageTool from './tools/ImageTool';
import EllipseTool from './tools/EllipseTool';
import CrossTool from './tools/CrossTool';
import CheckTool from './tools/CheckTool';
import SignatureTool from './tools/SignatureTool';
import CommentTool from './tools/CommentTool';
import LinkTool from './tools/LinkTool';

/**
 * PDF Düzenleme Aracı
 * Sıfırdan tasarlanmış, temiz kod yapısıyla PDF düzenleme işlemleri
 */
const PdfEditor = () => {
  // Durum yönetimi
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [fileName, setFileName] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Referanslar
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Araç tipleri
  const TOOLS = {
    TEXT: 'text',
    LINE: 'line',
    HIGHLIGHT: 'highlight',
    PEN: 'pen',
    IMAGE: 'image',
    ELLIPSE: 'ellipse',
    CROSS: 'cross',
    CHECK: 'check',
    SIGNATURE: 'signature',
    COMMENT: 'comment',
    LINK: 'link',
    NONE: null
  };
  
  /**
   * PDF dosyası yükleme işlemi
   */
  const handleFileUpload = async (e) => {
    try {
      setLoading(true);
      setError('');
      
      const file = e.target.files[0];
      if (!file) {
        setLoading(false);
        return;
      }
      
      if (file.type !== 'application/pdf') {
        setError('Lütfen geçerli bir PDF dosyası yükleyin.');
        setLoading(false);
        return;
      }
      
      // PDF verilerini yükle
      try {
        // ArrayBuffer olarak oku
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
        // PDF.js ile PDF'i parse et
        const loadingTask = PdfPageRenderer.loadPdfDocument(buffer);
        const pdfDoc = await loadingTask;
        
        // Bilgileri sakla
        setPdfDocument(pdfDoc);
        setPdfBytes(buffer);
        setFileName(file.name);
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
        setIsEditing(true);
        
        // Görüntüleme için URL oluştur
        const blob = new Blob([buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        
        // Küçük resimleri oluştur (ayrı bir işlem olarak)
        setTimeout(() => {
          generateThumbnails(pdfDoc);
        }, 100);
        
        // Yükleme tamamlandı
        setLoading(false);
      } catch (error) {
        console.error('PDF yükleme hatası:', error);
        setError(`PDF yüklenemedi: ${error.message}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Dosya işleme hatası:', error);
      setError(`Dosya işleme hatası: ${error.message}`);
      setLoading(false);
    }
  };

  /**
   * PDF küçük resimlerini oluştur
   */
  const generateThumbnails = async (pdfDoc) => {
    try {
      if (!pdfDoc) return;
      
      const thumbs = [];
      const pageCount = Math.min(pdfDoc.numPages, 5); // Performans için ilk 5 sayfa
        
        for (let i = 1; i <= pageCount; i++) {
        const thumb = await PdfPageRenderer.renderPageToThumbnail(pdfDoc, i, 0.2);
        thumbs.push(thumb);
      }
      
      setThumbnails(thumbs);
    } catch (error) {
      console.error('Küçük resim oluşturma hatası:', error);
    }
  };

  /**
   * Araç değiştirme
   */
  const changeTool = (toolType) => {
    setActiveTool(toolType);
  };
  
  /**
   * Ölçek değiştirme (yakınlaştırma/uzaklaştırma)
   */
  const handleZoom = (newScale) => {
    setScale(Math.min(Math.max(0.5, newScale), 3.0)); // 0.5x - 3.0x arası
  };

  /**
   * Sayfa değiştirme
   */
  const changePage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) return;
    setCurrentPage(pageNum);
  };

  /**
   * PDF canvas üzerinde tıklama olayı
   */
  const handleCanvasClick = (e) => {
    if (!isEditing || !activeTool || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Araç tipine göre işlem yap
    handleToolAction(activeTool, { x, y, page: currentPage });
  };
  
  /**
   * Seçilen araca göre işlem yap
   */
  const handleToolAction = (tool, position) => {
    switch(tool) {
      case TOOLS.TEXT:
        // Metin ekleme
        addAnnotation({
          type: TOOLS.TEXT,
          position,
          content: 'Yeni metin',
          fontSize: 14,
          color: '#000000'
        });
        break;
        
      case TOOLS.LINE:
        // Çizgi ekleme
        addAnnotation({
          type: TOOLS.LINE,
          start: position,
          end: { ...position, x: position.x + 100 },
          color: '#000000',
          width: 2
        });
        break;
        
      case TOOLS.HIGHLIGHT:
        // Vurgulama
        addAnnotation({
          type: TOOLS.HIGHLIGHT,
          position,
          width: 100,
          height: 20,
          color: 'rgba(255, 255, 0, 0.5)'
        });
        break;
        
      // Diğer araç tipleri için işlemler...
      case TOOLS.IMAGE:
        // Resim eklemek için dosya seçme diyaloğunu aç
        document.getElementById('image-upload').click();
        break;
        
      case TOOLS.SIGNATURE:
        // İmza ekleme modalını aç
        // ...
        break;
        
      default:
        break;
    }
  };
  
  /**
   * Annotation (açıklama/çizim) ekle
   */
  const addAnnotation = (annotation) => {
    const newAnnotation = {
      ...annotation,
      id: `annotation_${Date.now()}`,
      page: currentPage
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    setSuccess('Öğe eklendi');
    setTimeout(() => setSuccess(''), 2000);
  };

  /**
   * Annotation düzenleme
   */
  const updateAnnotation = (id, changes) => {
    setAnnotations(prev => 
      prev.map(ann => ann.id === id ? { ...ann, ...changes } : ann)
    );
  };
  
  /**
   * Annotation silme
   */
  const deleteAnnotation = (id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    setSuccess('Öğe silindi');
    setTimeout(() => setSuccess(''), 2000);
  };

  /**
   * PDF'i kaydet
   */
  const savePdf = async () => {
    try {
      setLoading(true);
      
      // Düzenlemeleri PDF'e uygula
      const modifiedPdf = await PdfAnnotationService.applyAnnotations(
        pdfBytes, 
        annotations
      );
      
      // İndir
      const blob = new Blob([modifiedPdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace('.pdf', '_düzenlenmiş.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setLoading(false);
      setSuccess('PDF başarıyla kaydedildi');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      console.error('PDF kaydetme hatası:', error);
      setError(`PDF kaydedilemedi: ${error.message}`);
      setLoading(false);
    }
  };

  /**
   * Düzenleme modundan çık
   */
  const exitEditMode = () => {
    setIsEditing(false);
    setPdfDocument(null);
    setPdfBytes(null);
    setPdfUrl(null);
    setFileName('');
    setCurrentPage(1);
    setTotalPages(0);
    setAnnotations([]);
    setThumbnails([]);
    
    // URL'i temizle
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  };
  
  // Temizleme işlemleri
  useEffect(() => {
    return () => {
      // Komponent kaldırıldığında kaynakları temizle
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      if (pdfDocument) {
        try {
          pdfDocument.destroy();
        } catch (e) {
          console.warn('PDF destroy hatası:', e);
        }
      }
    };
  }, [pdfUrl, pdfDocument]);

  return (
    <div className={styles.pdfEditor}>
      <Helmet>
        <title>PDF Düzenleyici - lazımsaburada</title>
        <meta
          name="description"
          content="PDF dosyalarını düzenleyin, metin ekleyin, çizim yapın ve içerik değiştirin"
        />
      </Helmet>

      {!isEditing ? (
        // PDF Yükleme Ekranı
        <div className={styles.uploadContainer}>
          <div className={styles.uploadHeader}>
              <h1>PDF Düzenleyici</h1>
              <p>PDF dosyalarını kolayca düzenleyin, metin ekleyin, imza atın ve içeriği özelleştirin</p>
          </div>

          <div className={styles.uploadArea}>
            <div className={styles.uploadBox}>
              <div className={styles.uploadIcon}>
                <i className="fas fa-file-pdf"></i>
              </div>
              <h2>PDF Dosyanızı Yükleyin</h2>
              <p>Düzenlemek istediğiniz PDF dosyasını seçin</p>
              
              <label className={styles.uploadButton}>
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className={styles.fileInput}
                />
                <i className="fas fa-upload"></i> PDF Dosyası Seç
              </label>
              
              <div className={styles.supportedInfo}>
                <i className="fas fa-info-circle"></i> Desteklenen format: PDF
              </div>
            </div>
            
            <div className={styles.featuresGrid}>
              {/* Özellik kartları */}
              <div className={styles.featureCard}>
                <i className="fas fa-font"></i>
                  <h3>Metin Düzenleme</h3>
                <p>PDF'e metin ekleyin ve düzenleyin</p>
              </div>
              
              <div className={styles.featureCard}>
                <i className="fas fa-pen"></i>
                <h3>Çizim Araçları</h3>
                <p>Çizgiler, şekiller ve el yazısı</p>
              </div>
              
              <div className={styles.featureCard}>
                <i className="fas fa-image"></i>
                <h3>Görsel Ekleme</h3>
                <p>PDF'e resim ve grafik ekleyin</p>
              </div>
              
              <div className={styles.featureCard}>
                <i className="fas fa-signature"></i>
                <h3>İmza Atma</h3>
                <p>Dijital imzalar ekleyin</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // PDF Düzenleme Ekranı
        <div className={styles.editorContainer} ref={containerRef}>
          {/* Üst Toolbar */}
          <div className={styles.editorHeader}>
            <div className={styles.logoArea}>
              <div className={styles.logo}>
                <i className="fas fa-file-pdf"></i>
                <span>PDF Düzenleyici</span>
              </div>
              <div className={styles.fileName}>{fileName}</div>
            </div>
            
            <PdfToolbar 
              activeTool={activeTool} 
              onChangeTool={changeTool}
              tools={TOOLS}
              onSave={savePdf}
              onExit={exitEditMode}
            />
          </div>
          
          <div className={styles.editorContent}>
            {/* Küçük Resimler Kenar Çubuğu */}
            {thumbnails.length > 0 && (
              <PdfThumbnails 
                thumbnails={thumbnails}
                currentPage={currentPage}
                onPageChange={changePage}
                totalPages={totalPages}
              />
            )}
            
            <div className={styles.editorMain}>
              {/* Sayfa Navigasyonu */}
              <PdfPageNavigator 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={changePage}
                scale={scale}
                onZoomChange={handleZoom}
              />
              
                {/* PDF Canvas */}
              <div 
                className={styles.canvasContainer} 
                onClick={handleCanvasClick}
              >
                <PdfViewerCanvas 
                  ref={canvasRef}
                  pdfDocument={pdfDocument}
                  currentPage={currentPage}
                  scale={scale}
                  onRender={() => setLoading(false)}
                  setError={setError}
                  setLoading={setLoading}
                />
                
                {/* Aktif araç bileşenleri */}
                {activeTool === TOOLS.TEXT && (
                  <TextTool 
                    annotations={annotations.filter(a => a.type === TOOLS.TEXT && a.page === currentPage)}
                    onUpdate={updateAnnotation}
                    onDelete={deleteAnnotation}
                    scale={scale}
                />
                )}
                
                {activeTool === TOOLS.LINE && (
                  <LineTool 
                    annotations={annotations.filter(a => a.type === TOOLS.LINE && a.page === currentPage)}
                    onUpdate={updateAnnotation}
                    onDelete={deleteAnnotation}
                    scale={scale}
                  />
                )}
                
                {activeTool === TOOLS.HIGHLIGHT && (
                  <HighlightTool 
                    annotations={annotations.filter(a => a.type === TOOLS.HIGHLIGHT && a.page === currentPage)}
                    onUpdate={updateAnnotation}
                    onDelete={deleteAnnotation}
                    scale={scale}
                    />
                )}
                
                {/* Diğer araçlar... */}
                
                {/* Tüm sayfadaki ek açıklamaları göster */}
                {annotations
                  .filter(ann => ann.page === currentPage)
                  .map(ann => {
                    switch(ann.type) {
                      case TOOLS.TEXT:
                        return (
                          <div 
                            key={ann.id}
                            className={styles.textAnnotation}
                            style={{
                              left: ann.position.x * scale,
                              top: ann.position.y * scale,
                              fontSize: `${ann.fontSize * scale}px`,
                              color: ann.color
                            }}
                          >
                            {ann.content}
                          </div>
                        );
                      
                      case TOOLS.LINE:
                        return (
                          <div 
                            key={ann.id}
                            className={styles.lineAnnotation}
                            style={{
                              left: ann.start.x * scale,
                              top: ann.start.y * scale,
                              width: Math.abs(ann.end.x - ann.start.x) * scale,
                              height: Math.abs(ann.end.y - ann.start.y) * scale,
                              borderTop: `${ann.width}px solid ${ann.color}`
                            }}
                          />
                        );
                      
                      case TOOLS.HIGHLIGHT:
                        return (
                          <div 
                            key={ann.id}
                            className={styles.highlightAnnotation}
                            style={{
                              left: ann.position.x * scale,
                              top: ann.position.y * scale,
                              width: ann.width * scale,
                              height: ann.height * scale,
                              backgroundColor: ann.color
                            }}
                          />
                        );
                      
                      // Diğer annotation tipleri...
                      
                      default:
                        return null;
                    }
                  })
                }
              </div>
            </div>
          </div>
          
          {/* Görünmeyen dosya yükleme girdileri */}
          <input 
            type="file" 
            id="image-upload"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              // Resim yükleme işlemi...
            }}
          />
        </div>
      )}
      
      {/* Yükleme Göstergesi */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}>
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <span>İşleniyor...</span>
        </div>
      )}
      
      {/* Hata Mesajı */}
      {error && (
        <div className={styles.errorMessage}>
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      {/* Başarı Mesajı */}
      {success && (
        <div className={styles.successMessage}>
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}
    </div>
  );
};

export default PdfEditor; 