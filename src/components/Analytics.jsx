/**
 * @copyright 2024 Abdulkerim Erdurun
 * @license Apache-2.0
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Analytics = () => {
  const location = useLocation();
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    // Google Analytics yükleme ve konfigürasyonu
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
      // Google Analytics script'ini yükle
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
          page_title: document.title,
          page_location: window.location.href,
        });
      `;
      document.head.appendChild(script2);

      // Global gtag fonksiyonunu tanımla
      window.gtag = window.gtag || function() {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(arguments);
      };
    }
  }, [GA_MEASUREMENT_ID]);

  useEffect(() => {
    // Sayfa değişikliklerini takip et
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search,
      });
    }
  }, [location, GA_MEASUREMENT_ID]);

  // Custom event tracking fonksiyonları
  const trackEvent = (action, category, label = '', value = 0) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackProjectClick = (projectName, projectUrl) => {
    trackEvent('click', 'project', `${projectName} - ${projectUrl}`);
  };

  const trackContactForm = (formType) => {
    trackEvent('submit', 'contact', formType);
  };

  const trackDownload = (fileName) => {
    trackEvent('download', 'file', fileName);
  };

  // Global olarak erişilebilir tracking fonksiyonları
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.trackProjectClick = trackProjectClick;
      window.trackContactForm = trackContactForm;
      window.trackDownload = trackDownload;
    }
  }, []);

  return null; // Bu komponentin görsel çıktısı yok
};

export default Analytics; 