
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPicker, ClimateLegend } from '../components/MapPicker';
import { ClimateChart } from '../components/ClimateChart';
import { ClimateTable } from '../components/ClimateTable';
import { ClassificationCard } from '../components/ClassificationCard';
import { VegetationCard } from '../components/VegetationCard';
import { LocationInput } from '../components/LocationInput';
import { CitySearchBox } from '../components/CitySearchBox';
import { ExploreMenu } from '../components/ExploreMenu';
import { CityAnalysisCard } from '../components/CityAnalysisCard';
import { MobileDataViewer } from '../components/MobileDataViewer';
import { fetchClimateData, fetchClassification } from '../services/climateService';
import { findNearestCity } from '../services/csvService';
import { generatePDF } from '../services/pdfService';
import { GeoLocation, ClimateDataResponse, ClassificationResponse, CityDefinition } from '../types';
import { Map as MapIcon, Loader2, AlertCircle, Waves, Download, Maximize, Minimize, Settings2, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';

// Mars Mock Data
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
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [canFullScreen, setCanFullScreen] = useState(true);
  const [useLegacySource, setUseLegacySource] = useState(false);
  
  // Map Overlay State
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'climate' | 'precip'>('none');

  // Extract params to variables for stable dependency usage
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng') ?? searchParams.get('lon');
  const isMarsParam = searchParams.get('isMars') === '1';

  // Sync URL params to State
  useEffect(() => {
    // Sync Mode
    if (isMarsParam !== isMarsMode) {
      setIsMarsMode(isMarsParam);
    }

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);

      if (!isNaN(lat) && !isNaN(lng)) {
        // Check if we need to update state to avoid loops/redundant fetches
        const locationChanged = !selectedLocation || 
                                Math.abs(selectedLocation.lat - lat) > 0.0001 || 
                                Math.abs(selectedLocation.lng - lng) > 0.0001;
        
        // Update if location changed OR if mode changed (to update name/data)
        if (locationChanged || isMarsParam !== isMarsMode) {
             setSelectedLocation({ lat, lng });
             
             // If Mars, set default name, else clear to let fetcher find city
             if (isMarsParam) {
                setLocationName("Mars, The Red Planet");
             } else if (locationChanged) {
                // Only clear name if location actually changed, otherwise we might wipe a manually set name
                setLocationName(null);
             }
             
             // If navigating via URL, we likely don't have the rich city object
             setSelectedCity(null);
        }
      }
    } else {
      // Clear location if URL params are removed (e.g. back to root)
      if (selectedLocation) {
        setSelectedLocation(null);
        setLocationName(null);
        setClimateData(null);
        setClassification(null);
      }
    }
  }, [latParam, lngParam, isMarsParam, isMarsMode, setIsMarsMode, selectedLocation]);

  // Screen Width Check for Full Screen Eligibility
  useEffect(() => {
    const checkWidth = () => {
      const isWide = window.innerWidth >= 768; // md breakpoint, 768px
      setCanFullScreen(isWide);
      // Auto-exit if screen becomes too small while in full screen
      if (!isWide && isFullScreen) {
        setIsFullScreen(false);
        showNotification("Exited full screen mode due to screen size", "info");
      }
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [isFullScreen, showNotification]);

  // Data Fetching Effect
  useEffect(() => {
    const loadData = async () => {
      if (isMarsMode) {
        setClimateData(generateMarsData());
        setClassification(MARS_CLASSIFICATION);
        // Explicitly set name if not set (e.g. initial load)
        if (!locationName) setLocationName('Mars, The Red Planet');
        return;
      }

      if (!selectedLocation) return;

      setLoading(true);
      setError(null);
      setClimateData(null);
      // Don't reset classification immediately if switching modes to avoid flash, but we handle it below
      if (useLegacySource) setClassification(null); 

      try {
        const promises: Promise<any>[] = [
          fetchClimateData(selectedLocation.lat, selectedLocation.lng, useLegacySource)
        ];

        // Only fetch classification if in Legacy Mode. In Fast Mode, we calculate it locally.
        if (useLegacySource) {
          promises.push(fetchClassification(selectedLocation.lat, selectedLocation.lng));
        }

        const results = await Promise.all(promises);
        const climateRes = results[0];
        const classRes = useLegacySource ? results[1] : null; // Null in fast mode

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, isMarsMode, useLegacySource]);

  const handleManualLocationSelect = (location: GeoLocation) => {
    // Handle URL Update instead of direct State update
    const params: any = {};
    
    if (location.name === 'Mars' || location.name === 'Mars, The Red Planet') {
       params.lat = '0';
       params.lng = '0';
       params.isMars = '1';
    } else {
       params.lat = location.lat.toFixed(4);
       params.lng = location.lng.toFixed(4);
       
       // If currently in Mars mode and clicking the map (no name implies map click), keep Mars mode.
       // If location has a name (from search), assume user wants to go to that Earth location.
       if (isMarsMode && !location.name) {
          params.isMars = '1';
       }
    }
    
    setSearchParams(params);
  };

  const handleExploreCitySelect = (city: CityDefinition) => {
    // Set UI specific state that can't be in URL (Description card)
    setSelectedCity(city);
    
    // Update URL to trigger location change
    setSearchParams({
        lat: city.lat.toFixed(4),
        lng: city.lng.toFixed(4)
    });
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
      
      setSearchParams({
          lat: antiLat.toFixed(4),
          lng: antiLng.toFixed(4)
      });
    }, 1500);
  };

  const handleAntipodeTrigger = () => {
    setIsAntipodeJump(true);
  };

  const handleDownloadReport = async () => {
    if (!selectedLocation || !climateData) return;
    // For report generation in fast mode, construct a basic classification object
    
    setGeneratingPdf(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      // Ensure we pass a valid object structure even if null
      const classData = classification || { results: {lat: '0', lon: '0', version: ''}, status: 'OK', data: [] };
      await generatePDF(selectedLocation, climateData, classData, language, t, locationName);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const hasData = climateData && climateData.data && climateData.data.length > 0;
  // In Fast mode, we don't require classification object to be present to show data
  const isDataReady = hasData && climateData && (useLegacySource ? classification : true);

  // Toggle Body Scroll for FullScreen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFullScreen]);

  return (
    <>
      {/* 
        Left Column: Map & Inputs 
        If FullScreen: Fixed to cover viewport, z-[2000] to sit above footer
      */}
      <div className={isFullScreen ? "fixed inset-0 z-[2000] bg-slate-50 w-screen h-screen" : "lg:col-span-5 lg:sticky lg:top-24 transition-all"}>
        {!isFullScreen && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-1">
              <MapIcon className={`w-5 h-5 ${primaryColor}`} />
              <h2 className="text-lg font-semibold text-slate-800">{t.selectLocation}</h2>
            </div>
            <p className="text-sm text-slate-500">{t.instructionMap}</p>
          </div>
        )}

        {!isFullScreen && (
          <>
            <ExploreMenu onSelectCity={handleExploreCitySelect} />
            <CitySearchBox onLocationSelect={handleManualLocationSelect} />
            <LocationInput onLocationSelect={handleManualLocationSelect} selectedLocation={selectedLocation} />
          </>
        )}
        
        <div className="relative">
          <MapPicker 
            mode="single"
            selectedLocation={selectedLocation}
            onLocationSelect={handleManualLocationSelect}
            onAntipodeTrigger={handleAntipodeTrigger}
            isMarsMode={isMarsMode}
            isRetroMode={isRetroMode}
            isDigging={isDigging}
            onDig={handleDig}
            isFullScreen={isFullScreen}
            activeOverlay={activeOverlay}
            onOverlayChange={setActiveOverlay}
            showLegend={false}
          />
          {/* External Legend Rendered Below Map */}
          {activeOverlay === 'climate' && !isMarsMode && (
             <div className="mt-4 relative animate-in fade-in slide-in-from-top-2">
                <ClimateLegend className="w-full relative z-10" />
             </div>
          )}

          {/* Toggle Full Screen Button */}
          {/* Visible on all screens, but disabled if screen is too small */}
          <button 
            onClick={() => canFullScreen && setIsFullScreen(!isFullScreen)}
            disabled={!canFullScreen}
            className={`absolute top-3 ${isFullScreen ? 'right-3' : 'right-14'} z-[2010] p-2 bg-white rounded-md shadow-md border border-slate-300 transition-colors text-slate-700 flex items-center justify-center 
              ${!canFullScreen ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:bg-slate-50'}`}
            title={!canFullScreen ? "Full screen mode requires a wider screen" : (isFullScreen ? t.exitFullScreen : t.enterFullScreen)}
          >
            {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 
        Right Column: Data Display 
        If FullScreen: Fixed overlay (pointer-events-none by default to let clicks pass to map), z-[2010]
      */}
      <div className={isFullScreen ? "fixed inset-0 z-[2010] pointer-events-none p-6" : "lg:col-span-7 transition-all"}>
        {loading && !isFullScreen && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-slate-100 mb-6">
            <Loader2 className={`w-10 h-10 ${primaryColor} animate-spin mb-4`} />
            <p className="text-slate-600 font-medium">{t.loading}</p>
          </div>
        )}

        {error && !loading && !isFullScreen && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-4 mb-6">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-semibold">{t.errorTitle}</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!selectedLocation && !isFullScreen && (
          <div className="min-h-[500px] h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
            <div className={`${isMarsMode ? 'bg-orange-50' : 'bg-indigo-50'} p-4 rounded-full mb-4`}>
              <MapIcon className={`w-8 h-8 ${isMarsMode ? 'text-orange-400' : 'text-indigo-400'}`} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">{t.noLocationTitle}</h3>
            <p className="text-slate-500 max-w-xs mt-2">{t.noLocationText}</p>
          </div>
        )}

        {selectedLocation && !loading && !error && (
          <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isFullScreen ? 'h-full w-full relative' : ''}`}>
            {!hasData && climateData && !isFullScreen && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 flex flex-col items-center text-center">
                <Waves className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-blue-900 font-semibold text-lg">{t.noDataTitle}</h3>
                <p className="text-blue-700 mt-2 max-w-sm">{t.noDataText}</p>
              </div>
            )}

            {isDataReady && climateData && (
              <>
                {!isFullScreen && (
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-2">
                       <Settings2 className="w-4 h-4 text-slate-400" />
                       <span className="text-sm font-medium text-slate-600 hidden sm:inline">{t.dataSource}:</span>
                       <button 
                         onClick={() => setUseLegacySource(!useLegacySource)}
                         className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${
                           !useLegacySource 
                             ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                             : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                         }`}
                       >
                         {t.dataFast}
                       </button>
                       <button 
                         onClick={() => setUseLegacySource(!useLegacySource)}
                         className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${
                           useLegacySource 
                             ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                             : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                         }`}
                       >
                         {t.dataLegacy}
                       </button>
                    </div>
                    <button
                      onClick={handleDownloadReport}
                      disabled={generatingPdf}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm font-medium"
                    >
                      {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      <span>{generatingPdf ? t.generating : t.downloadReport}</span>
                    </button>
                  </div>
                )}
                
                {!isFullScreen && selectedCity && <CityAnalysisCard city={selectedCity} />}

                {/* Classification Card */}
                {/* In FullScreen: Top Left Overlay. Scaled down on mid-sized screens to fit. */}
                <div className={isFullScreen ? "absolute top-6 left-6 w-[380px] pointer-events-auto origin-top-left md:scale-90 scale-75" : ""}>
                  <ClassificationCard 
                    classificationData={classification ? classification.data : []} 
                    lat={selectedLocation.lat} 
                    lng={selectedLocation.lng}
                    locationName={locationName} 
                    onDig={handleDig}
                    climateData={climateData.data}
                    isFastMode={!useLegacySource}
                  />
                </div>
                
                {/* FullScreen Mode: Floating Chart */}
                <div className={isFullScreen ? "absolute top-6 right-6 w-[550px] pointer-events-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 origin-top-right scale-75" : "hidden"}>
                   <ClimateChart 
                     data={climateData.data} 
                     locationName={locationName} 
                     elevation={climateData.results.location.elev}
                   />
                </div>
                
                {/* Normal Mode: Mobile Carousel, Desktop Stack */}
                {!isFullScreen && (
                  <MobileDataViewer>
                     <ClimateChart 
                       data={climateData.data} 
                       locationName={locationName} 
                       elevation={climateData.results.location.elev}
                     />
                     <ClimateTable data={climateData.data} locationName={locationName} />
                     <VegetationCard classificationData={classification ? classification.data : (isDataReady ? [{type: 'Calculated', code: 'Calculated', short: ''}] : [])} />
                  </MobileDataViewer>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
