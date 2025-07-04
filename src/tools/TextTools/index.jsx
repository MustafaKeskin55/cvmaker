import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import styles from './styles.module.css';

const TextTools = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [operation, setOperation] = useState('uppercase');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Handle text input change
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  // Handle operation selection
  const handleOperationChange = (e) => {
    setOperation(e.target.value);
  };

  // Show notification message
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Process text based on selected operation
  const processText = () => {
    if (!inputText.trim()) {
      showNotification('Lütfen işlenecek metin girin', 'error');
      return;
    }

    let result = '';
    
    switch (operation) {
      case 'uppercase':
        result = inputText.toUpperCase();
        break;
      case 'lowercase':
        result = inputText.toLowerCase();
        break;
      case 'capitalize':
        result = inputText
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      case 'reverse':
        result = inputText.split('').reverse().join('');
        break;
      case 'remove_spaces':
        result = inputText.replace(/\s+/g, '');
        break;
      case 'remove_lines':
        result = inputText.replace(/(\r\n|\n|\r)/gm, ' ');
        break;
      case 'count':
        const charCount = inputText.length;
        const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
        const lineCount = inputText.split(/\r\n|\r|\n/).length;
        result = `Karakter sayısı: ${charCount}\nKelime sayısı: ${wordCount}\nSatır sayısı: ${lineCount}`;
        break;
      default:
        result = inputText;
    }

    setOutputText(result);
    showNotification('Metin işlendi');
  };

  // Copy processed text to clipboard
  const copyToClipboard = () => {
    if (!outputText) {
      showNotification('Kopyalanacak metin yok', 'error');
      return;
    }

    navigator.clipboard.writeText(outputText).then(
      () => {
        showNotification('Metin panoya kopyalandı');
      },
      (err) => {
        showNotification('Kopyalama işlemi başarısız: ' + err, 'error');
      }
    );
  };

  // Download text as file
  const downloadAsFile = () => {
    if (!outputText) {
      showNotification('İndirilecek metin yok', 'error');
      return;
    }

    // Create file name based on operation
    let fileName = 'islenmis-metin.txt';
    switch (operation) {
      case 'uppercase':
        fileName = 'buyuk-harf.txt';
        break;
      case 'lowercase':
        fileName = 'kucuk-harf.txt';
        break;
      case 'capitalize':
        fileName = 'bas-harfler-buyuk.txt';
        break;
      case 'reverse':
        fileName = 'ters-metin.txt';
        break;
      case 'remove_spaces':
        fileName = 'bosluksuz.txt';
        break;
      case 'remove_lines':
        fileName = 'tek-satir.txt';
        break;
      case 'count':
        fileName = 'karakter-sayim.txt';
        break;
    }

    // Create blob and download
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Metin dosyası indiriliyor');
  };

  // Clear both input and output
  const clearText = () => {
    setInputText('');
    setOutputText('');
    showNotification('Metin alanları temizlendi');
  };

  return (
    <div className={styles.textTools}>
      <Helmet>
        <title>Metin Araçları - lazımsaburada</title>
        <meta
          name="description"
          content="Metin düzenleme, formatlama ve dönüştürme araçları"
        />
      </Helmet>

      <div className={styles.toolHeader}>
        <div className={styles.container}>
          <h1>Metin Araçları</h1>
          <p>Metin düzenleme, formatlama ve dönüştürme araçları</p>
        </div>
      </div>

      <div className={styles.toolContent}>
        <div className={styles.container}>
          <div className={styles.textToolBox}>
            <div className={styles.topBar}>
              <select 
                value={operation} 
                onChange={handleOperationChange}
                className={styles.operationSelect}
              >
                <option value="uppercase">Büyük Harf</option>
                <option value="lowercase">Küçük Harf</option>
                <option value="capitalize">Baş Harfleri Büyüt</option>
                <option value="reverse">Metni Ters Çevir</option>
                <option value="remove_spaces">Boşlukları Kaldır</option>
                <option value="remove_lines">Satırları Birleştir</option>
                <option value="count">Karakter/Kelime Say</option>
              </select>

              <div className={styles.actionButtons}>
                <button onClick={processText} className={styles.processButton}>
                  <i className="fas fa-play"></i> İşle
                </button>
                <button onClick={clearText} className={styles.clearButton}>
                  <i className="fas fa-trash-alt"></i> Temizle
                </button>
              </div>
            </div>

            <div className={styles.textAreas}>
              <div className={styles.inputArea}>
                <div className={styles.areaHeader}>
                  <h2>Giriş Metni</h2>
                </div>
                <textarea 
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="İşlemek istediğiniz metni buraya girin..."
                  className={styles.textInput}
                ></textarea>
              </div>
              
              <div className={styles.outputArea}>
                <div className={styles.areaHeader}>
                  <h2>Sonuç</h2>
                  {outputText && (
                    <div className={styles.outputActions}>
                      <button 
                        onClick={copyToClipboard} 
                        className={styles.copyButton}
                        title="Panoya Kopyala"
                      >
                        <i className="fas fa-copy"></i> Kopyala
                      </button>
                      <button 
                        onClick={downloadAsFile} 
                        className={styles.downloadButton}
                        title="Metin Dosyasını İndir"
                      >
                        <i className="fas fa-download"></i> İndir
                      </button>
                    </div>
                  )}
                </div>
                <textarea 
                  value={outputText}
                  readOnly
                  placeholder="İşlenmiş metin burada görünecek..."
                  className={styles.textOutput}
                ></textarea>
              </div>
            </div>
          </div>

          <div className={styles.infoSection}>
            <h3>Metin İşlemleri Hakkında</h3>
            <div className={styles.operationList}>
              <div className={styles.operationItem}>
                <h4>Büyük Harf</h4>
                <p>Tüm metni büyük harflere dönüştürür.</p>
              </div>
              <div className={styles.operationItem}>
                <h4>Küçük Harf</h4>
                <p>Tüm metni küçük harflere dönüştürür.</p>
              </div>
              <div className={styles.operationItem}>
                <h4>Baş Harfleri Büyüt</h4>
                <p>Her kelimenin ilk harfini büyük, diğerlerini küçük yapar.</p>
              </div>
              <div className={styles.operationItem}>
                <h4>Metni Ters Çevir</h4>
                <p>Metni tersten yazar.</p>
              </div>
              <div className={styles.operationItem}>
                <h4>Boşlukları Kaldır</h4>
                <p>Metindeki tüm boşlukları temizler.</p>
              </div>
              <div className={styles.operationItem}>
                <h4>Satırları Birleştir</h4>
                <p>Çok satırlı metni tek satır haline getirir.</p>
              </div>
              <div className={styles.operationItem}>
                <h4>Karakter/Kelime Say</h4>
                <p>Metindeki karakter, kelime ve satır sayısını hesaplar.</p>
              </div>
            </div>
            
            <div className={styles.note}>
              <i className="fas fa-info-circle"></i>
              <p>Not: Tüm işlemler tarayıcınızda gerçekleşir, metniniz herhangi bir sunucuya gönderilmez.</p>
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

export default TextTools; 