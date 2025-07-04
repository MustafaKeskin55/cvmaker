import React from 'react';
import styles from '../styles.module.css';

/**
 * PDF üzerindeki görsel elemanı
 */
const ImageElement = ({
  element,
  onDrag,
  onDelete,
  type = 'image' // 'image' veya 'signature'
}) => {
  return (
    <div
      id={`element-${element.id}`}
      className={`${styles.editableElement} ${styles[`${type}Element`]}`}
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`
      }}
      onMouseDown={(e) => onDrag(e, element.id, type)}
    >
      <img src={element.src} alt={type === 'image' ? "Eklenen görsel" : "İmza"} />
      <div className={styles.elementControls}>
        <button 
          className={styles.elementDeleteButton}
          onClick={() => onDelete(element.id, type)}
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default ImageElement; 