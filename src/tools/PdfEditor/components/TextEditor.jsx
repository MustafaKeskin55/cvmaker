import React from 'react';
import styles from '../styles.module.css';

/**
 * PDF metin düzenleme bileşeni
 */
const TextEditor = ({ 
  visible,
  position, 
  value, 
  onChange, 
  onSave, 
  onCancel 
}) => {
  if (!visible) return null;
  
  return (
    <div 
      className={styles.textEditor}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Metin girin"
        autoFocus
      />
      <div className={styles.textEditorButtons}>
        <button onClick={onSave}>
          <i className="fas fa-check"></i>
        </button>
        <button onClick={onCancel}>
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default TextEditor; 