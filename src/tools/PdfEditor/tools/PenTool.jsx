import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Kalem Aracı
 * PDF'e serbest çizim yapmak için kullanılır
 */
const PenTool = ({ 
  annotations, 
  onUpdate, 
  onDelete, 
  scale 
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  
  // Element sil
  const handleDeletePath = (id) => {
    onDelete(id, 'pen');
  };

  // Canvas olaylarını dinle
  useEffect(() => {
    const canvasContainer = document.querySelector(`.${styles.canvasContainer}`);
    if (!canvasContainer) return;
    
    const handleMouseDown = (e) => {
      // Sadece pen aracı aktifken çalış
      if (!isDrawing) {
        const rect = canvasContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        
        // Yeni bir path başlat
        setCurrentPath({
          id: `pen_${Date.now()}`,
          type: 'pen',
          points: [{ x, y }],
          color: '#000000',
          width: 2,
          page: 1 // Aktif sayfayı kullan
        });
        
        setIsDrawing(true);
      }
    };
    
    const handleMouseMove = (e) => {
      if (isDrawing && currentPath) {
        const rect = canvasContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        
        // Yeni noktayı ekle
        setCurrentPath(prev => ({
          ...prev,
          points: [...prev.points, { x, y }]
        }));
      }
    };
    
    const handleMouseUp = () => {
      if (isDrawing && currentPath) {
        // Çizimi tamamla ve ekle
        onUpdate(currentPath.id, currentPath);
        setIsDrawing(false);
        setCurrentPath(null);
      }
    };
    
    // Olayları dinle
    canvasContainer.addEventListener('mousedown', handleMouseDown);
    canvasContainer.addEventListener('mousemove', handleMouseMove);
    canvasContainer.addEventListener('mouseup', handleMouseUp);
    canvasContainer.addEventListener('mouseleave', handleMouseUp);
    
    // Temizle
    return () => {
      canvasContainer.removeEventListener('mousedown', handleMouseDown);
      canvasContainer.removeEventListener('mousemove', handleMouseMove);
      canvasContainer.removeEventListener('mouseup', handleMouseUp);
      canvasContainer.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDrawing, currentPath, onUpdate, scale]);

  // SVG path oluştur
  const createSvgPath = (points) => {
    if (!points || points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };

  return (
    <>
      {/* Mevcut çizimler */}
      {annotations.map(annotation => (
        <div 
          key={annotation.id}
          className={styles.penAnnotation}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <svg 
            width="100%" 
            height="100%" 
            style={{ position: 'absolute', left: 0, top: 0 }}
          >
            <path
              d={createSvgPath(annotation.points.map(pt => ({
                x: pt.x * scale,
                y: pt.y * scale
              })))}
              stroke={annotation.color || '#000000'}
              strokeWidth={annotation.width || 2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          {/* Kontrol düğmeleri */}
          <div 
            className={styles.annotationControls}
            style={{
              position: 'absolute',
              left: annotation.points[0].x * scale,
              top: annotation.points[0].y * scale - 25,
              pointerEvents: 'auto'
            }}
          >
            <button 
              className={styles.deleteButton}
              onClick={() => handleDeletePath(annotation.id)}
              title="Çizimi Sil"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      ))}
      
      {/* Aktif çizim */}
      {isDrawing && currentPath && (
        <div 
          className={styles.penAnnotation}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 11
          }}
        >
          <svg 
            width="100%" 
            height="100%" 
            style={{ position: 'absolute', left: 0, top: 0 }}
          >
            <path
              d={createSvgPath(currentPath.points.map(pt => ({
                x: pt.x * scale,
                y: pt.y * scale
              })))}
              stroke={currentPath.color || '#000000'}
              strokeWidth={currentPath.width || 2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </>
  );
};

PenTool.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      points: PropTypes.arrayOf(
        PropTypes.shape({
          x: PropTypes.number.isRequired,
          y: PropTypes.number.isRequired
        })
      ).isRequired,
      width: PropTypes.number,
      color: PropTypes.string,
      page: PropTypes.number.isRequired
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired
};

export default PenTool; 