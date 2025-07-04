import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

  // Dark mode ayarını uygula
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">
            <img src="/lazımsaburada.png" alt="lazımsaburada Logo" />
          </Link>
        </div>

        <div className={styles.mobileMenuToggle} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          <ul className={styles.menu}>
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Ana Sayfa</Link></li>
            <li><Link to="/araclar" onClick={() => setMenuOpen(false)}>Araçlarımız</Link></li>
            <li className={styles.dropdown}>
              <span className={styles.dropdownToggle}>
                Online Araçlar <i className="fas fa-chevron-down"></i>
              </span>
              <ul className={styles.dropdownMenu}>
                <li><Link to="/araclar/kategori-olusturucu" onClick={() => setMenuOpen(false)}>Kategori Oluşturucu</Link></li>
                <li><Link to="/araclar/json-to-excel" onClick={() => setMenuOpen(false)}>JSON to Excel</Link></li>
                <li><Link to="/araclar/pdf-donusturucu" onClick={() => setMenuOpen(false)}>PDF Dönüştürücü</Link></li>
                <li><Link to="/araclar/resim-donusturucu" onClick={() => setMenuOpen(false)}>Resim Dönüştürücü</Link></li>
                <li><Link to="/araclar/metin-araclari" onClick={() => setMenuOpen(false)}>Metin Araçları</Link></li>
                <li><Link to="/araclar/qr-kod-olusturucu" onClick={() => setMenuOpen(false)}>QR Kod Oluşturucu</Link></li>
              </ul>
            </li>
            <li><Link to="/iletisim" onClick={() => setMenuOpen(false)}>İletişim</Link></li>
          </ul>

          <div className={styles.themeToggle} onClick={toggleDarkMode}>
            {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 