import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HomeIcon,
    ArrowRightOnRectangleIcon,
    FolderIcon,
    PlusCircleIcon,
    ChartBarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    PencilIcon,
    TrashIcon,
    CloudArrowUpIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    CursorArrowRaysIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import DashboardLogin from '../components/DashboardLogin';
import LazyImage from '../components/LazyImage';

const Dashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({
        title: '',
        tags: '',
        projectLink: '',
        imgSrc: '',
        images: [] // ÇOKLU GÖRSEL ARRAY
    });
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('projects');
    const [editingProject, setEditingProject] = useState(null);
    const [analytics, setAnalytics] = useState({
        pageViews: {},
        projectClicks: {},
        visitors: { daily: [], total: 0 },
        devices: {},
        browsers: {},
        countries: {}
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkAuth();
        loadProjects();
        loadAnalytics();
    }, []);

    const checkAuth = () => {
        const authStatus = localStorage.getItem('dashboard-auth');
        const authTime = localStorage.getItem('dashboard-auth-time');

        if (authStatus === 'true' && authTime) {
            const hoursPassed = (Date.now() - parseInt(authTime)) / (1000 * 60 * 60);
            if (hoursPassed < 24) {
                setIsAuthenticated(true);
            } else {
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

    const loadProjects = async () => {
        try {
            // 1. Önce Blob API'den yükle (canlıda)
            try {
                const response = await fetch('/api/projects');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.projects && data.projects.length > 0) {
                        setProjects(data.projects);
                        console.log('✅ Blob API:', data.projects.length, 'proje');
                        return;
                    }
                }
            } catch (apiErr) {
                console.log('API mevcut değil, fallback kullanılacak');
            }

            // 2. Fallback: Local JSON
            const fallback = await fetch('/data/projects.json');
            if (fallback.ok) {
                const data = await fallback.json();
                setProjects(data);
                console.log('✅ Local JSON:', data.length, 'proje');
            }
        } catch (error) {
            console.error('Load error:', error);
        }
    };

    const loadAnalytics = async () => {
        try {
            const response = await fetch('/api/analytics');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.analytics) {
                    setAnalytics(data.analytics);
                }
            }
        } catch (error) {
            // Silent fail - local'de API yok
        }
    };

    const saveProjects = async (updatedProjects) => {
        setIsLoading(true);
        try {
            // API'ye kaydet (Vercel Blob)
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projects: updatedProjects,
                    password: import.meta.env.VITE_DASHBOARD_PASSWORD || 'kerimoski2024'
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('✅ Blob kayıt:', data.message);
                setProjects(updatedProjects);
                showMessage('✅ Projeler kaydedildi!', 'success');
                setActiveTab('projects');
                return true;
            } else {
                throw new Error(data.error || 'Kayıt başarısız');
            }

        } catch (error) {
            console.error('❌ Kayıt hatası:', error);
            showMessage('❌ ' + error.message, 'error');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const openCloudinaryWidget = (isEditing = false) => {
        if (typeof window.cloudinary === 'undefined') {
            showMessage('Cloudinary yüklenmedi, sayfayı yenileyin', 'error');
            return;
        }

        const widget = window.cloudinary.createUploadWidget({
            cloudName: 'dgxp3zgko',
            uploadPreset: 'portfolio',
            sources: ['local', 'camera'],
            multiple: true,  // ÇOKLU GÖRSEL!
            maxFiles: 3,     // Maksimum 3 görsel
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            maxFileSize: 5000000,
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
                { width: 1200, height: 675, crop: 'fill', gravity: 'center' }
            ]
        }, (error, result) => {
            if (error) {
                showMessage('Upload hatası: ' + error.message, 'error');
                return;
            }

            if (result && result.event === "success") {
                const imageUrl = result.info.secure_url;
                if (isEditing) {
                    // Düzenleme: images array'e ekle
                    setEditingProject(prev => ({
                        ...prev,
                        images: [...(prev.images || [prev.imgSrc || '']), imageUrl].filter(Boolean).slice(0, 3),
                        imgSrc: prev.imgSrc || imageUrl // İlk görsel
                    }));
                } else {
                    // Yeni proje: images array'e ekle
                    setNewProject(prev => ({
                        ...prev,
                        images: [...(prev.images || []), imageUrl].filter(Boolean).slice(0, 3),
                        imgSrc: prev.imgSrc || imageUrl // İlk görsel
                    }));
                }
                showMessage(`✅ ${result.info.original_filename} yüklendi! (${result.info.resource_type})`, 'success');
            }
        });

        widget.open();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newProject.title || !newProject.tags || !newProject.imgSrc || !newProject.projectLink) {
            showMessage('Lütfen tüm alanları doldurun!', 'error');
            return;
        }

        const projectData = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            images: newProject.images && newProject.images.length > 0 ? newProject.images : [newProject.imgSrc], // Çoklu veya tekil
            imgSrc: newProject.imgSrc,
            title: newProject.title.trim(),
            tags: newProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            projectLink: newProject.projectLink.trim()
        };

        const updated = [...projects, projectData];
        const success = await saveProjects(updated);

        if (success) {
            setNewProject({ title: '', tags: '', projectLink: '', imgSrc: '', images: [] });
            e.target.reset();
        }
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
            const updated = projects.filter(p => p.id !== projectId);
            await saveProjects(updated);
        }
    };

    const moveProject = async (projectId, direction) => {
        const currentIndex = projects.findIndex(p => p.id === projectId);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= projects.length) return;

        const newProjects = [...projects];
        [newProjects[currentIndex], newProjects[newIndex]] = [newProjects[newIndex], newProjects[currentIndex]];

        await saveProjects(newProjects);
    };

    const startEdit = (project) => {
        setEditingProject({
            ...project,
            images: project.images || [project.imgSrc], // Images array yoksa imgSrc'den oluştur
            tags: Array.isArray(project.tags) ? project.tags.join(', ') : project.tags
        });
        setActiveTab('edit-project');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!editingProject.title || !editingProject.tags || !editingProject.imgSrc || !editingProject.projectLink) {
            showMessage('Lütfen tüm alanları doldurun!', 'error');
            return;
        }

        const updated = projects.map(p =>
            p.id === editingProject.id
                ? {
                    ...editingProject,
                    images: editingProject.images && editingProject.images.length > 0 ? editingProject.images : [editingProject.imgSrc], // Çoklu görsel
                    tags: editingProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                }
                : p
        );

        const success = await saveProjects(updated);
        if (success) {
            setEditingProject(null);
            setActiveTab('projects');
        }
    };

    const exportData = () => {
        const dataStr = JSON.stringify(projects, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `projects-${new Date().toISOString().split('T')[0]}.json`);
        link.click();

        showMessage('📥 Projeler export edildi!', 'success');
    };

    const showMessage = (msg, type = 'info') => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const totalClicks = Object.values(analytics.projectClicks).reduce((a, b) => a + b, 0);
    const totalPageViews = Object.values(analytics.pageViews).reduce((a, b) => a + b, 0);

    if (!isAuthenticated) {
        return <DashboardLogin onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            {/* Premium Header */}
            <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <SparklesIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Portfolio Dashboard
                                </h1>
                                <p className="text-zinc-500 text-xs">Premium Edition</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/"
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-all group"
                            >
                                <HomeIcon className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all" />
                                <span className="text-white hidden sm:inline">Ana Sayfa</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-all group border border-red-600/20"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400 group-hover:scale-110 transition-all" />
                                <span className="text-red-400 hidden sm:inline">Çıkış</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Premium Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-30 group-hover:opacity-60 transition blur"></div>
                        <div className="relative bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <FolderIcon className="w-8 h-8 text-blue-400" />
                                <span className="text-sm text-zinc-500">Total</span>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{projects.length}</p>
                            <p className="text-sm text-zinc-400">Projeler</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-30 group-hover:opacity-60 transition blur"></div>
                        <div className="relative bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <EyeIcon className="w-8 h-8 text-purple-400" />
                                <span className="text-sm text-zinc-500">Views</span>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{totalPageViews}</p>
                            <p className="text-sm text-zinc-400">Görüntülenme</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-30 group-hover:opacity-60 transition blur"></div>
                        <div className="relative bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <CursorArrowRaysIcon className="w-8 h-8 text-green-400" />
                                <span className="text-sm text-zinc-500">Clicks</span>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{totalClicks}</p>
                            <p className="text-sm text-zinc-400">Tıklanma</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl opacity-30 group-hover:opacity-60 transition blur"></div>
                        <div className="relative bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <GlobeAltIcon className="w-8 h-8 text-orange-400" />
                                <span className="text-sm text-zinc-500">Visitors</span>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{analytics.visitors.total}</p>
                            <p className="text-sm text-zinc-400">Ziyaretçi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex gap-2 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'projects'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}
                    >
                        <FolderIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Projeler</span>
                        <span className="text-xs">({projects.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'add'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Yeni Ekle</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'analytics'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}
                    >
                        <ChartBarIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Analytics</span>
                    </button>
                    <button
                        onClick={exportData}
                        className="px-4 py-3 rounded-lg font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Message Alert */}
            {message && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                    <div className={`px-6 py-4 rounded-xl backdrop-blur-sm border ${message.includes('✅')
                        ? 'bg-green-600/20 border-green-600/30 text-green-400'
                        : message.includes('❌')
                            ? 'bg-red-600/20 border-red-600/30 text-red-400'
                            : 'bg-blue-600/20 border-blue-600/30 text-blue-400'
                        } animate-pulse`}>
                        {message}
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white text-center">Kaydediliyor...</p>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => (
                            <div key={project.id} className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-2xl opacity-0 group-hover:opacity-100 transition blur"></div>
                                <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                                    <div className="relative aspect-video overflow-hidden">
                                        <LazyImage
                                            src={project.imgSrc}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            #{index + 1}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{project.title}</h3>

                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {Array.isArray(project.tags) && project.tags.map((tag, i) => (
                                                <span key={i} className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => moveProject(project.id, 'up')}
                                                disabled={index === 0}
                                                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded disabled:opacity-30 transition-all"
                                                title="Yukarı"
                                            >
                                                <ArrowUpIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => moveProject(project.id, 'down')}
                                                disabled={index === projects.length - 1}
                                                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded disabled:opacity-30 transition-all"
                                                title="Aşağı"
                                            >
                                                <ArrowDownIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => startEdit(project)}
                                                className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all"
                                            >
                                                <PencilIcon className="w-4 h-4 mx-auto" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Project Tab */}
                {activeTab === 'add' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <PlusCircleIcon className="w-7 h-7 text-blue-400" />
                                Yeni Proje Ekle
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Proje Başlığı
                                    </label>
                                    <input
                                        type="text"
                                        value={newProject.title}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        placeholder="Örn: Modern E-Ticaret"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Teknolojiler (virgülle ayırın)
                                    </label>
                                    <input
                                        type="text"
                                        value={newProject.tags}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, tags: e.target.value }))}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        placeholder="React, Node.js, MongoDB"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Proje Linki
                                    </label>
                                    <input
                                        type="url"
                                        value={newProject.projectLink}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, projectLink: e.target.value }))}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        placeholder="https://example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Proje Görseli
                                    </label>
                                    {newProject.imgSrc && (
                                        <div className="mb-4 relative aspect-video rounded-lg overflow-hidden border-2 border-green-600/50">
                                            <img src={newProject.imgSrc} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2">
                                                <CheckCircleIcon className="w-6 h-6 text-green-400" />
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => openCloudinaryWidget(false)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
                                    >
                                        <CloudArrowUpIcon className="w-5 h-5" />
                                        {newProject.imgSrc ? 'Görseli Değiştir' : 'Görsel Yükle'}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-green-600/30"
                                >
                                    <SparklesIcon className="w-6 h-6" />
                                    Projeyi Ekle
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Analytics Tab - PREMIUM DETAILED VERSION */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                <ChartBarIcon className="w-8 h-8 text-purple-400" />
                                Analytics Dashboard
                            </h2>
                            <button
                                onClick={loadAnalytics}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Yenile
                            </button>
                        </div>

                        {/* Top Level Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-600/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <EyeIcon className="w-8 h-8 text-blue-400" />
                                    <span className="text-blue-300 text-sm font-medium">Total</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{totalPageViews}</p>
                                <p className="text-blue-300 text-sm mt-1">Sayfa Görüntüleme</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-600/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <CursorArrowRaysIcon className="w-8 h-8 text-green-400" />
                                    <span className="text-green-300 text-sm font-medium">Clicks</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{totalClicks}</p>
                                <p className="text-green-300 text-sm mt-1">Proje Tıklamaları</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-600/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <GlobeAltIcon className="w-8 h-8 text-purple-400" />
                                    <span className="text-purple-300 text-sm font-medium">Visitors</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{analytics.visitors.total || 0}</p>
                                <p className="text-purple-300 text-sm mt-1">Toplam Ziyaretçi</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 border border-orange-600/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <FolderIcon className="w-8 h-8 text-orange-400" />
                                    <span className="text-orange-300 text-sm font-medium">Projects</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{Object.keys(analytics.projectClicks).length}</p>
                                <p className="text-orange-300 text-sm mt-1">Tıklanan Projeler</p>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Device Distribution - Pie Chart Style */}
                            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <DevicePhoneMobileIcon className="w-6 h-6 text-cyan-400" />
                                    Cihaz Dağılımı
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(analytics.devices).map(([device, count]) => {
                                        const total = Object.values(analytics.devices).reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                                        const colors = {
                                            mobile: 'from-cyan-500 to-blue-500',
                                            desktop: 'from-purple-500 to-pink-500',
                                            tablet: 'from-green-500 to-emerald-500'
                                        };

                                        return (
                                            <div key={device} className="group hover:scale-[1.02] transition-transform">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        {device === 'mobile' ? <DevicePhoneMobileIcon className="w-5 h-5 text-cyan-400" /> :
                                                            device === 'tablet' ? <DevicePhoneMobileIcon className="w-5 h-5 text-green-400" /> :
                                                                <ComputerDesktopIcon className="w-5 h-5 text-purple-400" />}
                                                        <span className="text-white font-medium capitalize">{device}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-zinc-400 text-sm">{percentage}%</span>
                                                        <span className="text-white font-bold text-lg">{count}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${colors[device]} rounded-full transition-all duration-700 ease-out shadow-lg`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Summary */}
                                <div className="mt-6 pt-6 border-t border-zinc-800">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-400">En Popüler Cihaz:</span>
                                        <span className="text-white font-semibold capitalize">
                                            {Object.entries(analytics.devices).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Top Projects - Bar Chart Style */}
                            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <FolderIcon className="w-6 h-6 text-green-400" />
                                    En Popüler Projeler
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(analytics.projectClicks)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 6)
                                        .map(([project, clicks], index) => {
                                            const maxClicks = Math.max(...Object.values(analytics.projectClicks));
                                            const percentage = (clicks / maxClicks) * 100;
                                            const colors = [
                                                'from-green-500 to-emerald-500',
                                                'from-blue-500 to-cyan-500',
                                                'from-purple-500 to-pink-500',
                                                'from-orange-500 to-red-500',
                                                'from-yellow-500 to-orange-500',
                                                'from-indigo-500 to-purple-500'
                                            ];

                                            return (
                                                <div key={project} className="group hover:scale-[1.02] transition-transform">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-zinc-600">#{index + 1}</span>
                                                            <span className="text-white font-medium truncate max-w-[200px]">{project}</span>
                                                        </div>
                                                        <span className="text-green-400 font-bold text-lg">{clicks}</span>
                                                    </div>
                                                    <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-700 ease-out shadow-lg`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>

                                {Object.keys(analytics.projectClicks).length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-zinc-500">Henüz proje tıklaması yok</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Browser & Page Views */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Browser Stats */}
                            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <GlobeAltIcon className="w-6 h-6 text-blue-400" />
                                    Tarayıcı Dağılımı
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(analytics.browsers).map(([browser, count]) => {
                                        const total = Object.values(analytics.browsers).reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

                                        return (
                                            <div key={browser} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                                        <span className="text-xl">{browser[0]}</span>
                                                    </div>
                                                    <span className="text-white font-medium">{browser}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-white font-bold">{count}</p>
                                                        <p className="text-zinc-400 text-xs">{percentage}%</p>
                                                    </div>
                                                    <div className="w-16 bg-zinc-700 rounded-full h-2">
                                                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Page Views */}
                            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <EyeIcon className="w-6 h-6 text-purple-400" />
                                    Sayfa Görüntülemeleri
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(analytics.pageViews).map(([page, views]) => (
                                        <div key={page} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                                                    <span className="text-purple-400">📄</span>
                                                </div>
                                                <span className="text-white font-medium">{page === '/' ? 'Ana Sayfa' : page}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-purple-400 font-bold text-lg">{views}</span>
                                                <span className="text-zinc-500 text-sm">views</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-blue-600/20 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-semibold mb-2">💡 Analytics Bilgisi</h4>
                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                        Bu veriler <strong>real-time</strong> olarak toplanıyor. Vercel'e deploy sonrası tüm ziyaretçiler,
                                        proje tıklamaları ve sayfa görüntülemeleri burada görünecek.
                                        Local'de ise localStorage'da saklanıyor.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Project Tab */}
                {activeTab === 'edit-project' && editingProject && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <PencilIcon className="w-7 h-7 text-orange-400" />
                                Projeyi Düzenle
                            </h2>

                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                {/* Görsel Yükleme */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Proje Görseli</label>

                                    {/* Mevcut Görseller */}
                                    {editingProject.images && editingProject.images.length > 0 && (
                                        <div className="mb-3 grid grid-cols-3 gap-2">
                                            {editingProject.images.map((img, idx) => (
                                                <div key={idx} className="relative group">
                                                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newImages = editingProject.images.filter((_, i) => i !== idx);
                                                            setEditingProject(prev => ({
                                                                ...prev,
                                                                images: newImages,
                                                                imgSrc: newImages[0] || prev.imgSrc
                                                            }));
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Yükleme Butonu */}
                                    <button
                                        type="button"
                                        onClick={() => openCloudinaryWidget(true)}
                                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <CloudArrowUpIcon className="w-5 h-5" />
                                        {editingProject.images?.length > 0 ? 'Daha Fazla Görsel Ekle' : 'Görsel Yükle'} (Max 3)
                                    </button>

                                    {editingProject.imgSrc && (
                                        <div className="mt-3">
                                            <img src={editingProject.imgSrc} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Proje Başlığı</label>
                                    <input
                                        type="text"
                                        value={editingProject.title}
                                        onChange={(e) => setEditingProject(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Teknolojiler</label>
                                    <input
                                        type="text"
                                        value={editingProject.tags}
                                        onChange={(e) => setEditingProject(prev => ({ ...prev, tags: e.target.value }))}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Proje Linki</label>
                                    <input
                                        type="url"
                                        value={editingProject.projectLink}
                                        onChange={(e) => setEditingProject(prev => ({ ...prev, projectLink: e.target.value }))}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Görsel</label>
                                    {editingProject.imgSrc && (
                                        <div className="mb-4 relative aspect-video rounded-lg overflow-hidden">
                                            <img src={editingProject.imgSrc} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => openCloudinaryWidget(true)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                                    >
                                        <CloudArrowUpIcon className="w-5 h-5" />
                                        Görseli Değiştir
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingProject(null);
                                            setActiveTab('projects');
                                        }}
                                        className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-all"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
                                    >
                                        💾 Güncelle
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
