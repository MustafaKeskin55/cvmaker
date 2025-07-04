import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import styles from './styles.module.css';

const ImageConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [convertTo, setConvertTo] = useState('jpg');
  const [quality, setQuality] = useState(80);
  const [loading, setLoading] = useState(false);
  const [convertedImage, setConvertedImage] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Reset converted image when selecting new file
      setConvertedImage(null);
    }
  };

  // Handle format change
  const handleFormatChange = (e) => {
    setConvertTo(e.target.value);
    setConvertedImage(null); // Reset converted image when changing format
  };

  // Handle quality change
  const handleQualityChange = (e) => {
    setQuality(e.target.value);
    setConvertedImage(null); // Reset converted image when changing quality
  };

  // Show notification message
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle conversion
  const handleConvert = () => {
    if (!selectedFile) {
      showNotification('Lütfen bir resim dosyası seçin', 'error');
      return;
    }

    setLoading(true);

    // Simulated conversion process
    setTimeout(() => {
      setLoading(false);
      
      // In a real app, this would be the actual converted image
      // For simulation, we'll use the same preview but pretend it's converted
      const convertedImageData = {
        url: previewUrl, // In real app, this would be different based on conversion
        name: `${selectedFile.name.split('.')[0]}.${convertTo}`,
        size: Math.floor(Math.random() * 500000) // Random fake file size in bytes
      };
      
      setConvertedImage(convertedImageData);
      showNotification(`Resim başarıyla ${convertTo.toUpperCase()} formatına dönüştürüldü`);
    }, 2000);
  };

  // Handle download
  const handleDownload = () => {
    if (!convertedImage) return;
    
    const link = document.createElement('a');
    link.href = convertedImage.url;
    link.download = convertedImage.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Resim indiriliyor');
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.imageConverter}>
      <Helmet>
        <title>Resim Dönüştürücü - lazımsaburada</title>
        <meta
          name="description"
          content="Resim formatı ve boyutu değiştirme, sıkıştırma işlemleri yapın"
        />
      </Helmet>

      <div className={styles.toolHeader}>
        <div className={styles.container}>
          <h1>Resim Dönüştürücü</h1>
          <p>Resim formatı ve boyutu değiştirme, sıkıştırma işlemleri yapın</p>
        </div>
      </div>

      <div className={styles.toolContent}>
        <div className={styles.container}>
          <div className={styles.converterBox}>
            <div className={styles.fileUploadSection}>
              <h2>Resim Yükle</h2>
              <div className={styles.fileUploader}>
                <input 
                  type="file" 
                  id="imageFile" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className={styles.fileInput}
                />
                <label htmlFor="imageFile" className={styles.fileLabel}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>Resim Dosyası Seç</span>
                </label>
              </div>
              
              {previewUrl && (
                <div className={styles.imagePreview}>
                  <img src={previewUrl} alt="Preview" />
                </div>
              )}
            </div>

            <div className={styles.conversionOptions}>
              <h2>Dönüştürme Seçenekleri</h2>
              <div className={styles.optionsForm}>
                <div className={styles.formGroup}>
                  <label>Dönüştürme Formatı:</label>
                  <select 
                    value={convertTo} 
                    onChange={handleFormatChange} 
                    className={styles.selectInput}
                  >
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                    <option value="gif">GIF</option>
                    <option value="bmp">BMP</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Kalite: {quality}%</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={quality} 
                    onChange={handleQualityChange}
                    className={styles.rangeInput}
                  />
                </div>
              </div>
            </div>

            <div className={styles.conversionActions}>
              <button 
                onClick={handleConvert}
                disabled={!selectedFile || loading}
                className={styles.convertButton}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Dönüştürülüyor...
                  </>
                ) : (
                  <>
                    <i className="fas fa-exchange-alt"></i> Dönüştür
                  </>
                )}
              </button>
            </div>

            {convertedImage && (
              <div className={styles.resultSection}>
                <h2>Dönüştürme Tamamlandı</h2>
                <div className={styles.convertedItem}>
                  <div className={styles.convertedPreview}>
                    <img src={convertedImage.url} alt="Converted" />
                  </div>
                  <div className={styles.convertedDetails}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>{convertedImage.name}</span>
                      <span className={styles.fileSize}>{formatFileSize(convertedImage.size)}</span>
                      <span className={styles.fileFormat}>Format: {convertTo.toUpperCase()}</span>
                      {convertTo !== 'gif' && convertTo !== 'bmp' && (
                        <span className={styles.fileQuality}>Kalite: {quality}%</span>
                      )}
                    </div>
                    <button 
                      onClick={handleDownload} 
                      className={styles.downloadButton}
                    >
                      <i className="fas fa-download"></i> İndir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.infoSection}>
            <h3>Nasıl Kullanılır?</h3>
            <ol>
              <li>Dönüştürmek istediğiniz resmi yükleyin.</li>
              <li>Dönüştürmek istediğiniz formatı seçin.</li>
              <li>Resim kalitesini ayarlayın.</li>
              <li>"Dönüştür" butonuna tıklayın.</li>
              <li>Dönüştürme işlemi tamamlandıktan sonra resmi indirin.</li>
            </ol>
            
            <h3>Desteklenen Formatlar</h3>
            <div className={styles.formatsGrid}>
              <div className={styles.formatItem}>
                <span className={styles.formatName}>JPG</span>
                <span className={styles.formatDesc}>Fotoğraflar için ideal, küçük dosya boyutu</span>
              </div>
              <div className={styles.formatItem}>
                <span className={styles.formatName}>PNG</span>
                <span className={styles.formatDesc}>Şeffaf arka plan desteği</span>
              </div>
              <div className={styles.formatItem}>
                <span className={styles.formatName}>WebP</span>
                <span className={styles.formatDesc}>Modern web için optimize edilmiş format</span>
              </div>
              <div className={styles.formatItem}>
                <span className={styles.formatName}>GIF</span>
                <span className={styles.formatDesc}>Basit animasyonlar için</span>
              </div>
              <div className={styles.formatItem}>
                <span className={styles.formatName}>BMP</span>
                <span className={styles.formatDesc}>Sıkıştırılmamış yüksek kalite</span>
              </div>
            </div>
            
            <div className={styles.note}>
              <i className="fas fa-info-circle"></i>
              <p>Not: Büyük resimlerin dönüştürülmesi biraz zaman alabilir.</p>
            </div>
          </div>
        </div>
      </div>

      {notification.show && (
        <div className={`${styles.notification} ${notification.type === 'error' ? styles.error : styles.success}`}>
          <i className={notification.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}></i>
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default ImageConverter; 