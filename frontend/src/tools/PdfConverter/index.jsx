import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import styles from './styles.module.css';

const PdfConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertTo, setConvertTo] = useState('docx');
  const [loading, setLoading] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Placeholder for file selection handler
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setConvertedFile(null); // Reset converted file when selecting new file
    }
  };

  // Placeholder for conversion type change
  const handleConvertToChange = (e) => {
    setConvertTo(e.target.value);
    setConvertedFile(null); // Reset converted file when changing format
  };

  // Show notification message
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Placeholder for conversion process
  const handleConvert = () => {
    if (!selectedFile) {
      showNotification('Lütfen bir dosya seçin', 'error');
      return;
    }

    setLoading(true);

    // Simulated conversion process
    setTimeout(() => {
      setLoading(false);
      
      // Create a fake converted file URL (in a real app, this would be the actual converted file)
      const fakeConvertedFile = {
        name: `${selectedFile.name.split('.')[0]}.${convertTo}`,
        url: URL.createObjectURL(new Blob([''], { type: `application/${convertTo}` })),
        size: Math.floor(Math.random() * 1000000) // Random fake file size in bytes
      };
      
      setConvertedFile(fakeConvertedFile);
      showNotification(`PDF başarıyla ${convertTo.toUpperCase()} formatına dönüştürüldü`);
    }, 2000);
  };

  // Handle file download
  const handleDownload = () => {
    if (!convertedFile) return;
    
    const link = document.createElement('a');
    link.href = convertedFile.url;
    link.download = convertedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Dosya indiriliyor');
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
    <div className={styles.pdfConverter}>
      <Helmet>
        <title>PDF Dönüştürücü - lazımsaburada</title>
        <meta
          name="description"
          content="PDF dosyalarını farklı formatlara kolayca dönüştürün"
        />
      </Helmet>

      <div className={styles.toolHeader}>
        <div className={styles.container}>
          <h1>PDF Dönüştürücü</h1>
          <p>PDF dosyalarını farklı formatlara kolayca dönüştürün</p>
        </div>
      </div>

      <div className={styles.toolContent}>
        <div className={styles.container}>
          <div className={styles.converterBox}>
            <div className={styles.fileUploadSection}>
              <h2>Dosya Yükle</h2>
              <div className={styles.fileUploader}>
                <input 
                  type="file" 
                  id="pdfFile" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  className={styles.fileInput}
                />
                <label htmlFor="pdfFile" className={styles.fileLabel}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>PDF Dosyası Seç</span>
                </label>
                {selectedFile && (
                  <div className={styles.selectedFile}>
                    <i className="fas fa-file-pdf"></i>
                    <span>{selectedFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.conversionOptions}>
              <h2>Dönüştürme Seçenekleri</h2>
              <div className={styles.optionsForm}>
                <div className={styles.formGroup}>
                  <label>Dönüştürme Formatı:</label>
                  <select 
                    value={convertTo} 
                    onChange={handleConvertToChange} 
                    className={styles.selectInput}
                  >
                    <option value="docx">Word (DOCX)</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="pptx">PowerPoint (PPTX)</option>
                    <option value="jpg">Resim (JPG)</option>
                    <option value="txt">Metin (TXT)</option>
                  </select>
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

            {convertedFile && (
              <div className={styles.resultSection}>
                <h2>Dönüştürme Tamamlandı</h2>
                <div className={styles.convertedFile}>
                  <div className={styles.fileInfo}>
                    <i className={`fas fa-file${convertTo === 'docx' ? '-word' : convertTo === 'xlsx' ? '-excel' : convertTo === 'pptx' ? '-powerpoint' : '-alt'}`}></i>
                    <div className={styles.fileDetails}>
                      <span className={styles.fileName}>{convertedFile.name}</span>
                      <span className={styles.fileSize}>{formatFileSize(convertedFile.size)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleDownload} 
                    className={styles.downloadButton}
                  >
                    <i className="fas fa-download"></i> İndir
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.infoSection}>
            <h3>Nasıl Kullanılır?</h3>
            <ol>
              <li>PDF dosyanızı seçin.</li>
              <li>Dönüştürmek istediğiniz formatı seçin.</li>
              <li>"Dönüştür" butonuna tıklayın.</li>
              <li>Dönüştürme işlemi tamamlandıktan sonra dosyayı indirin.</li>
            </ol>
            
            <h3>Desteklenen Çıktı Formatları</h3>
            <ul>
              <li>Word (DOCX)</li>
              <li>Excel (XLSX)</li>
              <li>PowerPoint (PPTX)</li>
              <li>Resim (JPG)</li>
              <li>Metin (TXT)</li>
            </ul>
            
            <div className={styles.note}>
              <i className="fas fa-info-circle"></i>
              <p>Not: Dönüştürme işlemi içeriğe bağlı olarak biraz zaman alabilir.</p>
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

export default PdfConverter; 