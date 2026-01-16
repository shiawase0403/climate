import React, { useState } from 'react';
import { Compass, ChevronDown, ChevronRight, MapPin, X } from 'lucide-react';
import { EXPLORE_DATA } from '../data/cityData';
import { CityDefinition } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ExploreMenuProps {
  onSelectCity: (city: CityDefinition) => void;
}

export const ExploreMenu: React.FC<ExploreMenuProps> = ({ onSelectCity }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (code: string) => {
    setExpandedCategory(expandedCategory === code ? null : code);
  };

  const handleCityClick = (city: CityDefinition) => {
    onSelectCity(city);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center space-x-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors text-sm font-medium shadow-sm mb-4"
      >
        <Compass className="w-4 h-4" />
        <span>{t.exploreCities}</span>
      </button>

      {/* Modal/Drawer Overlay - Using z-[9999] to be above Leaflet (z-1000) and other UI */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex justify-end transition-opacity">
          {/* Clickable background to close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          
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

              {EXPLORE_DATA.map((category) => (
                <div key={category.code} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleCategory(category.code)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 min-w-[36px] text-center">
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
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-center text-slate-400">
               {t.exploreDataCredit}
            </div>
          </div>
        </div>
      )}
    </>
  );
};