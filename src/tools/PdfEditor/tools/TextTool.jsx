import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Metin Ekleme Aracı
 * PDF'e metin eklemek ve düzenlemek için kullanılır
 */
const TextTool = ({ 
  annotations, 
  onUpdate, 
  onDelete, 
  scale 
}) => {
  const [editingText, setEditingText] = useState(null);
  const [textValue, setTextValue] = useState('');

  // Metin düzenleme modalını aç
  const handleEditText = (annotation) => {
    setEditingText(annotation);
    setTextValue(annotation.content);
  };

  // Düzenlenen metni kaydet
  const handleSaveText = () => {
    if (editingText && textValue.trim() !== '') {
      onUpdate(editingText.id, { content: textValue });
      setEditingText(null);
      setTextValue('');
    }
  };

  // Düzenleme iptal
  const handleCancelEdit = () => {
    setEditingText(null);
    setTextValue('');
  };

  // Metin sil
  const handleDeleteText = (id) => {
    onDelete(id, 'text');
  };

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

  return (
    <>
      {/* Metin elemanları */}
      {annotations.map(annotation => (
        <div
          key={annotation.id}
          className={styles.textAnnotation}
          style={{
            left: annotation.position.x * scale,
            top: annotation.position.y * scale,
            fontSize: `${annotation.fontSize * scale}px`,
            color: annotation.color || '#000000',
            cursor: 'move',
            position: 'absolute',
            zIndex: 10
          }}
          onMouseDown={(e) => handleDragStart(e, annotation)}
        >
          <div className={styles.textContent}>
            {annotation.content}
          </div>
          
          <div className={styles.annotationControls}>
            <button 
              className={styles.editButton}
              onClick={(e) => {
                e.stopPropagation();
                handleEditText(annotation);
              }}
              title="Metni Düzenle"
            >
              <i className="fas fa-edit"></i>
            </button>
            
            <button 
              className={styles.deleteButton}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteText(annotation.id);
              }}
              title="Metni Sil"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      ))}
      
      {/* Metin düzenleme modalı */}
      {editingText && (
        <div className={styles.textEditorModal}>
          <div className={styles.textEditorContainer}>
            <div className={styles.textEditorHeader}>
              <h3>Metni Düzenle</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCancelEdit}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <textarea
              className={styles.textEditorInput}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              autoFocus
            />
            
            <div className={styles.textEditorControls}>
              <div className={styles.textStyleOptions}>
                <select 
                  className={styles.fontSelect}
                  onChange={(e) => onUpdate(editingText.id, { fontFamily: e.target.value })}
                  value={editingText.fontFamily || 'Arial'}
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                </select>
                
                <select 
                  className={styles.fontSizeSelect}
                  onChange={(e) => onUpdate(editingText.id, { fontSize: parseInt(e.target.value) })}
                  value={editingText.fontSize || 12}
                >
                  <option value="8">8</option>
                  <option value="10">10</option>
                  <option value="12">12</option>
                  <option value="14">14</option>
                  <option value="16">16</option>
                  <option value="18">18</option>
                  <option value="20">20</option>
                  <option value="24">24</option>
                </select>
                
                <input 
                  type="color" 
                  className={styles.colorPicker}
                  value={editingText.color || '#000000'}
                  onChange={(e) => onUpdate(editingText.id, { color: e.target.value })}
                />
              </div>
              
              <div className={styles.textActionButtons}>
                <button 
                  className={styles.cancelButton}
                  onClick={handleCancelEdit}
                >
                  İptal
                </button>
                
                <button 
                  className={styles.saveButton}
                  onClick={handleSaveText}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

TextTool.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      fontSize: PropTypes.number,
      color: PropTypes.string,
      fontFamily: PropTypes.string
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired
};

export default TextTool; 