import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl, ScaleControl, Popup, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import { GeoLocation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export interface MapPoint {
  id: string;
  location: GeoLocation;
  color: string;
}

interface MapPickerProps {
  mode: 'single' | 'compare';
  selectedLocation: GeoLocation | null; // For single mode
  comparisonPoints?: MapPoint[];        // For compare mode
  onLocationSelect: (location: GeoLocation) => void;
}

// Helper to create a colored DivIcon marker
const createColoredIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  `;
  
  return L.divIcon({
    className: 'custom-map-marker',
    html: svgIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

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
const MapFlyTo: React.FC<{ location: GeoLocation | null }> = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      // We use noMoveStart: true to avoid interrupting user interaction if they are dragging
      // But typically we want to center. 
      map.flyTo([location.lat, location.lng], 6, { duration: 1.5 });
    }
  }, [location, map]);
  return null;
};

export const MapPicker: React.FC<MapPickerProps> = ({ mode, selectedLocation, comparisonPoints, onLocationSelect }) => {
  const { t } = useLanguage();

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 relative z-0">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        // Removed maxBounds to allow infinite horizontal scrolling
        // Added worldCopyJump to keep markers in view when panning across worlds
        worldCopyJump={true}
        attributionControl={false}
      >
        <AttributionControl position="bottomright" prefix={false} />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name={t.mapLayers.osm}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={false}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={t.mapLayers.gaode}>
            <TileLayer
              attribution='&copy; AutoNavi'
              url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
              subdomains={["1", "2", "3", "4"]}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={t.mapLayers.gaodeEn}>
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
        </LayersControl>

        <ScaleControl position="bottomleft" />
        
        <MapController onSelect={onLocationSelect} />
        <MapInvalidator />
        
        {/* Single Mode Marker */}
        {mode === 'single' && selectedLocation && (
          <>
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={defaultIcon} />
            <MapFlyTo location={selectedLocation} />
          </>
        )}

        {/* Compare Mode Markers */}
        {mode === 'compare' && comparisonPoints && comparisonPoints.map((point) => (
           <Marker 
             key={point.id} 
             position={[point.location.lat, point.location.lng]} 
             icon={createColoredIcon(point.color)}
           >
              <Popup closeButton={false} offset={[0, -28]}>
                <div className="font-semibold text-xs">
                  {Math.abs(point.location.lat).toFixed(2)}°, {Math.abs(point.location.lng).toFixed(2)}°
                </div>
              </Popup>
           </Marker>
        ))}
      </MapContainer>
      
      {/* Hint Overlay */}
      <div className="absolute bottom-6 right-14 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-slate-600 pointer-events-none z-[400] hidden sm:block border border-slate-200">
        {t.clickMapHint}
      </div>
    </div>
  );
};