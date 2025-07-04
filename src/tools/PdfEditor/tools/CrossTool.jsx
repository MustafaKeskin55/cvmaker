import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Çarpı İşareti Ekleme Aracı
 */
const CrossTool = ({ 
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

  // Element sil
  const handleDelete = (id) => {
    onDelete(id, 'cross');
  };

  return (
    <>
      {annotations.map(annotation => {
        const size = annotation.size || 20;
        
        return (
          <div 
            key={annotation.id}
            className={styles.crossContainer}
            style={{
              position: 'absolute',
              left: annotation.position.x * scale - size/2 * scale,
              top: annotation.position.y * scale - size/2 * scale,
              width: size * scale,
              height: size * scale,
              cursor: 'move',
              zIndex: 10
            }}
            onMouseDown={(e) => handleDragStart(e, annotation)}
          >
            {/* Çarpı işareti */}
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${size} ${size}`}
              style={{ overflow: 'visible' }}
            >
              <line
                x1="0"
                y1="0"
                x2={size}
                y2={size}
                stroke={annotation.color || '#FF0000'}
                strokeWidth={annotation.width || 2}
              />
              <line
                x1="0"
                y1={size}
                x2={size}
                y2="0"
                stroke={annotation.color || '#FF0000'}
                strokeWidth={annotation.width || 2}
              />
            </svg>
            
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
                title="İşareti Sil"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};

CrossTool.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      size: PropTypes.number,
      width: PropTypes.number,
      color: PropTypes.string,
      page: PropTypes.number.isRequired
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired
};

export default CrossTool; 