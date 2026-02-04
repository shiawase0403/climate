
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CitySearchResult, GeoLocation } from '../types';
import { searchCities, findNearestCity } from '../services/csvService';

interface CitySearchBoxProps {
  onLocationSelect: (location: GeoLocation) => void;
}

export const CitySearchBox: React.FC<CitySearchBoxProps> = ({ onLocationSelect }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmedQuery = query.trim();
      
      if (trimmedQuery.length >= 2) {
        setLoading(true);
        try {
          const searchResults = await searchCities(query);
          
          // Easter Egg: Mars
          if ('mars'.includes(trimmedQuery.toLowerCase())) {
             searchResults.unshift({
               city: 'Mars',
               city_ascii: 'Mars',
               lat: 0, 
               lng: 0,
               country: 'The Red Planet',
               count: 9999999
             });
          }

          setResults(searchResults);
          setIsOpen(true);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: CitySearchResult) => {
    // Pass city_ascii as the name for substitution
    onLocationSelect({ lat: city.lat, lng: city.lng, name: city.city_ascii });
    setQuery('');
    setIsOpen(false);
    
    // Ping API for tracking purposes as requested
    findNearestCity(city.lat, city.lng);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 relative" ref={wrapperRef}>
      <div className="flex items-center space-x-2 mb-3 text-slate-800 font-semibold">
        <Search className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm">{t.searchCity}</h3>
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchCityPlaceholder}
          className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
        />
        
        {loading ? (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          </div>
        ) : query ? (
           <button 
             onClick={clearSearch}
             className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
           >
             <X className="w-4 h-4" />
           </button>
        ) : null}

        {/* Dropdown Results */}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 max-h-60 overflow-y-auto">
            {results.map((city, index) => (
              <button
                key={`${city.city_ascii}-${index}`}
                onClick={() => handleSelect(city)}
                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors flex items-center group border-b border-slate-50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-slate-400 mr-3 group-hover:text-indigo-500 flex-shrink-0" />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      {city.city_ascii}
                    </span>
                    {city.count !== undefined && city.count > 0 && (
                      <div className="flex items-center text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100" title="Search Popularity">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>{city.count}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-slate-500 gap-1">
                     {city.country && <span>{city.country}</span>}
                     {city.country && <span className="text-slate-300">•</span>}
                     <span className="font-mono text-[10px] text-slate-400">
                       {typeof city.lat === 'number' ? city.lat.toFixed(2) : '-'}, {typeof city.lng === 'number' ? city.lng.toFixed(2) : '-'}
                     </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {isOpen && query.length >= 2 && results.length === 0 && !loading && (
           <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 p-4 text-center text-sm text-slate-500">
             {t.noResults}
           </div>
        )}
      </div>
    </div>
  );
};
