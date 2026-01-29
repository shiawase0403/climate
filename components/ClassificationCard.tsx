
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { ClassificationEntry, MonthlyClimateData } from '../types';
import { Info, MapPin, BookOpen, HelpCircle, RotateCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getChineseClimateClassification } from '../services/climateService';
import { getClimateClassification } from '../services/logic';

interface ClassificationCardProps {
  classificationData: ClassificationEntry[] | null;
  lat: number;
  lng: number;
  locationName?: string | null;
  masked?: boolean; // New prop for game mode
  hintRevealed?: boolean; // If true, shows code/description even if masked
  onDig?: () => void; // Trigger for digger mode
  climateData?: MonthlyClimateData[]; // Required for local calculation
  isFastMode?: boolean; // If true, forces local calculation and ignores API classification
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

export const ClassificationCard: React.FC<ClassificationCardProps> = ({ 
  classificationData, 
  lat, 
  lng, 
  locationName, 
  masked = false, 
  hintRevealed = false,
  onDig,
  climateData,
  isFastMode = false
}) => {
  const { t, language } = useLanguage();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [useModifiedLogic, setUseModifiedLogic] = useState(true);

  // In Fast Mode, we always use modified logic
  useEffect(() => {
    if (isFastMode) {
      setUseModifiedLogic(true);
    }
  }, [isFastMode]);

  // Determine API data (Only relevant if not in Fast Mode or as fallback)
  const mainClass = classificationData?.find(c => c.type === 'K\u00f6ppen-Geiger' && c.text) || (classificationData ? classificationData[0] : null);
  const apiCode = mainClass?.code || 'N/A';
  
  // Calculate local code if enabled
  const calculatedCode = useMemo(() => {
    if ((useModifiedLogic || isFastMode) && climateData && climateData.length === 12) {
      const temps = climateData.map(d => d.temp);
      const precips = climateData.map(d => d.prec);
      const c = getClimateClassification(temps, precips, lat);
      return c !== 'N/A' ? c : null;
    }
    return null;
  }, [useModifiedLogic, isFastMode, climateData, lat]);

  const code = isFastMode ? (calculatedCode || 'N/A') : (calculatedCode || apiCode);
  
  // Logic for display text (title)
  let displayText = (!isFastMode && mainClass?.text) ? mainClass.text : null;
  
  // If we rely on calculated code (Fast Mode OR Logic Toggle), derive text
  if ((isFastMode || calculatedCode) && code) {
     if (language === 'zh') {
       const cnText = getChineseClimateClassification(code);
       if (cnText) displayText = cnText;
     } else {
       // In English, use the description map
       const enText = t.climateDescriptions[code];
       if (enText) displayText = enText;
     }
  }

  // Fallback title
  displayText = displayText || (language === 'zh' ? '未知气候' : 'Unknown Climate');
  
  const actualDescription = code ? t.climateDescriptions[code] : null;

  // Determine display State based on masked & hintRevealed
  const isClimateHidden = masked && !hintRevealed;
  
  const displayCode = isClimateHidden ? "??" : code;
  const displayTitle = isClimateHidden ? t.unknownClimate : displayText;
  const displayDescription = isClimateHidden ? t.gameInstruction : actualDescription;
  
  // Background logic
  const bgColor = isClimateHidden ? '#475569' : getClimateColor(code);
  const gradientEnd = isClimateHidden ? '#1e293b' : adjustBrightness(bgColor, -20);
  
  // Brightness check for text contrast
  const isBright = (!isClimateHidden && code) ? BRIGHT_CLIMATE_CODES.includes(code) : false;
  
  const locationHeader = masked ? t.mysteryLocation : (locationName || `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`);
  const locationSubtext = masked ? "??.??°N/S, ??.??°E/W" : `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;

  // Styles
  const textColorClass = isBright ? 'text-[rgba(0,0,0,0.85)]' : 'text-white';
  const subTextClass = isBright ? 'text-[rgba(0,0,0,0.6)]' : (isClimateHidden ? 'text-white/70' : 'text-white/90');
  const iconClass = isBright ? 'text-[rgba(0,0,0,0.7)]' : 'text-white';
  
  const badgeBgClass = isBright 
    ? 'bg-black/5 border-black/10 backdrop-blur-md' 
    : 'bg-black/10 border-white/20 backdrop-blur-md shadow-sm';
    
  const dividerClass = isBright ? 'border-black/10' : 'border-white/30';
  
  const descriptionBgClass = isBright 
    ? 'bg-white/40 border-black/5 backdrop-blur-sm'
    : 'bg-black/10 border-white/20 backdrop-blur-sm';

  const textShadowStyle = (isBright || isClimateHidden) ? {} : {
    textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'
  };

  // Golden Glow Effect for Modified Logic
  const modifiedGlowStyle = ((useModifiedLogic || isFastMode) && !isClimateHidden) ? {
    textShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24, 0 0 30px #f59e0b',
    color: '#ffffff'
  } : {};

  const toggleLogic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFastMode) return; // Disable toggle in Fast Mode
    if (!isClimateHidden && climateData && climateData.length === 12) {
      setUseModifiedLogic(prev => !prev);
    }
  };

  const startPress = () => {
    if (onDig && !timerRef.current) {
      timerRef.current = setTimeout(() => {
        onDig();
        timerRef.current = null;
      }, 3000);
    }
  };

  const endPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div 
      className={`rounded-xl shadow-lg p-6 mb-6 transition-all duration-500 ${textColorClass}`}
      style={{ 
        background: `linear-gradient(135deg, ${bgColor} 0%, ${gradientEnd} 100%)`,
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchMove={endPress}
      onContextMenu={(e) => {
        // Prevent context menu if using long press for digging
        if (onDig) e.preventDefault();
      }}
    >
      <div className="flex items-start justify-between">
        <div style={textShadowStyle}>
          <div className={`flex items-center space-x-2 mb-1 ${subTextClass}`}>
            <MapPin className="w-4 h-4" style={(!isBright && !isClimateHidden) ? { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' } : {}} />
            <span className="text-sm font-medium">{t.selectedLocation}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center">
             {masked && <HelpCircle className={`w-6 h-6 mr-2 ${isClimateHidden ? 'animate-pulse' : ''}`} />}
             {locationHeader}
          </h2>
          <p className={`text-sm ${subTextClass} -mt-2 mb-4 font-mono`}>
             {locationSubtext}
          </p>
        </div>
        
        <div 
           className={`${badgeBgClass} p-3 rounded-lg border transition-all duration-300 relative group ${!isClimateHidden && !isFastMode && climateData ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
           onClick={toggleLogic}
        >
             <div className="flex items-center justify-between space-x-2 mb-1">
                <span className={`block text-xs uppercase tracking-wider font-semibold ${subTextClass}`} style={textShadowStyle}>{t.code}</span>
                {useModifiedLogic && !isClimateHidden && !isFastMode && (
                  <RotateCw className="w-3 h-3 text-amber-300 animate-spin-slow" />
                )}
             </div>
             <span className="text-3xl font-bold" style={{...textShadowStyle, ...modifiedGlowStyle}}>{displayCode}</span>
             
             {!isClimateHidden && climateData && !isFastMode && (
               <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-black/70 text-white px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
                 {useModifiedLogic ? 'Using Modified Logic' : 'Click to Switch Logic'}
               </div>
             )}
             
             {isFastMode && (
               <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[9px] bg-black/40 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-60">
                 Fast Mode
               </div>
             )}
        </div>
      </div>
      
      <div className={`mt-4 pt-4 border-t ${dividerClass}`}>
        <div className="flex items-start space-x-3 mb-3" style={textShadowStyle}>
          <Info className={`w-5 h-5 mt-1 flex-shrink-0 ${iconClass}`} style={(!isBright && !isClimateHidden) ? { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' } : {}} />
          <div>
            <h3 className="text-lg font-semibold">
              {displayTitle}
            </h3>
            <p className={`text-sm mt-1 ${subTextClass}`}>
              {isClimateHidden 
                ? t.gameInstruction 
                : ((useModifiedLogic || isFastMode) && calculatedCode 
                    ? 'Based on Modified Peel et al. 2007 Logic' 
                    : t.basedOn)}
            </p>
          </div>
        </div>

        {displayDescription && displayDescription !== displayTitle && (
           <div className={`mt-4 rounded-lg p-3 border flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300 ${descriptionBgClass}`}>
             <BookOpen className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconClass}`} style={(!isBright && !isClimateHidden) ? { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' } : {}} />
             <p className="text-sm leading-relaxed font-medium" style={textShadowStyle}>
               {displayDescription}
             </p>
           </div>
        )}
      </div>
    </div>
  );
};
