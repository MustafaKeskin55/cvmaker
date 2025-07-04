import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Çizgi Ekleme Aracı
 * PDF'e çizgi eklemek ve düzenlemek için kullanılır
 */
const LineTool = ({ 
  annotations, 
  onUpdate, 
  onDelete, 
  scale 
}) => {
  // Element taşıma - başlangıç noktası
  const handleStartPointDrag = (e, annotation) => {
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPoint = { ...annotation.start };
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;
      
      const newStart = {
        x: startPoint.x + deltaX,
        y: startPoint.y + deltaY
      };
      
      onUpdate(annotation.id, { start: newStart });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Element taşıma - bitiş noktası
  const handleEndPointDrag = (e, annotation) => {
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const endPoint = { ...annotation.end };
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;
      
      const newEnd = {
        x: endPoint.x + deltaX,
        y: endPoint.y + deltaY
      };
      
      onUpdate(annotation.id, { end: newEnd });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Çizgiyi tamamen taşıma
  const handleLineDrag = (e, annotation) => {
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPoint = { ...annotation.start };
    const endPoint = { ...annotation.end };
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;
      
      const newStart = {
        x: startPoint.x + deltaX,
        y: startPoint.y + deltaY
      };
      
      const newEnd = {
        x: endPoint.x + deltaX,
        y: endPoint.y + deltaY
      };
      
      onUpdate(annotation.id, { 
        start: newStart,
        end: newEnd
      });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Çizgi sil
  const handleDeleteLine = (id) => {
    onDelete(id, 'line');
  };

  return (
    <>
      {annotations.map(annotation => {
        // Çizgi özellikleri
        const startX = annotation.start.x * scale;
        const startY = annotation.start.y * scale;
        const endX = annotation.end.x * scale;
        const endY = annotation.end.y * scale;
        
        // Çizginin uzunluğunu ve açısını hesapla
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        
        return (
          <div key={annotation.id} className={styles.lineContainer}>
            {/* Çizgi */}
            <div 
              className={styles.lineAnnotation}
              style={{
                position: 'absolute',
                left: startX,
                top: startY,
                width: length,
                height: annotation.width || 2,
                backgroundColor: annotation.color || '#000000',
                transform: `rotate(${angle}deg)`,
                transformOrigin: '0 50%',
                cursor: 'move',
                zIndex: 5
              }}
              onMouseDown={(e) => handleLineDrag(e, annotation)}
            />
            
            {/* Başlangıç noktası */}
            <div 
              className={styles.lineEndpoint}
              style={{
                position: 'absolute',
                left: startX - 5,
                top: startY - 5,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid ' + (annotation.color || '#000000'),
                cursor: 'move',
                zIndex: 6
              }}
              onMouseDown={(e) => handleStartPointDrag(e, annotation)}
            />
            
            {/* Bitiş noktası */}
            <div 
              className={styles.lineEndpoint}
              style={{
                position: 'absolute',
                left: endX - 5,
                top: endY - 5,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid ' + (annotation.color || '#000000'),
                cursor: 'move',
                zIndex: 6
              }}
              onMouseDown={(e) => handleEndPointDrag(e, annotation)}
            />
            
            {/* Kontrol düğmeleri */}
            <div 
              className={styles.annotationControls}
              style={{
                position: 'absolute',
                left: (startX + endX) / 2,
                top: (startY + endY) / 2,
                transform: 'translate(-50%, -100%)',
                zIndex: 7
              }}
            >
              <button 
                className={styles.deleteButton}
                onClick={() => handleDeleteLine(annotation.id)}
                title="Çizgiyi Sil"
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

LineTool.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      start: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      end: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      width: PropTypes.number,
      color: PropTypes.string
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired
};

export default LineTool; 