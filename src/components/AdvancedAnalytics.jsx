/**
 * @copyright 2024 Abdulkerim Erdurun
 * @license Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AdvancedAnalytics = () => {
  const location = useLocation();
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const [analyticsData, setAnalyticsData] = useState({
    pageViews: {},
    projectClicks: {},
    contactSubmissions: 0,
    downloads: {},
    visitors: {
      daily: [],
      weekly: [],
      monthly: []
    },
    devices: {
      mobile: 0,
      desktop: 0,
      tablet: 0
    },
    countries: {},
    browsers: {},
    sessionDuration: []
  });

  // Cihaz türünü tespit et
  const detectDevice = () => {
    const userAgent = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      if (/iPad/i.test(userAgent)) return 'tablet';
      return 'mobile';
    }
    return 'desktop';
  };

  // Tarayıcı türünü tespit et
  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    return "Other";
  };

  // IP'den ülke bilgisi al (geofree API kullanarak)
  const getCountryFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_name || 'Unknown';
    } catch (error) {
      console.error('Ülke bilgisi alınamadı:', error);
      return 'Unknown';
    }
  };

  // Oturum başlangıç zamanı
  const sessionStart = Date.now();

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
          custom_map: {
            'custom_device_type': 'device_type',
            'custom_country': 'user_country'
          }
        });
      `;
      document.head.appendChild(script2);

      // Global gtag fonksiyonunu tanımla
      window.gtag = window.gtag || function () {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(arguments);
      };

      // İlk ziyaret verilerini kaydet
      initializeVisitorData();
    }
  }, [GA_MEASUREMENT_ID]);

  const initializeVisitorData = async () => {
    const device = detectDevice();
    const browser = detectBrowser();
    const country = await getCountryFromIP();
    const currentDate = new Date().toISOString().split('T')[0];

    // Yerel analytics verilerini güncelle
    updateLocalAnalytics('pageView', location.pathname);
    updateLocalAnalytics('device', device);
    updateLocalAnalytics('browser', browser);
    updateLocalAnalytics('country', country);
    updateLocalAnalytics('visitor', currentDate);

    // Google Analytics'e özel veriler gönder
    if (window.gtag) {
      window.gtag('event', 'page_view_detailed', {
        device_type: device,
        browser: browser,
        user_country: country,
        page_path: location.pathname
      });
    }
  };

  const updateLocalAnalytics = async (type, data) => {
    const existing = JSON.parse(localStorage.getItem('portfolio-analytics') || '{}');
    const today = new Date().toISOString().split('T')[0];

    switch (type) {
      case 'pageView':
        existing.pageViews = existing.pageViews || {};
        existing.pageViews[data] = (existing.pageViews[data] || 0) + 1;

        // API'ye de kaydet (Vercel'de çalışacak)
        try {
          await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'pageView', data: { page: data } })
          });
        } catch (err) {
          console.log('API analytics not available');
        }
        break;

      case 'device':
        existing.devices = existing.devices || { mobile: 0, desktop: 0, tablet: 0 };
        existing.devices[data] = (existing.devices[data] || 0) + 1;
        break;

      case 'browser':
        existing.browsers = existing.browsers || {};
        existing.browsers[data] = (existing.browsers[data] || 0) + 1;
        break;

      case 'country':
        existing.countries = existing.countries || {};
        existing.countries[data] = (existing.countries[data] || 0) + 1;
        break;

      case 'visitor':
        existing.visitors = existing.visitors || { daily: [], weekly: [], monthly: [] };

        // Günlük ziyaretçi
        const dailyEntry = existing.visitors.daily.find(v => v.date === today);
        if (dailyEntry) {
          dailyEntry.count += 1;
        } else {
          existing.visitors.daily.push({ date: today, count: 1 });
        }

        //Son 30 gün tut
        existing.visitors.daily = existing.visitors.daily.slice(-30);

        // API'ye visitor kaydı gönder
        try {
          const device = detectDevice();
          const browser = detectBrowser();
          await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'visitor',
              data: { device, browser, country: 'Unknown' }
            })
          });
        } catch (err) {
          console.log('API analytics not available');
        }
        break;

      case 'projectClick':
        existing.projectClicks = existing.projectClicks || {};
        existing.projectClicks[data.projectName] = (existing.projectClicks[data.projectName] || 0) + 1;
        existing.lastProjectClick = {
          project: data.projectName,
          url: data.projectUrl,
          timestamp: Date.now()
        };
        break;

      case 'contactSubmission':
        existing.contactSubmissions = (existing.contactSubmissions || 0) + 1;
        existing.lastContactSubmission = Date.now();
        break;

      case 'download':
        existing.downloads = existing.downloads || {};
        existing.downloads[data] = (existing.downloads[data] || 0) + 1;
        break;

      case 'sessionEnd':
        const duration = Math.round((Date.now() - sessionStart) / 1000); // saniye
        existing.sessionDuration = existing.sessionDuration || [];
        existing.sessionDuration.push({
          date: today,
          duration: duration,
          pages: Object.keys(existing.pageViews || {}).length
        });
        // Son 100 oturum tut
        existing.sessionDuration = existing.sessionDuration.slice(-100);
        break;
    }

    localStorage.setItem('portfolio-analytics', JSON.stringify(existing));
    setAnalyticsData(existing);
  };

  useEffect(() => {
    // Sayfa değişikliklerini takip et
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search,
      });
    }

    // Sayfa görüntüleme kaydet
    updateLocalAnalytics('pageView', location.pathname);
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
    updateLocalAnalytics('projectClick', { projectName, projectUrl });
  };

  const trackContactForm = (formType) => {
    trackEvent('submit', 'contact', formType);
    updateLocalAnalytics('contactSubmission');
  };

  const trackDownload = (fileName) => {
    trackEvent('download', 'file', fileName);
    updateLocalAnalytics('download', fileName);
  };

  // Oturum sonu tracking
  const trackSessionEnd = () => {
    updateLocalAnalytics('sessionEnd');
  };

  // Sayfa kapanırken oturum süresini kaydet
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackSessionEnd();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackSessionEnd();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Global olarak erişilebilir tracking fonksiyonları
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.trackProjectClick = trackProjectClick;
      window.trackContactForm = trackContactForm;
      window.trackDownload = trackDownload;

      // Analytics data getter
      window.getAnalyticsData = () => {
        return JSON.parse(localStorage.getItem('portfolio-analytics') || '{}');
      };

      // Analytics data export
      window.exportAnalyticsData = () => {
        const data = JSON.parse(localStorage.getItem('portfolio-analytics') || '{}');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
    }
  }, []);

  // İlk yüklemede mevcut verileri al
  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('portfolio-analytics') || '{}');
    setAnalyticsData(existing);
  }, []);

  return null; // Bu komponentin görsel çıktısı yok
};

export default AdvancedAnalytics; 