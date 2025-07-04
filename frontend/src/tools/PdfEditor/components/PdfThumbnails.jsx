import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Küçük Resimler Bileşeni
 * PDF sayfalarının küçük resimlerini bir yan panel içinde gösterir
 */
const PdfThumbnails = ({ 
  thumbnails, 
  currentPage, 
  onPageChange, 
  totalPages 
}) => {
  return (
    <div className={styles.thumbnailSidebar}>
      <div className={styles.thumbnailHeader}>
        <h3>Sayfalar</h3>
        <span className={styles.pageCount}>{totalPages} sayfa</span>
      </div>
      
      <div className={styles.thumbnailList}>
        {thumbnails.map((thumbnail, index) => (
          <div 
            key={index}
            className={`${styles.thumbnailItem} ${currentPage === index + 1 ? styles.active : ''}`}
            onClick={() => onPageChange(index + 1)}
            role="button"
            aria-label={`Sayfa ${index + 1}`}
          >
            <div className={styles.thumbnailWrapper}>
              {thumbnail ? (
                <img 
                  src={thumbnail} 
                  alt={`Sayfa ${index + 1}`} 
                  className={styles.thumbnailImage}
                />
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  <i className="fas fa-file-pdf"></i>
                </div>
              )}
            </div>
            <div className={styles.thumbnailNumber}>
              {index + 1}
            </div>
          </div>
        ))}
        
        {/* Henüz yüklenmeyen sayfalar için yer tutucular */}
        {thumbnails.length < totalPages && (
          Array.from({ length: Math.min(5, totalPages - thumbnails.length) }, (_, i) => (
            <div 
              key={`placeholder-${i}`}
              className={styles.thumbnailItem}
              role="presentation"
            >
              <div className={styles.thumbnailWrapper}>
                <div className={styles.thumbnailPlaceholder}>
                  <div className={styles.thumbnailLoading}>
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                </div>
              </div>
              <div className={styles.thumbnailNumber}>
                {thumbnails.length + i + 1}
              </div>
            </div>
          ))
        )}
      </div>
      
      {totalPages > 10 && (
        <div className={styles.thumbnailFooter}>
          <button 
            className={styles.thumbnailPageButton}
            onClick={() => onPageChange(Math.max(1, currentPage - 5))}
            disabled={currentPage <= 1}
          >
            <i className="fas fa-chevron-up"></i>
          </button>
          
          <div className={styles.thumbnailPageIndicator}>
            Sayfa {currentPage} / {totalPages}
          </div>
          
          <button 
            className={styles.thumbnailPageButton}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 5))}
            disabled={currentPage >= totalPages}
          >
            <i className="fas fa-chevron-down"></i>
          </button>
        </div>
      )}
    </div>
  );
};

PdfThumbnails.propTypes = {
  thumbnails: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired
};

export default PdfThumbnails; 