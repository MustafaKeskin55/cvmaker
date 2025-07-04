import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import styles from './styles.module.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form gönderme durumunu güncelleyelim
    setFormStatus({
      submitting: true,
      submitted: false,
      success: false,
      message: ''
    });
    
    // Backend entegrasyonu için burada bir API çağrısı yapılacak
    // Şimdilik sadece simüle edelim
    setTimeout(() => {
      setFormStatus({
        submitting: false,
        submitted: true,
        success: true,
        message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
      });
      
      // Formu sıfırla
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className={styles.contactPage}>
      <Helmet>
        <title>İletişim - Acil Destek Lazım</title>
        <meta name="description" content="Acil Destek Lazım ekibiyle iletişime geçin. Sorularınız veya ihtiyaçlarınız için bize ulaşın." />
        <link rel="canonical" href="https://acilldesteklazim.com/iletisim" />
      </Helmet>
      
      <div className={styles.pageHeader}>
        <div className={styles.container}>
          <h1>İletişim</h1>
          <p>Sorularınız ve ihtiyaçlarınız için bize ulaşın</p>
        </div>
      </div>

      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactLayout}>
            <div className={styles.contactInfo}>
              <h2>Bize Ulaşın</h2>
              <p>İhtiyaçlarınız veya sorularınız için aşağıdaki iletişim kanallarından bize ulaşabilirsiniz.</p>
              
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className={styles.infoContent}>
                  <h3>Adres</h3>
                  <p>Ataşehir, İstanbul, Türkiye</p>
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div className={styles.infoContent}>
                  <h3>Telefon</h3>
                  <p>+90 212 123 4567</p>
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <i className="fas fa-envelope"></i>
                </div>
                <div className={styles.infoContent}>
                  <h3>E-posta</h3>
                  <p>info@acilldesteklazim.com</p>
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <i className="fas fa-clock"></i>
                </div>
                <div className={styles.infoContent}>
                  <h3>Çalışma Saatleri</h3>
                  <p>Pazartesi - Cuma: 09:00 - 18:00</p>
                  <p>Cumartesi: 10:00 - 15:00</p>
                </div>
              </div>
              
              <div className={styles.socialLinks}>
                <h3>Bizi Takip Edin</h3>
                <div className={styles.socialIcons}>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <div className={styles.contactForm}>
              <h2>Bize Mesaj Gönderin</h2>
              <p>Aşağıdaki formu doldurarak bize mesaj gönderebilirsiniz. En kısa sürede size dönüş yapacağız.</p>
              
              {formStatus.submitted && (
                <div className={`${styles.formMessage} ${formStatus.success ? styles.success : styles.error}`}>
                  {formStatus.message}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Adınız Soyadınız</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">E-posta Adresiniz</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Telefon Numaranız</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="subject">Konu</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message">Mesajınız</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={formStatus.submitting}
                >
                  {formStatus.submitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <section className={styles.mapSection}>
        <div className={styles.mapContainer}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24083.08877593312!2d29.08540564453125!3d40.98651419999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac7b7c23176c5%3A0x3ae7e652b253337c!2zQXRhxZ9laGlyLCDEsHN0YW5idWw!5e0!3m2!1str!2str!4v1649927620621!5m2!1str!2str"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Acil Destek Lazım Konum"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 