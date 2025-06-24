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
  const fullText = `> Kerimoski
frontend developer

> Web sitesi veya aplikasyonamı ihtiyacınız var?
✔ React.js
✔ Node.js
✔ TypeScript
✔ Tailwind CSS

> Modern Teknolojileri kullanarak
Hızlıca ve istediğiniz tarzda projelerinizi tamamlayabilirim.`;

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
              label="CV indir"
              icon="download"
              onClick={() => {
                // Analytics tracking
                if (typeof window !== 'undefined' && window.trackDownload) {
                  window.trackDownload('abdulkerim_erdurun_cv.pdf');
                }
              }}
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
    </section>
  );
};

export default Hero;