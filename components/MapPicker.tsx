
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl, ScaleControl, Popup, AttributionControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Shovel, Search, Layers, ChevronDown, ChevronRight, Info, X, Wind, Waves } from 'lucide-react';
import { GeoLocation, MatchReviewDetail } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { EXPLORE_DATA } from '../data/cityData';

// --- Constants & Helpers ---

const CLIMATE_COLORS: Record<string, string> = {
  'Af': '#0000FF', 'Am': '#0077FF', 'Aw': '#46A9FA', 'As': '#46A9FA', 'As/Aw': '#46A9FA',
  'BWh': '#FF0000', 'BWk': '#FF9696', 'BSh': '#F5A500', 'BSk': '#FFDC64',
  'Csa': '#FFFF00', 'Csb': '#C6C700', 'Csc': '#969600',
  'Cwa': '#96FF96', 'Cwb': '#63C764', 'Cwc': '#329633',
  'Cfa': '#C6FFC7', 'Cfb': '#66FF66', 'Cfc': '#33C733',
  'Dsa': '#FF00FF', 'Dsb': '#C700C7', 'Dsc': '#963295', 'Dsd': '#966495',
  'Dwa': '#ABBAD9', 'Dwb': '#5A77DB', 'Dwc': '#4C5169', 'Dwd': '#380094',
  'Dfa': '#00FFFF', 'Dfb': '#38C7FF', 'Dfc': '#007E7E', 'Dfd': '#004545',
  'ET': '#B2B2B2', 'EF': '#686868'
};

const CLIMATE_GROUPS = {
  'A': { color: '#0000FF', codes: ['Af', 'Am', 'Aw', 'As'] },
  'B': { color: '#FF0000', codes: ['BWh', 'BWk', 'BSh', 'BSk'] },
  'C': { color: '#C6FFC7', codes: ['Cfa', 'Cfb', 'Cfc', 'Csa', 'Csb', 'Csc', 'Cwa', 'Cwb', 'Cwc'] },
  'D': { color: '#00FFFF', codes: ['Dfa', 'Dfb', 'Dfc', 'Dfd', 'Dwa', 'Dwb', 'Dwc', 'Dwd', 'Dsa', 'Dsb', 'Dsc'] },
  'E': { color: '#B2B2B2', codes: ['ET', 'EF'] }
};

const GROUP_LABELS: Record<string, { en: string, zh: string }> = {
  'A': { en: 'Tropical (A)', zh: '热带气候 (A)' },
  'B': { en: 'Arid (B)', zh: '干旱半干旱气候 (B)' },
  'C': { en: 'Temperate (C)', zh: '亚热带/温带气候 (C)' },
  'D': { en: 'Continental (D)', zh: '温带亚寒带气候 (D)' },
  'E': { en: 'Polar (E)', zh: '极地气候 (E)' },
};

// Helper to get description from EXPLORE_DATA
const getClimateTitle = (code: string) => {
  const entry = EXPLORE_DATA.find(item => item.code === code);
  return entry ? entry.title : code;
};

// --- Sub-components ---

interface ClimateLegendProps {
  className?: string;
  activeCode?: string | null;
  onCodeClick?: (code: string | null) => void;
}

