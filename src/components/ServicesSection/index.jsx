import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

const ServicesSection = ({ data }) => {
  // Eğer veri gelmezse veya eksik gelirse varsayılan içerik
  const {
    title = 'Hizmetlerimiz',
    subtitle = 'İhtiyaçlarınıza özel profesyonel çözümler',
    services = [
      {
        id: 1,
        title: 'Acil Durum Desteği',
        description: '24/7 acil durumlarda yanınızda oluyoruz.',
        icon: 'fas fa-ambulance',
        link: '/hizmetlerimiz'
      },
      {
        id: 2,
        title: 'Teknik Destek',
        description: 'Teknik sorunlarınıza hızlı ve etkili çözümler.',
        icon: 'fas fa-tools',
        link: '/hizmetlerimiz'
      },
      {
        id: 3,
        title: 'Danışmanlık',
        description: 'Profesyonel danışmanlık hizmetlerimizle yanınızdayız.',
        icon: 'fas fa-briefcase',
        link: '/hizmetlerimiz'
      },
      {
        id: 4,
        title: 'Eğitim',
        description: 'Özel eğitim programlarıyla kariyerinize destek oluyoruz.',
        icon: 'fas fa-graduation-cap',
        link: '/hizmetlerimiz'
      }
    ],
    actionText = 'Tüm Hizmetlerimizi Görüntüleyin',
    actionLink = '/hizmetlerimiz'
  } = data || {};

  return (
    <section className={styles.servicesSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className={styles.servicesGrid}>
          {services.map(service => (
            <div key={service.id} className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className={service.icon}></i>
              </div>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
              <Link to={service.link} className={styles.serviceLink}>
                Detaylı Bilgi <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.sectionAction}>
          <Link to={actionLink} className={styles.actionButton}>
            {actionText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 