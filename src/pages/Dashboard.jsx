import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLogin from '../components/DashboardLogin';
import LazyImage from '../components/LazyImage';
import ProjectSlideshow from '../components/ProjectSlideshow';
import ReviewManager from '../components/ReviewManager';
import AnalyticsChart from '../components/AnalyticsChart';


const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    images: [], // Çoklu resim dizisi
    title: '',
    tags: '',
    projectLink: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [editingProject, setEditingProject] = useState(null);
  const [editedProject, setEditedProject] = useState(null);
  const [editedImages, setEditedImages] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalViews: 0,
    totalClicks: 0
  });
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    checkAuth();
    loadProjects();
    loadAnalyticsData();
    
    // Analytics verileri güncelleme listener'ı
    const interval = setInterval(() => {
      if (activeTab === 'analytics') {
        loadAnalyticsData();
      }
    }, 10000); // 10 saniyede bir güncelle
    
    // Analytics güncellemelerini dinle
    const handleAnalyticsUpdate = () => {
      loadAnalyticsData();
    };
    
    window.addEventListener('analyticsUpdated', handleAnalyticsUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('analyticsUpdated', handleAnalyticsUpdate);
    };
  }, [activeTab]);

  const loadAnalyticsData = () => {
    const data = JSON.parse(localStorage.getItem('portfolio-analytics') || '{}');
    setAnalyticsData(data);
  };

  const checkAuth = () => {
    const authStatus = localStorage.getItem('dashboard-auth');
    const authTime = localStorage.getItem('dashboard-auth-time');
    
    if (authStatus === 'true' && authTime) {
      const currentTime = Date.now();
      const authTimestamp = parseInt(authTime);
      const hoursPassed = (currentTime - authTimestamp) / (1000 * 60 * 60);
      
      if (hoursPassed < 24) { // 24 saat geçerli
        setIsAuthenticated(true);
      } else {
        // Auth süresi dolmuş
        localStorage.removeItem('dashboard-auth');
        localStorage.removeItem('dashboard-auth-time');
      }
    }
  };

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboard-auth');
    localStorage.removeItem('dashboard-auth-time');
    setIsAuthenticated(false);
  };

  // Artık default projeler yok - sadece user eklenen projeler

  const loadProjects = async () => {
    console.log('🔄 Dashboard projeler yükleniyor (SUNUCU + LOCAL)...');
    
    let allProjects = [];
    
    try {
      // 1. Önce API'dan sunucu verilerini çek
      console.log('🌐 API\'dan projeler yükleniyor...');
      const response = await fetch('/data/projects.json');
      if (response.ok) {
        const apiProjects = await response.json();
        console.log('📦 API\'dan alınan projeler:', apiProjects);
        
        if (Array.isArray(apiProjects) && apiProjects.length > 0) {
          allProjects = apiProjects.map(project => ({
            ...project,
            id: project.id || `api-${Date.now()}-${Math.random()}`
          }));
          console.log('✅ API projeler kullanılıyor:', allProjects.length, 'adet');
        }
      }
    } catch (error) {
      console.log('📭 API projeler yüklenemedi:', error.message);
    }
    
    // 2. Eğer API'dan veri gelmediyse localStorage'dan yükle (fallback)
    if (allProjects.length === 0) {
      console.log('💾 localStorage\'dan projeler yükleniyor...');
    const savedProjects = localStorage.getItem('portfolio-projects');
    if (savedProjects) {
      try {
        const userProjects = JSON.parse(savedProjects);
          console.log('📦 localStorage\'dan alınan:', userProjects);
        
        allProjects = userProjects.map(project => ({
          ...project,
            id: project.id || `local-${Date.now()}-${Math.random()}`
        }));
        
          console.log('✅ localStorage projeler kullanılıyor:', allProjects.length, 'adet');
      } catch (error) {
          console.error('❌ localStorage yükleme hatası:', error);
        }
      }
    }
    
    // Sıralama varsa uygula
    const savedOrder = localStorage.getItem('portfolio-projects-order');
    if (savedOrder && allProjects.length > 0) {
      try {
        const orderIds = JSON.parse(savedOrder);
        console.log('🔄 Dashboard sıralama uygulanıyor:', orderIds);
        
        allProjects.sort((a, b) => {
          const aIndex = orderIds.indexOf(a.id);
          const bIndex = orderIds.indexOf(b.id);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      } catch (error) {
        console.error('❌ Dashboard sıralama hatası:', error);
      }
    }
    
    setProjects(allProjects);
    console.log('🎯 Dashboard final projeler:', allProjects.length, 'adet');
    
    setStats(prev => ({
      ...prev,
      totalProjects: allProjects.length
    }));
  };

  // Cloudinary Upload Widget - Çoklu Resim
  const openCloudinaryWidget = () => {
    // Cloudinary konfigürasyonu
    const cloudName = 'dgxp3zgko';
    
    if (typeof window.cloudinary === 'undefined') {
      setMessage('Cloudinary widget yüklenmedi. Sayfayı yenileyin.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (selectedImages.length >= 3) {
      setMessage('Maksimum 3 resim ekleyebilirsiniz!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Önce mevcut preset'leri dene, sonra fallback
    const uploadOptions = [
      { uploadPreset: 'portfolio' },
      { uploadPreset: 'ml_default' }, // Cloudinary default preset
      { uploadPreset: 'unsigned_preset' } // Genel unsigned preset
    ];

    // Ana fonksiyon - farklı preset'leri sırayla dener
    const tryUploadWithPreset = (presetIndex = 0) => {
      if (presetIndex >= uploadOptions.length) {
        // Son çare: preset olmadan dene
        tryWithoutPreset();
        return;
      }

      const currentPreset = uploadOptions[presetIndex];
      console.log(`🔄 Upload preset deneniyor: ${currentPreset.uploadPreset}`);

      const widgetConfig = {
        cloudName: cloudName,
        uploadPreset: currentPreset.uploadPreset,
        sources: ['local', 'camera'],
        multiple: true, // Çoklu seçim aktif
        maxFiles: 3 - selectedImages.length, // Kalan slot kadar
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5000000,
        maxImageWidth: 1920,
        maxImageHeight: 1080,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
          { width: 1200, height: 675, crop: 'fill', gravity: 'center' }
        ],
        styles: {
          palette: {
            window: "#18181B",
            windowBorder: "#3F3F46",
            tabIcon: "#3B82F6",
            menuIcons: "#9CA3AF",
            textDark: "#E4E4E7",
            textLight: "#9CA3AF",
            link: "#3B82F6",
            action: "#3B82F6",
            inactiveTabIcon: "#6B7280",
            error: "#EF4444",
            inProgress: "#F59E0B",
            complete: "#10B981",
            sourceBg: "#27272A"
          }
        }
      };

      const widget = window.cloudinary.createUploadWidget(widgetConfig, (error, result) => {
        if (error) {
          console.error(`❌ Preset "${currentPreset.uploadPreset}" hatası:`, error);
          
          // Eğer preset hatası ise bir sonrakini dene
          if (error.message && (error.message.includes('preset') || error.message.includes('unsigned'))) {
            console.log('🔄 Sonraki preset deneniyor...');
            tryUploadWithPreset(presetIndex + 1);
            return;
          }
          
          // Diğer hatalar için direkt hata göster
          setMessage('Upload hatası: ' + error.message);
          setTimeout(() => setMessage(''), 3000);
          return;
        }
        
        if (result && result.event === "success") {
          console.log('✅ Cloudinary upload başarılı:', result.info);
          
          const imageUrl = result.info.secure_url;
          
          // Yeni resmi diziye ekle
          const newImages = [...selectedImages, imageUrl];
          setSelectedImages(newImages);
          setNewProject(prev => ({
            ...prev,
            images: newImages
          }));
          
          setMessage(`Görsel eklendi! (${newImages.length}/3)`);
          setTimeout(() => setMessage(''), 3000);
        }
      });

      widget.open();
    };

    // Preset olmadan deneme fonksiyonu (manuel upload için)
    const tryWithoutPreset = () => {
      console.log('🔧 Preset olmadan deneniyor...');
      
              setMessage('Preset ayarı başarısız. Lütfen Cloudinary dashboard\'ında "portfolio" preset\'ini "unsigned" yapmayı deneyin veya manuel upload kullanın.');
      setTimeout(() => setMessage(''), 8000);
    };

    // İlk preset ile başla
    tryUploadWithPreset(0);
  };

  // Eski handleImageChange (yedek olarak kalsın)
  const handleImageChange = (e) => {
    setMessage('💡 Cloudinary kullanmanızı öneririz. "Cloudinary ile Yükle" butonunu deneyin.');
    setTimeout(() => setMessage(''), 3000);
  };

  // Proje düzenleme fonksiyonları
  const startEditProject = (project) => {
    setEditingProject(project.id);
    setEditedProject({
      ...project,
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : project.tags
    });
    setEditedImages(project.images || [project.imgSrc]);
    setActiveTab('edit-project');
  };

  const cancelEditProject = () => {
    setEditingProject(null);
    setEditedProject(null);
    setEditedImages([]);
    setActiveTab('projects');
  };

  // Düzenleme için özel Cloudinary widget
  const openEditCloudinaryWidget = () => {
    const cloudName = 'dgxp3zgko';
    
    if (typeof window.cloudinary === 'undefined') {
      setMessage('Cloudinary widget yüklenmedi. Sayfayı yenileyin.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (editedImages.length >= 3) {
      setMessage('Maksimum 3 resim ekleyebilirsiniz!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const uploadOptions = [
      { uploadPreset: 'portfolio' },
      { uploadPreset: 'ml_default' },
      { uploadPreset: 'unsigned_preset' }
    ];

    const tryUploadWithPreset = (presetIndex = 0) => {
      if (presetIndex >= uploadOptions.length) {
        setMessage('Preset ayarı başarısız. Lütfen Cloudinary dashboard\'ında "portfolio" preset\'ini "unsigned" yapmayı deneyin.');
        setTimeout(() => setMessage(''), 8000);
        return;
      }

      const currentPreset = uploadOptions[presetIndex];
      
      const widgetConfig = {
        cloudName: cloudName,
        uploadPreset: currentPreset.uploadPreset,
        sources: ['local', 'camera'],
        multiple: true,
        maxFiles: 3 - editedImages.length,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5000000,
        maxImageWidth: 1920,
        maxImageHeight: 1080,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
          { width: 1200, height: 675, crop: 'fill', gravity: 'center' }
        ]
      };

      const widget = window.cloudinary.createUploadWidget(widgetConfig, (error, result) => {
        if (error) {
          console.error('Cloudinary error:', error);
          if (presetIndex < uploadOptions.length - 1) {
            tryUploadWithPreset(presetIndex + 1);
          } else {
            setMessage('Upload hatası: ' + error.message);
            setTimeout(() => setMessage(''), 3000);
          }
          return;
        }
        
        if (result && result.event === "success") {
          const imageUrl = result.info.secure_url;
          const newImages = [...editedImages, imageUrl];
          setEditedImages(newImages);
          setEditedProject(prev => ({
            ...prev,
            images: newImages
          }));
          
          setMessage(`Görsel eklendi! (${newImages.length}/3)`);
          setTimeout(() => setMessage(''), 3000);
        }
      });

      widget.open();
    };

    tryUploadWithPreset(0);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editedProject.title || !editedProject.tags || !editedImages || editedImages.length === 0) {
      setMessage('Lütfen tüm alanları doldurun ve en az 1 resim bulundurun!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const updatedProjectData = {
      ...editedProject,
      images: editedImages,
      imgSrc: editedImages[0], // Geriye uyumluluk
      tags: editedProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      updatedAt: new Date().toISOString()
    };

    // Projeleri güncelle
    const updatedProjects = projects.map(p => 
      p.id === editingProject ? updatedProjectData : p
    );

    try {
      // localStorage güncelle
      localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
      
      // State güncelle
      setProjects(updatedProjects);
      
      setMessage('Proje güncellendi! API\'ya kaydediliyor...');
      
      // API'ya kaydet
      try {
        const response = await fetch('/api/update-projects.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projects: updatedProjects.map(project => ({
              id: project.id,
              images: project.images || [project.imgSrc],
              imgSrc: project.imgSrc,
              title: project.title,
              tags: project.tags,
              projectLink: project.projectLink
            })),
            password: import.meta.env.VITE_DASHBOARD_PASSWORD || 'kerimoski2024'
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setMessage('Proje başarıyla güncellendi ve sunucuya kaydedildi!');
        } else {
          setMessage('Proje güncellendi (yerel) - API kaydı başarısız olabilir');
        }
      } catch (apiError) {
        setMessage('Proje güncellendi (yerel) - API bağlantısı yok');
      }
      
      // Ana sayfayı bilgilendir
      window.dispatchEvent(new Event('projectsUpdated'));
      
      // Düzenleme modundan çık
      cancelEditProject();
      
    } catch (error) {
      console.error('Update hatası:', error);
      setMessage('Proje güncellenirken hata oluştu.');
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Yeni proje ekleniyor:', newProject);
    
    if (!newProject.title || !newProject.tags || !newProject.images || newProject.images.length === 0) {
      setMessage('Lütfen tüm alanları doldurun ve en az 1 resim ekleyin!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // localStorage boyut kontrolü - hosting için kritik
    const currentStorageSize = JSON.stringify(localStorage).length;
    const newProjectSize = JSON.stringify(newProject).length;
    const maxStorageSize = 4 * 1024 * 1024; // 4MB limit
    
    console.log('💾 localStorage boyutu:', Math.round(currentStorageSize / 1024), 'KB');
    console.log('📦 Yeni proje boyutu:', Math.round(newProjectSize / 1024), 'KB');
    
    if (currentStorageSize + newProjectSize > maxStorageSize) {
              setMessage('Depolama alanı doldu! Bazı projeleri silmeniz gerekebilir.');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    const newProjectData = {
      images: newProject.images, // Çoklu resim dizisi
      imgSrc: newProject.images[0], // Geriye uyumluluk için ilk resim
      title: newProject.title.trim(),
      tags: newProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      projectLink: newProject.projectLink.trim(),
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    console.log('✨ Formatlanmış proje verisi:', newProjectData);
    
    // Mevcut projeleri al
    const userProjects = projects || [];
    const updatedUserProjects = [...userProjects, newProjectData];
    
    console.log('💾 User projeler güncellendi:', updatedUserProjects);
    
    try {
      // 1. localStorage'a kaydet (hızlı görüntüleme için)
      localStorage.setItem('portfolio-projects', JSON.stringify(updatedUserProjects));
      
      // 2. Projeleri hemen güncelle
      setProjects(updatedUserProjects);
      
      console.log('📋 Projeler güncellendi:', updatedUserProjects.length, 'adet');
      
      // 3. Sıralama güncellemesi
      localStorage.setItem('portfolio-projects-order', JSON.stringify(updatedUserProjects.map(p => p.id)));
      
      setMessage('✅ Proje eklendi! API\'ya kaydediliyor...');
      
      // 4. API'ya kaydet (sunucuya senkronizasyon için)
      try {
        const response = await fetch('/api/update-projects.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projects: updatedUserProjects.map(project => ({
              id: project.id,
              images: project.images || [project.imgSrc], // Çoklu resim veya fallback
              imgSrc: project.imgSrc,
              title: project.title,
              tags: project.tags,
              projectLink: project.projectLink
            })),
            password: import.meta.env.VITE_DASHBOARD_PASSWORD || 'kerimoski2024'
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setMessage('Proje başarıyla eklendi ve sunucuya kaydedildi!');
          console.log('🌐 API\'ya başarıyla kaydedildi');
        } else {
          console.warn('⚠️ API kaydı başarısız:', result.error);
          setMessage('✅ Proje eklendi (yerel) - API kaydı başarısız olabilir');
        }
      } catch (apiError) {
        console.warn('⚠️ API bağlantı hatası:', apiError);
        setMessage('✅ Proje eklendi (yerel) - API bağlantısı yok');
      }
      
      console.log('🔄 Ana sayfaya event gönderiliyor...');
      window.dispatchEvent(new Event('projectsUpdated'));
      
      setNewProject({ images: [], title: '', tags: '', projectLink: '' });
      setSelectedImages([]);
      e.target.reset();
      
    } catch (error) {
      console.error('❌ localStorage hatası:', error);
              setMessage('Proje kaydedilirken hata oluştu. Görsel çok büyük olabilir.');
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      console.log('🗑️ Proje siliniyor:', projectId);
      
      // Projeyi listeden çıkar
      const updatedProjects = projects.filter(p => p.id !== projectId);
      
      // 1. localStorage'ı güncelle (hızlı görüntüleme için)
      localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
      
      // 2. Sıralama güncellemesi
      localStorage.setItem('portfolio-projects-order', JSON.stringify(updatedProjects.map(p => p.id)));
      
      // 3. State'i güncelle
      setProjects(updatedProjects);
      
      setMessage('Proje silindi! API\'dan kaldırılıyor...');
      
      // 4. API'dan da sil (sunucuya senkronizasyon için)
      try {
        const response = await fetch('/api/update-projects.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projects: updatedProjects.map(project => ({
              id: project.id,
              images: project.images || [project.imgSrc], // Çoklu resim veya fallback
              imgSrc: project.imgSrc,
              title: project.title,
              tags: project.tags,
              projectLink: project.projectLink
            })),
            password: import.meta.env.VITE_DASHBOARD_PASSWORD || 'kerimoski2024'
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setMessage('Proje başarıyla silindi ve sunucudan kaldırıldı!');
          console.log('🌐 API\'dan başarıyla silindi');
        } else {
          console.warn('⚠️ API silme başarısız:', result.error);
          setMessage('✅ Proje silindi (yerel) - API güncelleme başarısız olabilir');
        }
      } catch (apiError) {
        console.warn('⚠️ API bağlantı hatası:', apiError);
        setMessage('✅ Proje silindi (yerel) - API bağlantısı yok');
      }
      
      // Ana sayfayı bilgilendir
      window.dispatchEvent(new Event('projectsUpdated'));
      
      setTimeout(() => setMessage(''), 3000);
      
      console.log('✅ Proje silme tamamlandı. Kalan projeler:', updatedProjects.length);
    }
  };

  const moveProject = async (projectId, direction) => {
    const currentIndex = projects.findIndex(p => p.id === projectId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= projects.length) return;
    
    console.log(`🔄 Proje taşınıyor: ${projectId} (${currentIndex} → ${newIndex})`);
    
    const newProjects = [...projects];
    [newProjects[currentIndex], newProjects[newIndex]] = [newProjects[newIndex], newProjects[currentIndex]];
    
    // 1. State'i güncelle
    setProjects(newProjects);
    
    // 2. localStorage'ı güncelle
    localStorage.setItem('portfolio-projects', JSON.stringify(newProjects));
    localStorage.setItem('portfolio-projects-order', JSON.stringify(newProjects.map(p => p.id)));
    
    setMessage('📋 Proje sırası güncellendi! API\'ya kaydediliyor...');
    
    // 3. API'ya kaydet (sunucuya senkronizasyon için)
    try {
      const response = await fetch('/api/update-projects.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projects: newProjects.map(project => ({
            id: project.id,
            imgSrc: project.imgSrc,
            title: project.title,
            tags: project.tags,
            projectLink: project.projectLink
          })),
          password: import.meta.env.VITE_DASHBOARD_PASSWORD || 'kerimoski2024'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage('Sıralama başarıyla güncellendi ve sunucuya kaydedildi!');
        console.log('🌐 API\'ya başarıyla kaydedildi');
      } else {
        console.warn('⚠️ API kaydı başarısız:', result.error);
        setMessage('✅ Sıralama güncellendi (yerel) - API kaydı başarısız olabilir');
      }
    } catch (apiError) {
      console.warn('⚠️ API bağlantı hatası:', apiError);
      setMessage('✅ Sıralama güncellendi (yerel) - API bağlantısı yok');
    }
    
    // Ana sayfayı bilgilendir
    window.dispatchEvent(new Event('projectsUpdated'));
    
    setTimeout(() => setMessage(''), 2000);
    
    console.log('✅ Proje sıralama tamamlandı');
  };

  const exportData = () => {
    const data = {
      projects: projects,
      exportDate: new Date().toISOString(),
      totalProjects: projects.length
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setMessage('Veriler başarıyla export edildi!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Yeni fonksiyon: JSON dosyasını güncelle
  const updatePublicJSON = () => {
    const jsonData = projects.map(project => ({
      id: project.id,
      imgSrc: project.imgSrc,
      title: project.title,
      tags: project.tags,
      projectLink: project.projectLink
    }));

    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'projects.json');
    linkElement.click();
    
    setMessage('📄 projects.json dosyası indirildi! Bu dosyayı public/data/ klasörüne yükleyin.');
    setTimeout(() => setMessage(''), 5000);
  };

  // Yeni fonksiyon: API ile direkt güncelleme
  const updateViaAPI = async () => {
    if (projects.length === 0) {
      setMessage('Güncellenecek proje yok!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setMessage('🔄 API ile güncelleniyor...');
    
    try {
      const response = await fetch('/api/update-projects.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projects: projects.map(project => ({
            id: project.id,
            imgSrc: project.imgSrc,
            title: project.title,
            tags: project.tags,
            projectLink: project.projectLink
          })),
          password: import.meta.env.VITE_DASHBOARD_PASSWORD || 'kerimoski2024'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage(`Projeler başarıyla güncellendi! (${result.count} adet)`);
        
        // Sayfayı yenile ki değişiklikler görünsün
        setTimeout(() => {
          window.dispatchEvent(new Event('projectsUpdated'));
        }, 1000);
      } else {
        throw new Error(result.error || 'API hatası');
      }
    } catch (error) {
      console.error('API Error:', error);
      setMessage(`API Hatası: ${error.message}. Manuel indirme kullanın.`);
    }
    
    setTimeout(() => setMessage(''), 5000);
  };

  if (!isAuthenticated) {
    return <DashboardLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <header className="bg-zinc-800 border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src="/images/logo.png" alt="Logo" className="w-8 h-8 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-semibold text-white truncate">Portfolio Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="btn btn-outline flex-shrink-0">
                <span className="material-symbols-rounded">home</span>
                <span className="hidden sm:inline">Ana Sayfa</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary flex-shrink-0">
                <span className="material-symbols-rounded">logout</span>
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mesaj Alanı */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.includes('✅') || message.includes('başarıyla') ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            message.includes('🗑️') || message.includes('silindi') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
            message.includes('📥') || message.includes('indirildi') ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
            message.includes('hata') || message.includes('Hata') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
          }`}>
            <span className="material-symbols-rounded text-lg">
              {message.includes('✅') || message.includes('başarıyla') ? 'check_circle' :
               message.includes('🗑️') || message.includes('silindi') ? 'delete' :
               message.includes('📥') || message.includes('indirildi') ? 'download' :
               message.includes('hata') || message.includes('Hata') ? 'error' :
               'info'}
            </span>
            <span className="flex-1">{message.replace(/[📥🗑️✅❌💥🧹]/g, '').trim()}</span>
          </div>
        )}

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Toplam Proje</p>
                <p className="text-2xl font-semibold text-white">{stats.totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-rounded text-sky-400">folder</span>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Aktif Projeler</p>
                <p className="text-2xl font-semibold text-white">{projects.filter(p => p.projectLink).length}</p>
                <p className="text-xs text-zinc-500">
                  Aktif link bulunan projeler
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-rounded text-green-400">check_circle</span>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Son Güncelleme</p>
                <p className="text-sm text-white">{new Date().toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-rounded text-purple-400">update</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-700 mb-8">
          <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                activeTab === 'projects'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <span className="material-symbols-rounded text-sm">folder</span>
              <span className="hidden sm:inline">Projeler ({projects.length})</span>
              <span className="sm:hidden">({projects.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('add-project')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                activeTab === 'add-project'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <span className="material-symbols-rounded text-sm">add</span>
              <span className="hidden sm:inline">Proje Ekle</span>
              <span className="sm:hidden">Ekle</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                activeTab === 'analytics'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <span className="material-symbols-rounded text-sm">analytics</span>
              <span className="hidden sm:inline">Analitik</span>
              <span className="sm:hidden">Analiz</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                activeTab === 'reviews'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <span className="material-symbols-rounded text-sm">rate_review</span>
              <span className="hidden sm:inline">Değerlendirmeler</span>
              <span className="sm:hidden">Yorumlar</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                activeTab === 'settings'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <span className="material-symbols-rounded text-sm">settings</span>
              <span className="hidden sm:inline">Ayarlar</span>
              <span className="sm:hidden">Ayar</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'projects' && (
                      <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Mevcut Projeler</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  <span className="material-symbols-rounded text-xs align-middle mr-1">swap_vert</span>
                  Sıralamayı değiştirmek için ok tuşlarını kullanın • Ana sayfada aynı sırada görünür
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={updateViaAPI} className="btn btn-primary text-xs sm:text-sm">
                  <span className="material-symbols-rounded">cloud_sync</span>
                  <span className="hidden sm:inline">Hızlı Güncelle (API)</span>
                  <span className="sm:hidden">API</span>
                </button>
                <button onClick={updatePublicJSON} className="btn btn-secondary text-xs sm:text-sm">
                  <span className="material-symbols-rounded">download</span>
                  <span className="hidden sm:inline">Manuel İndir</span>
                  <span className="sm:hidden">İndir</span>
                </button>
                <button onClick={exportData} className="btn btn-outline text-xs sm:text-sm">
                  <span className="material-symbols-rounded">backup</span>
                  <span className="hidden sm:inline">Backup</span>
                  <span className="sm:hidden">Yedek</span>
                </button>
              </div>
            </div>
            
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-rounded text-zinc-400 text-2xl">folder_open</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Henüz proje yok</h3>
                <p className="text-zinc-400 mb-4">İlk projenizi eklemek için "Proje Ekle" sekmesini kullanın.</p>
                <button 
                  onClick={() => setActiveTab('add-project')}
                  className="btn btn-primary"
                >
                  İlk Projeyi Ekle
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  <div key={project.id} className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 relative">
                    {/* Sıra Numarası */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-zinc-700 text-white text-xs px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    
                    {project.isDefault && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                          Default
                        </span>
                      </div>
                    )}
                    <ProjectSlideshow
                      images={project.images || [project.imgSrc]}
                      title={project.title}
                      autoPlay={true}
                      interval={5000}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2">{project.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.isArray(project.tags) ? 
                          project.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-3 py-1.5 bg-gradient-to-r from-sky-600/20 to-blue-600/20 text-sky-300 text-sm font-medium rounded-full border border-sky-500/30 hover:border-sky-400/50 transition-all duration-200 hover:scale-105">
                              {tag}
                            </span>
                          )) : 
                          project.tags.split(',').map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-3 py-1.5 bg-gradient-to-r from-sky-600/20 to-blue-600/20 text-sky-300 text-sm font-medium rounded-full border border-sky-500/30 hover:border-sky-400/50 transition-all duration-200 hover:scale-105">
                              {tag.trim()}
                            </span>
                          ))
                        }
                      </div>
                      <div className="flex justify-between items-center">
                        {project.projectLink ? (
                          <a
                            href={project.projectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 text-sm flex items-center gap-1"
                            onClick={() => {
                              // Analytics tracking
                              if (typeof window !== 'undefined' && window.trackProjectClick) {
                                window.trackProjectClick(project.title, project.projectLink);
                              }
                            }}
                          >
                            <span className="material-symbols-rounded text-sm">open_in_new</span>
                            Projeyi Gör
                          </a>
                        ) : (
                          <span className="text-zinc-500 text-sm">Link yok</span>
                        )}
                        <div className="flex items-center gap-1">
                          {/* Sıralama Butonları */}
                          <div className="flex flex-col">
                            <button
                              onClick={() => moveProject(project.id, 'up')}
                              className={`p-1 text-xs transition-colors ${
                                index === 0 
                                  ? 'text-zinc-600 cursor-not-allowed' 
                                  : 'text-zinc-400 hover:text-zinc-300'
                              }`}
                              title="Yukarı taşı"
                              disabled={index === 0}
                            >
                              <span className="material-symbols-rounded text-sm">keyboard_arrow_up</span>
                            </button>
                            <button
                              onClick={() => moveProject(project.id, 'down')}
                              className={`p-1 text-xs transition-colors ${
                                index === projects.length - 1
                                  ? 'text-zinc-600 cursor-not-allowed' 
                                  : 'text-zinc-400 hover:text-zinc-300'
                              }`}
                              title="Aşağı taşı"
                              disabled={index === projects.length - 1}
                            >
                              <span className="material-symbols-rounded text-sm">keyboard_arrow_down</span>
                            </button>
                          </div>
                          
                          {/* Düzenleme Butonu */}
                          <button
                            onClick={() => startEditProject(project)}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded ml-2"
                            title="Projeyi düzenle"
                          >
                            <span className="material-symbols-rounded">edit</span>
                          </button>

                          {/* Silme Butonu */}
                          {project.isDefault ? (
                            <span className="text-zinc-500 text-xs ml-2">Korumalı</span>
                          ) : (
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="text-red-400 hover:text-red-300 p-1 rounded ml-2"
                              title="Projeyi sil"
                            >
                              <span className="material-symbols-rounded">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-project' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-6">Yeni Proje Ekle</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Görsel Yükleme - Çoklu Resim */}
              <div>
                <label className="label">Proje Görselleri (Maksimum 3 Adet)</label>
                <div className="space-y-4">
                  {/* Mevcut Resimler Preview */}
                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-video rounded-lg overflow-hidden border border-zinc-600">
                            <img
                              src={image}
                              alt={`Görsel ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = selectedImages.filter((_, i) => i !== index);
                              setSelectedImages(newImages);
                              setNewProject(prev => ({ ...prev, images: newImages }));
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="Resmi sil"
                          >
                            <span className="material-symbols-rounded text-xs">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Butonları */}
                  <div className="flex flex-col items-center gap-4">
                    {selectedImages.length < 3 && (
                      <button
                        type="button"
                        onClick={openCloudinaryWidget}
                        className="btn btn-primary w-full max-w-md justify-center"
                      >
                        <span className="material-symbols-rounded mr-2">add_photo_alternate</span>
                        {selectedImages.length === 0 ? 'İlk Görseli Ekle' : `Görsel Ekle (${selectedImages.length}/3)`}
                      </button>
                    )}
                    
                    {selectedImages.length === 3 && (
                      <div className="text-center text-green-400 text-sm flex items-center gap-2">
                        <span className="material-symbols-rounded text-sm">check_circle</span>
                        <span>Maksimum resim sayısına ulaştınız (3/3)</span>
                      </div>
                    )}
                    
                    {selectedImages.length > 0 && (
                      <div className="text-center text-zinc-400 text-xs">
                        <span className="material-symbols-rounded text-xs align-middle mr-1">info</span>
                        Resimler 5 saniyede bir otomatik değişecek
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Proje Bilgileri */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Proje Başlığı *</label>
                  <input
                    type="text"
                    className="text-field"
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    required
                    maxLength={50}
                    placeholder="Örn: E-ticaret Sitesi"
                  />
                </div>
                
                <div>
                  <label className="label">Proje Linki</label>
                  <input
                    type="url"
                    className="text-field"
                    value={newProject.projectLink}
                    onChange={(e) => setNewProject({...newProject, projectLink: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="label">Etiketler (virgülle ayırın) *</label>
                <input
                  type="text"
                  className="text-field"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({...newProject, tags: e.target.value})}
                  required
                  placeholder="React, Node.js, MongoDB"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full justify-center">
                <span className="material-symbols-rounded mr-2">add</span>
                Proje Ekle
              </button>
            </form>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Gelişmiş Analitik</h2>
              <button 
                onClick={() => {
                  window.exportAnalyticsData && window.exportAnalyticsData();
                  setMessage('Analitik verileri indirildi!');
                  setTimeout(() => setMessage(''), 3000);
                }}
                className="btn btn-outline"
              >
                <span className="material-symbols-rounded">download</span>
                Analitik Dışa Aktar
              </button>
            </div>

            {/* Ana İstatistikler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Toplam Sayfa Görüntüleme</p>
                    <p className="text-2xl font-semibold text-white">
                      {Object.values(analyticsData.pageViews || {}).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-rounded text-blue-400">visibility</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Proje Tıklamaları</p>
                    <p className="text-2xl font-semibold text-white">
                      {Object.values(analyticsData.projectClicks || {}).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-rounded text-green-400">mouse</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">İletişim Formları</p>
                    <p className="text-2xl font-semibold text-white">
                      {analyticsData.contactSubmissions || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-rounded text-purple-400">mail</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Ortalama Oturum Süresi</p>
                    <p className="text-2xl font-semibold text-white">
                      {analyticsData.sessionDuration && analyticsData.sessionDuration.length > 0 
                        ? `${Math.round(analyticsData.sessionDuration.reduce((a, b) => a + b.duration, 0) / analyticsData.sessionDuration.length)}s`
                        : '0s'
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-rounded text-orange-400">timer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cihaz Analizi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                <h3 className="text-lg font-semibold text-white mb-4">Cihaz Dağılımı</h3>
                <div className="space-y-4">
                  {Object.entries(analyticsData.devices || {}).map(([device, count]) => {
                    const total = Object.values(analyticsData.devices || {}).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={device} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-rounded text-zinc-400">
                            {device === 'mobile' ? 'smartphone' : device === 'tablet' ? 'tablet' : 'computer'}
                          </span>
                          <span className="text-white capitalize">{device}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-sky-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-zinc-400 text-sm w-12">{percentage}%</span>
                          <span className="text-white text-sm w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                <h3 className="text-lg font-semibold text-white mb-4">Tarayıcı Dağılımı</h3>
                <div className="space-y-4">
                  {Object.entries(analyticsData.browsers || {}).map(([browser, count]) => {
                    const total = Object.values(analyticsData.browsers || {}).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={browser} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-rounded text-zinc-400">web</span>
                          <span className="text-white">{browser}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-zinc-400 text-sm w-12">{percentage}%</span>
                          <span className="text-white text-sm w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sayfa Görüntülemeleri */}
            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
              <h3 className="text-lg font-semibold text-white mb-4">Sayfa Görüntülemeleri</h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.pageViews || {}).map(([page, views]) => (
                  <div key={page} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-zinc-400">article</span>
                      <span className="text-white">{page === '/' ? 'Ana Sayfa' : page}</span>
                    </div>
                    <span className="text-sky-400 font-medium">{views} görüntüleme</span>
                  </div>
                ))}
              </div>
            </div>

            {/* En Popüler Projeler */}
            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
              <h3 className="text-lg font-semibold text-white mb-4">En Popüler Projeler</h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.projectClicks || {})
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([project, clicks]) => (
                  <div key={project} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-zinc-400">work</span>
                      <span className="text-white">{project}</span>
                    </div>
                    <span className="text-green-400 font-medium">{clicks} tıklama</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coğrafi Analiz */}
            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
              <h3 className="text-lg font-semibold text-white mb-4">Coğrafi Dağılım</h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.countries || {})
                  .sort(([,a], [,b]) => b - a)
                  .map(([country, count]) => {
                    const total = Object.values(analyticsData.countries || {}).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={country} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-rounded text-zinc-400">public</span>
                          <span className="text-white">{country}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-zinc-400 text-sm w-12">{percentage}%</span>
                          <span className="text-white text-sm w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Gelişmiş Analitik Chart'ları */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <AnalyticsChart
                data={analyticsData.visitors?.daily}
                type="daily-visitors"
                title="Son 7 Gün Ziyaretçi Trendi"
                color="blue"
              />
              
              <AnalyticsChart
                data={analyticsData.pageViews}
                type="page-views"
                title="En Çok Görüntülenen Sayfalar"
                color="sky"
              />
              
              <AnalyticsChart
                data={analyticsData.devices}
                type="device-distribution"
                title="Cihaz Dağılımı"
                color="green"
              />
              
              <AnalyticsChart
                data={analyticsData.projectClicks}
                type="project-clicks"
                title="En Popüler Projeler"
                color="purple"
              />
            </div>
            
            {/* Detaylı Analitik Verileri */}
            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Detaylı Raporlar</h3>
                <div className="flex items-center gap-2">
                  <div className="pulse-dot"></div>
                  <span className="text-xs text-zinc-400">Real-time veriler</span>
                </div>
              </div>
              
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Oturum Süreleri */}
                <div className="bg-zinc-700/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Oturum İstatistikleri</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 text-sm">Toplam Oturum:</span>
                      <span className="text-white text-sm">{analyticsData.sessionDuration?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 text-sm">Ort. Süre:</span>
                      <span className="text-white text-sm">
                        {analyticsData.sessionDuration && analyticsData.sessionDuration.length > 0 
                          ? `${Math.round(analyticsData.sessionDuration.reduce((a, b) => a + b.duration, 0) / analyticsData.sessionDuration.length)}s`
                          : '0s'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 text-sm">En Uzun Oturum:</span>
                      <span className="text-white text-sm">
                        {analyticsData.sessionDuration && analyticsData.sessionDuration.length > 0 
                          ? `${Math.max(...analyticsData.sessionDuration.map(s => s.duration))}s`
                          : '0s'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* İndirme İstatistikleri */}
                <div className="bg-zinc-700/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">İndirmeler</h4>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.downloads || {}).slice(0, 3).map(([file, count]) => (
                      <div key={file} className="flex justify-between">
                        <span className="text-zinc-400 text-sm truncate">{file}:</span>
                        <span className="text-white text-sm">{count}</span>
                      </div>
                    ))}
                    {Object.keys(analyticsData.downloads || {}).length === 0 && (
                      <span className="text-zinc-500 text-sm">Henüz indirme yok</span>
                    )}
                  </div>
                </div>

                {/* Son Aktiviteler */}
                <div className="bg-zinc-700/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Son Aktiviteler</h4>
                  <div className="space-y-2">
                    {analyticsData.lastProjectClick && (
                      <div className="text-sm">
                        <span className="text-zinc-400">Son proje tıklaması:</span>
                        <p className="text-white truncate">{analyticsData.lastProjectClick.project}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(analyticsData.lastProjectClick.timestamp).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    )}
                    {analyticsData.lastContactSubmission && (
                      <div className="text-sm">
                        <span className="text-zinc-400">Son iletişim:</span>
                        <p className="text-xs text-zinc-500">
                          {new Date(analyticsData.lastContactSubmission).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <ReviewManager />
        )}

        {activeTab === 'edit-project' && editedProject && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Projeyi Düzenle</h2>
              <button 
                onClick={cancelEditProject}
                className="btn btn-outline"
              >
                <span className="material-symbols-rounded mr-2">close</span>
                İptal
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Mevcut Görsel Bilgisi */}
              <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <span className="material-symbols-rounded text-sm">info</span>
                  Düzenlenen Proje: {editedProject.title}
                </h3>
                <p className="text-zinc-400 text-sm">ID: {editedProject.id}</p>
                {editedProject.createdAt && (
                  <p className="text-zinc-400 text-sm">
                    Oluşturulma: {new Date(editedProject.createdAt).toLocaleString('tr-TR')}
                  </p>
                )}
              </div>

              {/* Görsel Düzenleme - Çoklu Resim */}
              <div>
                <label className="label">Proje Görselleri (Maksimum 3 Adet)</label>
                <div className="space-y-4">
                  {/* Mevcut Resimler Preview */}
                  {editedImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {editedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-video rounded-lg overflow-hidden border border-zinc-600">
                            <img
                              src={image}
                              alt={`Görsel ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = editedImages.filter((_, i) => i !== index);
                              setEditedImages(newImages);
                              setEditedProject(prev => ({ 
                                ...prev, 
                                images: newImages,
                                imgSrc: newImages[0] || prev.imgSrc // İlk resmi imgSrc yapar
                              }));
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="Resmi sil"
                          >
                            <span className="material-symbols-rounded text-xs">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Butonları */}
                  <div className="flex flex-col items-center gap-4">
                    {editedImages.length < 3 && (
                      <button
                        type="button"
                        onClick={openEditCloudinaryWidget}
                        className="btn btn-primary w-full max-w-md justify-center"
                      >
                        <span className="material-symbols-rounded mr-2">add_photo_alternate</span>
                        {editedImages.length === 0 ? 'İlk Görseli Ekle' : `Görsel Ekle (${editedImages.length}/3)`}
                      </button>
                    )}
                    
                    {editedImages.length === 3 && (
                      <div className="text-center text-green-400 text-sm flex items-center gap-2">
                        <span className="material-symbols-rounded text-sm">check_circle</span>
                        <span>Maksimum resim sayısına ulaştınız (3/3)</span>
                      </div>
                    )}
                    
                    {editedImages.length > 0 && (
                      <div className="text-center text-zinc-400 text-xs">
                        <span className="material-symbols-rounded text-xs align-middle mr-1">info</span>
                        Resimler 5 saniyede bir otomatik değişecek
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Proje Bilgilerini Düzenle */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Proje Başlığı *</label>
                  <input
                    type="text"
                    className="text-field"
                    value={editedProject.title}
                    onChange={(e) => setEditedProject({...editedProject, title: e.target.value})}
                    required
                    maxLength={50}
                    placeholder="Örn: E-ticaret Sitesi"
                  />
                </div>
                
                <div>
                  <label className="label">Proje Linki</label>
                  <input
                    type="url"
                    className="text-field"
                    value={editedProject.projectLink || ''}
                    onChange={(e) => setEditedProject({...editedProject, projectLink: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="label">Etiketler (virgülle ayırın) *</label>
                <input
                  type="text"
                  className="text-field"
                  value={editedProject.tags}
                  onChange={(e) => setEditedProject({...editedProject, tags: e.target.value})}
                  required
                  placeholder="React, Node.js, MongoDB"
                />
              </div>

              {/* Submit Butonları */}
              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary flex-1 justify-center">
                  <span className="material-symbols-rounded mr-2">save</span>
                  Değişiklikleri Kaydet
                </button>
                <button 
                  type="button" 
                  onClick={cancelEditProject}
                  className="btn btn-outline"
                >
                  <span className="material-symbols-rounded mr-2">cancel</span>
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Dashboard Ayarları</h2>
            
            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
              <h3 className="font-medium text-white mb-4">Güvenlik</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white">Oturum Süresi</p>
                    <p className="text-sm text-zinc-400">24 saat sonra otomatik çıkış</p>
                  </div>
                  <span className="text-green-400 text-sm">Aktif</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white">Şifre Koruması</p>
                    <p className="text-sm text-zinc-400">Environment değişkeni ile korunuyor</p>
                  </div>
                  <span className="text-green-400 text-sm">Aktif</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
              <h3 className="font-medium text-white mb-4">Veri Yönetimi</h3>
              <div className="space-y-4">
                <button onClick={exportData} className="btn btn-outline w-full justify-center">
                  <span className="material-symbols-rounded mr-2">download</span>
                  Tüm Verileri Dışa Aktar
                </button>
                
                <button 
                  onClick={() => {
                    if (window.confirm('Sadece kullanıcı projeleri silinecek! Default projeler korunacak. Bu işlem geri alınamaz.')) {
                      localStorage.removeItem('portfolio-projects');
                      localStorage.removeItem('portfolio-projects-order');
                      setProjects([...defaultProjects]);
                      // Yeni sıralama kaydet
                      localStorage.setItem('portfolio-projects-order', JSON.stringify(defaultProjects.map(p => p.id)));
                      window.dispatchEvent(new Event('projectsUpdated'));
                      setMessage('Kullanıcı projeleri silindi');
                      setTimeout(() => setMessage(''), 3000);
                    }
                  }}
                  className="btn bg-red-600 hover:bg-red-700 text-white w-full justify-center"
                >
                  <span className="material-symbols-rounded mr-2">delete_forever</span>
                  Kullanıcı Projelerini Sil
                </button>

                <button 
                  onClick={() => {
                    if (window.confirm('TÜM ANALİTİK VERİLER SİLİNECEK! Bu işlem geri alınamaz. Emin misiniz?')) {
                      localStorage.removeItem('portfolio-analytics');
                      setAnalyticsData({});
                      setMessage('Tüm analitik veriler temizlendi');
                      setTimeout(() => setMessage(''), 3000);
                    }
                  }}
                  className="btn bg-orange-600 hover:bg-orange-700 text-white w-full justify-center"
                >
                  <span className="material-symbols-rounded mr-2">cleaning_services</span>
                  Analitik Verilerini Temizle
                </button>

                <button 
                  onClick={() => {
                    if (window.confirm('Kullanıcı tarafından eklenen TÜM YORUMLAR silinecek! Default yorumlar korunacak. Bu işlem geri alınamaz.')) {
                      localStorage.removeItem('portfolio-reviews');
                      window.dispatchEvent(new Event('reviewsUpdated'));
                      setMessage('Kullanıcı yorumları silindi');
                      setTimeout(() => setMessage(''), 3000);
                    }
                  }}
                  className="btn bg-purple-600 hover:bg-purple-700 text-white w-full justify-center"
                >
                  <span className="material-symbols-rounded mr-2">rate_review</span>
                  Kullanıcı Yorumlarını Sil
                </button>

                <button 
                  onClick={() => {
                    if (window.confirm('TÜM KULLANICI VERİLERİ SİLİNECEK! (Projeler, Analitik, Yorumlar) Default veriler korunacak. Bu işlem geri alınamaz!')) {
                      // Tüm kullanıcı verilerini sil
                      localStorage.removeItem('portfolio-projects');
                      localStorage.removeItem('portfolio-projects-order');
                      localStorage.removeItem('portfolio-analytics');
                      localStorage.removeItem('portfolio-reviews');
                      
                      // State'leri sıfırla
                      setProjects([...defaultProjects]);
                      setAnalyticsData({});
                      
                      // Events tetikle
                      window.dispatchEvent(new Event('projectsUpdated'));
                      window.dispatchEvent(new Event('reviewsUpdated'));
                      
                      setMessage('Tüm kullanıcı verileri temizlendi! Site sıfırlandı.');
                      setTimeout(() => setMessage(''), 5000);
                    }
                  }}
                  className="btn bg-red-800 hover:bg-red-900 text-white w-full justify-center border-2 border-red-600"
                >
                  <span className="material-symbols-rounded mr-2">delete_sweep</span>
                  TÜM VERİLERİ TEMİZLE
                </button>
                
                <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                  <h4 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm">info</span>
                    Bilgilendirme
                  </h4>
                  <div className="text-amber-200 text-sm space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-rounded text-xs mt-1">check_circle</span>
                      <span>Default projeler silinmez ve korunur</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-rounded text-xs mt-1">delete</span>
                      <span>Sadece dashboard'dan eklediğiniz projeler silinebilir</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-rounded text-xs mt-1">storage</span>
                      <span>Tüm veriler localStorage'da saklanır</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 
 