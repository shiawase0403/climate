
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { TutorialModal } from '../components/TutorialModal';
import { CloudRain, Rocket, MousePointerClick, SplitSquareHorizontal, Gamepad2, Swords, Languages, BookOpen, HelpCircle, Waves, CheckCircle, X, AlertCircle, ChevronDown, Menu, Lightbulb } from 'lucide-react';
import { getRandomTip } from '../data/tips';

// Footer Notice Component (Moved here)
const NoticeFooter: React.FC<{ onOpenTutorial: () => void; isChallengeMode: boolean }> = ({ onOpenTutorial, isChallengeMode }) => {
  const { t } = useLanguage();
  return (
    <div className="mt-16 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 border-l-4 border-l-amber-500 relative">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-full flex-shrink-0 mt-1">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-800">{t.notice.title}</h3>
            {!isChallengeMode && (
              <button onClick={onOpenTutorial} className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors">
                <HelpCircle className="w-4 h-4" />
                <span>{t.openTutorial}</span>
              </button>
            )}
          </div>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed max-w-4xl">{t.notice.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-100 pt-6">
            {/* Major Types */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.notice.groupMajor}</h4>
              <ul className="space-y-2.5">
                {(['A', 'B', 'C', 'D', 'E'] as const).map(code => (
                   <li key={code} className="flex items-start text-sm">
                     <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-center mr-3 min-w-[32px]">{code}</span>
                     <span className="text-slate-700 pt-0.5">{t.notice.keys[code]}</span>
                   </li>
                ))}
              </ul>
            </div>
            {/* Precipitation */}
            <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.notice.groupPrecip}</h4>
               <ul className="space-y-2.5">
                 {(['f', 'w', 's'] as const).map(code => (
                   <li key={code} className="flex items-start text-sm">
                     <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-center mr-3 min-w-[32px]">{code}</span>
                     <span className="text-slate-700 pt-0.5">{t.notice.keys[code]}</span>
                   </li>
                 ))}
               </ul>
            </div>
            {/* Temperature */}
            <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.notice.groupTemp}</h4>
               <ul className="space-y-2.5">
                 {(['a', 'b', 'c', 'd'] as const).map(code => (
                   <li key={code} className="flex items-start text-sm">
                     <span className="font-mono font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded text-center mr-3 min-w-[32px]">{code}</span>
                     <span className="text-slate-700 pt-0.5">{t.notice.keys[code]}</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutFooter: React.FC = () => {
  const { t } = useLanguage();
  const [tip, setTip] = useState('');

  useEffect(() => {
    setTip(getRandomTip());
  }, []);

  return (
    <div className="mt-8 py-6 border-t border-slate-200 text-center">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t.aboutUs.title}</h3>
      <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-8 text-sm text-slate-500 font-medium mb-4">
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>{t.aboutUs.design}</span>
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>{t.aboutUs.geo}</span>
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>{t.aboutUs.server}</span>
      </div>
      <div className="text-xs text-slate-400 italic bg-slate-100/50 inline-flex items-center px-4 py-1.5 rounded-full max-w-full overflow-hidden">
        <Lightbulb className="w-3 h-3 mr-1.5 text-amber-400 flex-shrink-0" />
        <span className="truncate">{tip}</span>
      </div>
    </div>
  );
};

export const MainLayout: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { isMarsMode, isRetroMode, primaryColor, primaryBg, appBg } = useTheme();
  const { notification, clearNotification } = useNotification();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const getCurrentModeLabel = () => {
    if (location.pathname.startsWith('/compare')) return { icon: <SplitSquareHorizontal className="w-4 h-4" />, label: t.modeCompare };
    if (location.pathname.startsWith('/game')) return { icon: <Gamepad2 className="w-4 h-4" />, label: t.modeGame };
    if (location.pathname.startsWith('/pvp')) return { icon: <Swords className="w-4 h-4" />, label: t.modePvp };
    return { icon: <MousePointerClick className="w-4 h-4" />, label: t.modeSingle };
  };

  const currentMode = getCurrentModeLabel();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-1000 ${appBg} relative ${isRetroMode ? 'retro-mode' : ''}`}>
      {/* Retro Mode Styles */}
      {isRetroMode && (
        <style>{`
          .retro-mode * { font-family: "Press Start 2P", cursive !important; letter-spacing: -1px; image-rendering: pixelated; }
          .retro-mode .shadow-sm, .retro-mode .shadow-lg, .retro-mode .shadow-2xl { box-shadow: 4px 4px 0px 0px rgba(0,0,0,1) !important; }
          .retro-mode .rounded-xl, .retro-mode .rounded-lg, .retro-mode .rounded-2xl { border-radius: 0 !important; }
          .retro-mode input, .retro-mode button { border: 2px solid black !important; }
        `}</style>
      )}

      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

      {/* Toast - Increased z-index to ensure visibility */}
      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[10000] animate-in slide-in-from-top-4 fade-in duration-300 w-full max-w-md px-4">
          <div className={`p-4 rounded-xl shadow-2xl flex items-start space-x-3 border-l-4 ${
            notification.type === 'ocean' ? 'bg-blue-600 text-white border-blue-300' : 
            notification.type === 'error' ? 'bg-white text-slate-800 border-red-500' :
            'bg-white text-slate-800 border-emerald-500'
          }`}>
            {notification.type === 'ocean' ? <Waves className="w-6 h-6 flex-shrink-0 animate-pulse" /> : 
             notification.type === 'error' ? <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-500" /> :
             <CheckCircle className="w-6 h-6 flex-shrink-0 text-emerald-500" />
            }
            <div className="flex-1 font-medium text-sm">{notification.message}</div>
            <button onClick={clearNotification} className="text-current opacity-70 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <header className="border-b sticky top-0 z-[1001] transition-colors duration-500 bg-white border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${primaryBg} p-2 rounded-lg transition-colors duration-500`}>
              {isMarsMode ? <Rocket className="w-6 h-6 text-white" /> : <CloudRain className="w-6 h-6 text-white" />}
            </div>
            <h1 className="text-xl font-bold hidden sm:block text-slate-900">
              {isMarsMode ? "Mars Climate Explorer" : t.appTitle}
            </h1>
            <h1 className="text-lg font-bold sm:hidden text-slate-900">Climate Explorer</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex p-1 rounded-lg bg-slate-100 overflow-x-auto">
              <NavLink to="/" className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${isActive ? `bg-white shadow-sm ${primaryColor}` : 'text-slate-500 hover:text-slate-700'}`}>
                <MousePointerClick className="w-4 h-4" />
                <span className="hidden sm:inline">{t.modeSingle}</span>
              </NavLink>
              <NavLink to="/compare" className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${isActive ? `bg-white shadow-sm ${primaryColor}` : 'text-slate-500 hover:text-slate-700'}`}>
                <SplitSquareHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">{t.modeCompare}</span>
              </NavLink>
              <NavLink to="/game" className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${isActive ? `bg-white shadow-sm ${primaryColor}` : 'text-slate-500 hover:text-slate-700'}`}>
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t.modeGame}</span>
              </NavLink>
              <NavLink to="/pvp" className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${isActive ? `bg-white shadow-sm ${primaryColor}` : 'text-slate-500 hover:text-slate-700'}`}>
                <Swords className="w-4 h-4" />
                <span className="hidden sm:inline">{t.modePvp}</span>
              </NavLink>
            </div>

            {/* Mobile Navigation Dropdown */}
            <div className="sm:hidden relative" ref={mobileMenuRef}>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm border border-slate-200"
              >
                {currentMode.icon}
                <span>{currentMode.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMobileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    <NavLink to="/" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <MousePointerClick className="w-4 h-4" />
                      <span>{t.modeSingle}</span>
                    </NavLink>
                    <NavLink to="/compare" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <SplitSquareHorizontal className="w-4 h-4" />
                      <span>{t.modeCompare}</span>
                    </NavLink>
                    <NavLink to="/game" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Gamepad2 className="w-4 h-4" />
                      <span>{t.modeGame}</span>
                    </NavLink>
                    <NavLink to="/pvp" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Swords className="w-4 h-4" />
                      <span>{t.modePvp}</span>
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px hidden md:block bg-slate-200"></div>

            <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700">
              <Languages className="w-4 h-4" />
              <span>{language === 'en' ? '中文' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {location.pathname.startsWith('/pvp') ? (
           <Outlet />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-auto">
               <Outlet context={{ setShowTutorial }} />
            </div>
            <NoticeFooter onOpenTutorial={() => setShowTutorial(true)} isChallengeMode={false} />
            <AboutFooter />
          </>
        )}
      </main>
    </div>
  );
};
