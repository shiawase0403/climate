import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoLocation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MapPickerProps {
  selectedLocation: GeoLocation | null;
  onLocationSelect: (location: GeoLocation) => void;
}

// Fix for default Leaflet marker icons in React
const icon = L.icon({
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
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
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

export const MapPicker: React.FC<MapPickerProps> = ({ selectedLocation, onLocationSelect }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full h-full min-h-[400px] z-0 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController onSelect={onLocationSelect} />
        <MapFlyTo location={selectedLocation} />
        
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]} 
            icon={icon}
          />
        )}
      </MapContainer>
      
      {!selectedLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 text-sm font-medium text-slate-700 animate-pulse pointer-events-none">
          {t.clickMapHint}
        </div>
      )}
    </div>
  );
};