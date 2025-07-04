import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import styles from './styles.module.css';
// Gerçek işlevsellik için gerekli kütüphaneler
import * as XLSX from 'xlsx';

const ExcelToJson = () => {
  const [jsonOutput, setJsonOutput] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formatType, setFormatType] = useState('pretty');
  const [libraries, setLibraries] = useState({
    xlsx: false,
  });
  const [excelFile, setExcelFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  // Kütüphanelerin yüklenmesini kontrol et
  useEffect(() => {
    setLibraries({
      xlsx: typeof XLSX !== 'undefined',
    });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setExcelFile(file);
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type
    });
    setJsonOutput('');
    setError('');
  };

  const handleFormatChange = (e) => {
    setFormatType(e.target.value);
    if (jsonOutput) {
      formatJsonOutput(jsonOutput, e.target.value);
    }
  };

  const formatJsonOutput = (data, format = formatType) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (format === 'pretty') {
        setJsonOutput(JSON.stringify(parsed, null, 2));
      } else {
        setJsonOutput(JSON.stringify(parsed));
      }
    } catch (err) {
      console.error("JSON formatlama hatası:", err);
    }
  };

  const convertToJson = () => {
    if (!excelFile) {
      setError('Lütfen bir Excel dosyası seçin.');
      return;
    }

    setLoading(true);
    setError('');
    setJsonOutput('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // İlk çalışma sayfasını al
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Çalışma sayfasını JSON'a dönüştür
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        
        if (jsonData.length === 0) {
          setError('Excel dosyası boş veya dönüştürülebilir veri içermiyor.');
          setLoading(false);
          return;
        }
        
        // JSON formatını ayarla
        formatJsonOutput(jsonData);
        setLoading(false);
      } catch (err) {
        setError(`Dönüştürme hatası: ${err.message}`);
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Dosya okuma hatası');
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(excelFile);
  };

  const downloadJson = () => {
    if (!jsonOutput) return;
    
    try {
      const blob = new Blob([jsonOutput], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace(/\.(xlsx|xls)$/i, '.json') || 'converted_data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  return (
    <div className={styles.excelToJson}>
      <Helmet>
        <title>Excel to JSON Dönüştürücü - lazımsaburada</title>
        <meta
          name="description"
          content="Excel dosyalarınızı kolayca JSON formatına dönüştürün"
        />
      </Helmet>

      <div className={styles.toolHeader}>
        <div className={styles.container}>
          <h1>Excel to JSON Dönüştürücü</h1>
          <p>Excel dosyalarınızı kolayca JSON formatına dönüştürün</p>
        </div>
      </div>

      <div className={styles.toolContent}>
        <div className={styles.container}>
          {!libraries.xlsx ? (
            <div className={styles.libraryWarning}>
              <div className={styles.warningIcon}>
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className={styles.warningText}>
                <h3>Kütüphane Eksik</h3>
                <p>Bu özelliğin düzgün çalışması için gerekli kütüphaneler yüklenmemiş. Lütfen aşağıdaki kütüphanelerin yüklendiğinden emin olun:</p>
                <ul>
                  <li>xlsx {libraries.xlsx ? '✓' : '✗'}</li>
                </ul>
                <p className={styles.installCommand}>npm install xlsx --save</p>
              </div>
            </div>
          ) : (
            <div className={styles.converterBox}>
              <div className={styles.inputSection}>
                <div className={styles.inputHeader}>
                  <h2>Excel Dosyası</h2>
                </div>
                
                <div className={styles.fileUploadArea}>
                  <label className={styles.fileUploadLabel}>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                    <div className={styles.uploadIcon}>
                      <i className="fas fa-file-excel"></i>
                    </div>
                    <div className={styles.uploadText}>
                      <span>Excel Dosyası Yükle</span>
                      <small>.xlsx veya .xls</small>
                    </div>
                  </label>
                </div>
                
                {fileInfo && (
                  <div className={styles.fileInfo}>
                    <div className={styles.fileDetails}>
                      <span className={styles.fileName}>{fileInfo.name}</span>
                      <span className={styles.fileSize}>{formatFileSize(fileInfo.size)}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setExcelFile(null);
                        setFileInfo(null);
                        setJsonOutput('');
                      }}
                      className={styles.removeButton}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                
                <div className={styles.options}>
                  <div className={styles.optionField}>
                    <label>JSON Formatı:</label>
                    <select 
                      value={formatType}
                      onChange={handleFormatChange}
                      className={styles.selectField}
                      disabled={!jsonOutput}
                    >
                      <option value="pretty">Düzenli (Pretty)</option>
                      <option value="compact">Sıkıştırılmış (Compact)</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={convertToJson}
                  className={styles.convertButton}
                  disabled={loading || !excelFile}
                >
                  {loading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Dönüştürülüyor...
                    </span>
                  ) : (
                    <span>
                      <i className="fas fa-file-code"></i> JSON'a Dönüştür
                    </span>
                  )}
                </button>

                {error && (
                  <div className={styles.errorMessage}>
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
                )}

                {jsonOutput && (
                  <div className={styles.resultSection}>
                    <h2>Dönüştürme Sonucu</h2>
                    <div className={styles.jsonPreview}>
                      <textarea 
                        readOnly 
                        className={styles.jsonOutput}
                        value={jsonOutput}
                      ></textarea>
                    </div>
                    <button 
                      onClick={downloadJson} 
                      className={styles.downloadButton}
                    >
                      <i className="fas fa-download"></i> JSON İndir
                    </button>
                  </div>
                )}
              </div>
              
              <div className={styles.infoSection}>
                <h3>Nasıl Kullanılır?</h3>
                <ol>
                  <li>Excel dosyanızı yüklemek için "Excel Dosyası Yükle" butonuna tıklayın.</li>
                  <li>Dosya seçildikten sonra "JSON'a Dönüştür" butonuna tıklayın.</li>
                  <li>Dönüştürülen JSON verisini formatlı veya sıkıştırılmış olarak görüntüleyin.</li>
                  <li>"JSON İndir" butonu ile dönüştürülen veriyi indirin.</li>
                </ol>

                <h3>Desteklenen Formatlar</h3>
                <p>Bu araç aşağıdaki Excel formatlarını destekler:</p>
                <ul>
                  <li>.xlsx - Excel 2007 ve üzeri</li>
                  <li>.xls - Excel 97-2003</li>
                </ul>

                <h3>Notlar</h3>
                <ul>
                  <li>Büyük Excel dosyalarının dönüştürülmesi biraz zaman alabilir</li>
                  <li>Dönüştürme işlemi tarayıcı tarafında gerçekleştirilir, verileriniz hiçbir sunucuya gönderilmez</li>
                  <li>İlk çalışma sayfası varsayılan olarak dönüştürülür</li>
                </ul>

                <div className={styles.note}>
                  <i className="fas fa-info-circle"></i>
                  <p>İpucu: Excel tablosu başlıklar içeriyorsa, bunlar JSON nesnelerinin özellikleri olarak kullanılır.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelToJson; 