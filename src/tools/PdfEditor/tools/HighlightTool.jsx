import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Vurgulama Aracı
 * PDF'te metin vurgulamak için kullanılır
 */
const HighlightTool = ({ 
  annotations, 
  onUpdate, 
  onDelete, 
  scale 
}) => {
  // Element taşıma
  const handleDragStart = (e, annotation) => {
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosition = { ...annotation.position };
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;
      
      const newPosition = {
        x: startPosition.x + deltaX,
        y: startPosition.y + deltaY
      };
      
      onUpdate(annotation.id, { position: newPosition });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Vurgulama boyutunu değiştirme
  const handleResizeStart = (e, annotation, corner) => {
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosition = { ...annotation.position };
    const startWidth = annotation.width;
    const startHeight = annotation.height;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;
      
      let newPosition = { ...startPosition };
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      // Hangi köşeden boyutlandırma yapılıyor
      switch (corner) {
        case 'top-left':
          newPosition.x = startPosition.x + deltaX;
          newPosition.y = startPosition.y + deltaY;
          newWidth = startWidth - deltaX;
          newHeight = startHeight - deltaY;
          break;
        case 'top-right':
          newPosition.y = startPosition.y + deltaY;
          newWidth = startWidth + deltaX;
          newHeight = startHeight - deltaY;
          break;
        case 'bottom-left':
          newPosition.x = startPosition.x + deltaX;
          newWidth = startWidth - deltaX;
          newHeight = startHeight + deltaY;
          break;
        case 'bottom-right':
          newWidth = startWidth + deltaX;
          newHeight = startHeight + deltaY;
          break;
        default:
          break;
      }
      
      // Minimum boyut kontrolü
      if (newWidth < 10) {
        newWidth = 10;
        if (corner === 'top-left' || corner === 'bottom-left') {
          newPosition.x = startPosition.x + startWidth - 10;
        }
      }
      
      if (newHeight < 10) {
        newHeight = 10;
        if (corner === 'top-left' || corner === 'top-right') {
          newPosition.y = startPosition.y + startHeight - 10;
        }
      }
      
      onUpdate(annotation.id, { 
        position: newPosition,
        width: newWidth,
        height: newHeight
      });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Vurgulama sil
  const handleDeleteHighlight = (id) => {
    onDelete(id, 'highlight');
  };

  return (
    <>
      {annotations.map(annotation => (
        <div 
          key={annotation.id}
          className={styles.highlightContainer}
          style={{
            position: 'absolute',
            left: annotation.position.x * scale,
            top: annotation.position.y * scale,
            width: annotation.width * scale,
            height: annotation.height * scale,
            cursor: 'move',
            zIndex: 5
          }}
        >
          {/* Vurgulama dikdörtgeni */}
          <div 
            className={styles.highlightAnnotation}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              backgroundColor: annotation.color || 'rgba(255, 255, 0, 0.3)',
              border: '1px dashed rgba(0, 0, 0, 0.5)',
              boxSizing: 'border-box'
            }}
            onMouseDown={(e) => handleDragStart(e, annotation)}
          />
          
          {/* Kontrol düğmeleri */}
          <div 
            className={styles.annotationControls}
            style={{
              position: 'absolute',
              right: 0,
              top: '-25px'
            }}
          >
            <button 
              className={styles.deleteButton}
              onClick={() => handleDeleteHighlight(annotation.id)}
              title="Vurgulamayı Sil"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
          
          {/* Yeniden boyutlandırma köşeleri */}
          <div 
            className={styles.resizeHandle}
            style={{
              position: 'absolute',
              left: -5,
              top: -5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #000000',
              cursor: 'nwse-resize'
            }}
            onMouseDown={(e) => handleResizeStart(e, annotation, 'top-left')}
          />
          
          <div 
            className={styles.resizeHandle}
            style={{
              position: 'absolute',
              right: -5,
              top: -5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #000000',
              cursor: 'nesw-resize'
            }}
            onMouseDown={(e) => handleResizeStart(e, annotation, 'top-right')}
          />
          
          <div 
            className={styles.resizeHandle}
            style={{
              position: 'absolute',
              left: -5,
              bottom: -5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #000000',
              cursor: 'nesw-resize'
            }}
            onMouseDown={(e) => handleResizeStart(e, annotation, 'bottom-left')}
          />
          
          <div 
            className={styles.resizeHandle}
            style={{
              position: 'absolute',
              right: -5,
              bottom: -5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #000000',
              cursor: 'nwse-resize'
            }}
            onMouseDown={(e) => handleResizeStart(e, annotation, 'bottom-right')}
          />
        </div>
      ))}
    </>
  );
};

HighlightTool.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      color: PropTypes.string
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired
};

export default HighlightTool; 