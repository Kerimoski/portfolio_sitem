/**
 * Node modules
 */
import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from '@gsap/react';
import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';


/**
 * Register gsap plugins
 */
gsap.registerPlugin(useGSAP, ScrollTrigger);


/**
 * Components
 */
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Skill from "./components/Skill";
import Work from "./components/Work";
import Review from "./components/Review";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import SEOHead from "./components/SEOHead";
import AdvancedAnalytics from "./components/AdvancedAnalytics";
import { ThemeProvider } from "./contexts/ThemeContext";


const App = () => {

  useGSAP(() => {
    const elements = gsap.utils.toArray('.reveal-up');

    elements.forEach((element) => {
      gsap.to(element, {
        scrollTrigger: {
          trigger: element,
          start: '-200 bottom',
          end: 'bottom 80%',
          scrub: true
        },
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
      })
    });
  });

  // Scroll butonu için state
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Scroll pozisyonunu kontrol et
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true)
      } else {
        setShowScrollButton(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Yukarı çık fonksiyonu
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <ThemeProvider>
      <ReactLenis root>
        <AdvancedAnalytics />
        <Routes>
          <Route path="/" element={
            <>
              <SEOHead />
              <Header />
              <main>
                <Hero />
                <About />
                <Skill />
                <Work />
                <Review />
                <Contact />
              </main>
              <Footer />
            </>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      
      {/* Yukarı çık butonu */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#000',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            zIndex: 1000,
            opacity: 0.7,
            transition: 'opacity 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.7}
        >
          ↑
        </button>
      )}
    </ReactLenis>
    </ThemeProvider>
  )

}


export default App;