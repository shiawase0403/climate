import React from 'react';
import { ClassificationEntry } from '../types';
import { Info, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ClassificationCardProps {
  classificationData: ClassificationEntry[];
  lat: number;
  lng: number;
}

const getClimateGradient = (code: string | undefined): string => {
  if (!code) return 'from-slate-600 to-slate-800';
  
  const type = code.charAt(0).toUpperCase();
  switch (type) {
    case 'A': // Tropical
      return 'from-rose-500 to-red-700';
    case 'B': // Arid
      return 'from-amber-400 to-orange-600';
    case 'C': // Temperate
      return 'from-emerald-500 to-teal-700';
    case 'D': // Continental
      return 'from-blue-500 to-indigo-700';
    case 'E': // Polar
      return 'from-cyan-600 to-sky-800';
    default:
      return 'from-indigo-600 to-indigo-800';
  }
};

const getDisplayText = (originalText: string | undefined, lang: string): string => {
  // Return the original text from the API (e.g., "Tropical monsoon climate")
  // regardless of the selected language, as requested.
  if (originalText) return originalText;
  
  // Only translate the fallback "Unknown" message
  return lang === 'zh' ? '未知气候' : 'Unknown Climate';
};

export const ClassificationCard: React.FC<ClassificationCardProps> = ({ classificationData, lat, lng }) => {
  const { t, language } = useLanguage();
  // Find the main Köppen-Geiger entry (usually the first one or one with text)
  const mainClass = classificationData.find(c => c.type === 'K\u00f6ppen-Geiger' && c.text) || classificationData[0];
  
  const gradientClass = getClimateGradient(mainClass?.code);
  const displayText = getDisplayText(mainClass?.text, language);

  return (
    <div className={`bg-gradient-to-br ${gradientClass} rounded-xl shadow-lg text-white p-6 mb-6 transition-all duration-500`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 text-white/80 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{t.selectedLocation}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
             {Math.abs(lat).toFixed(2)}°{lat >= 0 ? 'N' : 'S'}, {Math.abs(lng).toFixed(2)}°{lng >= 0 ? 'E' : 'W'}
          </h2>
        </div>
        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm border border-white/10">
             <span className="block text-xs text-white/80 uppercase tracking-wider font-semibold">{t.code}</span>
             <span className="text-3xl font-bold">{mainClass?.code || 'N/A'}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-white/80 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              {displayText}
            </h3>
            <p className="text-white/70 text-sm mt-1">
              {t.basedOn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};