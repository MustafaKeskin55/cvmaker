import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import styles from './styles.module.css';

const SqlToJson = () => {
  const [sqlInput, setSqlInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [fileName, setFileName] = useState('sql_to_json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formatType, setFormatType] = useState('pretty');
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);

  const handleSqlChange = (e) => {
    setSqlInput(e.target.value);
    setError('');
    setJsonOutput('');
    setTableHeaders([]);
    setTableData([]);
  };

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  };

  const handleFormatChange = (e) => {
    setFormatType(e.target.value);
    if (jsonOutput) {
      try {
        const parsedData = JSON.parse(jsonOutput);
        formatJsonOutput(parsedData, e.target.value);
      } catch (err) {
        console.error("JSON formatlama hatası:", err);
      }
    }
  };

  const formatJsonOutput = (data, format = formatType) => {
    try {
      if (format === 'pretty') {
        setJsonOutput(JSON.stringify(data, null, 2));
      } else {
        setJsonOutput(JSON.stringify(data));
      }
    } catch (err) {
      console.error("JSON formatlama hatası:", err);
    }
  };

  // SQL INSERT ifadelerini JSON'a dönüştürme
  const parseSqlInserts = (sql) => {
    try {
      // INSERT INTO ifadesini bul
      const insertRegex = /INSERT\s+INTO\s+`?(\w+)`?\s*\(([^)]+)\)\s*VALUES\s*(\([^)]+\)(?:\s*,\s*\([^)]+\))*)/gi;
      const insertMatches = [...sql.matchAll(insertRegex)];

      if (insertMatches.length === 0) {
        throw new Error("Geçerli INSERT INTO ifadesi bulunamadı.");
      }

      const results = [];

      for (const match of insertMatches) {
        const tableName = match[1];
        const columnStr = match[2];
        const valuesStr = match[3];
        
        // Sütunları parçala
        const columns = columnStr
          .split(',')
          .map(col => col.trim().replace(/^`|`$/g, ''));
        
        // Değerleri parçala
        const valueRegex = /\(([^)]+)\)/g;
        const valueMatches = [...valuesStr.matchAll(valueRegex)];
        
        // Her bir değer satırını işle
        for (const valueMatch of valueMatches) {
          const rowValuesStr = valueMatch[1];
          
          // Değerleri ayır
          const rowValues = parseValuesWithQuotes(rowValuesStr);
          
          // Nesneyi oluştur
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = rowValues[i];
          });
          
          results.push(obj);
        }

        // İlk tablonun başlıklarını ve verilerini ayarla (ön izleme için)
        if (tableHeaders.length === 0) {
          setTableHeaders(columns);
          
          const previewData = [];
          for (let i = 0; i < Math.min(5, results.length); i++) {
            previewData.push(results[i]);
          }
          setTableData(previewData);
        }
      }

      return results;
    } catch (err) {
      throw new Error(`SQL ayrıştırma hatası: ${err.message}`);
    }
  };

  // CREATE TABLE ifadelerini JSON şemasına dönüştür
  const parseSqlCreateTable = (sql) => {
    try {
      // CREATE TABLE ifadesini bul
      const createRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\(([^;]+)\)/gi;
      const createMatches = [...sql.matchAll(createRegex)];
      
      if (createMatches.length === 0) {
        throw new Error("Geçerli CREATE TABLE ifadesi bulunamadı.");
      }

      const schemas = {};

      for (const match of createMatches) {
        const tableName = match[1];
        const columnDefs = match[2];
        
        // Sütun tanımlarını parçala
        const columnRegex = /`?(\w+)`?\s+(\w+)(?:\([^)]*\))?(?:\s+([^,]+))?/g;
        const columnMatches = [...columnDefs.matchAll(columnRegex)];
        
        const columns = {};
        const requiredFields = [];
        
        for (const colMatch of columnMatches) {
          const colName = colMatch[1];
          const colType = colMatch[2];
          const colAttrs = colMatch[3] || '';
          
          // SQL veri tipini JSON şema tipine dönüştür
          const jsonType = sqlTypeToJsonType(colType);
          
          columns[colName] = {
            type: jsonType.type,
            description: `${colType} type field`
          };
          
          // NOT NULL ise required field olarak işaretle
          if (colAttrs.includes('NOT NULL')) {
            requiredFields.push(colName);
          }
          
          // Diğer öznitelikler eklenebilir (varsayılan değer, vb.)
        }
        
        schemas[tableName] = {
          type: "object",
          properties: columns,
          required: requiredFields
        };
        
        // Başlıkları ayarla (ön izleme için)
        if (tableHeaders.length === 0) {
          const firstTable = schemas[tableName];
          const headers = Object.keys(firstTable.properties);
          setTableHeaders(headers);
          
          // Örnek veri oluştur
          const sampleData = [];
          for (let i = 0; i < 3; i++) {
            const row = {};
            headers.forEach(header => {
              const propType = firstTable.properties[header].type;
              row[header] = sampleValueForType(propType);
            });
            sampleData.push(row);
          }
          setTableData(sampleData);
        }
      }

      return schemas;
    } catch (err) {
      throw new Error(`SQL şema ayrıştırma hatası: ${err.message}`);
    }
  };

  // SQL tipini JSON tipine dönüştür
  const sqlTypeToJsonType = (sqlType) => {
    sqlType = sqlType.toLowerCase();
    if (sqlType.includes('int') || sqlType.includes('decimal') || 
        sqlType.includes('float') || sqlType.includes('double') || 
        sqlType.includes('numeric')) {
      return { type: "number" };
    } else if (sqlType.includes('char') || sqlType.includes('text') || 
              sqlType.includes('varchar')) {
      return { type: "string" };
    } else if (sqlType.includes('date') || sqlType.includes('time')) {
      return { type: "string", format: "date-time" };
    } else if (sqlType.includes('bool')) {
      return { type: "boolean" };
    } else if (sqlType.includes('blob') || sqlType.includes('binary')) {
      return { type: "string", format: "binary" };
    } else {
      return { type: "string" };
    }
  };

  // Örnek değerler oluştur
  const sampleValueForType = (type) => {
    switch (type) {
      case 'number': return Math.floor(Math.random() * 1000);
      case 'string': return 'sample_text';
      case 'boolean': return Math.random() > 0.5;
      default: return 'sample_value';
    }
  };

  // Tırnaklı SQL değerlerini doğru şekilde ayrıştır
  const parseValuesWithQuotes = (valuesStr) => {
    const result = [];
    let currentStr = '';
    let inQuote = false;
    let quoteChar = '';
    
    for (let i = 0; i < valuesStr.length; i++) {
      const char = valuesStr[i];
      
      if ((char === "'" || char === '"') && (i === 0 || valuesStr[i-1] !== '\\')) {
        if (!inQuote) {
          inQuote = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuote = false;
          quoteChar = '';
        } else {
          currentStr += char;
        }
      } else if (char === ',' && !inQuote) {
        result.push(parseSqlValue(currentStr.trim()));
        currentStr = '';
      } else {
        currentStr += char;
      }
    }
    
    // Son değeri ekle
    if (currentStr.trim()) {
      result.push(parseSqlValue(currentStr.trim()));
    }
    
    return result;
  };

  // SQL değerini uygun JavaScript tipine dönüştür
  const parseSqlValue = (value) => {
    // Boş değer kontrol et
    if (value === 'NULL') return null;
    
    // Tırnaklardan temizle
    if ((value.startsWith("'") && value.endsWith("'")) || 
        (value.startsWith('"') && value.endsWith('"'))) {
      return value.slice(1, -1);
    }
    
    // Sayısal değeri kontrol et
    if (!isNaN(value) && value.trim() !== '') {
      return Number(value);
    }
    
    // Boolean değerleri kontrol et
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    return value;
  };

  const convertToJson = () => {
    if (!sqlInput.trim()) {
      setError('Lütfen SQL sorgusu girin.');
      return;
    }

    setLoading(true);
    setError('');
    setJsonOutput('');
    setTableHeaders([]);
    setTableData([]);

    try {
      let result;
      const sql = sqlInput.trim().toUpperCase();

      // SQL sorgu tipini belirle
      if (sql.includes('INSERT INTO')) {
        result = parseSqlInserts(sqlInput);
      } else if (sql.includes('CREATE TABLE')) {
        result = parseSqlCreateTable(sqlInput);
      } else {
        throw new Error("Desteklenen bir SQL ifadesi bulunamadı. (INSERT INTO veya CREATE TABLE ifadeleri gerekli)");
      }

      formatJsonOutput(result);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!jsonOutput) return;
    
    try {
      const blob = new Blob([jsonOutput], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(`Dosya indirme hatası: ${err.message}`);
    }
  };

  const loadSampleInsert = () => {
    const sampleInsert = `INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`age\`, \`active\`, \`created_at\`)
VALUES
(1, 'Ahmet Yılmaz', 'ahmet@example.com', 35, TRUE, '2023-01-15'),
(2, 'Ayşe Demir', 'ayse@example.com', 28, TRUE, '2023-02-20'),
(3, 'Mehmet Kaya', 'mehmet@example.com', 42, FALSE, '2023-03-05'),
(4, 'Fatma Şahin', 'fatma@example.com', 31, TRUE, '2023-04-10');`;
    
    setSqlInput(sampleInsert);
    setError('');
    setJsonOutput('');
    setTableHeaders([]);
    setTableData([]);
  };

  const loadSampleCreate = () => {
    const sampleCreate = `CREATE TABLE \`users\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`email\` varchar(255) NOT NULL,
  \`password\` varchar(255) NOT NULL,
  \`age\` int(11) DEFAULT NULL,
  \`active\` tinyint(1) NOT NULL DEFAULT '1',
  \`created_at\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`email\` (\`email\`)
);`;
    
    setSqlInput(sampleCreate);
    setError('');
    setJsonOutput('');
    setTableHeaders([]);
    setTableData([]);
  };

  return (
    <div className={styles.sqlToJson}>
      <Helmet>
        <title>SQL to JSON Dönüştürücü - lazımsaburada</title>
        <meta
          name="description"
          content="SQL ifadelerini kolayca JSON formatına dönüştürün"
        />
      </Helmet>

      <div className={styles.toolHeader}>
        <div className={styles.container}>
          <h1>SQL to JSON Dönüştürücü</h1>
          <p>SQL ifadelerini kolayca JSON formatına dönüştürün</p>
        </div>
      </div>

      <div className={styles.toolContent}>
        <div className={styles.container}>
          <div className={styles.converterBox}>
            <div className={styles.inputSection}>
              <div className={styles.inputHeader}>
                <h2>SQL Girdisi</h2>
                <div className={styles.sampleButtons}>
                  <button 
                    onClick={loadSampleInsert} 
                    className={styles.sampleButton}
                  >
                    Örnek INSERT
                  </button>
                  <button 
                    onClick={loadSampleCreate} 
                    className={styles.sampleButton}
                  >
                    Örnek CREATE TABLE
                  </button>
                </div>
              </div>
              
              <textarea 
                className={styles.sqlTextarea} 
                value={sqlInput}
                onChange={handleSqlChange}
                placeholder="SQL ifadenizi buraya yapıştırın... (INSERT INTO veya CREATE TABLE)"
              ></textarea>
              
              <div className={styles.options}>
                <div className={styles.optionField}>
                  <label>Dosya Adı:</label>
                  <input 
                    type="text" 
                    value={fileName}
                    onChange={handleFileNameChange}
                    className={styles.inputField}
                  />
                  <span>.json</span>
                </div>
                <div className={styles.optionField}>
                  <label>JSON Formatı:</label>
                  <select 
                    value={formatType}
                    onChange={handleFormatChange}
                    className={styles.selectField}
                  >
                    <option value="pretty">Düzenli (Pretty)</option>
                    <option value="compact">Sıkıştırılmış (Compact)</option>
                  </select>
                </div>
              </div>
              
              <button 
                onClick={convertToJson}
                className={styles.convertButton}
                disabled={loading || !sqlInput.trim()}
              >
                {loading ? (
                  <span>
                    <i className="fas fa-spinner fa-spin"></i> Dönüştürülüyor...
                  </span>
                ) : (
                  <span>
                    <i className="fas fa-file-code"></i> JSON'a Dönüştür
                  </span>
                )}
              </button>

              {error && (
                <div className={styles.errorMessage}>
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              {jsonOutput && (
                <div className={styles.resultSection}>
                  <h2>Dönüştürme Sonucu</h2>
                  
                  {tableHeaders.length > 0 && (
                    <div className={styles.previewSection}>
                      <h3>Veri Önizleme</h3>
                      <div className={styles.tablePreview}>
                        <table className={styles.previewTable}>
                          <thead>
                            <tr>
                              {tableHeaders.map((header, index) => (
                                <th key={index}>{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.map((row, i) => (
                              <tr key={i}>
                                {tableHeaders.map((header, j) => (
                                  <td key={j}>{row[header] !== undefined ? String(row[header]) : ''}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.jsonPreview}>
                    <h3>JSON Çıktısı</h3>
                    <textarea 
                      readOnly 
                      className={styles.jsonOutput}
                      value={jsonOutput}
                    ></textarea>
                  </div>
                  
                  <button 
                    onClick={downloadJson} 
                    className={styles.downloadButton}
                  >
                    <i className="fas fa-download"></i> JSON İndir
                  </button>
                </div>
              )}
            </div>
            
            <div className={styles.infoSection}>
              <h3>Nasıl Kullanılır?</h3>
              <ol>
                <li>SQL ifadelerinizi giriş alanına yapıştırın.</li>
                <li>Desteklenen SQL ifadeleri: CREATE TABLE, INSERT INTO.</li>
                <li>JSON'a Dönüştür butonuna tıklayın.</li>
                <li>Sonucu görüntüleyin ve indirin.</li>
              </ol>

              <div className={styles.featureList}>
                <h3>Özellikler</h3>
                <ul>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <span><strong>INSERT INTO</strong> ifadelerini veri dizisine dönüştürme</span>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <span><strong>CREATE TABLE</strong> ifadelerini JSON şemasına dönüştürme</span>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <span>Düzenli veya sıkıştırılmış JSON formatı desteği</span>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <span>Tablo verisi önizleme</span>
                  </li>
                </ul>
              </div>

              <div className={styles.note}>
                <i className="fas fa-info-circle"></i>
                <p>Not: Karmaşık SQL ifadeleri veya alt sorgular henüz desteklenmemektedir.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SqlToJson; 