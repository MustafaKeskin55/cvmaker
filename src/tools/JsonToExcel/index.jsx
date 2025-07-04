import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import styles from './styles.module.css';
// Gerçek işlevsellik için gerekli kütüphaneler
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const JsonToExcel = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [fileName, setFileName] = useState('converted_data');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [convertedFile, setConvertedFile] = useState(null);
  const [libraries, setLibraries] = useState({
    xlsx: false,
    fileSaver: false
  });

  // Kütüphanelerin yüklenmesini kontrol et
  useEffect(() => {
    setLibraries({
      xlsx: typeof XLSX !== 'undefined',
      fileSaver: typeof saveAs !== 'undefined'
    });
  }, []);

  const handleJsonChange = (e) => {
    setJsonInput(e.target.value);
    setError('');
    setConvertedFile(null);
    setSuccessMessage('');
  };

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  };

  const validateJson = (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      return { isValid: true, data: parsed };
    } catch (e) {
      return { isValid: false, error: e.message };
    }
  };

  const convertToExcel = () => {
    setError('');
    setSuccessMessage('');
    setConvertedFile(null);
    setLoading(true);

    // Validate JSON input
    const { isValid, data, error } = validateJson(jsonInput);

    if (!isValid) {
      setError(`Geçersiz JSON: ${error}`);
      setLoading(false);
      return;
    }

    // Check if data is suitable for conversion
    if (!Array.isArray(data) && typeof data !== 'object') {
      setError('JSON veriniz bir nesne veya nesneler dizisi olmalıdır.');
      setLoading(false);
      return;
    }

    try {
      // Normalize data to ensure it's an array for the worksheet
      const normalizedData = Array.isArray(data) ? data : [data];
      
      // Create a worksheet from the JSON data
      const worksheet = XLSX.utils.json_to_sheet(normalizedData);
      
      // Create a workbook with the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      
      // Generate Excel file as an array buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Create a Blob from the buffer
      const blob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      
      // Save the blob for download
      const fileUrl = URL.createObjectURL(blob);
      
      setConvertedFile({
        url: fileUrl,
        name: `${fileName}.xlsx`,
        size: blob.size,
        blob: blob
      });

      setSuccessMessage(`${fileName}.xlsx başarıyla oluşturuldu!`);
      setLoading(false);
    } catch (err) {
      setError(`Dönüştürme sırasında hata oluştu: ${err.message}`);
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!convertedFile) return;
    
    try {
      // Use saveAs from file-saver to download the file
      saveAs(convertedFile.blob, `${fileName}.xlsx`);
    } catch (err) {
      setError(`Dosya indirme hatası: ${err.message}`);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const loadSampleData = () => {
    const sampleData = JSON.stringify([
      {
        "id": 1,
        "name": "Ahmet Yılmaz",
        "email": "ahmet@example.com",
        "city": "İstanbul"
      },
      {
        "id": 2,
        "name": "Ayşe Demir",
        "email": "ayse@example.com",
        "city": "Ankara"
      },
      {
        "id": 3,
        "name": "Mehmet Kaya",
        "email": "mehmet@example.com",
        "city": "İzmir"
      }
    ], null, 2);
    
    setJsonInput(sampleData);
    setConvertedFile(null);
    setSuccessMessage('');
    setError('');
  };

  return (
    <div className={styles.jsonToExcel}>
      <Helmet>
        <title>JSON to Excel Dönüştürücü - lazımsaburada</title>
        <meta
          name="description"
          content="JSON verilerinizi kolayca Excel dosyasına dönüştürün"
        />
      </Helmet>

      <div className={styles.toolHeader}>
        <div className={styles.container}>
          <h1>JSON to Excel Dönüştürücü</h1>
          <p>JSON verilerinizi kolayca Excel dosyasına dönüştürün</p>
        </div>
      </div>

      <div className={styles.toolContent}>
        <div className={styles.container}>
          {!libraries.xlsx || !libraries.fileSaver ? (
            <div className={styles.libraryWarning}>
              <div className={styles.warningIcon}>
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className={styles.warningText}>
                <h3>Kütüphane Eksik</h3>
                <p>Bu özelliğin düzgün çalışması için gerekli kütüphaneler yüklenmemiş. Lütfen aşağıdaki kütüphanelerin yüklendiğinden emin olun:</p>
                <ul>
                  <li>xlsx {libraries.xlsx ? '✓' : '✗'}</li>
                  <li>file-saver {libraries.fileSaver ? '✓' : '✗'}</li>
                </ul>
                <p className={styles.installCommand}>npm install xlsx file-saver --save</p>
              </div>
            </div>
          ) : (
            <div className={styles.converterBox}>
              <div className={styles.inputSection}>
                <div className={styles.inputHeader}>
                  <h2>JSON Girdisi</h2>
                  <button 
                    onClick={loadSampleData} 
                    className={styles.sampleButton}
                  >
                    Örnek Veri Yükle
                  </button>
                </div>
                
                <textarea 
                  className={styles.jsonTextarea} 
                  value={jsonInput}
                  onChange={handleJsonChange}
                  placeholder="JSON verinizi buraya yapıştırın..."
                ></textarea>
                
                <div className={styles.options}>
                  <div className={styles.optionField}>
                    <label>Dosya Adı:</label>
                    <input 
                      type="text" 
                      value={fileName}
                      onChange={handleFileNameChange}
                      className={styles.inputField}
                    />
                    <span>.xlsx</span>
                  </div>
                </div>
                
                <button 
                  onClick={convertToExcel}
                  className={styles.convertButton}
                  disabled={loading || !jsonInput.trim()}
                >
                  {loading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Dönüştürülüyor...
                    </span>
                  ) : (
                    <span>
                      <i className="fas fa-file-excel"></i> Excel'e Dönüştür
                    </span>
                  )}
                </button>

                {error && (
                  <div className={styles.errorMessage}>
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
                )}

                {successMessage && !convertedFile && (
                  <div className={styles.successMessage}>
                    <i className="fas fa-check-circle"></i> {successMessage}
                  </div>
                )}

                {convertedFile && (
                  <div className={styles.resultSection}>
                    <h2>Dönüştürme Tamamlandı</h2>
                    <div className={styles.convertedFile}>
                      <div className={styles.fileInfo}>
                        <i className="fas fa-file-excel"></i>
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}>{convertedFile.name}</span>
                          <span className={styles.fileSize}>{formatFileSize(convertedFile.size)}</span>
                        </div>
                      </div>
                      <button 
                        onClick={downloadExcel} 
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
                  <li>JSON verinizi yukarıdaki alana yapıştırın veya "Örnek Veri Yükle" butonunu kullanın.</li>
                  <li>Excel dosyasının adını girin (isteğe bağlı).</li>
                  <li>"Excel'e Dönüştür" butonuna tıklayın.</li>
                  <li>Dönüştürme işlemi tamamlandığında "İndir" butonu ile dosyayı indirebilirsiniz.</li>
                </ol>

                <h3>Desteklenen Formatlar</h3>
                <p>Bu araç, aşağıdaki yapılara sahip JSON verilerini destekler:</p>
                <ul>
                  <li>Nesneler dizisi - Her nesne Excel tablosunda bir satır olacaktır.</li>
                  <li>Tek bir nesne - Excel tablosunda tek bir satır olacaktır.</li>
                </ul>

                <div className={styles.note}>
                  <i className="fas fa-info-circle"></i>
                  <p>Not: Çok büyük JSON dosyaları için işlem biraz zaman alabilir.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonToExcel; 