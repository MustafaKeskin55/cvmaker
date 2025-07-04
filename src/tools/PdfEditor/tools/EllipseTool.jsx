import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Elips Ekleme Aracı
 * PDF'e elips eklemek için kullanılır
 */
const EllipseTool = ({ 
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

  // Boyutlandırma
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
      if (corner === 'bottom-right') {
        newWidth = Math.max(20, startWidth + deltaX);
        newHeight = Math.max(20, startHeight + deltaY);
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

  // Elipsi sil
  const handleDeleteEllipse = (id) => {
    onDelete(id, 'ellipse');
  };

  return (
    <>
      {annotations.map(annotation => (
        <div 
          key={annotation.id}
          className={styles.ellipseContainer}
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
          {/* Elips */}
          <div 
            className={styles.ellipseAnnotation}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `${annotation.borderWidth || 1}px solid ${annotation.color || '#000000'}`,
              backgroundColor: annotation.fillColor || 'transparent',
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
              onClick={() => handleDeleteEllipse(annotation.id)}
              title="Elipsi Sil"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
          
          {/* Boyutlandırma kulpu */}
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

EllipseTool.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      color: PropTypes.string,
      fillColor: PropTypes.string,
      borderWidth: PropTypes.number,
      page: PropTypes.number.isRequired
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired
};

export default EllipseTool; 