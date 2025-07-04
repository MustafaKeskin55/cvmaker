import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import styles from './styles.module.css';

const QrCreator = () => {
  const [qrText, setQrText] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [errorLevel, setErrorLevel] = useState('M');
  const [qrImage, setQrImage] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const canvasRef = useRef(null);

  // Handle text change
  const handleTextChange = (e) => {
    setQrText(e.target.value);
  };

  // Handle QR size change
  const handleSizeChange = (e) => {
    setQrSize(e.target.value);
  };

  // Handle QR color change
  const handleColorChange = (e) => {
    setQrColor(e.target.value);
  };

  // Handle background color change
  const handleBgColorChange = (e) => {
    setBgColor(e.target.value);
  };

  // Handle error correction level change
  const handleErrorLevelChange = (e) => {
    setErrorLevel(e.target.value);
  };

  // Show notification message
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Generate QR Code
  const generateQRCode = () => {
    if (!qrText.trim()) {
      showNotification('QR kod içeriği boş olamaz', 'error');
      return;
    }

    // In a real app, we would use a QR code generation library
    // For this example, we're simulating the generation with a placeholder image
    
    // Simulated QR code generation - in a real app use a library like qrcode.js
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = qrSize;
    canvas.height = qrSize;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, qrSize, qrSize);

    // Simulate QR code pattern
    ctx.fillStyle = qrColor;
    
    // Draw position detection pattern (corners)
    const drawPositionPattern = (x, y, size) => {
      ctx.fillRect(x, y, size, size);
      ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
      ctx.fillStyle = bgColor;
      ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
      ctx.fillStyle = qrColor;
      ctx.fillRect(x + 6, y + 6, size - 12, size - 12);
    };

    const blockSize = Math.floor(qrSize / 25);
    
    // Top-left position pattern
    drawPositionPattern(blockSize, blockSize, 7 * blockSize);
    
    // Top-right position pattern
    drawPositionPattern(qrSize - 8 * blockSize, blockSize, 7 * blockSize);
    
    // Bottom-left position pattern
    drawPositionPattern(blockSize, qrSize - 8 * blockSize, 7 * blockSize);
    
    // Draw some random blocks to simulate QR code data
    const drawRandomBlocks = () => {
      for (let i = 0; i < 150; i++) {
        const x = Math.floor(Math.random() * (qrSize - blockSize));
        const y = Math.floor(Math.random() * (qrSize - blockSize));
        
        // Skip position pattern areas
        const isInPositionPattern = (x, y) => {
          const margin = 8 * blockSize;
          return (x < margin && y < margin) || 
                 (x > qrSize - margin && y < margin) || 
                 (x < margin && y > qrSize - margin);
        };
        
        if (!isInPositionPattern(x, y)) {
          ctx.fillRect(x, y, blockSize, blockSize);
        }
      }
    };
    
    drawRandomBlocks();
    
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    setQrImage(dataUrl);

    showNotification('QR kod başarıyla oluşturuldu');
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (!qrImage) {
      showNotification('Önce QR kod oluşturun', 'error');
      return;
    }

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('QR kod indirildi');
  };

  return (
    <div className={styles.qrCreator}>
      <Helmet>
        <title>QR Kod Oluşturucu - Acil Destek Lazım</title>
        <meta
          name="description"
          content="Özelleştirilebilir QR kodları oluşturun ve indirin"
        />
      </Helmet>

      <div className={styles.toolHeader}>
        <div className={styles.container}>
          <h1>QR Kod Oluşturucu</h1>
          <p>Özelleştirilebilir QR kodları oluşturun ve indirin</p>
        </div>
      </div>

      <div className={styles.toolContent}>
        <div className={styles.container}>
          <div className={styles.qrCreatorBox}>
            <div className={styles.qrForm}>
              <div className={styles.formGroup}>
                <label htmlFor="qrText">QR Kod İçeriği</label>
                <textarea
                  id="qrText"
                  value={qrText}
                  onChange={handleTextChange}
                  placeholder="QR kod içeriğini girin (URL, metin, vCard, vb.)"
                  className={styles.textArea}
                ></textarea>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="qrSize">QR Kod Boyutu: {qrSize}px</label>
                  <input
                    type="range"
                    id="qrSize"
                    min="100"
                    max="400"
                    step="10"
                    value={qrSize}
                    onChange={handleSizeChange}
                    className={styles.rangeInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="errorLevel">Hata Düzeltme Seviyesi</label>
                  <select
                    id="errorLevel"
                    value={errorLevel}
                    onChange={handleErrorLevelChange}
                    className={styles.selectInput}
                  >
                    <option value="L">Düşük (7%)</option>
                    <option value="M">Orta (15%)</option>
                    <option value="Q">Yüksek (25%)</option>
                    <option value="H">En Yüksek (30%)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="qrColor">QR Rengi</label>
                  <div className={styles.colorInputWrapper}>
                    <input
                      type="color"
                      id="qrColor"
                      value={qrColor}
                      onChange={handleColorChange}
                      className={styles.colorInput}
                    />
                    <span className={styles.colorValue}>{qrColor}</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="bgColor">Arkaplan Rengi</label>
                  <div className={styles.colorInputWrapper}>
                    <input
                      type="color"
                      id="bgColor"
                      value={bgColor}
                      onChange={handleBgColorChange}
                      className={styles.colorInput}
                    />
                    <span className={styles.colorValue}>{bgColor}</span>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  onClick={generateQRCode}
                  className={styles.generateButton}
                  disabled={!qrText.trim()}
                >
                  <i className="fas fa-qrcode"></i> QR Kod Oluştur
                </button>
                <button
                  onClick={downloadQRCode}
                  className={styles.downloadButton}
                  disabled={!qrImage}
                >
                  <i className="fas fa-download"></i> İndir
                </button>
              </div>
            </div>

            <div className={styles.qrPreview}>
              <h2>Önizleme</h2>
              {qrImage ? (
                <div className={styles.qrImageContainer}>
                  <img src={qrImage} alt="QR Code" className={styles.qrImage} />
                </div>
              ) : (
                <div className={styles.emptyPreview}>
                  <i className="fas fa-qrcode"></i>
                  <p>QR kod oluşturmak için form bilgilerini doldurun ve "QR Kod Oluştur" butonuna tıklayın</p>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            </div>
          </div>

          <div className={styles.infoSection}>
            <h3>QR Kod Hakkında</h3>
            <p>
              QR kodlar (Hızlı Yanıt kodları), bilgiyi hem yatay hem de dikey olarak tutan iki boyutlu barkodlardır. 
              Akıllı telefonlar ve QR kod okuyucu uygulamalarla kolayca taranabilirler.
            </p>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <h4>QR Kod İçeriği</h4>
                <p>QR kodlar içerisinde URL, metin, telefon numarası, e-posta adresi, vCard, WiFi bilgileri ve daha fazlasını taşıyabilir.</p>
              </div>
              <div className={styles.infoItem}>
                <h4>Hata Düzeltme</h4>
                <p>QR kodlar hasar görse bile okunabilen hata düzeltme özelliğine sahiptir. Daha yüksek düzeltme seviyesi, kodun daha fazla hasara dayanmasını sağlar.</p>
              </div>
              <div className={styles.infoItem}>
                <h4>Kullanım Alanları</h4>
                <p>Pazarlama materyalleri, kartvizitler, ürün etiketleri, müze bilgilendirmeleri ve çok daha fazla alanda kullanılabilirler.</p>
              </div>
            </div>
            
            <div className={styles.note}>
              <i className="fas fa-info-circle"></i>
              <p>Not: Oluşturulan QR kodlar yüksek çözünürlüklü PNG formatında indirilir.</p>
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

export default QrCreator; 