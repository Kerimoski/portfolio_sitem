/**
 * @copyright 2024 Abdulkerim Erdurun
 * @license Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/images/placeholder.svg',
  loading = 'lazy',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Ana Resim */}
      {isInView && (
        <img
          src={error ? placeholder : src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
};

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager'])
};

export default LazyImage; 