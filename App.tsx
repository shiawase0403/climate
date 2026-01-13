import React, { useState, useEffect } from 'react';
import { MapPicker } from './components/MapPicker';
import { ClimateChart } from './components/ClimateChart';
import { ClimateTable } from './components/ClimateTable';
import { ClassificationCard } from './components/ClassificationCard';
import { fetchClimateData, fetchClassification } from './services/climateService';
import { GeoLocation, ClimateDataResponse, ClassificationResponse } from './types';
import { CloudRain, Map as MapIcon, Loader2, AlertCircle, Waves, Languages } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [climateData, setClimateData] = useState<ClimateDataResponse | null>(null);
  const [classification, setClassification] = useState<ClassificationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const loadData = async () => {
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
      } catch (err) {
        console.error(err);
        setError(t.errorText);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedLocation, t]);

  const hasData = climateData && climateData.data && climateData.data.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[1001]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <CloudRain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">{t.appTitle}</h1>
            <h1 className="text-lg font-bold text-slate-900 sm:hidden">Climate Explorer</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-sm font-medium"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'en' ? '中文' : 'English'}</span>
            </button>
            <div className="text-sm text-slate-500 hidden md:block">
              {t.providedBy}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Map */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="flex items-center space-x-2 mb-4">
              <MapIcon className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">{t.selectLocation}</h2>
            </div>
            <MapPicker 
              selectedLocation={selectedLocation} 
              onLocationSelect={setSelectedLocation} 
            />
            <p className="mt-3 text-sm text-slate-500">
              {t.instructionMap}
            </p>
          </div>

          {/* Right Column: Data */}
          <div className="lg:col-span-7">
            {!selectedLocation ? (
              <div className="min-h-[500px] h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                <div className="bg-indigo-50 p-4 rounded-full mb-4">
                  <MapIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">{t.noLocationTitle}</h3>
                <p className="text-slate-500 max-w-xs mt-2">
                  {t.noLocationText}
                </p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Loading State */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-slate-100">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                    <p className="text-slate-600 font-medium">{t.loading}</p>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-4">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-red-800 font-semibold">{t.errorTitle}</h3>
                      <p className="text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* No Data State (Ocean) */}
                {!loading && !error && !hasData && climateData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 flex flex-col items-center text-center">
                    <Waves className="w-12 h-12 text-blue-500 mb-4" />
                    <h3 className="text-blue-900 font-semibold text-lg">{t.noDataTitle}</h3>
                    <p className="text-blue-700 mt-2 max-w-sm">
                      {t.noDataText}
                    </p>
                  </div>
                )}

                {/* Data Display */}
                {!loading && !error && hasData && climateData && classification && (
                  <>
                    <ClassificationCard 
                      classificationData={classification.data} 
                      lat={selectedLocation.lat} 
                      lng={selectedLocation.lng} 
                    />
                    
                    <ClimateChart data={climateData.data} />
                    
                    <ClimateTable data={climateData.data} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;