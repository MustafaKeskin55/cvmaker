import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.logoSection}>
              <Link to="/" className={styles.footerLogo}>
                <img src="/assets/images/logo-white.png" alt="lazımsaburada Logo" />
              </Link>
              <p className={styles.logoText}>
                Ücretsiz çevrimiçi araçlarla işlerinizi kolaylaştırıyoruz. Her ihtiyacınız için pratik çözümler sunuyoruz.
              </p>
              <div className={styles.socialLinks}>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f"></i>
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

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Hızlı Linkler</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/">Ana Sayfa</Link></li>
              <li><Link to="/araclar">Araçlarımız</Link></li>
              <li><Link to="/iletisim">İletişim</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Araçlar</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/araclar/kategori-olusturucu">Kategori Oluşturucu</Link></li>
              <li><Link to="/araclar/json-to-excel">JSON to Excel</Link></li>
              <li><Link to="/araclar/pdf-donusturucu">PDF Dönüştürücü</Link></li>
              <li><Link to="/araclar/resim-donusturucu">Resim Dönüştürücü</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>İletişim</h3>
            <ul className={styles.contactList}>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>İstanbul, Türkiye</span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <span>iletisim@lazımsaburada.com</span>
              </li>
              <li>
                <i className="fas fa-phone-alt"></i>
                <span>+90 (212) 123 4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            &copy; {currentYear} lazımsaburada. Tüm hakları saklıdır.
          </div>
          <div className={styles.footerBottomLinks}>
            <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <Link to="/kullanim-sartlari">Kullanım Şartları</Link>
            <Link to="/cerez-politikasi">Çerez Politikası</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 