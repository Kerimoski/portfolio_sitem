import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  dark: {
    name: 'Dark',
    colors: {
      primary: 'zinc',
      accent: 'sky',
      background: 'from-zinc-900 via-zinc-800 to-zinc-900',
      surface: 'zinc-800/50',
      surfaceHover: 'zinc-700/50',
      text: 'white',
      textSecondary: 'zinc-400',
      border: 'zinc-700/50'
    }
  },
  light: {
    name: 'Light',
    colors: {
      primary: 'slate',
      accent: 'blue',
      background: 'from-gray-50 via-white to-gray-100',
      surface: 'white/80',
      surfaceHover: 'gray-50/80',
      text: 'gray-900',
      textSecondary: 'gray-600',
      border: 'gray-200/50'
    }
  },
  green: {
    name: 'Green',
    colors: {
      primary: 'emerald',
      accent: 'teal',
      background: 'from-emerald-950 via-green-900 to-emerald-950',
      surface: 'emerald-800/50',
      surfaceHover: 'emerald-700/50',
      text: 'emerald-50',
      textSecondary: 'emerald-300',
      border: 'emerald-700/50'
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      primary: 'purple',
      accent: 'violet',
      background: 'from-purple-950 via-violet-900 to-purple-950',
      surface: 'purple-800/50',
      surfaceHover: 'purple-700/50',
      text: 'purple-50',
      textSecondary: 'purple-300',
      border: 'purple-700/50'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  useEffect(() => {
    // LocalStorage'dan tema yükle
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Tema değiştiğinde CSS custom properties güncelle
    const theme = themes[currentTheme];
    const root = document.documentElement;

    // CSS değişkenlerini ayarla
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-surface-hover', theme.colors.surfaceHover);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--theme-border', theme.colors.border);

    // HTML class'ını güncelle
    root.className = `theme-${currentTheme}`;

    // LocalStorage'a kaydet
    localStorage.setItem('portfolio-theme', currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    changeTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
}; 