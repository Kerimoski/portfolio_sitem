/**
 * @copyright 2024 Abdulkerim Erdurun
 * @license Apache-2.0
 */

import { useState, useEffect } from 'react';

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: '',
    company: '',
    content: '',
    imgSrc: '',
    rating: 5,
    status: 'pending' // pending, approved, rejected
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Default reviews (mevcut olanlar)
  const defaultReviews = [
    {
      id: 'default-1',
      content: 'Eğitimlerim için aplikasyon oluşturmaya karar verdiğimde Kerim bey ile tanıştık. Süreç içerisinde göstermiş olduğu ilgi ve becerilerinden ötürü teşekkür ediyorum. Hayal ettiğim gibi bir aplikasyon oldu.',
      name: 'Zeynep',
      imgSrc: '/images/people-4.jpg',
      company: 'Eğitimci',
      rating: 5,
      status: 'approved',
      isDefault: true,
      createdAt: '2024-01-15'
    },
    {
      id: 'default-2',
      content: 'Daha önceki yaptığı işlerden dolayı yakın çevrem bahsetmişti Kerim beyi, bende iş yaptırmak istedim ve çok memnun kaldım yaptığı işten. Tasarladığı site çok akıcı ve kullanışlı, tavsiye ederim.',
      name: 'Fatih',
      imgSrc: '/images/people-2.jpg',
      company: 'Tan Oto',
      rating: 5,
      status: 'approved',
      isDefault: true,
      createdAt: '2024-01-20'
    },
    {
      id: 'default-3',
      content: 'Web sitesi kurmaya karar verdiğimizde aklımıza gelen ilk isimdi. Sitenin tasarımı tam istediğim sadelikte oldu. Kullanımı efektif ve çok hızlı. Teknik bir sorum olduğunda anında cevap alıyorum, daha ne olsun.',
      name: 'Azize',
      imgSrc: '/images/people-3.jpg',
      company: 'Gola Atölye',
      rating: 5,
      status: 'approved',
      isDefault: true,
      createdAt: '2024-02-01'
    },
    {
      id: 'default-4',
      content: 'Kafamda tasarladığım ve hayal ettiğim siteyi bu şekilde özenli ve düzenli yapan Kerim beye teşekkür ediyorum.',
      name: 'Deney',
      imgSrc: '/images/people-1.jpg',
      company: 'PixelForge',
      rating: 5,
      status: 'approved',
      isDefault: true,
      createdAt: '2024-02-10'
    },
    {
      id: 'default-5',
      content: 'Professional work! Delivered on time, with a polished design and smooth user experience. Top-notch developer.',
      name: 'Ava Thompson',
      imgSrc: '/images/people-5.jpg',
      company: 'TechMosaic',
      rating: 5,
      status: 'approved',
      isDefault: true,
      createdAt: '2024-02-15'
    },
    {
      id: 'default-6',
      content: 'Excellent project execution! High-quality code, responsive design, and exceptional problem-solving skills.',
      name: 'Jonathan',
      imgSrc: '/images/people-6.jpg',
      company: 'Skyline Digital',
      rating: 5,
      status: 'approved',
      isDefault: true,
      createdAt: '2024-02-20'
    }
  ];

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    // Kullanıcı eklenmiş yorumları yükle
    const savedReviews = localStorage.getItem('portfolio-reviews');
    let userReviews = [];
    
    if (savedReviews) {
      try {
        userReviews = JSON.parse(savedReviews);
      } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
      }
    }
    
    // Default yorumları ve kullanıcı yorumlarını birleştir
    const allReviews = [...defaultReviews, ...userReviews];
    setReviews(allReviews);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setSelectedImage(result);
        setNewReview(prev => ({
          ...prev,
          imgSrc: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newReview.name.trim() || !newReview.content.trim()) {
      setMessage('❌ Ad ve yorum alanları zorunludur!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const review = {
      id: `user-${Date.now()}`,
      ...newReview,
      createdAt: new Date().toISOString().split('T')[0],
      isDefault: false
    };

    // Kullanıcı yorumlarını kaydet
    const existingUserReviews = JSON.parse(localStorage.getItem('portfolio-reviews') || '[]');
    const updatedUserReviews = [review, ...existingUserReviews];
    localStorage.setItem('portfolio-reviews', JSON.stringify(updatedUserReviews));

    // Tüm yorumları güncelle
    const allReviews = [...defaultReviews, ...updatedUserReviews];
    setReviews(allReviews);

    // Ana sayfayı güncelle
    window.dispatchEvent(new Event('reviewsUpdated'));

    setMessage('✅ Yorum başarıyla eklendi!');
    setNewReview({
      name: '',
      company: '',
      content: '',
      imgSrc: '',
      rating: 5,
      status: 'pending'
    });
    setSelectedImage(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleStatusChange = (reviewId, newStatus) => {
    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId && !review.isDefault) {
        return { ...review, status: newStatus };
      }
      return review;
    });

    // Kullanıcı yorumlarını güncelle
    const userReviews = updatedReviews.filter(r => !r.isDefault);
    localStorage.setItem('portfolio-reviews', JSON.stringify(userReviews));
    
    setReviews(updatedReviews);
    window.dispatchEvent(new Event('reviewsUpdated'));
    
    setMessage(`✅ Yorum durumu ${newStatus === 'approved' ? 'onaylandı' : 'reddedildi'}!`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (reviewId) => {
    if (window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      const updatedReviews = reviews.filter(review => review.id !== reviewId);
      
      // Kullanıcı yorumlarını güncelle
      const userReviews = updatedReviews.filter(r => !r.isDefault);
      localStorage.setItem('portfolio-reviews', JSON.stringify(userReviews));
      
      setReviews(updatedReviews);
      window.dispatchEvent(new Event('reviewsUpdated'));
      
      setMessage('🗑️ Yorum silindi!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getFilteredReviews = () => {
    switch (activeTab) {
      case 'pending':
        return reviews.filter(r => r.status === 'pending');
      case 'approved':
        return reviews.filter(r => r.status === 'approved');
      case 'rejected':
        return reviews.filter(r => r.status === 'rejected');
      default:
        return reviews;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'pending':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default:
        return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-zinc-600'}`}
      >
        ★
      </span>
    ));
  };

  const filteredReviews = getFilteredReviews();

  return (
    <div className="space-y-6">
      {/* Mesaj Alanı */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          message.includes('🗑️') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
          message.includes('❌') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
        }`}>
          {message}
        </div>
      )}

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Toplam</p>
              <p className="text-xl font-semibold text-white">{reviews.length}</p>
            </div>
            <span className="material-symbols-rounded text-zinc-400">rate_review</span>
          </div>
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Onaylı</p>
              <p className="text-xl font-semibold text-green-400">
                {reviews.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <span className="material-symbols-rounded text-green-400">check_circle</span>
          </div>
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Bekleyen</p>
              <p className="text-xl font-semibold text-orange-400">
                {reviews.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <span className="material-symbols-rounded text-orange-400">schedule</span>
          </div>
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Ortalama Puan</p>
              <p className="text-xl font-semibold text-yellow-400">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0).toFixed(1)}
              </p>
            </div>
            <span className="material-symbols-rounded text-yellow-400">star</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-zinc-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'Tümü', count: reviews.length },
            { key: 'pending', label: 'Bekleyen', count: reviews.filter(r => r.status === 'pending').length },
            { key: 'approved', label: 'Onaylı', count: reviews.filter(r => r.status === 'approved').length },
            { key: 'rejected', label: 'Reddedilen', count: reviews.filter(r => r.status === 'rejected').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Yeni Yorum Ekleme Formu */}
      <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Yeni Yorum Ekle</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">İsim *</label>
              <input
                type="text"
                value={newReview.name}
                onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="Müşteri adı"
                required
              />
            </div>
            
            <div>
              <label className="label">Şirket</label>
              <input
                type="text"
                value={newReview.company}
                onChange={(e) => setNewReview(prev => ({ ...prev, company: e.target.value }))}
                className="input-field"
                placeholder="Şirket adı (opsiyonel)"
              />
            </div>
          </div>

          <div>
            <label className="label">Yorum *</label>
            <textarea
              value={newReview.content}
              onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
              className="input-field h-24 resize-none"
              placeholder="Müşteri yorumu"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Profil Fotoğrafı</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-field"
              />
              {selectedImage && (
                <div className="mt-2">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="w-16 h-16 rounded-full object-cover border border-zinc-600"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="label">Puan</label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                className="input-field"
              >
                <option value={5}>5 - Mükemmel</option>
                <option value={4}>4 - İyi</option>
                <option value={3}>3 - Orta</option>
                <option value={2}>2 - Kötü</option>
                <option value={1}>1 - Çok Kötü</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <span className="material-symbols-rounded">add</span>
            Yorum Ekle
          </button>
        </form>
      </div>

      {/* Yorumlar Listesi */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Yorumlar ({filteredReviews.length})
        </h3>
        
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-rounded text-zinc-400 text-2xl">rate_review</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Henüz yorum yok</h3>
            <p className="text-zinc-400">Bu kategoride henüz yorum bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 relative"
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={review.imgSrc} 
                    alt={review.name}
                    className="w-16 h-16 rounded-full object-cover border border-zinc-600"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{review.name}</h4>
                        {review.company && (
                          <p className="text-sm text-zinc-400">{review.company}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {getRatingStars(review.rating)}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(review.status)}`}>
                          {getStatusIcon(review.status)} {review.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-zinc-300 mb-3">{review.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{review.createdAt}</span>
                        {review.isDefault && (
                          <span className="bg-emerald-600 text-white px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      
                      {!review.isDefault && (
                        <div className="flex items-center gap-2">
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(review.id, 'approved')}
                                className="text-green-400 hover:text-green-300 p-1 rounded"
                                title="Onayla"
                              >
                                <span className="material-symbols-rounded text-sm">check</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(review.id, 'rejected')}
                                className="text-red-400 hover:text-red-300 p-1 rounded"
                                title="Reddet"
                              >
                                <span className="material-symbols-rounded text-sm">close</span>
                              </button>
                            </>
                          )}
                          
                          {review.status === 'approved' && (
                            <button
                              onClick={() => handleStatusChange(review.id, 'pending')}
                              className="text-orange-400 hover:text-orange-300 p-1 rounded"
                              title="Bekleyene al"
                            >
                              <span className="material-symbols-rounded text-sm">schedule</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded"
                            title="Sil"
                          >
                            <span className="material-symbols-rounded text-sm">delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManager; 