export const ClimateLegend: React.FC<ClimateLegendProps> = ({ className, activeCode, onCodeClick }) => {
  const { t, language } = useLanguage();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<{code: string, title: string} | null>(null);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroup(curr => curr === groupKey ? null : groupKey);
    // Don't close selected info when switching groups, user might still want to see it
  };

  const handleCodeClick = (code: string) => {
    // Show info toast
    setSelectedInfo({
      code,
      title: getClimateTitle(code)
    });

    // Handle selection toggle
    if (onCodeClick) {
      if (activeCode === code) {
        onCodeClick(null); // Deselect if already active
      } else {
        onCodeClick(code);
      }
    }
  };

  const handleCloseInfo = () => {
    setSelectedInfo(null);
    if (onCodeClick) {
      onCodeClick(null); // Restore to whole map layer
    }
  };

  // Default to absolute positioning if no className provided
  const containerClasses = className || "absolute bottom-8 left-3 z-[1000] max-w-[200px] sm:max-w-[250px]";

  return (
    <div className={`flex flex-col items-start gap-2 ${containerClasses}`}>
      
      {/* Info Toast */}
      {selectedInfo && (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-lg shadow-xl border border-slate-200 mb-2 animate-in slide-in-from-bottom-2 fade-in w-full relative">
          <button 
            onClick={handleCloseInfo}
            className="absolute top-1 right-1 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="w-3 h-3 rounded-full shadow-sm border border-black/10" 
              style={{ backgroundColor: CLIMATE_COLORS[selectedInfo.code] }}
            />
            <span className="font-bold text-slate-800">{selectedInfo.code}</span>
          </div>
          <p className="text-xs text-slate-600 leading-tight">{selectedInfo.title}</p>
        </div>
      )}

      {/* Accordion Container */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden w-full transition-all duration-300">
        <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>{language === 'zh' ? '图例' : 'Legend'}</span>
          <Info className="w-3 h-3" />
        </div>
        
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {(Object.keys(CLIMATE_GROUPS) as Array<keyof typeof CLIMATE_GROUPS>).map((key) => (
            <div key={key} className="border-b border-slate-100 last:border-0">
              <button 
                onClick={() => toggleGroup(key)}
                className={`w-full flex items-center justify-between p-2 text-xs font-medium transition-colors hover:bg-slate-50 ${expandedGroup === key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CLIMATE_GROUPS[key].color }}></div>
                  {GROUP_LABELS[key][language]}
                </div>
                {expandedGroup === key ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
              </button>

              {expandedGroup === key && (
                <div className="bg-slate-50 p-1 grid grid-cols-2 gap-1 animate-in slide-in-from-top-1 duration-200">
                  {CLIMATE_GROUPS[key].codes.map(code => {
                    const isActive = activeCode === code;
                    return (
                      <button
                        key={code}
                        onClick={() => handleCodeClick(code)}
                        className={`flex items-center gap-1.5 p-1.5 rounded transition-all text-left group border ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow-md border-indigo-700' 
                            : 'hover:bg-white hover:shadow-sm border-transparent hover:border-slate-200'
                        }`}
                      >
                        <span 
                          className={`w-3 h-3 rounded-sm shadow-sm flex-shrink-0 ${isActive ? 'border-white border' : ''}`}
                          style={{ backgroundColor: CLIMATE_COLORS[code] }} 
                        />
                        <span className={`text-[10px] font-mono ${isActive ? 'text-white font-bold' : 'text-slate-600 group-hover:text-slate-900 group-hover:font-bold'}`}>
                          {code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Velocity Layer Component ---

interface VelocityLayerProps {
  type: 'wind' | 'current' | 'none';
  month: number;
}

const VelocityLayer: React.FC<VelocityLayerProps> = ({ type, month }) => {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (type === 'none') {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    const loadData = async () => {
      try {
        const year = type === 'wind' ? 2022 : 2025;
        // Use user's URL structure
        const url = `http://climate.hywiki.org/static/velocity/${type}/${year}/${month}.json`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load velocity data");
        const data = await response.json();

        if (layerRef.current) {
          map.removeLayer(layerRef.current);
        }

        if ((window as any).L && (window as any).L.velocityLayer) {
          const isWind = type === 'wind';
          layerRef.current = (window as any).L.velocityLayer({
            displayValues: true,
            displayOptions: {
              velocityType: isWind ? 'Wind' : 'Ocean Current',
              position: 'bottomright',
              emptyString: 'No data',
              angleConvention: 'bearingCW',
              displayEmptyString: 'No data',
              speedUnit: 'm/s'
            },
            data: data,
            maxVelocity: isWind ? 25 : 2.0, // Scale differently for wind vs current
            velocityScale: isWind ? 0.005 : 0.1, // Wind moves fast so smaller scale to look good
            colorScale: isWind ? [
              "rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )", 
              "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)", 
              "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)", 
              "rgb(252,150,75)", "rgb(250,112,52)", "rgb(245,64,32)", 
              "rgb(237,45,28)", "rgb(220,24,32)", "rgb(180,0,35)"
            ] : [
              "rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )",
              "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)",
              "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)"
            ],
            lineWidth: isWind ? 2 : 2
          });
          
          layerRef.current.addTo(map);
        }
      } catch (e) {
        console.error("Velocity layer error:", e);
      }
    };

    loadData();

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [type, month, map]);

  return null;
};

// --- Main MapPicker Component ---

export interface MapPoint {
  id: string;
  location: GeoLocation;
  color: string;
  name?: string;
}

interface MapPickerProps {
  mode: 'single' | 'compare' | 'game' | 'review';
  selectedLocation: GeoLocation | null; // For single mode and game user guess
  comparisonPoints?: MapPoint[];        // For compare mode
  gameTargetLocation?: GeoLocation | null; // For game revealed state
  reviewRoundData?: MatchReviewDetail | null; // For review mode
  onLocationSelect: (location: GeoLocation) => void;
  onAntipodeTrigger?: () => void;
  isMarsMode?: boolean;
  isRetroMode?: boolean;
  isDigging?: boolean;
  onDig?: () => void;
  onAnalyzeGuess?: (lat: number, lng: number, name: string) => void; // New callback for review mode
  isFullScreen?: boolean; // New prop for full screen mode
  
  // Overlay Control Props
  activeOverlay?: 'none' | 'climate' | 'precip';
  onOverlayChange?: (overlay: 'none' | 'climate' | 'precip') => void;
  showLegend?: boolean; // Default true. If false, Legend is NOT rendered inside map (useful if rendered externally)
  
  // Specific Climate Layer Props
  activeClimateCode?: string | null;
  onClimateCodeChange?: (code: string | null) => void;
}

// Custom TileLayer to support QuadKeys for Bing Maps
const QuadKeyTileLayer = ({ url, ...props }: any) => {
  const tileLayerRef = useRef<L.TileLayer>(null);

  useEffect(() => {
    const layer = tileLayerRef.current;
    if (layer) {
      // We capture the original URL with {q} here
      const template = url;
      
      // Override getTileUrl to support 'q' placeholder for QuadKey
      layer.getTileUrl = function(coords: L.Coords) {
        const x = coords.x;
        const y = coords.y;
        const z = coords.z;
        
        // QuadKey conversion logic
        let quadKey = '';
        for (let i = z; i > 0; i--) {
          let digit = 0;
          const mask = 1 << (i - 1);
          if ((x & mask) !== 0) {
            digit++;
          }
          if ((y & mask) !== 0) {
            digit += 2;
          }
          quadKey += digit;
        }
        
        return L.Util.template(template, {
          q: quadKey,
          s: this._getSubdomain(coords),
          x: x,
          y: y,
          z: z
        });
      };
      
      // Force a redraw since the initial render used the safe URL
      layer.redraw();
    }
  }, [url]);

  // Pass a safe URL to the underlying TileLayer to prevent L.Util.template from throwing "No value provided for variable {q}"
  // during the initial render before our useEffect override kicks in.
  const safeUrl = url.replace('{q}', '_q_placeholder_');

  return <TileLayer ref={tileLayerRef} url={safeUrl} {...props} />;
};

// Helper to create a colored DivIcon marker
const createColoredIcon = (color: string, size: number = 32) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  `;
  
  return L.divIcon({
    className: 'custom-map-marker',
    html: svgIcon,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size],
  });
};

// Green Flag Icon for Correct Location
const flagIcon = L.divIcon({
  className: 'custom-map-marker-flag',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" stroke="#064e3b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
      <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [4, 32],
  popupAnchor: [0, -32],
});

// Default blue icon for single mode
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Green icon for Game Correct Location (Generic)
const greenIcon = createColoredIcon('#10b981');
// Red icon for Game User Guess
const redIcon = createColoredIcon('#ef4444');

// Player Colors for Review Mode (Matches PvpGame)
const PLAYER_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16'  // Lime
];

const isValidCoordinate = (lat: any, lng: any) => {
  return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
};

const MapController: React.FC<{ onSelect: (loc: GeoLocation) => void }> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      // wrap() ensures longitude is always normalized to -180 to 180
      const wrappedLatLng = e.latlng.wrap();
      onSelect({ lat: wrappedLatLng.lat, lng: wrappedLatLng.lng });
    },
  });
  return null;
};

// Component to handle map resizing and invalidation to prevent blank tiles
const MapInvalidator: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    // Handler to invalidate size
    const handleResize = () => {
      map.invalidateSize();
    };

    // Use ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(() => {
      // Wrap in requestAnimationFrame to prevent "ResizeObserver loop completed with undelivered notifications"
      requestAnimationFrame(() => {
        handleResize();
      });
    });
    
    // Observe the map container
    const container = map.getContainer();
    if (container) {
      resizeObserver.observe(container);
    }

    // Also trigger immediately and after a short delay to catch initial render issues
    handleResize();
    const timer = setTimeout(handleResize, 200);
    const timer2 = setTimeout(handleResize, 1000); // Safety check

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [map]);

  return null;
};

// Component to fly to location when it changes
const MapFlyTo: React.FC<{ location: GeoLocation | null; mode: string }> = ({ location, mode }) => {
  const map = useMap();
  useEffect(() => {
    // Don't auto-fly in game mode to avoid giving hints, unless it's the very first load or explicit action
    // We only fly to user selection in single mode.
    if (location && mode === 'single' && isValidCoordinate(location.lat, location.lng)) {
      map.flyTo([location.lat, location.lng], 6, { duration: 1.5 });
    }
  }, [location, map, mode]);
  return null;
};

// Component to fit bounds for game result
const GameResultFitter: React.FC<{ guess: GeoLocation | null; target: GeoLocation | null }> = ({ guess, target }) => {
  const map = useMap();
  useEffect(() => {
    if (guess && target && isValidCoordinate(guess.lat, guess.lng) && isValidCoordinate(target.lat, target.lng)) {
      const bounds = L.latLngBounds([
        [guess.lat, guess.lng],
        [target.lat, target.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6, duration: 1 });
    }
  }, [guess, target, map]);
  return null;
};

// Review Mode Fitter
const ReviewFitter: React.FC<{ data: MatchReviewDetail | null }> = ({ data }) => {
  const map = useMap();
  useEffect(() => {
    if (!data) return;
    
    // Ensure numbers for target
    const targetLat = typeof data.city.lat === 'string' ? parseFloat(data.city.lat) : data.city.lat;
    const targetLng = typeof data.city.lon === 'string' ? parseFloat(data.city.lon) : data.city.lon;
    
    if (!isValidCoordinate(targetLat, targetLng)) return;

    const points: [number, number][] = [[targetLat, targetLng]];
    
    data.answers.forEach(a => {
      // Ensure numbers for answers
      const aLat = typeof a.lat === 'string' ? parseFloat(a.lat) : a.lat;
      const aLon = typeof a.lon === 'string' ? parseFloat(a.lon) : a.lon;
      
      if (isValidCoordinate(aLat, aLon)) {
        points.push([aLat, aLon]);
      }
    });
    
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6, duration: 1 });
    }
  }, [data, map]);
  return null;
};

export const MapPicker: React.FC<MapPickerProps> = ({ 
  mode, 
  selectedLocation, 
  comparisonPoints, 
  gameTargetLocation, 
  reviewRoundData,
  onLocationSelect, 
  onAntipodeTrigger, 
  isMarsMode, 
  isRetroMode, 
  isDigging = false, 
  onDig,
  onAnalyzeGuess,
  isFullScreen = false,
  activeOverlay: propActiveOverlay,
  onOverlayChange,
  showLegend = true,
  activeClimateCode: propActiveClimateCode,
  onClimateCodeChange
}) => {
  const { t } = useLanguage();
  const [internalActiveOverlay, setInternalActiveOverlay] = useState<'none' | 'climate' | 'precip'>('none');
  const [internalActiveClimateCode, setInternalActiveClimateCode] = useState<string | null>(null);
  
  // Velocity Layer State
  const [velocityType, setVelocityType] = useState<'none' | 'wind' | 'current'>('none');
  const [velocityMonth, setVelocityMonth] = useState<number>(1);

  // Determine which state to use: controlled (prop) or uncontrolled (internal)
  const activeOverlay = propActiveOverlay !== undefined ? propActiveOverlay : internalActiveOverlay;
  const activeClimateCode = propActiveClimateCode !== undefined ? propActiveClimateCode : internalActiveClimateCode;

  const handleMarkerDblClick = (e: L.LeafletMouseEvent) => {
    if (e.originalEvent.shiftKey && selectedLocation) {
      // Prevent default map zoom behavior
      L.DomEvent.stopPropagation(e.originalEvent);
      if (onDig) onDig();
    }
  };

  // Construct border/shadow classes based on mode
  let containerClasses = "w-full overflow-hidden relative z-0";
  
  if (isFullScreen) {
    containerClasses += " fixed inset-0 h-screen w-screen z-[2000] rounded-none border-0";
  } else {
    containerClasses += " h-[400px] rounded-xl shadow-lg border";
    
    if (mode === 'review') {
      containerClasses = "h-full w-full rounded-none overflow-hidden relative z-0";
    }

    if (isRetroMode) {
      containerClasses += " border-4 border-black shadow-none grayscale-[0.2]";
    } else if (isMarsMode) {
      containerClasses += " border-orange-500 shadow-orange-200";
    } else if (mode !== 'review') {
      containerClasses += " border-slate-200";
    }
  }

  // Retro map filter
  const mapStyle = isRetroMode ? { 
    height: '100%', 
    width: '100%',
    filter: 'contrast(1.3) saturate(1.4) sepia(0.3) hue-rotate(-10deg)',
    imageRendering: 'pixelated' as const
  } : { 
    height: '100%', 
    width: '100%' 
  };

  // Helper to safely parse review coordinates
  const getReviewCoordinates = (): { target: [number, number] | null, answers: { lat: number, lon: number, color: string, username: string, score: number }[] } => {
    if (!reviewRoundData) return { target: null, answers: [] };

    let target: [number, number] | null = null;
    const tLat = typeof reviewRoundData.city.lat === 'string' ? parseFloat(reviewRoundData.city.lat) : reviewRoundData.city.lat;
    const tLon = typeof reviewRoundData.city.lon === 'string' ? parseFloat(reviewRoundData.city.lon) : reviewRoundData.city.lon;
    if (isValidCoordinate(tLat, tLon)) {
      target = [tLat, tLon];
    }

    const answers = reviewRoundData.answers.map((answer, index) => {
      const lat = typeof answer.lat === 'string' ? parseFloat(answer.lat) : answer.lat;
      const lon = typeof answer.lon === 'string' ? parseFloat(answer.lon) : answer.lon;
      if (isValidCoordinate(lat, lon)) {
        return {
          lat,
          lon,
          color: PLAYER_COLORS[index % PLAYER_COLORS.length],
          username: answer.username,
          score: answer.score
        };
      }
      return null;
    }).filter(a => a !== null) as { lat: number, lon: number, color: string, username: string, score: number }[];

    return { target, answers };
  };

  const { target: reviewTarget, answers: reviewAnswers } = mode === 'review' ? getReviewCoordinates() : { target: null, answers: [] };

  // Helper to toggle overlays mutually exclusively
  const toggleOverlay = (type: 'climate' | 'precip') => {
    const nextState = activeOverlay === type ? 'none' : type;
    if (onOverlayChange) {
      onOverlayChange(nextState);
    } else {
      setInternalActiveOverlay(nextState);
    }
    
    // Reset specific climate code when switching main layers internally
    if (!onClimateCodeChange && nextState !== 'climate') {
      setInternalActiveClimateCode(null);
    }
  };

  const handleClimateCodeChange = (code: string | null) => {
    if (onClimateCodeChange) {
      onClimateCodeChange(code);
    } else {
      setInternalActiveClimateCode(code);
    }
  };

  return (
    <div className={containerClasses}>
      {/* Velocity Control Panel - Only for single/compare modes */}
      {!isMarsMode && (mode === 'single' || mode === 'compare') && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-b-xl shadow-md border-b border-x border-slate-300 flex items-center gap-4 transition-all">
           <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">{t.velocity.title}</span>
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                 <button 
                   onClick={() => setVelocityType('none')}
                   className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${velocityType === 'none' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {t.velocity.none}
                 </button>
                 <button 
                   onClick={() => setVelocityType('wind')}
                   className={`px-3 py-1 text-xs rounded-md transition-colors font-medium flex items-center gap-1 ${velocityType === 'wind' ? 'bg-indigo-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   <Wind className="w-3 h-3" />
                   {t.velocity.wind}
                 </button>
                 <button 
                   onClick={() => setVelocityType('current')}
                   className={`px-3 py-1 text-xs rounded-md transition-colors font-medium flex items-center gap-1 ${velocityType === 'current' ? 'bg-blue-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   <Waves className="w-3 h-3" />
                   {t.velocity.current}
                 </button>
              </div>
           </div>
           
           {velocityType !== 'none' && (
             <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <span className="text-xs font-bold uppercase text-slate-500">{t.velocity.month}</span>
                <div className="flex items-center gap-2">
                   <input 
                     type="range" 
                     min="1" 
                     max="12" 
                     value={velocityMonth} 
                     onChange={(e) => setVelocityMonth(parseInt(e.target.value))}
                     className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                   />
                   <span className="text-xs font-mono font-bold w-4 text-center">{velocityMonth}</span>
                </div>
             </div>
           )}
        </div>
      )}

      {/* Custom Overlay Controls - Only show in single/compare modes and when not on Mars */}
      {!isMarsMode && (mode === 'single' || mode === 'compare') && (
        <div className="absolute top-16 left-3 z-[1000] flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-md border border-slate-300 flex flex-col gap-1">
            <div className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-wider flex items-center">
              <Layers className="w-3 h-3 mr-1" /> Overlays
            </div>
            <button 
              onClick={() => toggleOverlay('climate')}
              className={`text-xs px-2 py-1.5 rounded font-medium transition-colors text-left ${
                activeOverlay === 'climate' 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'hover:bg-slate-100 text-slate-700 border border-transparent'
              }`}
            >
              {t.mapLayers.climateLayer}
            </button>
            <button 
              onClick={() => toggleOverlay('precip')}
              className={`text-xs px-2 py-1.5 rounded font-medium transition-colors text-left ${
                activeOverlay === 'precip' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'hover:bg-slate-100 text-slate-700 border border-transparent'
              }`}
            >
              {t.mapLayers.precipLayer}
            </button>
          </div>
        </div>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        style={mapStyle}
        scrollWheelZoom={true}
        worldCopyJump={true}
        attributionControl={false}
        doubleClickZoom={!isDigging} 
        zoomControl={false} 
      >
        <AttributionControl position="bottomright" prefix={false} />
        
        <LayersControl key={isFullScreen ? "fs-layers" : "norm-layers"} position={isFullScreen ? "bottomright" : "topright"}>
          {isMarsMode ? (
            <LayersControl.BaseLayer checked name="Mars Surface">
              <TileLayer
                attribution='&copy; <a href="https://github.com/openplanetary/opm">OpenPlanetary</a>'
                url="https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-1/all/{z}/{x}/{y}.png"
                maxZoom={18}
              />
            </LayersControl.BaseLayer>
          ) : (
            <>
              <LayersControl.BaseLayer name={t.mapLayers.osm}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  noWrap={false}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer checked name={t.mapLayers.gaode}>
                <TileLayer
                  attribution='&copy; AutoNavi'
                  url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
                  subdomains={["1", "2", "3", "4"]}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer checked={!!isRetroMode && !isMarsMode} name={t.mapLayers.gaodeEn}>
                <TileLayer
                  attribution='&copy; AutoNavi'
                  url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=en&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
                  subdomains={["1", "2", "3", "4"]}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name={t.mapLayers.gaodeSat}>
                  <TileLayer
                  attribution='&copy; AutoNavi'
                  url="https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
                  subdomains={["1", "2", "3", "4"]}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name={t.mapLayers.bingSat}>
                <QuadKeyTileLayer
                  attribution='&copy; Microsoft Bing Maps'
                  url="https://ecn.t3.tiles.virtualearth.net/tiles/a{q}.jpeg?g=1"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer checked={!isRetroMode} name={t.mapLayers.bingHybrid}>
                <QuadKeyTileLayer
                  attribution='&copy; Microsoft Bing Maps'
                  url="https://ecn.t3.tiles.virtualearth.net/tiles/h{q}.jpeg?g=1"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name={t.mapLayers.bingStreet}>
                <QuadKeyTileLayer
                  attribution='&copy; Microsoft Bing Maps'
                  url="https://t1.dynamic.tiles.ditu.live.com/comp/ch/{q}?mkt=zh-CN&ur=CN&it=G,RL&n=z&og=804&cstl=vb"
                />
              </LayersControl.BaseLayer>
            </>
          )}
        </LayersControl>

        {/* Active Overlay (Rendered outside LayersControl to manage exclusivity via state) */}
        {!isMarsMode && activeOverlay === 'climate' && (
           activeClimateCode ? (
             <TileLayer 
                key={`climate-${activeClimateCode}`} // Key forces re-render when code changes
                url={`https://climate.hywiki.org/static/maptiles/koeppen-types/${activeClimateCode}/{z}/{x}/{y}.png`} 
                maxNativeZoom={7}
                opacity={0.8}
                zIndex={500}
             />
           ) : (
             <TileLayer 
                url="https://climate.hywiki.org/static/maptiles/koeppen/{z}/{x}/{y}.png" 
                maxNativeZoom={7}
                opacity={0.6}
                zIndex={500}
             />
           )
        )}
        {!isMarsMode && activeOverlay === 'precip' && (
           <TileLayer 
              url="https://climate.hywiki.org/static/maptiles/precipitation/{z}/{x}/{y}.png" 
              maxNativeZoom={7}
              opacity={0.6}
              zIndex={500}
           />
        )}

        {!isMarsMode && <VelocityLayer type={velocityType} month={velocityMonth} />}

        <ScaleControl position="bottomleft" />
        
        {/* Disable click to select if game is already revealed or in review mode */}
        {!gameTargetLocation && mode !== 'review' && <MapController onSelect={onLocationSelect} />}
        
        <MapInvalidator />
        
        {/* Single Mode Marker */}
        {mode === 'single' && selectedLocation && isValidCoordinate(selectedLocation.lat, selectedLocation.lng) && (
          <>
            <Marker 
              position={[selectedLocation.lat, selectedLocation.lng]} 
              icon={defaultIcon} 
              eventHandlers={{
                dblclick: handleMarkerDblClick
              }}
            />
            <MapFlyTo location={selectedLocation} mode={mode} />
          </>
        )}

        {/* Compare Mode OR Game Mode with other players: Render Comparison Points */}
        {(mode === 'compare' || mode === 'game') && comparisonPoints && comparisonPoints.map((point) => (
           isValidCoordinate(point.location.lat, point.location.lng) && (
             <React.Fragment key={point.id}>
               <Marker 
                 position={[point.location.lat, point.location.lng]} 
                 icon={createColoredIcon(point.color)}
               >
                  <Popup closeButton={false} offset={[0, -28]}>
                    <div className="text-xs">
                      {point.name && <div className="font-bold mb-1">{point.name}</div>}
                      <div className="font-mono text-slate-500">
                        {typeof point.location.lat === 'number' ? Math.abs(point.location.lat).toFixed(2) : '0.00'}°, {typeof point.location.lng === 'number' ? Math.abs(point.location.lng).toFixed(2) : '0.00'}°
                      </div>
                    </div>
                  </Popup>
               </Marker>
               
               {/* Draw dotted line to target if in game mode and target is revealed (for opponents) */}
               {mode === 'game' && gameTargetLocation && isValidCoordinate(gameTargetLocation.lat, gameTargetLocation.lng) && (
                  <Polyline 
                    positions={[
                      [point.location.lat, point.location.lng],
                      [gameTargetLocation.lat, gameTargetLocation.lng]
                    ]}
                    dashArray="5, 10"
                    color={point.color}
                    weight={2}
                    opacity={0.5}
                  />
               )}
             </React.Fragment>
           )
        ))}

        {/* Game Mode Specific Markers (User + Target) */}
        {mode === 'game' && (
          <>
            {/* User Guess */}
            {selectedLocation && isValidCoordinate(selectedLocation.lat, selectedLocation.lng) && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={gameTargetLocation ? redIcon : defaultIcon}>
                 {gameTargetLocation && <Popup offset={[0, -28]}>Your Guess</Popup>}
              </Marker>
            )}
            
            {/* Actual Target (Revealed) */}
            {gameTargetLocation && isValidCoordinate(gameTargetLocation.lat, gameTargetLocation.lng) && (
              <>
                <Marker position={[gameTargetLocation.lat, gameTargetLocation.lng]} icon={flagIcon}>
                  <Popup offset={[0, -32]} autoClose={false} closeOnClick={false}>Actual Location</Popup>
                </Marker>
                
                {/* Line connecting them */}
                {selectedLocation && isValidCoordinate(selectedLocation.lat, selectedLocation.lng) && (
                  <Polyline 
                    positions={[
                      [selectedLocation.lat, selectedLocation.lng],
                      [gameTargetLocation.lat, gameTargetLocation.lng]
                    ]}
                    dashArray="10, 10"
                    color="#475569"
                  />
                )}
                <GameResultFitter guess={selectedLocation} target={gameTargetLocation} />
              </>
            )}
          </>
        )}

        {/* Review Mode Markers */}
        {mode === 'review' && reviewRoundData && (
          <>
            {/* Correct Target (Flag or Green Marker) */}
            {reviewTarget && (
              <Marker 
                position={reviewTarget} 
                icon={flagIcon}
                zIndexOffset={1000} // Ensure it's on top
              >
                <Popup offset={[0, -32]} autoClose={false}>
                  <div className="text-center font-bold text-emerald-600">{reviewRoundData.city.city}</div>
                  <div className="text-xs text-slate-500 text-center">{reviewRoundData.city.country}</div>
                </Popup>
              </Marker>
            )}

            {/* Players Guesses */}
            {reviewAnswers.map((answer, index) => {
              // Target is already validated, but check for safety
              if (!reviewTarget) return null;

              return (
                <React.Fragment key={`review-${answer.username}-${index}`}>
                  <Marker 
                    position={[answer.lat, answer.lon]} 
                    icon={createColoredIcon(answer.color, 24)}
                  >
                    <Popup offset={[0, -24]}>
                      <div className="text-xs">
                        <div className="font-bold mb-1" style={{ color: answer.color }}>{answer.username}</div>
                        <div className="font-mono text-slate-500 mb-2">Score: {answer.score}</div>
                        {onAnalyzeGuess && (
                          <button 
                            onClick={() => onAnalyzeGuess(answer.lat, answer.lon, answer.username)}
                            className="flex items-center space-x-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 text-[10px] font-bold w-full justify-center transition-colors"
                          >
                            <Search className="w-3 h-3" />
                            <span>Analyze Climate</span>
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                  <Polyline 
                    positions={[
                      [answer.lat, answer.lon],
                      reviewTarget
                    ]}
                    dashArray="5, 10"
                    color={answer.color}
                    weight={2}
                    opacity={0.8}
                  />
                </React.Fragment>
              );
            })}
            <ReviewFitter data={reviewRoundData} />
          </>
        )}

      </MapContainer>
      
      {/* Precipitation Legend Overlay */}
      {!isMarsMode && activeOverlay === 'precip' && (
        <div 
          style={{
            position: 'absolute',
            bottom: '30px', 
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            maxWidth: '90%',
            height: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '8px',
            padding: '10px',
            backdropFilter: 'blur(5px)',
            pointerEvents: 'none',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}
        >
          <img src="./prec_legend_bar.png" alt="Precipitation Legend" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      )}

      {/* Climate Legend Overlay (Only if enabled internally) */}
      {!isMarsMode && activeOverlay === 'climate' && showLegend && (
        <ClimateLegend 
          activeCode={activeClimateCode}
          onCodeClick={handleClimateCodeChange}
        />
      )}

      {/* Hint Overlay */}
      <div className={`absolute bottom-6 right-14 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-slate-600 pointer-events-none z-[400] hidden sm:block border ${isRetroMode ? 'border-2 border-black font-[inherit]' : 'border border-slate-200'}`}>
        {mode === 'game' && !gameTargetLocation ? t.gameInstructionGuess : t.clickMapHint}
      </div>

      {/* Digging Animation Overlay */}
      {isDigging && (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none animate-in fade-in duration-300">
           <div className="flex flex-col items-center">
              <div className="bg-amber-500 p-6 rounded-full shadow-2xl animate-bounce border-4 border-white">
                 <Shovel className="w-12 h-12 text-white" />
              </div>
              <div className="mt-4 bg-white/90 px-4 py-2 rounded-lg font-bold text-amber-600 shadow-lg animate-pulse">
                 Digging to the other side...
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
