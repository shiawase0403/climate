import React from 'react';
import { ClassificationEntry } from '../types';
import { Info, MapPin, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getChineseClimateClassification } from '../services/climateService';

interface ClassificationCardProps {
  classificationData: ClassificationEntry[];
  lat: number;
  lng: number;
  locationName?: string | null;
}

const CLIMATE_COLORS: Record<string, string> = {
  'Af': '#0000FF',
  'Am': '#0077FF',
  'Aw': '#46A9FA',
  'As': '#46A9FA',
  'As/Aw': '#46A9FA',
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

const getClimateColor = (code: string | undefined): string => {
  if (!code) return '#475569'; // slate-600
  // Handle some variations if necessary, or default to the map
  return CLIMATE_COLORS[code] || '#475569';
};

// Helper to adjust brightness of a hex color (positive percent lights, negative darkens)
const adjustBrightness = (hex: string, percent: number): string => {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  
  const num = parseInt(cleanHex, 16);
  const amt = Math.round(2.55 * percent);
  
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;

  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
};

// Codes that should display dark text because their background color is too bright
// Specifically: Csa (Yellow), Cfa (Light Green), Cwa (Light Green), Dfa (Cyan)
const BRIGHT_CLIMATE_CODES = ['Csa', 'Cfa', 'Cwa', 'Dfa'];

export const ClassificationCard: React.FC<ClassificationCardProps> = ({ classificationData, lat, lng, locationName }) => {
  const { t, language } = useLanguage();
  // Find the main Köppen-Geiger entry (usually the first one or one with text)
  const mainClass = classificationData.find(c => c.type === 'K\u00f6ppen-Geiger' && c.text) || classificationData[0];
  
  const bgColor = getClimateColor(mainClass?.code);
  
  // Determine if we should use dark text based on the specific code list
  const isBright = mainClass?.code ? BRIGHT_CLIMATE_CODES.includes(mainClass.code) : false;
  
  // Generate a slightly darker version for the gradient end
  const gradientEnd = adjustBrightness(bgColor, -20);
  
  // Determine display text
  let displayText = mainClass?.text;
  
  if (language === 'zh' && mainClass?.code) {
    const cnText = getChineseClimateClassification(mainClass.code);
    if (cnText) displayText = cnText;
  }

  displayText = displayText || (language === 'zh' ? '未知气候' : 'Unknown Climate');

  // Specific description if available
  const description = mainClass?.code ? t.climateDescriptions[mainClass.code] : null;

  // Dynamic styles based on brightness
  const textColorClass = isBright ? 'text-[rgba(0,0,0,0.85)]' : 'text-white';
  const subTextClass = isBright ? 'text-[rgba(0,0,0,0.6)]' : 'text-white/90';
  const iconClass = isBright ? 'text-[rgba(0,0,0,0.7)]' : 'text-white';
  
  // For bright backgrounds, use a dark-ish translucent background for badges to maintain contrast
  // For dark backgrounds, use light-ish translucent
  const badgeBgClass = isBright 
    ? 'bg-black/5 border-black/10 backdrop-blur-md' 
    : 'bg-black/10 border-white/20 backdrop-blur-md shadow-sm';
    
  const dividerClass = isBright ? 'border-black/10' : 'border-white/30';
  
  const descriptionBgClass = isBright 
    ? 'bg-white/40 border-black/5 backdrop-blur-sm'
    : 'bg-black/10 border-white/20 backdrop-blur-sm';

  // Handsome text shader (Shadow) only when text is white to ensure pop
  const textShadowStyle = isBright ? {} : {
    textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'
  };

  return (
    <div 
      className={`rounded-xl shadow-lg p-6 mb-6 transition-all duration-500 ${textColorClass}`}
      style={{ 
        background: `linear-gradient(135deg, ${bgColor} 0%, ${gradientEnd} 100%)` 
      }}
    >
      <div className="flex items-start justify-between">
        <div style={textShadowStyle}>
          <div className={`flex items-center space-x-2 mb-1 ${subTextClass}`}>
            <MapPin className="w-4 h-4" style={isBright ? {} : { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
            <span className="text-sm font-medium">{t.selectedLocation}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
             {locationName ? locationName : `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`}
          </h2>
          {locationName && (
             <p className={`text-sm ${subTextClass} -mt-2 mb-4`}>
                {Math.abs(lat).toFixed(2)}°{lat >= 0 ? 'N' : 'S'}, {Math.abs(lng).toFixed(2)}°{lng >= 0 ? 'E' : 'W'}
             </p>
          )}
        </div>
        <div className={`${badgeBgClass} p-3 rounded-lg border`}>
             <span className={`block text-xs uppercase tracking-wider font-semibold ${subTextClass}`} style={textShadowStyle}>{t.code}</span>
             <span className="text-3xl font-bold" style={textShadowStyle}>{mainClass?.code || 'N/A'}</span>
        </div>
      </div>
      
      <div className={`mt-4 pt-4 border-t ${dividerClass}`}>
        <div className="flex items-start space-x-3 mb-3" style={textShadowStyle}>
          <Info className={`w-5 h-5 mt-1 flex-shrink-0 ${iconClass}`} style={isBright ? {} : { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
          <div>
            <h3 className="text-lg font-semibold">
              {displayText}
            </h3>
            <p className={`text-sm mt-1 ${subTextClass}`}>
              {t.basedOn}
            </p>
          </div>
        </div>

        {/* Dynamic Description if available */}
        {description && (
           <div className={`mt-4 rounded-lg p-3 border flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300 ${descriptionBgClass}`}>
             <BookOpen className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconClass}`} style={isBright ? {} : { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
             <p className="text-sm leading-relaxed font-medium" style={textShadowStyle}>
               {description}
             </p>
           </div>
        )}
      </div>
    </div>
  );
};