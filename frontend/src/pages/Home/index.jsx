import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

// Components
import HeroSection from '../../components/HeroSection';
import FeaturesSection from '../../components/FeaturesSection';
import ContactSection from '../../components/ContactSection';

const HomePage = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Araçları yükle
  useEffect(() => {
    // Örnek araçlar - gerçek projede API'den çekilebilir
    const toolsList = [
      {
        id: 1,
        title: "Kategori Oluşturucu",
        description: "Hiyerarşik kategori yapıları oluşturun ve JSON formatında dışa aktarın",
        icon: "fas fa-sitemap",
        link: "/araclar/kategori-olusturucu",
        color: "#4CAF50"
      },
      {
        id: 2,
        title: "JSON to Excel",
        description: "JSON verilerinizi Excel dosyasına dönüştürün",
        icon: "fas fa-file-excel",
        link: "/araclar/json-to-excel",
        color: "#2196F3"
      },
      {
        id: 3,
        title: "PDF Dönüştürücü",
        description: "PDF dosyalarını farklı formatlara dönüştürün",
        icon: "fas fa-file-pdf",
        link: "/araclar/pdf-donusturucu",
        color: "#F44336"
      },
      {
        id: 4,
        title: "Resim Dönüştürücü",
        description: "Resim formatı ve boyutu değiştirme işlemleri yapın",
        icon: "fas fa-image",
        link: "/araclar/resim-donusturucu",
        color: "#9C27B0"
      },
      {
        id: 5,
        title: "Metin Araçları",
        description: "Metin düzenleme, formatlama ve dönüştürme araçları",
        icon: "fas fa-font",
        link: "/araclar/metin-araclari",
        color: "#FF9800"
      },
      {
        id: 6,
        title: "QR Kod Oluşturucu",
        description: "Özelleştirilebilir QR kodları oluşturun ve indirin",
        icon: "fas fa-qrcode",
        link: "/araclar/qr-kod-olusturucu",
        color: "#607D8B"
      }
    ];
    
    setTools(toolsList);
    setLoading(false);
  }, []);

  // Hero section içeriği
  const heroContent = {
    title: "İşinizi Kolaylaştıran <span>Ücretsiz</span> Araçlar",
    description: "Zaman kazanmanızı sağlayacak, hızlı ve kullanımı kolay, %100 ücretsiz çevrimiçi araçlar.",
    ctaText: "Araçları Keşfedin",
    ctaLink: "#araclar"
  };

  // Özellikler içeriği
  const featuresContent = {
    title: "Neden Bizi Tercih Etmelisiniz?",
    subtitle: "Kullanıcı dostu ve tamamen ücretsiz araçlarımız ile işlerinizi kolaylaştırıyoruz",
    features: [
      {
        id: 1,
        icon: 'fas fa-bolt',
        title: 'Hız',
        description: 'Tüm araçlarımız hızlı yüklenir ve işlemlerini anında gerçekleştirir.'
      },
      {
        id: 2,
        icon: 'fas fa-shield-alt',
        title: 'Güvenlik',
        description: 'Yüklediğiniz tüm dosya ve veriler tamamen gizli kalır ve sunucularımızda saklanmaz.'
      },
      {
        id: 3,
        icon: 'fas fa-desktop',
        title: 'Tarayıcı Tabanlı',
        description: 'Hiçbir yazılım indirmeniz gerekmez, tüm araçlar tarayıcınızda çalışır.'
      },
      {
        id: 4,
        icon: 'fas fa-gift',
        title: '%100 Ücretsiz',
        description: 'Araçlarımız tamamen ücretsizdir ve gizli ücretler içermez.'
      }
    ]
  };

  return (
    <div className={styles.homePage}>
      <Helmet>
        <title>Acil Destek Lazım - Ücretsiz Online Araçlar</title>
        <meta name="description" content="Hızlı ve ücretsiz kategori oluşturucu, JSON to Excel dönüştürücü, PDF dönüştürme ve daha fazla online araç" />
        <meta name="keywords" content="ücretsiz araçlar, online araçlar, kategori oluşturucu, json to excel, pdf dönüştürücü" />
        <link rel="canonical" href="https://acilldesteklazim.com/" />
      </Helmet>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle} dangerouslySetInnerHTML={{ __html: heroContent.title }}></h1>
          <p className={styles.heroDescription}>{heroContent.description}</p>
          <a href={heroContent.ctaLink} className={styles.ctaButton}>
            {heroContent.ctaText} <i className="fas fa-chevron-right"></i>
          </a>
        </div>
        <div className={styles.heroImage}>
          <div className={`${styles.floatingCard} ${styles.card1}`}>
            <i className="fas fa-sitemap"></i>
            <span>Kategori Oluşturucu</span>
          </div>
          <div className={`${styles.floatingCard} ${styles.card2}`}>
            <i className="fas fa-file-excel"></i>
            <span>JSON to Excel</span>
          </div>
          <div className={`${styles.floatingCard} ${styles.card3}`}>
            <i className="fas fa-file-pdf"></i>
            <span>PDF Dönüştürücü</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection data={featuresContent} />

      {/* Tools Section */}
      <section className={styles.toolsSection} id="araclar">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Araçlarımız</h2>
            <p>İhtiyacınız olan aracı seçin ve hemen kullanmaya başlayın</p>
          </div>

          {loading ? (
            <div className={styles.loadingTools}>
              <i className="fas fa-spinner fa-spin"></i>
              <p>Araçlar yükleniyor...</p>
            </div>
          ) : (
            <div className={styles.toolsGrid}>
              {tools.map(tool => (
                <Link to={tool.link} key={tool.id} className={styles.toolCard}>
                  <div 
                    className={styles.toolIcon} 
                    style={{ backgroundColor: `${tool.color}20`, color: tool.color }}
                  >
                    <i className={tool.icon}></i>
                  </div>
                  <h3 className={styles.toolTitle}>{tool.title}</h3>
                  <p className={styles.toolDescription}>{tool.description}</p>
                  <span className={styles.toolLink}>
                    Kullan <i className="fas fa-arrow-right"></i>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>İhtiyacınız Olan Bir Araç mı Var?</h2>
            <p>Eklenmiş olmasını istediğiniz bir araç varsa, lütfen bize bildirin.</p>
            <Link to="/iletisim" className={styles.ctaButton}>
              Bize Ulaşın <i className="fas fa-paper-plane"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection data={{
        title: 'İletişim',
        subtitle: 'Sorularınız veya önerileriniz için bizimle iletişime geçebilirsiniz'
      }} />
    </div>
  );
};

export default HomePage; 