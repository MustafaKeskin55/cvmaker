import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.css';

/**
 * PDF Düzenleyici Araç Çubuğu
 * Görseldeki tüm düzenleme araçlarını içerir
 */
const PdfToolbar = ({ activeTool, onChangeTool, tools, onSave, onExit }) => {
  // Araç düğmesi bileşeni
  const ToolButton = ({ tool, icon, label, isActive }) => (
    <button
      type="button"
      className={`${styles.toolButton} ${isActive ? styles.active : ''}`}
      onClick={() => onChangeTool(tool)}
      title={label}
    >
      <i className={`fas ${icon}`}></i>
      <span>{label}</span>
    </button>
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarMain}>
        <div className={styles.toolGroup}>
          <ToolButton
            tool={tools.TEXT}
            icon="fa-font"
            label="Metin Düzenle"
            isActive={activeTool === tools.TEXT}
          />
          
          <ToolButton
            tool={tools.LINE}
            icon="fa-slash"
            label="Çizgi"
            isActive={activeTool === tools.LINE}
          />
          
          <ToolButton
            tool={tools.HIGHLIGHT}
            icon="fa-highlighter"
            label="Vurgula"
            isActive={activeTool === tools.HIGHLIGHT}
          />
          
          <ToolButton
            tool={tools.PEN}
            icon="fa-pen"
            label="Kurşun Kalem"
            isActive={activeTool === tools.PEN}
          />
          
          <ToolButton
            tool={tools.IMAGE}
            icon="fa-image"
            label="Resim"
            isActive={activeTool === tools.IMAGE}
          />
          
          <ToolButton
            tool={tools.ELLIPSE}
            icon="fa-circle"
            label="Elips"
            isActive={activeTool === tools.ELLIPSE}
          />
          
          <ToolButton
            tool={tools.CROSS}
            icon="fa-times"
            label="Çarpı"
            isActive={activeTool === tools.CROSS}
          />
          
          <ToolButton
            tool={tools.CHECK}
            icon="fa-check"
            label="Onay"
            isActive={activeTool === tools.CHECK}
          />
          
          <ToolButton
            tool={tools.SIGNATURE}
            icon="fa-signature"
            label="İmza"
            isActive={activeTool === tools.SIGNATURE}
          />
          
          <ToolButton
            tool={tools.COMMENT}
            icon="fa-comment-alt"
            label="Açıklamalar"
            isActive={activeTool === tools.COMMENT}
          />
          
          <ToolButton
            tool={tools.LINK}
            icon="fa-link"
            label="Bağlantılar"
            isActive={activeTool === tools.LINK}
          />
          
          <div className={styles.toolbarDropdown}>
            <button className={styles.toolButton}>
              <i className="fas fa-ellipsis-h"></i>
              <span>Daha Fazla Araç</span>
            </button>
            <div className={styles.dropdownContent}>
              <button className={styles.dropdownItem}>
                <i className="fas fa-eraser"></i>
                <span>Silgi</span>
              </button>
              <button className={styles.dropdownItem}>
                <i className="fas fa-crop"></i>
                <span>Kırp</span>
              </button>
              <button className={styles.dropdownItem}>
                <i className="fas fa-arrows-alt"></i>
                <span>Taşı</span>
              </button>
              <button className={styles.dropdownItem}>
                <i className="fas fa-object-group"></i>
                <span>Grupla</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.actionButtons}>
          <button
            className={styles.saveButton}
            onClick={onSave}
            title="PDF'i Kaydet"
          >
            <i className="fas fa-save"></i>
            <span>Kaydet</span>
          </button>
          
          <button
            className={styles.exitButton}
            onClick={onExit}
            title="Düzenleyiciden Çık"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      {/* Alt Araç Çubuğu - Seçilen araç için özelleşmiş ayarlar */}
      {activeTool && (
        <div className={styles.toolbarOptions}>
          {/* Metin Ayarları */}
          {activeTool === tools.TEXT && (
            <div className={styles.textOptions}>
              <select className={styles.fontSelect}>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
              </select>
              
              <select className={styles.fontSize}>
                <option value="8">8</option>
                <option value="10">10</option>
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="18">18</option>
                <option value="20">20</option>
                <option value="24">24</option>
              </select>
              
              <div className={styles.textStyle}>
                <button className={styles.styleButton} title="Kalın">
                  <i className="fas fa-bold"></i>
                </button>
                <button className={styles.styleButton} title="İtalik">
                  <i className="fas fa-italic"></i>
                </button>
                <button className={styles.styleButton} title="Altı Çizili">
                  <i className="fas fa-underline"></i>
                </button>
              </div>
              
              <input type="color" className={styles.colorPicker} title="Renk Seç" />
            </div>
          )}
          
          {/* Çizgi Ayarları */}
          {activeTool === tools.LINE && (
            <div className={styles.lineOptions}>
              <select className={styles.lineWidth}>
                <option value="1">İnce</option>
                <option value="2">Normal</option>
                <option value="3">Kalın</option>
                <option value="4">Çok Kalın</option>
              </select>
              
              <select className={styles.lineStyle}>
                <option value="solid">Düz</option>
                <option value="dashed">Kesikli</option>
                <option value="dotted">Noktalı</option>
              </select>
              
              <input type="color" className={styles.colorPicker} title="Renk Seç" />
            </div>
          )}
          
          {/* Vurgulama Ayarları */}
          {activeTool === tools.HIGHLIGHT && (
            <div className={styles.highlightOptions}>
              <div className={styles.opacityControl}>
                <span>Saydamlık:</span>
                <input type="range" min="10" max="100" defaultValue="50" />
              </div>
              
              <div className={styles.colorOptions}>
                <button className={`${styles.colorButton} ${styles.yellowHighlight}`}></button>
                <button className={`${styles.colorButton} ${styles.greenHighlight}`}></button>
                <button className={`${styles.colorButton} ${styles.blueHighlight}`}></button>
                <button className={`${styles.colorButton} ${styles.pinkHighlight}`}></button>
                <input type="color" className={styles.colorPicker} title="Özel Renk" />
              </div>
            </div>
          )}
          
          {/* Diğer araçlar için ayarlar... */}
        </div>
      )}
    </div>
  );
};

PdfToolbar.propTypes = {
  activeTool: PropTypes.string,
  onChangeTool: PropTypes.func.isRequired,
  tools: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onExit: PropTypes.func.isRequired
};

export default PdfToolbar; 