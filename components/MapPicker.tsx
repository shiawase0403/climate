import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl, ScaleControl } from 'react-leaflet';
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
      // Wrap the coordinates to ensure longitude is between -180 and 180
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

export const MapPicker: React.FC<MapPickerProps> = ({ selectedLocation, onLocationSelect }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full h-[500px] z-0 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        worldCopyJump={true} // Helps with markers/layers when panning across the date line
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