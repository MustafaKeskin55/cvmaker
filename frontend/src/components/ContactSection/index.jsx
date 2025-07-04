import React, { useState } from 'react';
import styles from './styles.module.css';

const ContactSection = ({ data }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);
    
    // Simülasyon: Form gönderimi
    setTimeout(() => {
      // Gerçek uygulamada burada bir API çağrısı yapılır
      console.log('Form gönderildi:', formData);
      setSubmitting(false);
      setSubmitStatus({
        success: true,
        message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  if (!data) {
    return null;
  }

  return (
    <section className={styles.contactSection} id="contact">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>{data.title || 'İletişim'}</h2>
          <p>{data.subtitle || 'Sorularınız mı var? Bizimle iletişime geçin'}</p>
        </div>

        <div className={styles.contactContent}>
          <div className={styles.contactInfo}>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className={styles.infoContent}>
                <h3>Adres</h3>
                <p>İstanbul, Türkiye</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <i className="fas fa-envelope"></i>
              </div>
              <div className={styles.infoContent}>
                <h3>E-posta</h3>
                <p>iletisim@acilldesteklazim.com</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <i className="fas fa-phone-alt"></i>
              </div>
              <div className={styles.infoContent}>
                <h3>Telefon</h3>
                <p>+90 (212) 123 4567</p>
              </div>
            </div>

            <div className={styles.socialLinks}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name">İsim</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Adınız Soyadınız"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">E-posta</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="E-posta adresiniz"
                  required
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
                placeholder="Mesajınızın konusu"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Mesaj</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Mesajınızı buraya yazın..."
                rows="5"
                required
              ></textarea>
            </div>

            {submitStatus && (
              <div className={submitStatus.success ? styles.successMessage : styles.errorMessage}>
                <i className={submitStatus.success ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}></i>
                <p>{submitStatus.message}</p>
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Gönderiliyor...
                </>
              ) : (
                <>
                  Mesaj Gönder <i className="fas fa-paper-plane"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection; 