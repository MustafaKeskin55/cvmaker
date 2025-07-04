import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { v4 as uuidv4 } from 'uuid';
import styles from './styles.module.css';

const CategoryCreator = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // JSON çıktısını güncelle
  useEffect(() => {
    const output = JSON.stringify(categories, null, 2);
    setJsonOutput(output);
  }, [categories]);

  // Bildirim göster
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Ana kategori ekle
  const addCategory = () => {
    if (!newCategory.trim()) {
      showNotification('Kategori adı boş olamaz!', 'error');
      return;
    }

    const categoryExists = categories.some(
      (cat) => cat.name.toLowerCase() === newCategory.toLowerCase()
    );

    if (categoryExists) {
      showNotification('Bu kategori zaten var!', 'error');
      return;
    }

    const newCategoryObject = {
      id: uuidv4(),
      name: newCategory.trim(),
      subcategories: [],
    };

    setCategories([...categories, newCategoryObject]);
    setNewCategory('');
    showNotification('Kategori başarıyla eklendi');
  };

  // Alt kategori ekle
  const addSubcategory = () => {
    if (!selectedCategory) {
      showNotification('Lütfen önce bir ana kategori seçin!', 'error');
      return;
    }

    if (!newSubcategory.trim()) {
      showNotification('Alt kategori adı boş olamaz!', 'error');
      return;
    }

    const subcategoryExists = categories
      .find((cat) => cat.id === selectedCategory)
      ?.subcategories.some(
        (subcat) => subcat.name.toLowerCase() === newSubcategory.toLowerCase()
      );

    if (subcategoryExists) {
      showNotification('Bu alt kategori zaten var!', 'error');
      return;
    }

    const newSubcategoryObject = {
      id: uuidv4(),
      name: newSubcategory.trim(),
      items: [],
    };

    const updatedCategories = categories.map((category) => {
      if (category.id === selectedCategory) {
        return {
          ...category,
          subcategories: [...category.subcategories, newSubcategoryObject],
        };
      }
      return category;
    });

    setCategories(updatedCategories);
    setNewSubcategory('');
    showNotification('Alt kategori başarıyla eklendi');
  };

  // Kategori sil
  const deleteCategory = (id) => {
    const updatedCategories = categories.filter((category) => category.id !== id);
    setCategories(updatedCategories);

    if (selectedCategory === id) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    }

    showNotification('Kategori başarıyla silindi');
  };

  // Alt kategori sil
  const deleteSubcategory = (categoryId, subcategoryId) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.filter(
            (subcategory) => subcategory.id !== subcategoryId
          ),
        };
      }
      return category;
    });

    setCategories(updatedCategories);

    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory(null);
    }

    showNotification('Alt kategori başarıyla silindi');
  };

  // Öğe ekle
  const addItem = (subcategoryId) => {
    const selectedSubcategoryObject = categories
      .find((cat) => cat.id === selectedCategory)
      ?.subcategories.find((subcat) => subcat.id === subcategoryId);

    const newItemName = prompt('Öğe adını girin:');

    if (!newItemName || !newItemName.trim()) {
      return;
    }

    const itemExists = selectedSubcategoryObject?.items.some(
      (item) => item.toLowerCase() === newItemName.toLowerCase()
    );

    if (itemExists) {
      showNotification('Bu öğe zaten var!', 'error');
      return;
    }

    const updatedCategories = categories.map((category) => {
      if (category.id === selectedCategory) {
        return {
          ...category,
          subcategories: category.subcategories.map((subcategory) => {
            if (subcategory.id === subcategoryId) {
              return {
                ...subcategory,
                items: [...subcategory.items, newItemName.trim()],
              };
            }
            return subcategory;
          }),
        };
      }
      return category;
    });

    setCategories(updatedCategories);
    showNotification('Öğe başarıyla eklendi');
  };

  // Öğe sil
  const deleteItem = (subcategoryId, itemIndex) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === selectedCategory) {
        return {
          ...category,
          subcategories: category.subcategories.map((subcategory) => {
            if (subcategory.id === subcategoryId) {
              return {
                ...subcategory,
                items: subcategory.items.filter((_, index) => index !== itemIndex),
              };
            }
            return subcategory;
          }),
        };
      }
      return category;
    });

    setCategories(updatedCategories);
    showNotification('Öğe başarıyla silindi');
  };

  // Kategorileri temizle
  const clearCategories = () => {
    if (window.confirm('Tüm kategorileri silmek istediğinize emin misiniz?')) {
      setCategories([]);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      showNotification('Tüm kategoriler temizlendi');
    }
  };

  // JSON'ı kopyala
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
    setCopiedToClipboard(true);
    showNotification('JSON çıktısı panoya kopyalandı');

    setTimeout(() => {
      setCopiedToClipboard(false);
    }, 2000);
  };

  // JSON'ı indir
  const downloadJson = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification('JSON dosyası indirildi');
  };

  // Örnek kategorileri yükle
  const loadExampleCategories = () => {
    const exampleCategories = [
      {
        id: uuidv4(),
        name: 'Elektronik',
        subcategories: [
          {
            id: uuidv4(),
            name: 'Telefonlar',
            items: ['iPhone', 'Samsung', 'Xiaomi', 'Huawei'],
          },
          {
            id: uuidv4(),
            name: 'Bilgisayarlar',
            items: ['Dizüstü', 'Masaüstü', 'Tablet'],
          },
        ],
      },
      {
        id: uuidv4(),
        name: 'Giyim',
        subcategories: [
          {
            id: uuidv4(),
            name: 'Erkek',
            items: ['Tişört', 'Pantolon', 'Ceket'],
          },
          {
            id: uuidv4(),
            name: 'Kadın',
            items: ['Elbise', 'Bluz', 'Etek'],
          },
        ],
      },
    ];

    setCategories(exampleCategories);
    showNotification('Örnek kategoriler yüklendi');
  };

  // Sürükle-bırak fonksiyonları
  const handleDragStart = (e, categoryId) => {
    setDraggedCategory(categoryId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetCategoryId) => {
    e.preventDefault();
    if (draggedCategory === targetCategoryId) return;

    const draggedCategoryIndex = categories.findIndex((cat) => cat.id === draggedCategory);
    const targetCategoryIndex = categories.findIndex((cat) => cat.id === targetCategoryId);

    const newCategories = [...categories];
    const [draggedCategoryObj] = newCategories.splice(draggedCategoryIndex, 1);
    newCategories.splice(targetCategoryIndex, 0, draggedCategoryObj);

    setCategories(newCategories);
  };

  // Kategori arama
  const filterCategories = (category) => {
    if (!searchQuery) return true;
    return category.name.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className={styles.categoryCreator}>
      <Helmet>
        <title>Kategori Oluşturucu - Acil Destek Lazım</title>
        <meta
          name="description"
          content="Hiyerarşik kategori yapıları oluşturun ve JSON formatında dışa aktarın"
        />
      </Helmet>

      <div className={styles.toolHeader}>
        <div className={styles.container}>
          <h1>Kategori Oluşturucu</h1>
          <p>Hiyerarşik kategori yapıları oluşturun ve JSON formatında dışa aktarın</p>
        </div>
      </div>

      <div className={styles.toolContent}>
        <div className={styles.container}>
          {/* Araç Arayüzü */}
          <div className={styles.toolInterface}>
            {/* Kategori Paneli */}
            <div className={styles.categoriesPanel}>
              <div className={styles.panelHeader}>
                <h2>Kategoriler</h2>
                <div className={styles.categoryControls}>
                  <input
                    type="text"
                    placeholder="Kategori ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  <div className={styles.categoryActions}>
                    <button
                      onClick={clearCategories}
                      className={`${styles.actionButton} ${styles.clearButton}`}
                      title="Tüm kategorileri temizle"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <button
                      onClick={loadExampleCategories}
                      className={`${styles.actionButton} ${styles.exampleButton}`}
                      title="Örnek kategorileri yükle"
                    >
                      <i className="fas fa-lightbulb"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.categoryInput}>
                <input
                  type="text"
                  placeholder="Yeni kategori adı..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <button onClick={addCategory}>
                  <i className="fas fa-plus"></i> Ekle
                </button>
              </div>

              <div className={styles.categoryList}>
                {categories.length === 0 ? (
                  <div className={styles.emptyState}>
                    <i className="fas fa-folder-open"></i>
                    <p>Henüz kategori eklenmemiş</p>
                    <button
                      onClick={loadExampleCategories}
                      className={styles.emptyStateButton}
                    >
                      Örnek Kategoriler Yükle
                    </button>
                  </div>
                ) : (
                  <ul>
                    {categories.filter(filterCategories).map((category) => (
                      <li
                        key={category.id}
                        className={`${styles.categoryItem} ${
                          selectedCategory === category.id ? styles.selected : ''
                        }`}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedSubcategory(null);
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, category.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, category.id)}
                      >
                        <div className={styles.categoryName}>
                          <i className="fas fa-folder"></i>
                          <span>{category.name}</span>
                          <span className={styles.categoryCount}>
                            {category.subcategories.length}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCategory(category.id);
                          }}
                          className={styles.deleteButton}
                          title="Kategoriyi sil"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Alt Kategori Paneli */}
            <div className={styles.subcategoriesPanel}>
              <div className={styles.panelHeader}>
                <h2>Alt Kategoriler</h2>
              </div>

              {selectedCategory ? (
                <>
                  <div className={styles.categoryInput}>
                    <input
                      type="text"
                      placeholder="Yeni alt kategori adı..."
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSubcategory()}
                    />
                    <button onClick={addSubcategory}>
                      <i className="fas fa-plus"></i> Ekle
                    </button>
                  </div>

                  <div className={styles.subcategoryList}>
                    {categories.find((cat) => cat.id === selectedCategory)?.subcategories
                      .length === 0 ? (
                      <div className={styles.emptyState}>
                        <i className="fas fa-folder-open"></i>
                        <p>Henüz alt kategori eklenmemiş</p>
                      </div>
                    ) : (
                      <ul>
                        {categories
                          .find((cat) => cat.id === selectedCategory)
                          ?.subcategories.map((subcategory) => (
                            <li
                              key={subcategory.id}
                              className={`${styles.subcategoryItem} ${
                                selectedSubcategory === subcategory.id ? styles.selected : ''
                              }`}
                              onClick={() => setSelectedSubcategory(subcategory.id)}
                            >
                              <div className={styles.subcategoryName}>
                                <i className="fas fa-folder"></i>
                                <span>{subcategory.name}</span>
                                <span className={styles.categoryCount}>
                                  {subcategory.items.length}
                                </span>
                              </div>
                              <div className={styles.subcategoryActions}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addItem(subcategory.id);
                                  }}
                                  className={styles.actionButton}
                                  title="Öğe ekle"
                                >
                                  <i className="fas fa-plus"></i>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSubcategory(selectedCategory, subcategory.id);
                                  }}
                                  className={styles.deleteButton}
                                  title="Alt kategoriyi sil"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <i className="fas fa-info-circle"></i>
                  <p>Lütfen soldan bir kategori seçin</p>
                </div>
              )}
            </div>

            {/* Öğeler Paneli */}
            <div className={styles.itemsPanel}>
              <div className={styles.panelHeader}>
                <h2>Öğeler</h2>
              </div>

              {selectedSubcategory ? (
                <div className={styles.itemsList}>
                  {categories
                    .find((cat) => cat.id === selectedCategory)
                    ?.subcategories.find((subcat) => subcat.id === selectedSubcategory)
                    ?.items.length === 0 ? (
                    <div className={styles.emptyState}>
                      <i className="fas fa-list"></i>
                      <p>Henüz öğe eklenmemiş</p>
                      <button
                        onClick={() => addItem(selectedSubcategory)}
                        className={styles.emptyStateButton}
                      >
                        Öğe Ekle
                      </button>
                    </div>
                  ) : (
                    <ul>
                      {categories
                        .find((cat) => cat.id === selectedCategory)
                        ?.subcategories.find((subcat) => subcat.id === selectedSubcategory)
                        ?.items.map((item, index) => (
                          <li key={index} className={styles.itemItem}>
                            <div className={styles.itemName}>
                              <i className="fas fa-circle"></i>
                              <span>{item}</span>
                            </div>
                            <button
                              onClick={() => deleteItem(selectedSubcategory, index)}
                              className={styles.deleteButton}
                              title="Öğeyi sil"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <i className="fas fa-info-circle"></i>
                  <p>Lütfen soldan bir alt kategori seçin</p>
                </div>
              )}
            </div>
          </div>

          {/* JSON Çıktısı */}
          <div className={styles.jsonOutput}>
            <div className={styles.jsonHeader}>
              <h2>JSON Çıktısı</h2>
              <div className={styles.jsonActions}>
                <button
                  onClick={copyToClipboard}
                  className={`${styles.actionButton} ${copiedToClipboard ? styles.copied : ''}`}
                  title="Panoya kopyala"
                >
                  {copiedToClipboard ? (
                    <>
                      <i className="fas fa-check"></i> Kopyalandı
                    </>
                  ) : (
                    <>
                      <i className="fas fa-copy"></i> Kopyala
                    </>
                  )}
                </button>
                <button
                  onClick={downloadJson}
                  className={styles.actionButton}
                  title="JSON olarak indir"
                >
                  <i className="fas fa-download"></i> İndir
                </button>
              </div>
            </div>
            <pre className={styles.jsonContent}>{jsonOutput}</pre>
          </div>
        </div>
      </div>

      {/* Bildirim */}
      {notification.show && (
        <div
          className={`${styles.notification} ${
            notification.type === 'error' ? styles.error : styles.success
          }`}
        >
          <i
            className={
              notification.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'
            }
          ></i>
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default CategoryCreator; 