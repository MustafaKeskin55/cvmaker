import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Bağlantı Ekleme Aracı
 */
const LinkTool = ({ 
  annotations, 
  onUpdate, 
  onDelete, 
  scale 
}) => {
  const [editingLink, setEditingLink] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  
  // Element taşıma
  const handleDragStart = (e, annotation) => {
    e.stopPropagation();
    
    if (editingLink) return;
    
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
      
      // Sadece genişlik değiştir
      let newWidth = Math.max(50, startWidth + deltaX);
      
      onUpdate(annotation.id, { width: newWidth });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Link düzenleme başlat
  const handleEditLink = (annotation) => {
    setEditingLink(annotation);
    setLinkUrl(annotation.url || '');
    setLinkText(annotation.content || '');
  };
  
  // Düzenlemeyi kaydet
  const handleSaveLink = () => {
    if (editingLink) {
      onUpdate(editingLink.id, { 
        url: linkUrl,
        content: linkText
      });
      setEditingLink(null);
      setLinkUrl('');
      setLinkText('');
    }
  };
  
  // Düzenlemeyi iptal et
  const handleCancelEdit = () => {
    setEditingLink(null);
    setLinkUrl('');
    setLinkText('');
  };

  // Bağlantıyı sil
  const handleDelete = (id) => {
    onDelete(id, 'link');
  };

  // Link tıklama
  const handleLinkClick = (e, url) => {
    e.stopPropagation();
    
    if (!editingLink && url) {
      // Url kontrolü
      let finalUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        finalUrl = 'https://' + url;
      }
      
      window.open(finalUrl, '_blank');
    }
  };

  return (
    <>
      {annotations.map(annotation => (
        <div 
          key={annotation.id}
          className={styles.linkContainer}
          style={{
            position: 'absolute',
            left: annotation.position.x * scale,
            top: annotation.position.y * scale,
            width: (annotation.width || 150) * scale,
            height: (annotation.height || 30) * scale,
            cursor: 'move',
            zIndex: 10
          }}
          onMouseDown={(e) => handleDragStart(e, annotation)}
        >
          {/* Bağlantı */}
          <div 
            className={styles.linkAnnotation}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              border: '1px solid #3f51b5',
              borderRadius: '4px',
              backgroundColor: 'rgba(63, 81, 181, 0.1)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
            onClick={(e) => handleLinkClick(e, annotation.url)}
          >
            <div className={styles.linkIcon} style={{ marginRight: '8px' }}>
              <i className="fas fa-link"></i>
            </div>
            
            <div 
              className={styles.linkContent}
              style={{
                color: '#3f51b5',
                textDecoration: 'underline',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {annotation.content || annotation.url || 'Bağlantı'}
            </div>
          </div>
          
          {/* Kontrol düğmeleri */}
          <div 
            className={styles.annotationControls}
            style={{
              position: 'absolute',
              right: '5px',
              top: '5px',
              display: 'flex',
              gap: '5px',
              zIndex: 1
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={styles.editButton}
              onClick={() => handleEditLink(annotation)}
              title="Bağlantıyı Düzenle"
              style={{ fontSize: '12px' }}
            >
              <i className="fas fa-edit"></i>
            </button>
            
            <button 
              className={styles.deleteButton}
              onClick={() => handleDelete(annotation.id)}
              title="Bağlantıyı Sil"
              style={{ fontSize: '12px' }}
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
              bottom: 'calc(50% - 5px)',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #3f51b5',
              cursor: 'ew-resize'
            }}
            onMouseDown={(e) => handleResizeStart(e, annotation)}
          />
        </div>
      ))}
      
      {/* Bağlantı düzenleme modalı */}
      {editingLink && (
        <div 
          className={styles.linkModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100
          }}
          onClick={handleCancelEdit}
        >
          <div 
            className={styles.linkModalContent}
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '4px',
              width: '350px',
              maxWidth: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Bağlantıyı Düzenle</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Bağlantı Metni:
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
                placeholder="Görüntülenecek metin"
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                URL:
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
                placeholder="https://örnek.com"
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={handleCancelEdit}
                style={{
                  padding: '8px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#f2f2f2',
                  cursor: 'pointer'
                }}
              >
                İptal
              </button>
              
              <button 
                onClick={handleSaveLink}
                style={{
                  padding: '8px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#3f51b5',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

LinkTool.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string,
      content: PropTypes.string,
      position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      width: PropTypes.number,
      height: PropTypes.number,
      page: PropTypes.number.isRequired
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired
};

export default LinkTool;