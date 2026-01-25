import React, { useState, useEffect } from 'react';
import { MapPicker } from '../components/MapPicker';
import { ClimateChart } from '../components/ClimateChart';
import { ClimateTable } from '../components/ClimateTable';
import { ClassificationCard } from '../components/ClassificationCard';
import { VegetationCard } from '../components/VegetationCard';
import { LocationInput } from '../components/LocationInput';
import { CitySearchBox } from '../components/CitySearchBox';
import { ExploreMenu } from '../components/ExploreMenu';
import { CityAnalysisCard } from '../components/CityAnalysisCard';
import { fetchClimateData, fetchClassification } from '../services/climateService';
import { findNearestCity } from '../services/csvService';
import { generatePDF } from '../services/pdfService';
import { GeoLocation, ClimateDataResponse, ClassificationResponse, CityDefinition } from '../types';
import { Map as MapIcon, Loader2, AlertCircle, Waves, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';

// Mars Mock Data (Moved here or imported)
const generateMarsData = (): ClimateDataResponse => ({
  results: { location: { lat: '0', lon: '0' } },
  status: 'OK',
  data: Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    temp: -55 + Math.cos((i - 6) * Math.PI / 6) * 35,
    prec: 0
  }))
});

const MARS_CLASSIFICATION: ClassificationResponse = {
  results: { lat: '0', lon: '0', version: '1.0' },
  status: 'OK',
  data: [{ type: 'K\u00f6ppen-Geiger', code: 'Alien-X', short: 'Mars', text: 'Martian Desert' }]
};

