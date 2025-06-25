import { useState, useEffect } from 'react';

const Work = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Projeler yükleme - Sunucu öncelikli sistem
  const loadProjects = async () => {
    console.log('🔄 Projeler yükleniyor (SUNUCU ÖNCELİKLİ)...');
    
    let allProjects = [];

    try {
      // 1. Önce sunucudaki JSON dosyasından yükle (güncel veriler için)
      console.log('🌐 Sunucudan projeler yükleniyor...');
      
      try {
        const response = await fetch('/data/projects.json');
        if (response.ok) {
          const jsonProjects = await response.json();
          console.log('📦 Sunucudan projeler:', jsonProjects);
          
          if (Array.isArray(jsonProjects) && jsonProjects.length > 0) {
            allProjects = jsonProjects;
            console.log('✅ Sunucu projeler kullanılıyor:', allProjects.length, 'adet');
          }
        } else {
          console.log('📭 Sunucu JSON dosyası bulunamadı');
        }
      } catch (jsonError) {
        console.log('📭 Sunucu bağlantı hatası:', jsonError.message);
      }
      
      // 2. Eğer sunucudan veri gelmezse, localStorage'dan yükle (fallback)
      if (allProjects.length === 0) {
        console.log('💾 localStorage\'dan projeler yükleniyor (fallback)...');
        
        const savedData = localStorage.getItem('portfolio-projects');
        
        if (savedData && savedData !== 'null' && savedData !== '[]') {
          const localProjects = JSON.parse(savedData);
          console.log('📦 localStorage\'dan projeler:', localProjects);
          
          if (Array.isArray(localProjects) && localProjects.length > 0) {
            allProjects = localProjects;
            console.log('✅ localStorage projeler kullanılıyor (fallback):', allProjects.length, 'adet');
          }
        }
      }

      // Projeleri set et
      setProjects(allProjects);
      console.log('🎯 Final projeler:', allProjects.length, 'adet');
      
        } catch (error) {
      console.error('❌ Proje yükleme hatası:', error);
      setProjects([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // İlk yükleme
    loadProjects();
    
    // Event listener - basit
    const handleUpdate = () => {
      console.log('📢 Project update event alındı');
      setTimeout(loadProjects, 100); // Küçük delay
    };
    
    window.addEventListener('projectsUpdated', handleUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('projectsUpdated', handleUpdate);
    };
  }, []);



  if (loading) {
    return (
      <section id="work" className="section">
        <div className="container">
          <h2 className="headline-2 mb-8 reveal-up">Portföyümün Öne Çıkanları</h2>
          <div className="text-center py-12">
            <div className="text-zinc-400">Projeler yükleniyor...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="section">
      <div className="container">
        <h2 className="headline-2 mb-8 reveal-up">
          Portföyümün Öne Çıkanları
        </h2>



        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-zinc-400 text-2xl">📁</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Henüz proje yok</h3>
            <p className="text-zinc-400">Dashboard'dan ilk projenizi ekleyin!</p>
            <button 
              onClick={loadProjects}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔄 Tekrar Yükle
            </button>
          </div>
        ) : (
          <div className="grid gap-x-4 gap-y-5 grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] bg-transparent" style={{minHeight: '400px'}}>
            {projects.map((project, index) => {
              return (
                <div 
                  key={project.id || `project-${index}`} 
                  className="relative p-4 rounded-2xl hover:bg-zinc-700/50 active:bg-zinc-700/60 ring-1 ring-inset ring-zinc-50/5 transition-all duration-300 bg-zinc-800/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 hover:ring-blue-500/30 hover:-translate-y-1 group"
                >
                  {/* Mavi Glow Efekti - Arka plan */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-sky-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                  
                  {/* Görsel Container - Tam referans tasarıma uygun */}
                  <figure 
                    className="img-box aspect-square rounded-lg mb-4 overflow-hidden relative group cursor-zoom-in"
                    onClick={(e) => {
                      if (project.imgSrc) {
                        // Create modal for image zoom
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 cursor-zoom-out';
                        modal.style.backdropFilter = 'blur(10px)';
                        
                        const img = document.createElement('img');
                        img.src = project.imgSrc;
                        img.className = 'max-w-[90%] max-h-[90%] object-contain rounded-xl shadow-2xl';
                        img.alt = project.title;
                        
                        modal.appendChild(img);
                        document.body.appendChild(modal);
                        
                        // Close modal on click
                        modal.onclick = () => document.body.removeChild(modal);
                        
                        // Close on ESC key
                        const handleEsc = (e) => {
                          if (e.key === 'Escape') {
                            document.body.removeChild(modal);
                            document.removeEventListener('keydown', handleEsc);
                          }
                        };
                        document.addEventListener('keydown', handleEsc);
                      }
                    }}
                  >
                    {/* Zoom Icon - Minimal */}
                    <div className="absolute top-3 left-3 w-6 h-6 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {project.imgSrc ? (
                <img
                  src={project.imgSrc}
                  alt={project.title}
                        loading="lazy"
                        className="img-cover w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, #27272a 0%, #18181b 100%);color:#71717a;"><span style="font-size:2.5rem;">🖼️</span></div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-500">
                        <span className="text-4xl">🖼️</span>
                      </div>
                    )}
              </figure>

                  {/* İçerik - Tam referans tasarım */}
              <div className="flex items-center justify-between gap-4">
                <div>
                      <h3 className="title-1 mb-3 text-white font-semibold text-lg">
                        {project.title || 'İsimsiz Proje'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                        {project.tags && project.tags.length > 0 ? (
                          project.tags.map((tag, tagIndex) => (
                      <span
                              key={tagIndex}
                        className="h-8 text-sm text-zinc-400 bg-zinc-50/5 grid items-center px-3 rounded-lg"
                      >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="h-8 text-sm text-zinc-400 bg-zinc-50/5 grid items-center px-3 rounded-lg">
                              API
                            </span>
                            <span className="h-8 text-sm text-zinc-400 bg-zinc-50/5 grid items-center px-3 rounded-lg">
                              Development
                      </span>
                          </>
                        )}
                  </div>
                </div>

                {project.projectLink && (
                  <div className="w-11 h-11 rounded-lg grid place-items-center bg-sky-400 text-zinc-950 shrink-0">
                        <span className="material-symbols-rounded" aria-hidden="true">
                      arrow_outward
                    </span>
                  </div>
                )}
              </div>

                  {/* Invisible link overlay */}
              {project.projectLink && (
                <a
                  href={project.projectLink}
                      target="_blank"
                  className="absolute inset-0"
                  rel="noopener noreferrer"
                ></a>
              )}
            </div>
              );
            })}
        </div>
        )}
      </div>
    </section>
  );
};

export default Work;