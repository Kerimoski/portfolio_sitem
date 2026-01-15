import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector = () => {
  const { currentTheme, themes, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
    setIsOpen(false);
  };

  const themeIcons = {
    dark: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    light: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    green: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    purple: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  };

  return (
    <div className="relative">
      {/* Tema Seçici Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="menu-btn"
        title="Tema Değiştir"
      >
        {themeIcons[currentTheme]}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Menu */}
          <div className="absolute top-12 right-0 z-50 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-zinc-700/50 shadow-2xl min-w-[180px] overflow-hidden animate-fadeIn">
            <div className="p-2">
              <div className="text-xs text-zinc-400 px-3 py-2 border-b border-zinc-700/50 mb-1">
                Tema Seç
              </div>
              
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                    currentTheme === key 
                      ? 'bg-sky-400/20 text-sky-400 border border-sky-400/30' 
                      : 'hover:bg-zinc-800/50 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="text-zinc-400 group-hover:text-white">
                    {themeIcons[key]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{theme.name}</div>
                    <div className="text-xs text-zinc-500 group-hover:text-zinc-400">
                      {key === 'dark' && 'Varsayılan tema'}
                      {key === 'light' && 'Aydınlık tema'}
                      {key === 'green' && 'Doğa teması'}
                      {key === 'purple' && 'Mistik tema'}
                    </div>
                  </div>
                  
                  {/* Active Indicator */}
                  {currentTheme === key && (
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="px-3 py-2 bg-zinc-800/30 border-t border-zinc-700/50">
              <div className="text-xs text-zinc-500 text-center">
                Seçimin kaydedildi 
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector; 