import { useState, useEffect } from 'react';
import ProjectSlideshow from './ProjectSlideshow';

const Work = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Projeler yükleme - SADECE projects.json (CANLI SİSTEM)
  const loadProjects = async () => {
    console.log('🔄 Projeler yükleniyor (CANLI - projects.json)...');

    try {
      const response = await fetch('/data/projects.json');

      if (!response.ok) {
        throw new Error('projects.json yüklenemedi');
      }

      const jsonProjects = await response.json();
      console.log('📦 projects.json:', jsonProjects.length, 'proje');

      if (Array.isArray(jsonProjects) && jsonProjects.length > 0) {
        setProjects(jsonProjects);
        console.log('✅ Projeler yüklendi:', jsonProjects.length, 'adet');
      } else {
        console.warn('⚠️ Projeler boş veya geçersiz format');
        setProjects([]);
      }

    } catch (error) {
      console.error('❌ Proje yükleme hatası:', error);
      setProjects([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    // İlk yükleme
    loadProjects();

    // Event listener - custom event
    const handleUpdate = () => {
      console.log('📢 Project update event alındı');
      setTimeout(loadProjects, 100); // Küçük delay
    };

    // Storage event listener - farklı sekmeler arası otomatik senkronizasyon
    const handleStorageChange = (e) => {
      // Sadece portfolio-projects değişikliklerini dinle
      if (e.key === 'portfolio-projects') {
        console.log('🔄 Storage değişikliği algılandı - farklı sekmeden güncelleme!');
        setTimeout(loadProjects, 100);
      }
    };

    window.addEventListener('projectsUpdated', handleUpdate);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('projectsUpdated', handleUpdate);
      window.removeEventListener('storage', handleStorageChange);
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
              <span className="material-symbols-rounded text-zinc-400 text-2xl">folder_open</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Henüz proje yok</h3>
            <p className="text-zinc-400">Dashboard'dan ilk projenizi ekleyin!</p>
            <button
              onClick={loadProjects}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <span className="material-symbols-rounded text-sm">refresh</span>
              Tekrar Yükle
            </button>
          </div>
        ) : (
          <div className="grid gap-x-4 gap-y-5 grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] bg-transparent" style={{ minHeight: '400px' }}>
            {projects.map((project, index) => {
              return (
                <div
                  key={project.id || `project-${index}`}
                  className="relative p-4 rounded-2xl hover:bg-zinc-700/50 active:bg-zinc-700/60 ring-1 ring-inset ring-zinc-50/5 transition-all duration-300 bg-zinc-800/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 hover:ring-blue-500/30 hover:-translate-y-1 group"
                >
                  {/* Mavi Glow Efekti - Arka plan */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-sky-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>

                  {/* Proje Slideshow */}
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <ProjectSlideshow
                      images={project.images || [project.imgSrc]}
                      title={project.title}
                      autoPlay={true}
                      interval={5000}
                      aspectRatio="aspect-square"
                    />
                  </div>

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
                      onClick={async () => {
                        // Analytics tracking
                        try {
                          await fetch('/api/analytics', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              event: 'projectClick',
                              data: { project: project.title }
                            })
                          });
                          console.log('📊 Project click tracked:', project.title);
                        } catch (err) {
                          console.log('Analytics not available');
                        }
                      }}
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