import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const TestimonialsSection = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Eğer veri gelmezse veya eksik gelirse varsayılan içerik
  const {
    title = 'Müşteri Yorumları',
    subtitle = 'Hizmetlerimizden memnun kalan müşterilerimizin görüşleri',
    testimonials = [
      {
        id: 1,
        name: 'Ahmet Yıldız',
        position: 'İşletme Sahibi',
        company: 'Yıldız Market',
        quote: 'Acil Destek Lazım ekibi ile çalışmak gerçekten çok güzel bir deneyimdi. İhtiyacımız olan her anda yanımızda oldular ve profesyonel çözümler sundular.',
        avatar: '/assets/images/testimonial-1.jpg'
      },
      {
        id: 2,
        name: 'Ayşe Kaya',
        position: 'Genel Müdür',
        company: 'Kaya İnşaat',
        quote: 'Hızlı ve etkili çözümleriyle bizi hiç yalnız bırakmadılar. Profesyonel ekipleri sayesinde tüm sorunlarımız kısa sürede çözüldü.',
        avatar: '/assets/images/testimonial-2.jpg'
      },
      {
        id: 3,
        name: 'Mehmet Demir',
        position: 'IT Sorumlusu',
        company: 'Demir Teknoloji',
        quote: 'Teknik sorunlarımızda bize sundukları destek paha biçilemez. 7/24 ulaşılabilir olmaları ve uzman kadroları ile her zaman yanımızda oldular.',
        avatar: '/assets/images/testimonial-3.jpg'
      }
    ]
  } = data || {};

  // Otomatik kaydırma için
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className={styles.testimonialsWrapper}>
          <div className={styles.testimonialsSlider}>
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`${styles.testimonialCard} ${index === activeIndex ? styles.active : ''}`}
              >
                <div className={styles.testimonialQuote}>
                  <i className="fas fa-quote-left"></i>
                  <p>{testimonial.quote}</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>
                    <img src={testimonial.avatar} alt={testimonial.name} />
                  </div>
                  <div className={styles.authorInfo}>
                    <h3>{testimonial.name}</h3>
                    <p>{testimonial.position}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.testimonialDots}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 