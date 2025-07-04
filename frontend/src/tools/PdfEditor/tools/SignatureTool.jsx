import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF İmza Ekleme Aracı
 */
const SignatureTool = ({ 
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
  const handleResizeStart = (e, annotation) => {
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = annotation.width;
    const startHeight = annotation.height;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;
      
      // Oranı koru
      const aspectRatio = startWidth / startHeight;
      let newWidth = Math.max(50, startWidth + deltaX);
      let newHeight = newWidth / aspectRatio;
      
      onUpdate(annotation.id, { 
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

  // İmzayı sil
  const handleDelete = (id) => {
    onDelete(id, 'signature');
  };

  return (
    <>
      {annotations.map(annotation => (
        <div 
          key={annotation.id}
          className={styles.signatureContainer}
          style={{
            position: 'absolute',
            left: annotation.position.x * scale,
            top: annotation.position.y * scale,
            width: annotation.width * scale,
            height: annotation.height * scale,
            cursor: 'move',
            zIndex: 10
          }}
          onMouseDown={(e) => handleDragStart(e, annotation)}
        >
          {/* İmza Görüntüsü */}
          <img 
            src={annotation.imageData}
            alt="İmza"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
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
              onClick={() => handleDelete(annotation.id)}
              title="İmzayı Sil"
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
            onMouseDown={(e) => handleResizeStart(e, annotation)}
          />
        </div>
      ))}
    </>
  );
};

SignatureTool.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      imageData: PropTypes.string.isRequired,
      position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      page: PropTypes.number.isRequired
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired
};

export default SignatureTool; 