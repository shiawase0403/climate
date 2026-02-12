
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, TrendingUp, Settings2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CitySearchResult, GeoLocation } from '../types';
import { searchCities, findNearestCity, SearchMode } from '../services/csvService';

interface CitySearchBoxProps {
  onLocationSelect: (location: GeoLocation) => void;
}

export const CitySearchBox: React.FC<CitySearchBoxProps> = ({ onLocationSelect }) => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Advanced Search States
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('default');
  const [resultLimit, setResultLimit] = useState(0); // 0 means no limit

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
          const searchResults = await searchCities(query, searchMode, resultLimit);
          
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
  }, [query, searchMode, resultLimit]);

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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-slate-800 font-semibold">
          <Search className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm">{t.searchCity}</h3>
        </div>
        <button 
          onClick={() => setIsAdvanced(!isAdvanced)}
          className={`p-1.5 rounded-lg transition-colors border ${isAdvanced ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-400 border-transparent hover:bg-slate-100'}`}
          title={language === 'zh' ? '高级搜索' : 'Advanced Search'}
        >
          <Settings2 className="w-4 h-4" /> 
        </button>
      </div>

      {isAdvanced && (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs animate-in slide-in-from-top-1">
          <div className="mb-3">
            <span className="font-bold text-slate-500 block mb-1.5 uppercase tracking-wider text-[10px]">
              {language === 'zh' ? '搜索模式' : 'Search Mode'}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => setSearchMode('default')}
                className={`flex-1 px-2 py-1.5 rounded-md border font-medium transition-colors ${searchMode === 'default' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {language === 'zh' ? '智能' : 'Smart'}
              </button>
              <button 
                onClick={() => setSearchMode('city')}
                className={`flex-1 px-2 py-1.5 rounded-md border font-medium transition-colors ${searchMode === 'city' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {language === 'zh' ? '城市' : 'City'}
              </button>
              <button 
                onClick={() => setSearchMode('country')}
                className={`flex-1 px-2 py-1.5 rounded-md border font-medium transition-colors ${searchMode === 'country' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {language === 'zh' ? '国家' : 'Country'}
              </button>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                {language === 'zh' ? '结果数量限制' : 'Max Results'}
              </span>
              <span className="font-mono font-bold text-indigo-600">
                {resultLimit === 0 ? (language === 'zh' ? '无限制' : 'All') : resultLimit}
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="50" 
              step="1"
              value={resultLimit} 
              onChange={(e) => setResultLimit(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>{language === 'zh' ? '全部' : 'All'}</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>
        </div>
      )}
      
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