export const AnalysisPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { isMarsMode, setIsMarsMode, isRetroMode, primaryColor } = useTheme();
  const { showNotification } = useNotification();

  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [climateData, setClimateData] = useState<ClimateDataResponse | null>(null);
  const [classification, setClassification] = useState<ClassificationResponse | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityDefinition | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [isDigging, setIsDigging] = useState(false);
  const [isAntipodeJump, setIsAntipodeJump] = useState(false);

  // Data Fetching Effect
  useEffect(() => {
    const loadData = async () => {
      if (isMarsMode) {
        setClimateData(generateMarsData());
        setClassification(MARS_CLASSIFICATION);
        return;
      }

      if (!selectedLocation) return;

      setLoading(true);
      setError(null);
      setClimateData(null);
      setClassification(null);

      try {
        const [climateRes, classRes] = await Promise.all([
          fetchClimateData(selectedLocation.lat, selectedLocation.lng),
          fetchClassification(selectedLocation.lat, selectedLocation.lng)
        ]);

        setClimateData(climateRes);
        setClassification(classRes);
        
        // Handle city name and Antipode logic
        let cityName = null;
        if (!locationName) {
           cityName = await findNearestCity(selectedLocation.lat, selectedLocation.lng);
           if (cityName) setLocationName(cityName);
        } else {
           cityName = locationName;
        }

        if (isAntipodeJump) {
          if (cityName) {
            showNotification(`You dug through the earth! Welcome to ${cityName}.`, 'success');
          } else {
            showNotification("You dug through the earth! ... Splash! You hit the ocean.", 'ocean');
          }
          setIsAntipodeJump(false);
        }

      } catch (err) {
        console.error(err);
        if (isAntipodeJump) {
             showNotification("You dug through the earth! ... Splash! You hit the ocean.", 'ocean');
             setIsAntipodeJump(false);
             setError(null);
        } else {
             setError(t.errorText);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedLocation, isMarsMode, t, isAntipodeJump, locationName, showNotification]);

  const handleManualLocationSelect = (location: GeoLocation) => {
    if (location.name === 'Mars') {
      setIsMarsMode(true);
      setSelectedLocation(location);
      setLocationName('Mars, The Red Planet');
      return;
    }
    if (isMarsMode) setIsMarsMode(false);

    setSelectedLocation(location);
    setSelectedCity(null);
    if (location.name) setLocationName(location.name);
    else setLocationName(null);
  };

  const handleExploreCitySelect = (city: CityDefinition) => {
    setIsMarsMode(false);
    const location = { lat: city.lat, lng: city.lng };
    setSelectedLocation(location);
    setSelectedCity(city);
    setLocationName(`${city.name}, ${city.country}`);
    findNearestCity(city.lat, city.lng); // ping tracking
  };

  const handleDig = () => {
    if (!selectedLocation) return;
    setIsDigging(true);
    setTimeout(() => {
      setIsDigging(false);
      setIsAntipodeJump(true);
      const lat = selectedLocation.lat;
      const lng = selectedLocation.lng;
      const antiLat = -lat;
      let antiLng = lng + 180;
      if (antiLng > 180) antiLng -= 360;
      handleManualLocationSelect({ lat: antiLat, lng: antiLng });
    }, 1500);
  };

  const handleAntipodeTrigger = () => {
    setIsAntipodeJump(true);
  };

  const handleDownloadReport = async () => {
    if (!selectedLocation || !climateData || !classification) return;
    setGeneratingPdf(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      await generatePDF(selectedLocation, climateData, classification, language, t, locationName);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const hasData = climateData && climateData.data && climateData.data.length > 0;

  return (
    <>
      <div className="lg:col-span-5 lg:sticky lg:top-24">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <MapIcon className={`w-5 h-5 ${primaryColor}`} />
            <h2 className="text-lg font-semibold text-slate-800">{t.selectLocation}</h2>
          </div>
          <p className="text-sm text-slate-500">{t.instructionMap}</p>
        </div>

        <ExploreMenu onSelectCity={handleExploreCitySelect} />
        <CitySearchBox onLocationSelect={handleManualLocationSelect} />
        <LocationInput onLocationSelect={handleManualLocationSelect} selectedLocation={selectedLocation} />
        
        <MapPicker 
          mode="single"
          selectedLocation={selectedLocation}
          onLocationSelect={handleManualLocationSelect}
          onAntipodeTrigger={handleAntipodeTrigger}
          isMarsMode={isMarsMode}
          isRetroMode={isRetroMode}
          isDigging={isDigging}
          onDig={handleDig}
        />
      </div>

      <div className="lg:col-span-7">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-slate-100 mb-6">
            <Loader2 className={`w-10 h-10 ${primaryColor} animate-spin mb-4`} />
            <p className="text-slate-600 font-medium">{t.loading}</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-4 mb-6">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-semibold">{t.errorTitle}</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!selectedLocation && (
          <div className="min-h-[500px] h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
            <div className={`${isMarsMode ? 'bg-orange-50' : 'bg-indigo-50'} p-4 rounded-full mb-4`}>
              <MapIcon className={`w-8 h-8 ${isMarsMode ? 'text-orange-400' : 'text-indigo-400'}`} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">{t.noLocationTitle}</h3>
            <p className="text-slate-500 max-w-xs mt-2">{t.noLocationText}</p>
          </div>
        )}

        {selectedLocation && !loading && !error && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!hasData && climateData && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 flex flex-col items-center text-center">
                <Waves className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-blue-900 font-semibold text-lg">{t.noDataTitle}</h3>
                <p className="text-blue-700 mt-2 max-w-sm">{t.noDataText}</p>
              </div>
            )}

            {hasData && climateData && classification && (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={handleDownloadReport}
                    disabled={generatingPdf}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>{generatingPdf ? t.generating : t.downloadReport}</span>
                  </button>
                </div>
                
                {selectedCity && <CityAnalysisCard city={selectedCity} />}

                <ClassificationCard 
                  classificationData={classification.data} 
                  lat={selectedLocation.lat} 
                  lng={selectedLocation.lng}
                  locationName={locationName} 
                  onDig={handleDig}
                  climateData={climateData.data}
                />
                
                <ClimateChart data={climateData.data} locationName={locationName} />
                <ClimateTable data={climateData.data} locationName={locationName} />
                <VegetationCard classificationData={classification.data} />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
