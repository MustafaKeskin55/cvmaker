import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Sayfa Navigasyon Bileşeni
 * Sayfalar arası gezinme ve zoom kontrollerini sağlar
 */
const PdfPageNavigator = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  scale, 
  onZoomChange 
}) => {
  // Sayfa numarası giriş değişimi
  const handlePageInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      onPageChange(value);
    }
  };

  // Yakınlaştırma/uzaklaştırma
  const handleZoomIn = () => {
    onZoomChange(scale + 0.1);
  };

  const handleZoomOut = () => {
    onZoomChange(scale - 0.1);
  };

  const handleZoomReset = () => {
    onZoomChange(1.0);
  };

  // Sayfa değiştirme
  const goToFirstPage = () => {
    onPageChange(1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const goToLastPage = () => {
    onPageChange(totalPages);
  };

  return (
    <div className={styles.pageNavigator}>
      <div className={styles.pageControls}>
        <button
          className={styles.navButton}
          onClick={goToFirstPage}
          disabled={currentPage <= 1}
          title="İlk Sayfa"
        >
          <i className="fas fa-angle-double-left"></i>
        </button>
        
        <button
          className={styles.navButton}
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          title="Önceki Sayfa"
        >
          <i className="fas fa-angle-left"></i>
        </button>
        
        <div className={styles.pageIndicator}>
          <input
            type="number"
            className={styles.pageInput}
            value={currentPage}
            onChange={handlePageInputChange}
            min="1"
            max={totalPages}
          />
          <span> / {totalPages}</span>
        </div>
        
        <button
          className={styles.navButton}
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          title="Sonraki Sayfa"
        >
          <i className="fas fa-angle-right"></i>
        </button>
        
        <button
          className={styles.navButton}
          onClick={goToLastPage}
          disabled={currentPage >= totalPages}
          title="Son Sayfa"
        >
          <i className="fas fa-angle-double-right"></i>
        </button>
      </div>
      
      <div className={styles.zoomControls}>
        <button
          className={styles.zoomButton}
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          title="Uzaklaştır"
        >
          <i className="fas fa-search-minus"></i>
        </button>
        
        <button
          className={styles.zoomResetButton}
          onClick={handleZoomReset}
          title="Varsayılan Boyut"
        >
          {Math.round(scale * 100)}%
        </button>
        
        <button
          className={styles.zoomButton}
          onClick={handleZoomIn}
          disabled={scale >= 3.0}
          title="Yakınlaştır"
        >
          <i className="fas fa-search-plus"></i>
        </button>
      </div>
    </div>
  );
};

PdfPageNavigator.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired,
  onZoomChange: PropTypes.func.isRequired
};

export default PdfPageNavigator; 