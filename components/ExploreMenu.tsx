import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Compass, ChevronDown, ChevronRight, MapPin, X } from 'lucide-react';
import { EXPLORE_DATA } from '../data/cityData';
import { CityDefinition } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ExploreMenuProps {
  onSelectCity: (city: CityDefinition) => void;
}

const CLIMATE_COLORS: Record<string, string> = {
  'Af': '#0000FF',
  'Am': '#0077FF',
  'Aw': '#46A9FA',
  'As': '#46A9FA',
  'BWh': '#FF0000',
  'BWk': '#FF9696',
  'BSh': '#F5A500',
  'BSk': '#FFDC64',
  'Csa': '#FFFF00',
  'Csb': '#C6C700',
  'Csc': '#969600',
  'Cwa': '#96FF96',
  'Cwb': '#63C764',
  'Cwc': '#329633',
  'Cfa': '#C6FFC7',
  'Cfb': '#66FF66',
  'Cfc': '#33C733',
  'Dsa': '#FF00FF',
  'Dsb': '#C700C7',
  'Dsc': '#963295',
  'Dsd': '#966495',
  'Dwa': '#ABBAD9',
  'Dwb': '#5A77DB',
  'Dwc': '#4C5169',
  'Dwd': '#380094',
  'Dfa': '#00FFFF',
  'Dfb': '#38C7FF',
  'Dfc': '#007E7E',
  'Dfd': '#004545',
  'ET': '#B2B2B2',
  'EF': '#686868'
};

const getTextColor = (hex: string | undefined) => {
  if (!hex) return '#1e293b'; // slate-800
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
};

export const ExploreMenu: React.FC<ExploreMenuProps> = ({ onSelectCity }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleCategory = (code: string) => {
    setExpandedCategory(expandedCategory === code ? null : code);
  };

  const handleCityClick = (city: CityDefinition) => {
    onSelectCity(city);
    setIsOpen(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex justify-end">
      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)} 
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2 text-emerald-700">
            <Compass className="w-5 h-5" />
            <h2 className="font-bold text-lg">{t.climateExplorer}</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-sm text-slate-500 mb-4 px-1">
            {t.exploreInstruction}
          </p>

          {EXPLORE_DATA.map((category) => {
            const bg = CLIMATE_COLORS[category.code];
            const fg = getTextColor(bg);
            
            return (
              <div key={category.code} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => toggleCategory(category.code)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span 
                      className="font-mono font-bold px-2 py-0.5 rounded border border-black/5 min-w-[36px] text-center shadow-sm"
                      style={{ backgroundColor: bg || '#e0e7ff', color: fg }}
                    >
                      {category.code}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{category.title}</span>
                  </div>
                  {expandedCategory === category.code ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {expandedCategory === category.code && (
                  <div className="bg-slate-50 border-t border-slate-100 divide-y divide-slate-100">
                    {category.cities.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleCityClick(city)}
                        className="w-full p-3 pl-4 flex items-start space-x-3 hover:bg-white transition-colors text-left group"
                      >
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{city.name}</div>
                          <div className="text-xs text-slate-500">{city.country}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-center text-slate-400">
           {t.exploreDataCredit}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center space-x-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors text-sm font-medium shadow-sm mb-4"
      >
        <Compass className="w-4 h-4" />
        <span>{t.exploreCities}</span>
      </button>

      {isOpen && mounted ? createPortal(modalContent, document.body) : null}
    </>
  );
};
