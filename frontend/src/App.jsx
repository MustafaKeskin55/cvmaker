import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/Home';
import ToolsPage from './pages/Tools';
import ContactPage from './pages/Contact';

// Tool Pages
import CategoryCreator from './tools/CategoryCreator';
import JsonToExcel from './tools/JsonToExcel';
import ExcelToJson from './tools/ExcelToJson';
import SqlToJson from './tools/SqlToJson';
import PdfConverter from './tools/PdfConverter';
import PdfEditor from './tools/PdfEditor';
import ImageConverter from './tools/ImageConverter';
import TextTools from './tools/TextTools';
import QrCreator from './tools/QrCreator';

function App() {
  return (
    <div className="app">
      {/* SEO için meta taglar */}
      <Helmet>
        <title>lazımsaburada - Ücretsiz Online Araçlar</title>
        <meta name="description" content="Hızlı ve ücretsiz kategori oluşturucu, JSON to Excel dönüştürücü, PDF dönüştürme ve daha fazla online araç" />
        <link rel="canonical" href="https://lazımsaburada.com/" />
      </Helmet>
      
      <Header />
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/araclar" element={<ToolsPage />} />
          <Route path="/iletisim" element={<ContactPage />} />
          
          {/* Araç Sayfaları */}
          <Route path="/araclar/kategori-olusturucu" element={<CategoryCreator />} />
          <Route path="/araclar/json-to-excel" element={<JsonToExcel />} />
          <Route path="/araclar/excel-to-json" element={<ExcelToJson />} />
          <Route path="/araclar/sql-to-json" element={<SqlToJson />} />
          <Route path="/araclar/pdf-donusturucu" element={<PdfConverter />} />
          <Route path="/araclar/pdf-duzenleyici" element={<PdfEditor />} />
          <Route path="/araclar/resim-donusturucu" element={<ImageConverter />} />
          <Route path="/araclar/metin-araclari" element={<TextTools />} />
          <Route path="/araclar/qr-kod-olusturucu" element={<QrCreator />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App; 