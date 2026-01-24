import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl, ScaleControl, Popup, AttributionControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Shovel, Search } from 'lucide-react';
import { GeoLocation, MatchReviewDetail } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

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
  onAnalyzeGuess 
}) => {
  const { t } = useLanguage();

  const handleMarkerDblClick = (e: L.LeafletMouseEvent) => {
    if (e.originalEvent.shiftKey && selectedLocation) {
      // Prevent default map zoom behavior
      L.DomEvent.stopPropagation(e.originalEvent);
      if (onDig) onDig();
    }
  };

  // Construct border/shadow classes based on mode
  let containerClasses = "h-[400px] w-full rounded-xl overflow-hidden shadow-lg border relative z-0";
  // Adjust height for review mode to fill container
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

  return (
    <div className={containerClasses}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        style={mapStyle}
        scrollWheelZoom={true}
        // Removed maxBounds to allow infinite horizontal scrolling
        // Added worldCopyJump to keep markers in view when panning across worlds
        worldCopyJump={true}
        attributionControl={false}
        doubleClickZoom={!isDigging} // Temporarily disable default dblclick zoom
      >
        <AttributionControl position="bottomright" prefix={false} />
        
        <LayersControl position="topright">
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
             <Marker 
               key={point.id} 
               position={[point.location.lat, point.location.lng]} 
               icon={createColoredIcon(point.color)}
             >
                <Popup closeButton={false} offset={[0, -28]}>
                  <div className="text-xs">
                    {point.name && <div className="font-bold mb-1">{point.name}</div>}
                    <div className="font-mono text-slate-500">
                      {Math.abs(point.location.lat).toFixed(2)}°, {Math.abs(point.location.lng).toFixed(2)}°
                    </div>
                  </div>
                </Popup>
             </Marker>
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
                <Marker position={[gameTargetLocation.lat, gameTargetLocation.lng]} icon={greenIcon}>
                  <Popup offset={[0, -28]} autoClose={false} closeOnClick={false}>Actual Location</Popup>
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
            <Marker 
              position={[
                typeof reviewRoundData.city.lat === 'string' ? parseFloat(reviewRoundData.city.lat) : reviewRoundData.city.lat,
                typeof reviewRoundData.city.lon === 'string' ? parseFloat(reviewRoundData.city.lon) : reviewRoundData.city.lon
              ]} 
              icon={flagIcon}
              zIndexOffset={1000} // Ensure it's on top
            >
              <Popup offset={[0, -32]} autoClose={false}>
                <div className="text-center font-bold text-emerald-600">{reviewRoundData.city.city}</div>
                <div className="text-xs text-slate-500 text-center">{reviewRoundData.city.country}</div>
              </Popup>
            </Marker>

            {/* Players Guesses */}
            {reviewRoundData.answers.map((answer, index) => {
              const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
              const lat = typeof answer.lat === 'string' ? parseFloat(answer.lat) : answer.lat;
              const lon = typeof answer.lon === 'string' ? parseFloat(answer.lon) : answer.lon;
              
              if (!isValidCoordinate(lat, lon)) return null;

              return (
                <React.Fragment key={`review-${answer.userId}-${index}`}>
                  <Marker 
                    position={[lat, lon]} 
                    icon={createColoredIcon(color, 24)}
                  >
                    <Popup offset={[0, -24]}>
                      <div className="text-xs">
                        <div className="font-bold mb-1" style={{ color: color }}>{answer.username}</div>
                        <div className="font-mono text-slate-500 mb-2">Score: {answer.score}</div>
                        {onAnalyzeGuess && (
                          <button 
                            onClick={() => onAnalyzeGuess(lat, lon, answer.username)}
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
                      [lat, lon],
                      [
                        typeof reviewRoundData.city.lat === 'string' ? parseFloat(reviewRoundData.city.lat) : reviewRoundData.city.lat,
                        typeof reviewRoundData.city.lon === 'string' ? parseFloat(reviewRoundData.city.lon) : reviewRoundData.city.lon
                      ]
                    ]}
                    dashArray="5, 10"
                    color={color}
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
      
      {/* Hint Overlay */}
      <div className={`absolute bottom-6 right-14 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-slate-600 pointer-events-none z-[400] hidden sm:block border ${isRetroMode ? 'border-2 border-black font-[inherit]' : 'border border-slate-200'}`}>
        {mode === 'game' && !gameTargetLocation ? t.gameInstructionGuess : t.clickMapHint}
      </div>

      {/* Digging Animation Overlay */}
      {isDigging && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none animate-in fade-in duration-300">
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