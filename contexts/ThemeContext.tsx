import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useNotification } from './NotificationContext';

interface ThemeContextType {
  isMarsMode: boolean;
  setIsMarsMode: (val: boolean) => void;
  isRetroMode: boolean;
  setIsRetroMode: (val: boolean) => void;
  primaryColor: string;
  primaryBg: string;
  primaryBgHover: string;
  appBg: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMarsMode, setIsMarsMode] = useState(false);
  const [isRetroMode, setIsRetroMode] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { showNotification } = useNotification();

  // Konami Code Listener
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let cursor = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      const targetKey = konamiCode[cursor].toLowerCase();
      const match = key === targetKey || e.code === konamiCode[cursor];

      if (match) {
        cursor++;
        if (cursor === konamiCode.length) {
          setIsRetroMode(prev => {
            const newState = !prev;
            if (newState) {
              if (language !== 'en') {
                setLanguage('en');
                showNotification("CHEAT CODE ACTIVATED: RETRO MODE ON (Switched to English for font compatibility)", 'success');
              } else {
                showNotification("CHEAT CODE ACTIVATED: RETRO MODE ON", 'success');
              }
            } else {
              showNotification("RETRO MODE DEACTIVATED", 'success');
            }
            return newState;
          });
          cursor = 0;
        }
      } else {
        cursor = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [language, setLanguage, showNotification]);

  // Derived Theme Values
  const primaryColor = isMarsMode ? 'text-orange-600' : 'text-indigo-600';
  const primaryBg = isMarsMode ? 'bg-orange-600' : 'bg-indigo-600';
  const primaryBgHover = isMarsMode ? 'hover:bg-orange-700' : 'hover:bg-indigo-700';
  const appBg = isMarsMode ? 'bg-orange-50' : 'bg-slate-50';

  return (
    <ThemeContext.Provider value={{ 
      isMarsMode, setIsMarsMode, 
      isRetroMode, setIsRetroMode,
      primaryColor, primaryBg, primaryBgHover, appBg
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};