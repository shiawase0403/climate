import React, { useState, useEffect } from 'react';
import { MapPicker, MapPoint } from './components/MapPicker';
import { ClimateChart } from './components/ClimateChart';
import { ClimateTable } from './components/ClimateTable';
import { ClassificationCard } from './components/ClassificationCard';
import { LocationInput } from './components/LocationInput';
import { ComparisonChart } from './components/ComparisonChart';
import { ExploreMenu } from './components/ExploreMenu';
import { CityAnalysisCard } from './components/CityAnalysisCard';
import { fetchClimateData, fetchClassification } from './services/climateService';
import { generatePDF, generateComparisonPDF } from './services/pdfService';
import { GeoLocation, ClimateDataResponse, ClassificationResponse, ComparisonPoint, CityDefinition } from './types';
import { CloudRain, Map as MapIcon, Loader2, AlertCircle, Waves, Languages, Download, SplitSquareHorizontal, MousePointerClick, X, Trash2, BookOpen } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

type AppMode = 'single' | 'compare';

const PALETTE = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
];

// Footer Notice Component
const NoticeFooter: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="mt-16 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 border-l-4 border-l-amber-500">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-full flex-shrink-0 mt-1">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 w-full">
          <h3 className="text-lg font-bold text-slate-800 mb-2">{t.notice.title}</h3>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed max-w-4xl">
            {t.notice.description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-100 pt-6">
            {/* Major Types */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.notice.groupMajor}</h4>
              <ul className="space-y-2.5">
                {(['A', 'B', 'C', 'D', 'E'] as const).map(code => (
                   <li key={code} className="flex items-start text-sm">
                     <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-center mr-3 min-w-[32px]">{code}</span>
                     <span className="text-slate-700 pt-0.5">{t.notice.keys[code]}</span>
                   </li>
                ))}
              </ul>
            </div>

            {/* Precipitation */}
            <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.notice.groupPrecip}</h4>
               <ul className="space-y-2.5">
                 {(['f', 'w', 's'] as const).map(code => (
                   <li key={code} className="flex items-start text-sm">
                     <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-center mr-3 min-w-[32px]">{code}</span>
                     <span className="text-slate-700 pt-0.5">{t.notice.keys[code]}</span>
                   </li>
                 ))}
               </ul>
            </div>
            
            {/* Temperature */}
            <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.notice.groupTemp}</h4>
               <ul className="space-y-2.5">
                 {(['a', 'b', 'c', 'd'] as const).map(code => (
                   <li key={code} className="flex items-start text-sm">
                     <span className="font-mono font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded text-center mr-3 min-w-[32px]">{code}</span>
                     <span className="text-slate-700 pt-0.5">{t.notice.keys[code]}</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// About Footer Component
const AboutFooter: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="mt-8 py-6 border-t border-slate-200 text-center">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t.aboutUs.title}</h3>
      <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-8 text-sm text-slate-500 font-medium">
        <span className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
          {t.aboutUs.design}
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
          {t.aboutUs.geo}
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
          {t.aboutUs.server}
        </span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  
  // State
  const [mode, setMode] = useState<AppMode>('single');
  
  // Single Mode State
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [climateData, setClimateData] = useState<ClimateDataResponse | null>(null);
  const [classification, setClassification] = useState<ClassificationResponse | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityDefinition | null>(null);
  
  // Comparison Mode State
  const [comparePoints, setComparePoints] = useState<ComparisonPoint[]>([]);

  // Shared State
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Single Mode Logic ---
  useEffect(() => {
    const loadData = async () => {
      if (mode !== 'single' || !selectedLocation) return;

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
  }, [selectedLocation, mode, t]);

  const handleManualLocationSelect = (location: GeoLocation) => {
    setSelectedLocation(location);
    setSelectedCity(null); // Clear city analysis if manual pick
  };

  const handleExploreCitySelect = (city: CityDefinition) => {
    const location = { lat: city.lat, lng: city.lng };
    setSelectedLocation(location);
    setSelectedCity(city);
  };

  // --- Comparison Mode Logic ---
  const handleComparisonLocationSelect = async (location: GeoLocation) => {
    if (comparePoints.length >= 5) {
      // Optional: Show toast or alert that max is reached
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const climateRes = await fetchClimateData(location.lat, location.lng);
      
      // Check for valid data (if ocean, api might return empty data)
      if (!climateRes.data || climateRes.data.length === 0) {
         setError(t.noDataText);
         setLoading(false);
         return;
      }

      // Find the first available color
      const usedColors = new Set(comparePoints.map(p => p.color));
      const nextColor = PALETTE.find(c => !usedColors.has(c)) || PALETTE[0];

      const newPoint: ComparisonPoint = {
        id: Date.now().toString(),
        location: location,
        data: climateRes,
        color: nextColor
      };

      setComparePoints(prev => [...prev, newPoint]);
    } catch (err) {
      console.error(err);
      setError(t.errorText);
    } finally {
      setLoading(false);
    }
  };

  const removeComparePoint = (id: string) => {
    setComparePoints(prev => prev.filter(p => p.id !== id));
  };

  const clearComparePoints = () => {
    setComparePoints([]);
    setError(null);
  };

  // --- Handlers ---
  const handleDownloadReport = async () => {
    if (!selectedLocation || !climateData || !classification) return;
    
    setGeneratingPdf(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      await generatePDF(selectedLocation, climateData, classification, language, t);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadComparisonReport = async () => {
    if (comparePoints.length === 0) return;

    setGeneratingPdf(true);
    try {
       await new Promise(resolve => setTimeout(resolve, 100));
       await generateComparisonPDF(comparePoints, language, t);
    } catch (e) {
      console.error("Comparison PDF generation failed", e);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const hasDataSingle = climateData && climateData.data && climateData.data.length > 0;

  // Map points for the picker in compare mode
  const mapPoints: MapPoint[] = comparePoints.map(p => ({
    id: p.id,
    location: p.location,
    color: p.color
  }));

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
             {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setMode('single')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  mode === 'single' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <MousePointerClick className="w-4 h-4" />
                <span className="hidden sm:inline">{t.modeSingle}</span>
              </button>
              <button
                onClick={() => setMode('compare')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  mode === 'compare' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <SplitSquareHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">{t.modeCompare}</span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            <button 
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-sm font-medium"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'en' ? '中文' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-auto">
          
          {/* Left Column: Input & Map */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            
            {/* Context Header for Left Column */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-1">
                <MapIcon className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  {mode === 'single' ? t.selectLocation : t.compareTitle}
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                {mode === 'single' ? t.instructionMap : t.compareIntro}
              </p>
            </div>

            {mode === 'single' && (
              <>
                <ExploreMenu onSelectCity={handleExploreCitySelect} />
                <LocationInput 
                  onLocationSelect={handleManualLocationSelect} 
                  selectedLocation={selectedLocation} 
                />
              </>
            )}

            {/* Compare Mode List */}
            {mode === 'compare' && (
              <div className="mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-sm font-semibold text-slate-800">{t.selectedLocation} ({comparePoints.length}/5)</h3>
                   {comparePoints.length > 0 && (
                     <button onClick={clearComparePoints} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center">
                       <Trash2 className="w-3 h-3 mr-1" /> {t.clearAll}
                     </button>
                   )}
                </div>
                
                {comparePoints.length === 0 ? (
                   <div className="text-sm text-slate-400 italic text-center py-2">{t.addPoint}</div>
                ) : (
                  <ul className="space-y-2">
                    {comparePoints.map((p) => (
                      <li key={p.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                          <span className="text-sm text-slate-700 font-medium">
                            {Math.abs(p.location.lat).toFixed(2)}°{p.location.lat >= 0 ? 'N' : 'S'}, {Math.abs(p.location.lng).toFixed(2)}°{p.location.lng >= 0 ? 'E' : 'W'}
                          </span>
                        </div>
                        <button 
                          onClick={() => removeComparePoint(p.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {comparePoints.length >= 5 && (
                  <div className="mt-3 text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-100 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1.5" /> {t.maxPoints}
                  </div>
                )}
              </div>
            )}

            <MapPicker 
              mode={mode}
              selectedLocation={selectedLocation}
              comparisonPoints={mapPoints}
              onLocationSelect={mode === 'single' ? handleManualLocationSelect : handleComparisonLocationSelect} 
            />
          </div>

          {/* Right Column: Data */}
          <div className="lg:col-span-7">
            
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-slate-100 mb-6">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">{t.loading}</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-4 mb-6">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-semibold">{t.errorTitle}</h3>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* ---------------- SINGLE MODE VIEW ---------------- */}
            {mode === 'single' && (
              <>
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
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* No Data State (Ocean) */}
                    {!loading && !error && !hasDataSingle && climateData && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 flex flex-col items-center text-center">
                        <Waves className="w-12 h-12 text-blue-500 mb-4" />
                        <h3 className="text-blue-900 font-semibold text-lg">{t.noDataTitle}</h3>
                        <p className="text-blue-700 mt-2 max-w-sm">
                          {t.noDataText}
                        </p>
                      </div>
                    )}

                    {/* Data Display */}
                    {!loading && !error && hasDataSingle && climateData && classification && (
                      <>
                        <div className="flex justify-end">
                          <button
                            onClick={handleDownloadReport}
                            disabled={generatingPdf}
                            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                          >
                            {generatingPdf ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            <span>{generatingPdf ? t.generating : t.downloadReport}</span>
                          </button>
                        </div>
                        
                        {/* Display City Analysis Card if a city is selected via Explore Menu */}
                        {selectedCity && <CityAnalysisCard city={selectedCity} />}

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
              </>
            )}

            {/* ---------------- COMPARE MODE VIEW ---------------- */}
            {mode === 'compare' && (
              <>
                 {comparePoints.length === 0 && !loading && (
                    <div className="min-h-[500px] h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                    <div className="bg-indigo-50 p-4 rounded-full mb-4">
                      <SplitSquareHorizontal className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">{t.compareTitle}</h3>
                    <p className="text-slate-500 max-w-xs mt-2">
                      {t.compareIntro}
                    </p>
                  </div>
                 )}

                 {comparePoints.length > 0 && !loading && (
                    <>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={handleDownloadComparisonReport}
                          disabled={generatingPdf}
                          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                          {generatingPdf ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          <span>{generatingPdf ? t.generating : t.downloadComparison}</span>
                        </button>
                      </div>
                      <ComparisonChart points={comparePoints} />
                    </>
                 )}
              </>
            )}

          </div>
        </div>
        
        {/* Footer Notice */}
        <NoticeFooter />
        
        {/* About Footer */}
        <AboutFooter />

      </main>
    </div>
  );
};

export default App;