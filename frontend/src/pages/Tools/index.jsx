import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import styles from './styles.module.css';

const ToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Örnek araçlar - gerçek projede API'den çekilebilir
    const toolsList = [
      {
        id: 1,
        title: "Kategori Oluşturucu",
        description: "Hiyerarşik kategori yapıları oluşturun ve JSON formatında dışa aktarın",
        icon: "fas fa-sitemap",
        link: "/araclar/kategori-olusturucu",
        color: "#4CAF50",
        category: "json"
      },
      {
        id: 2,
        title: "JSON to Excel",
        description: "JSON verilerinizi Excel dosyasına dönüştürün",
        icon: "fas fa-file-excel",
        link: "/araclar/json-to-excel",
        color: "#2196F3",
        category: "json"
      },
      {
        id: 3,
        title: "PDF Dönüştürücü",
        description: "PDF dosyalarını farklı formatlara dönüştürün veya birleştirin",
        icon: "fas fa-file-pdf",
        link: "/araclar/pdf-donusturucu",
        color: "#F44336",
        category: "pdf"
      },
      {
        id: 4,
        title: "Resim Dönüştürücü",
        description: "Resim formatı ve boyutu değiştirme, sıkıştırma işlemleri yapın",
        icon: "fas fa-image",
        link: "/araclar/resim-donusturucu",
        color: "#9C27B0",
        category: "image"
      },
      {
        id: 5,
        title: "Metin Formatla",
        description: "Metinleri farklı formatlara çevirin ve düzenleyin",
        icon: "fas fa-font",
        link: "/araclar/metin-araclari",
        color: "#FF9800",
        category: "text"
      },
      {
        id: 6,
        title: "QR Kod Oluşturucu",
        description: "Özelleştirilebilir QR kodları oluşturun ve indirin",
        icon: "fas fa-qrcode",
        link: "/araclar/qr-kod-olusturucu",
        color: "#607D8B",
        category: "other"
      },
      {
        id: 7,
        title: "Excel to JSON",
        description: "Excel dosyalarını JSON formatına dönüştürün",
        icon: "fas fa-file-code",
        link: "/araclar/excel-to-json",
        color: "#009688",
        category: "json"
      },
      {
        id: 8,
        title: "SQL to JSON",
        description: "SQL ifadelerini JSON verilerine dönüştürün",
        icon: "fas fa-database",
        link: "/araclar/sql-to-json",
        color: "#3F51B5",
        category: "json"
      },
      {
        id: 9,
        title: "PDF Düzenleyici",
        description: "PDF dosyalarını döndürün, sıkıştırın ve sayfalarını düzenleyin",
        icon: "fas fa-edit",
        link: "/araclar/pdf-duzenleyici",
        color: "#E91E63",
        category: "pdf"
      },
      {
        id: 10,
        title: "Metin Temizleyici",
        description: "Metinleri gereksiz boşluk ve karakterlerden temizleyin",
        icon: "fas fa-broom",
        link: "/araclar/metin-temizleme",
        color: "#795548",
        category: "text"
      }
    ];
    
    setTools(toolsList);
    setFilteredTools(toolsList);
    setLoading(false);
  }, []);

  // Araçları kategoriye göre filtrele
  const filterByCategory = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setFilteredTools(tools.filter(tool => 
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredTools(tools.filter(tool => 
        tool.category === category && (
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ));
    }
  };

  // Araç arama
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (activeCategory === 'all') {
      setFilteredTools(tools.filter(tool => 
        tool.title.toLowerCase().includes(query.toLowerCase()) || 
        tool.description.toLowerCase().includes(query.toLowerCase())
      ));
    } else {
      setFilteredTools(tools.filter(tool => 
        tool.category === activeCategory && (
          tool.title.toLowerCase().includes(query.toLowerCase()) || 
          tool.description.toLowerCase().includes(query.toLowerCase())
        )
      ));
    }
  };

  // Kategori listesi
  const categories = [
    { id: 'all', name: 'Hepsi', icon: 'fas fa-th-large' },
    { id: 'json', name: 'JSON Araçları', icon: 'fas fa-code' },
    { id: 'pdf', name: 'PDF Araçları', icon: 'fas fa-file-pdf' },
    { id: 'image', name: 'Resim Araçları', icon: 'fas fa-image' },
    { id: 'text', name: 'Metin Araçları', icon: 'fas fa-font' },
    { id: 'other', name: 'Diğer', icon: 'fas fa-ellipsis-h' }
  ];

  return (
    <div className={styles.toolsPage}>
      <Helmet>
        <title>Ücretsiz Online Araçlar - lazımsaburada</title>
        <meta name="description" content="Kategori oluşturucu, dönüştürücüler ve daha birçok ücretsiz online araç." />
        <link rel="canonical" href="https://lazımsaburada.com/araclar" />
      </Helmet>

      <div className={styles.pageHeader}>
        <div className={styles.container}>
          <h1>Ücretsiz Online Araçlar</h1>
          <p>İşinizi kolaylaştırmak için tasarlanmış çevrimiçi araçlar</p>
        </div>
      </div>

      <div className={styles.toolsContent}>
        <div className={styles.container}>
          <div className={styles.toolsTopBar}>
            <div className={styles.search}>
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Araç ara..." 
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            <div className={styles.categories}>
              {categories.map(category => (
                <button 
                  key={category.id}
                  className={`${styles.categoryButton} ${activeCategory === category.id ? styles.active : ''}`}
                  onClick={() => filterByCategory(category.id)}
                >
                  <i className={category.icon}></i>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              <p>Araçlar yükleniyor...</p>
            </div>
          ) : (
            <>
              {filteredTools.length > 0 ? (
                <div className={styles.toolsGrid}>
                  {filteredTools.map(tool => (
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
              ) : (
                <div className={styles.noResults}>
                  <i className="fas fa-search"></i>
                  <h3>Araç Bulunamadı</h3>
                  <p>Arama kriterlerinize uygun araç bulunamadı. Lütfen başka bir arama terimi deneyin.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className={styles.requestToolSection}>
        <div className={styles.container}>
          <div className={styles.requestToolContent}>
            <h2>İhtiyacınız Olan Bir Araç mı Var?</h2>
            <p>İhtiyacınız olan bir aracı bulamadınız mı? Eklenmiş olmasını istediğiniz bir araç varsa, lütfen bize bildirin.</p>
            <Link to="/iletisim" className={styles.requestButton}>
              Araç Talep Et <i className="fas fa-paper-plane"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;

 