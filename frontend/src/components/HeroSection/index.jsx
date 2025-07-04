import React from 'react';
import styles from './styles.module.css';

const HeroSection = ({ data }) => {
  // Backend'den veri gelmediğinde varsayılan değerler
  const {
    title = 'Acil Destek Lazım',
    subtitle = 'İhtiyacınız olan profesyonel çözümler burada',
    buttonText = 'Hizmetlerimiz',
    buttonLink = '/hizmetlerimiz',
    backgroundImage = '/assets/images/hero-bg.jpg'
  } = data || {};

  return (
    <section 
      className={styles.heroSection}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.overlay}></div>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          <a href={buttonLink} className={styles.button}>
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 