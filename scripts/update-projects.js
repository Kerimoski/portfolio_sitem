#!/usr/bin/env node

/**
 * Portfolio Projelerini Otomatik Güncelleme Script'i
 * Bu script localStorage'daki projeleri public/data/projects.json'a yazar
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON dosya yolu
const projectsPath = path.join(__dirname, '../public/data/projects.json');

// Manuel proje verisi girişi için
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔄 Portfolio Projelerini Güncelleme Script\'i\n');

// Mevcut projeleri göster
try {
  if (fs.existsSync(projectsPath)) {
    const currentData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    console.log('📋 Mevcut projeler:', currentData.length, 'adet\n');
    
    currentData.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title}`);
    });
    console.log('');
  }
} catch (error) {
  console.log('📁 Henüz proje dosyası yok, yeni oluşturulacak.\n');
}

readline.question('Dashboard\'dan export ettiğiniz JSON verisini buraya yapıştırın:\n', (input) => {
  try {
    // JSON verisini parse et
    const projectsData = JSON.parse(input.trim());
    
    if (!Array.isArray(projectsData)) {
      throw new Error('Veriler array formatında olmalı');
    }

    // Klasör var mı kontrol et
    const dataDir = path.dirname(projectsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 data klasörü oluşturuldu');
    }

    // JSON dosyasını güncelle
    fs.writeFileSync(projectsPath, JSON.stringify(projectsData, null, 2));
    
    console.log('✅ Projeler başarıyla güncellendi!');
    console.log(`📊 Toplam ${projectsData.length} proje public/data/projects.json dosyasına yazıldı`);
    console.log('\n🚀 Artık hosting\'e yükleme yapabilirsiniz!');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('💡 JSON formatını kontrol edin ve tekrar deneyin.');
  }
  
  readline.close();
}); 