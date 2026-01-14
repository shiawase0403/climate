import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl, ScaleControl } from 'react-leaflet';
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
      const wrappedLatLng = e.latlng.wrap();
      onSelect({ lat: wrappedLatLng.lat, lng: wrappedLatLng.lng });
    },
  });
  return null;
};

// Component to fly to location when it changes
const MapFlyTo: React.FC<{ location: GeoLocation | null }> = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], map.getZoom(), {
        duration: 1.5
      });
    }
  }, [location, map]);
  return null;
};

export const MapPicker: React.FC<MapPickerProps> = ({ 
  mode, 
  selectedLocation, 
  comparisonPoints = [], 
  onLocationSelect 
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full h-[500px] z-0 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        worldCopyJump={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer name={t.mapLayers.osm}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name={t.mapLayers.gaode}>
            <TileLayer
              attribution='&copy; <a href="https://www.amap.com">GaoDe</a>'
              url="https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name={t.mapLayers.gaodeSat}>
            <TileLayer
              attribution='&copy; <a href="https://www.amap.com">GaoDe</a>'
              url="https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer checked name={t.mapLayers.gaodeEn}>
            <TileLayer
              attribution='&copy; <a href="https://www.amap.com">GaoDe</a>'
              url="https://webrd02.is.autonavi.com/appmaptile?lang=zh_en&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ScaleControl position="bottomleft" />
        <MapController onSelect={onLocationSelect} />
        
        {/* In single mode, fly to the selected location */}
        {mode === 'single' && <MapFlyTo location={selectedLocation} />}
        
        {/* Render markers */}
        {mode === 'single' && selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]} 
            icon={defaultIcon}
          />
        )}

        {mode === 'compare' && comparisonPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.location.lat, point.location.lng]}
            icon={createColoredIcon(point.color)}
            title={`Lat: ${point.location.lat.toFixed(2)}, Lng: ${point.location.lng.toFixed(2)}`}
          />
        ))}
      </MapContainer>
      
      {!selectedLocation && mode === 'single' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 text-sm font-medium text-slate-700 animate-pulse pointer-events-none">
          {t.clickMapHint}
        </div>
      )}
      {mode === 'compare' && comparisonPoints.length < 5 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 text-sm font-medium text-slate-700 pointer-events-none">
          {t.addPoint} ({comparisonPoints.length}/5)
        </div>
      )}
    </div>
  );
};