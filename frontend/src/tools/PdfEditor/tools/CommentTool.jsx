import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Açıklama/Yorum Ekleme Aracı
 */
const CommentTool = ({ 
  annotations, 
  onUpdate, 
  onDelete, 
  scale 
}) => {
  const [editingComment, setEditingComment] = useState(null);
  const [commentValue, setCommentValue] = useState('');
  
  // Element taşıma
  const handleDragStart = (e, annotation) => {
    e.stopPropagation();
    
    if (editingComment) return;
    
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

  // Yorum düzenleme başlat
  const handleEditComment = (annotation) => {
    setEditingComment(annotation);
    setCommentValue(annotation.content || '');
  };
  
  // Düzenlemeyi kaydet
  const handleSaveComment = () => {
    if (editingComment) {
      onUpdate(editingComment.id, { content: commentValue });
      setEditingComment(null);
      setCommentValue('');
    }
  };
  
  // Düzenlemeyi iptal et
  const handleCancelEdit = () => {
    setEditingComment(null);
    setCommentValue('');
  };

  // Açıklamayı sil
  const handleDelete = (id) => {
    onDelete(id, 'comment');
  };

  return (
    <>
      {annotations.map(annotation => (
        <div 
          key={annotation.id}
          className={styles.commentContainer}
          style={{
            position: 'absolute',
            left: annotation.position.x * scale,
            top: annotation.position.y * scale,
            zIndex: 10
          }}
        >
          {/* Yorum balonu */}
          <div 
            className={styles.commentBubble}
            style={{
              display: 'flex',
              padding: '8px 12px',
              backgroundColor: annotation.color || '#FFEB3B',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              maxWidth: '250px',
              cursor: 'move',
              position: 'relative'
            }}
            onMouseDown={(e) => handleDragStart(e, annotation)}
          >
            <div className={styles.commentIcon} style={{ marginRight: '8px' }}>
              <i className="fas fa-comment-alt"></i>
            </div>
            
            <div className={styles.commentContent}>
              {annotation.content || 'Yorum ekleyin...'}
            </div>
            
            {/* Kontrol düğmeleri */}
            <div 
              className={styles.annotationControls}
              style={{
                position: 'absolute',
                right: '5px',
                top: '5px',
                display: 'flex',
                gap: '5px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className={styles.editButton}
                onClick={() => handleEditComment(annotation)}
                title="Yorumu Düzenle"
                style={{ fontSize: '12px' }}
              >
                <i className="fas fa-edit"></i>
              </button>
              
              <button 
                className={styles.deleteButton}
                onClick={() => handleDelete(annotation.id)}
                title="Yorumu Sil"
                style={{ fontSize: '12px' }}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          {/* Yorum bağlantı çizgisi */}
          <div 
            className={styles.commentConnector}
            style={{
              position: 'absolute',
              left: '10px',
              bottom: '-10px',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `10px solid ${annotation.color || '#FFEB3B'}`
            }}
          />
        </div>
      ))}
      
      {/* Yorum düzenleme modalı */}
      {editingComment && (
        <div 
          className={styles.commentModal}
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
            className={styles.commentModalContent}
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '4px',
              width: '350px',
              maxWidth: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Yorumu Düzenle</h3>
            
            <textarea
              value={commentValue}
              onChange={(e) => setCommentValue(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '8px',
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              placeholder="Yorum metni girin..."
            />
            
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
                onClick={handleSaveComment}
                style={{
                  padding: '8px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#4CAF50',
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

CommentTool.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string,
      position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      color: PropTypes.string,
      page: PropTypes.number.isRequired
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired
};

export default CommentTool; 