import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

const ServicesPage = () => {
  // Hizmetler listesi
  const services = [
    {
      id: 1,
      title: "Acil Durum Desteği",
      description: "24/7 hizmetimizle, ihtiyaç duyduğunuz her anda yanınızdayız. Acil durumlarla başa çıkmanıza yardımcı oluyoruz.",
      icon: "fas fa-ambulance",
      image: "/assets/images/service-emergency.jpg"
    },
    {
      id: 2,
      title: "Teknik Destek",
      description: "Teknik sorunlarınıza hızlı ve etkili çözümler sunuyoruz. Deneyimli ekibimiz, her türlü teknik zorlukla başa çıkmanıza yardımcı olur.",
      icon: "fas fa-tools",
      image: "/assets/images/service-technical.jpg"
    },
    {
      id: 3,
      title: "Danışmanlık Hizmetleri",
      description: "Profesyonel danışmanlık hizmetlerimizle, iş süreçlerinizi optimize etmenize ve hedeflerinize ulaşmanıza yardımcı oluyoruz.",
      icon: "fas fa-briefcase",
      image: "/assets/images/service-consulting.jpg"
    },
    {
      id: 4,
      title: "Eğitim Programları",
      description: "Özel eğitim programlarımızla, ekibinizin becerilerini geliştirmenize ve potansiyellerini maksimize etmelerine destek oluyoruz.",
      icon: "fas fa-graduation-cap",
      image: "/assets/images/service-education.jpg"
    },
    {
      id: 5,
      title: "Lojistik Hizmetler",
      description: "Etkili ve verimli lojistik çözümlerle, operasyonlarınızı sorunsuz bir şekilde yönetmenize yardımcı oluyoruz.",
      icon: "fas fa-truck",
      image: "/assets/images/service-logistics.jpg"
    },
    {
      id: 6,
      title: "Müşteri Desteği",
      description: "Müşterilerinize en iyi hizmeti sunmanız için gereken tüm desteği sağlıyoruz. Memnuniyet odaklı çözümler sunuyoruz.",
      icon: "fas fa-headset",
      image: "/assets/images/service-customer.jpg"
    }
  ];

  return (
    <div className={styles.servicesPage}>
      <Helmet>
        <title>Hizmetlerimiz - Acil Destek Lazım</title>
        <meta name="description" content="Acil Destek Lazım olarak sunduğumuz profesyonel hizmetler. İhtiyaçlarınıza özel çözümler için hizmetlerimizi keşfedin." />
        <link rel="canonical" href="https://acilldesteklazim.com/hizmetlerimiz" />
      </Helmet>

      <div className={styles.pageHeader}>
        <div className={styles.container}>
          <h1>Hizmetlerimiz</h1>
          <p>İhtiyaçlarınıza özel profesyonel çözümler</p>
        </div>
      </div>

      <section className={styles.servicesIntro}>
        <div className={styles.container}>
          <div className={styles.introContent}>
            <h2>Size Nasıl Yardımcı Olabiliriz?</h2>
            <p>Acil Destek Lazım olarak, çeşitli alanlarda profesyonel hizmetler sunuyoruz. Amacımız, ihtiyaçlarınızı en iyi şekilde anlamak ve size özel çözümler geliştirmektir. Aşağıda sunduğumuz hizmetleri inceleyebilir ve ihtiyaçlarınıza en uygun olanı seçebilirsiniz.</p>
            <p>Tüm hizmetlerimiz, deneyimli ekibimiz tarafından en yüksek standartlarda sunulmaktadır. Müşteri memnuniyeti ve kalite, en önem verdiğimiz değerlerdir.</p>
          </div>
        </div>
      </section>

      <section className={styles.servicesGrid}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {services.map(service => (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.serviceImage}>
                  <img src={service.image} alt={service.title} />
                </div>
                <div className={styles.serviceIcon}>
                  <i className={service.icon}></i>
                </div>
                <div className={styles.serviceContent}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <Link to="/iletisim" className={styles.serviceButton}>
                    Daha Fazla Bilgi
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.callToAction}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Özel İhtiyaçlarınız mı Var?</h2>
            <p>Bize ulaşın, size özel çözümler geliştirelim.</p>
            <Link to="/iletisim" className={styles.ctaButton}>
              İletişime Geçin
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage; 