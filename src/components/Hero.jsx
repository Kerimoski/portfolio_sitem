/**
 * @copyright 2024 codewithsadee
 * @license Apache-2.0
 */

/**
 * Components
 */
import { ButtonPrimary, ButtonOutline } from "./Button";
import { useState, useEffect } from 'react';

const Hero = () => {
  const [terminalText, setTerminalText] = useState('');
  const [showSurprise, setShowSurprise] = useState(false);
  const [surpriseText, setSurpriseText] = useState('');
  
  const fullText = `> Kerimoski
Full stack developer

> Web sitesi veya aplikasyonamı ihtiyacınız var?
✔ React
✔ Next.js
✔ Node.js
✔ TypeScript
✔ Tailwind CSS

> Modern Teknolojileri kullanarak
Hızlıca ve istediğiniz tarzda projelerinizi tamamlayabilirim.`;

  const surpriseMessage = "👋 Selam! Umarım sayfamı beğenmişsindir. 🎉";

  useEffect(() => {
    let currentIndex = 0;
    const terminalAnimation = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTerminalText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(terminalAnimation);
      }
    }, 50);

    return () => clearInterval(terminalAnimation);
  }, []);

  // İletişim formuna kaydır
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Form odaklanması için küçük gecikme
      setTimeout(() => {
        const nameInput = document.getElementById('name');
        if (nameInput) {
          nameInput.focus();
        }
      }, 400);
    }
  };

  return (
    <section
      id="home"
      className="pt-28 lg:pt-36"
    >
      <div className="container items-center lg:grid lg:grid-cols-2 lg:gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-3 text-zinc-400 text-sm tracking-wide">
              <span className="relative w-2 h-2 rounded-full bg-emerald-400">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></span>
              </span>
              <img 
                src="/images/avatar-1.jpg" 
                alt="Avatar" 
                className="w-6 h-6 rounded-full object-cover"
              />
              Çalışmaya Hazır
            </div>
          </div>

          <h2 className="headline-1 max-w-[15ch] sm:max-w-[20ch] lg:max-w-[15ch] mb-8 lg:mb-10">
            Modern Web Siteleri ve İhtiyaç Aplikasyonları
          </h2>

          <div className="flex items-center gap-3">
            <ButtonPrimary
              label="İletişime Geç"
              icon="mail"
              onClick={scrollToContact}
            />
            <ButtonOutline
              href="#about"
              label="Aşağıya kaydır"
              icon="arrow_downward"
            />
          </div>
        </div>

        {/* Terminal Bölümü */}
        <div className="mt-8 lg:mt-0">
          <div className="terminal bg-zinc-900 rounded-lg overflow-hidden shadow-xl max-w-[500px] mx-auto lg:mx-0">
            {/* Terminal Başlık Çubuğu */}
            <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-2 text-sm text-zinc-400">terminal</div>
            </div>
            
            {/* Terminal İçeriği */}
            <div className="p-4 font-mono text-sm min-h-[250px] max-h-[300px] overflow-y-auto scrollbar-hide bg-[#1a1a1a]">
              <pre className="text-green-400 whitespace-pre-wrap">
                {terminalText}
                <span className="text-green-400 inline-block w-2 h-4 ml-1 animate-pulse"></span>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Sürpriz Modal */}
      {showSurprise && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-zinc-900 border border-emerald-400 rounded-2xl p-8 max-w-md mx-4 relative overflow-hidden shadow-2xl">
            {/* Neon Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl animate-pulse"></div>
            
            {/* Digital Screen Effect */}
            <div className="relative z-10 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-2xl">🎉</span>
                </div>
              </div>
              
              <div className="font-mono text-emerald-400 text-xl mb-4 min-h-[2em] flex items-center justify-center">
                {surpriseText}
                <span className="ml-1 w-2 h-6 bg-emerald-400 animate-pulse"></span>
              </div>
              
              <div className="text-zinc-400 text-sm">
                :D
              </div>
              
              {/* Scanlines Effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.05)_2px,rgba(0,255,0,0.05)_4px)] animate-pulse"></div>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setShowSurprise(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

// CSS animasyonları için stil
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export default Hero;