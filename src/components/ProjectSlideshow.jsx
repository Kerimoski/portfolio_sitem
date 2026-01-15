import { useState, useEffect } from 'react';
import LazyImage from './LazyImage';

const ProjectSlideshow = ({ images, title, autoPlay = true, interval = 5000, aspectRatio = 'aspect-video' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Tek resim varsa slideshow gösterme
  if (!images || images.length <= 1) {
    return (
      <div className={`${aspectRatio} relative`}>
        <LazyImage
          src={images?.[0] || '/images/placeholder.jpg'}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Otomatik geçiş
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, images.length, interval]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      className={`${aspectRatio} relative group`}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(autoPlay)}
    >
      {/* Ana Resim */}
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <LazyImage
              src={image}
              alt={`${title} - Resim ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={prevSlide}
          className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          title="Önceki resim"
        >
          <span className="material-symbols-rounded text-sm">chevron_left</span>
        </button>
        <button
          onClick={nextSlide}
          className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          title="Sonraki resim"
        >
          <span className="material-symbols-rounded text-sm">chevron_right</span>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            title={`Resim ${index + 1}`}
          />
        ))}
      </div>

      {/* Play/Pause Indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
          isPlaying ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'
        }`}>
          <span className="material-symbols-rounded text-xs">
            {isPlaying ? 'play_arrow' : 'pause'}
          </span>
        </div>
      </div>

      {/* Resim Sayısı */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {currentIndex + 1}/{images.length}
      </div>
    </div>
  );
};

export default ProjectSlideshow; 