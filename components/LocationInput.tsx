
import React, { useState, useEffect } from 'react';
import { Search, Compass } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { GeoLocation } from '../types';

interface LocationInputProps {
  onLocationSelect: (location: GeoLocation) => void;
  selectedLocation: GeoLocation | null;
}

export const LocationInput: React.FC<LocationInputProps> = ({ onLocationSelect, selectedLocation }) => {
  const { t } = useLanguage();
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Update inputs when map selection changes
  useEffect(() => {
    if (selectedLocation && typeof selectedLocation.lat === 'number' && typeof selectedLocation.lng === 'number') {
      setLat(selectedLocation.lat.toFixed(4));
      setLng(selectedLocation.lng.toFixed(4));
    }
  }, [selectedLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError(t.invalidLat);
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError(t.invalidLng);
      return;
    }

    onLocationSelect({ lat: latNum, lng: lngNum });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center space-x-2 mb-3 text-slate-800 font-semibold">
        <Compass className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm">{t.manualInputTitle}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">{t.latitude}</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">{t.longitude}</label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
            />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-xs mb-3 font-medium">{error}</p>}
        
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t.searchLocation}</span>
        </button>
      </form>
    </div>
  );
};
