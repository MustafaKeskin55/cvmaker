import React from 'react';
import styles from '../styles.module.css';

/**
 * PDF üzerindeki metin elemanı
 */
const TextElement = ({
  element,
  onDrag,
  onEdit,
  onDelete,
  isExtracted = false
}) => {
  const classNames = [
    styles.editableElement,
    isExtracted ? styles.extractedTextElement : styles.textElement
  ].join(' ');
  
  const elementId = isExtracted ? `extracted-${element.id}` : `element-${element.id}`;
  
  return (
    <div
      id={elementId}
      className={classNames}
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        fontSize: `${element.fontSize}px`,
        color: element.color,
        ...(isExtracted ? {
          position: 'absolute',
          border: '1px dashed #3498db',
          padding: '2px',
          cursor: 'pointer',
          backgroundColor: 'rgba(52, 152, 219, 0.1)'
        } : {})
      }}
      onMouseDown={(e) => !isExtracted && onDrag(e, element.id, 'text')}
      onClick={() => isExtracted && onEdit(element)}
    >
      {element.text}
      {!isExtracted && (
        <div className={styles.elementControls}>
          <button 
            className={styles.elementEditButton}
            onClick={() => onEdit(element)}
          >
            <i className="fas fa-pen"></i>
          </button>
          <button 
            className={styles.elementDeleteButton}
            onClick={() => onDelete(element.id, 'text')}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default TextElement; 