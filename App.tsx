import React, { useState, useEffect } from 'react';
import { MapPicker, MapPoint } from './components/MapPicker';
import { ClimateChart } from './components/ClimateChart';
import { ClimateTable } from './components/ClimateTable';
import { ClassificationCard } from './components/ClassificationCard';
import { LocationInput } from './components/LocationInput';
import { CitySearchBox } from './components/CitySearchBox';
import { ComparisonChart } from './components/ComparisonChart';
import { ExploreMenu } from './components/ExploreMenu';
import { CityAnalysisCard } from './components/CityAnalysisCard';
import { TutorialModal } from './components/TutorialModal';
import { PvpGame } from './components/PvpGame';
import { fetchClimateData, fetchClassification } from './services/climateService';
import { searchCities, findNearestCity, fetchRandomCity } from './services/csvService';
import { generatePDF, generateComparisonPDF } from './services/pdfService';
import { GeoLocation, ClimateDataResponse, ClassificationResponse, ComparisonPoint, CityDefinition, RandomCityResponse, GameStatus, ChallengeRoundResult } from './types';
import { CloudRain, Map as MapIcon, Loader2, AlertCircle, Waves, Languages, Download, SplitSquareHorizontal, MousePointerClick, X, Trash2, BookOpen, Gamepad2, Trophy, Target, ArrowRight, Lightbulb, Globe, Award, Medal, Flag, HelpCircle, Swords } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

type AppMode = 'single' | 'compare' | 'game' | 'pvp';

const PALETTE = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
];

// Footer Notice Component
interface NoticeFooterProps {
  onOpenTutorial: () => void;
  isChallengeMode: boolean;
}

const NoticeFooter: React.FC<NoticeFooterProps> = ({ onOpenTutorial, isChallengeMode }) => {
  const { t } = useLanguage();
  
  return (
    <div className="mt-16 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 border-l-4 border-l-amber-500 relative">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-full flex-shrink-0 mt-1">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-800">{t.notice.title}</h3>
            
            {!isChallengeMode && (
              <button 
                onClick={onOpenTutorial}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{t.openTutorial}</span>
              </button>
            )}
          </div>
          
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

// Calculate spherical distance in kilometers
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of Earth in kilometers
  const toRad = (deg: number) => deg * Math.PI / 180;
  
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lon2 - lon1);
  
  const cosCentralAngle = Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const clampedCos = Math.max(-1, Math.min(1, cosCentralAngle));
  
  return R * Math.acos(clampedCos);
};

// Calculate score based on distance (km)
const calculateScore = (distanceInKm: number): number => {
  return Math.round(5000 / Math.sqrt(1 + Math.pow(distanceInKm / 1000, 2)));
};

// Calculate Grade based on challenge history
const calculateGrade = (history: ChallengeRoundResult[]): { grade: string, color: string } => {
  const totalScore = history.reduce((acc, curr) => acc + curr.score, 0);
  const minScore = Math.min(...history.map(r => r.score));

  // Adjusted colors for dark background visibility
  if (totalScore >= 24000) return { grade: 'φ', color: 'text-amber-300' };
  if (minScore >= 4000) return { grade: 'Blue V', color: 'text-blue-300' };
  if (totalScore >= 22000) return { grade: 'V', color: 'text-white' };
  if (totalScore >= 18000) return { grade: 'A', color: 'text-white' };
  if (totalScore >= 14000) return { grade: 'B', color: 'text-white' };
  if (totalScore >= 10000) return { grade: 'C', color: 'text-white' };
  return { grade: 'F', color: 'text-white' };
};

const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  
  // State
  const [mode, setMode] = useState<AppMode>('single');
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Single Mode State
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [singleClimateData, setSingleClimateData] = useState<ClimateDataResponse | null>(null);
  const [singleClassification, setSingleClassification] = useState<ClassificationResponse | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityDefinition | null>(null);
  
  // Comparison Mode State
  const [comparePoints, setComparePoints] = useState<ComparisonPoint[]>([]);

  // Game Mode State
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [targetCity, setTargetCity] = useState<RandomCityResponse | null>(null);
  const [gameUserGuess, setGameUserGuess] = useState<GeoLocation | null>(null);
  const [gameClimateData, setGameClimateData] = useState<ClimateDataResponse | null>(null);
  const [gameClassification, setGameClassification] = useState<ClassificationResponse | null>(null);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameDistance, setGameDistance] = useState<number>(0);
  const [gameHintRevealed, setGameHintRevealed] = useState<boolean>(false);
  const [gameCountryHintRevealed, setGameCountryHintRevealed] = useState<boolean>(false);

  // Challenge Mode State
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [challengeRound, setChallengeRound] = useState<number>(1);
  const [challengeHistory, setChallengeHistory] = useState<ChallengeRoundResult[]>([]);
  const [showChallengeResults, setShowChallengeResults] = useState<boolean>(false);

  // Shared State
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear transient states when mode changes
  useEffect(() => {
    setError(null);
    setLoading(false);
  }, [mode]);

  // --- Game Mode Logic ---
  const startNewGameRound = async () => {
    setLoading(true);
    setError(null);
    setGameStatus('playing');
    setGameUserGuess(null);
    setTargetCity(null);
    setGameClimateData(null);
    setGameClassification(null);
    setGameScore(0);
    setGameDistance(0);
    setGameHintRevealed(false);
    setGameCountryHintRevealed(false);

    try {
      const randomCity = await fetchRandomCity();
      if (!randomCity) throw new Error("Failed to fetch random city");
      
      setTargetCity(randomCity);
      const lat = typeof randomCity.lat === 'string' ? parseFloat(randomCity.lat) : randomCity.lat;
      const lon = typeof randomCity.lon === 'string' ? parseFloat(randomCity.lon) : randomCity.lon;

      const [climateRes, classRes] = await Promise.all([
          fetchClimateData(lat, lon),
          fetchClassification(lat, lon)
      ]);
      
      setGameClimateData(climateRes);
      setGameClassification(classRes);

    } catch (err) {
      console.error(err);
      setError(t.errorText);
    } finally {
      setLoading(false);
    }
  };

  // --- Challenge Logic ---
  const startChallenge = async () => {
    setIsChallengeMode(true);
    setChallengeRound(1);
    setChallengeHistory([]);
    setShowChallengeResults(false);
    await startNewGameRound();
  };

  const handleNextChallengeRound = async () => {
    if (challengeRound < 5) {
      setChallengeRound(prev => prev + 1);
      await startNewGameRound();
    } else {
      setShowChallengeResults(true);
    }
  };

  const quitChallenge = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.confirm(t.challengeQuitConfirm)) {
      setIsChallengeMode(false);
      setChallengeHistory([]);
      setChallengeRound(1);
      setShowChallengeResults(false);
      startNewGameRound(); 
    }
  };

  const handleGameGuess = () => {
    if (!gameUserGuess || !targetCity) return;
    
    const targetLat = typeof targetCity.lat === 'string' ? parseFloat(targetCity.lat) : targetCity.lat;
    const targetLng = typeof targetCity.lon === 'string' ? parseFloat(targetCity.lon) : targetCity.lon;

    const dist = calculateDistance(gameUserGuess.lat, gameUserGuess.lng, targetLat, targetLng);
    const score = calculateScore(dist);
    
    setGameDistance(dist);
    setGameScore(score);
    setGameStatus('revealed');

    if (isChallengeMode) {
      setChallengeHistory(prev => [
        ...prev, 
        {
          round: challengeRound,
          targetCity: targetCity,
          userGuess: gameUserGuess,
          distance: dist,
          score: score
        }
      ]);
    }
  };

  const attemptModeSwitch = (newMode: AppMode) => {
    if (isChallengeMode && !showChallengeResults) {
      if (window.confirm(t.challengeQuitConfirm)) {
        setIsChallengeMode(false);
        setMode(newMode);
      }
    } else {
      setMode(newMode);
    }
  };

  useEffect(() => {
    if (mode === 'game' && !targetCity && !isChallengeMode) {
      startNewGameRound();
    }
  }, [mode]);

  useEffect(() => {
    const loadData = async () => {
      if ((mode !== 'single') || !selectedLocation) return;

      setLoading(true);
      setError(null);
      setSingleClimateData(null);
      setSingleClassification(null);

      try {
        const [climateRes, classRes] = await Promise.all([
          fetchClimateData(selectedLocation.lat, selectedLocation.lng),
          fetchClassification(selectedLocation.lat, selectedLocation.lng)
        ]);

        setSingleClimateData(climateRes);
        setSingleClassification(classRes);
        
        if (!locationName) {
           findNearestCity(selectedLocation.lat, selectedLocation.lng).then(cityStr => {
             if (cityStr) setLocationName(cityStr);
           });
        }

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
    if (mode === 'game') {
      setGameUserGuess(location);
    } else {
      setSelectedLocation(location);
      setSelectedCity(null);
      
      if (location.name) {
        setLocationName(location.name);
      } else {
        setLocationName(null);
      }
    }
  };

  const handleExploreCitySelect = (city: CityDefinition) => {
    const location = { lat: city.lat, lng: city.lng };
    setSelectedLocation(location);
    setSelectedCity(city);
    setLocationName(`${city.name}, ${city.country}`);
    findNearestCity(city.lat, city.lng);
  };

  const handleComparisonLocationSelect = async (location: GeoLocation) => {
    if (comparePoints.length >= 5) return;

    setLoading(true);
    setError(null);

    try {
      const [climateRes, nearestCity] = await Promise.all([
        fetchClimateData(location.lat, location.lng),
        !location.name ? findNearestCity(location.lat, location.lng) : Promise.resolve(null)
      ]);
      
      if (!climateRes.data || climateRes.data.length === 0) {
         setError(t.noDataText);
         setLoading(false);
         return;
      }

      const usedColors = new Set(comparePoints.map(p => p.color));
      const nextColor = PALETTE.find(c => !usedColors.has(c)) || PALETTE[0];
      
      const displayName = location.name || nearestCity || null;

      const newPoint: ComparisonPoint = {
        id: Date.now().toString(),
        location: location,
        name: displayName, 
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

  const handleDownloadReport = async () => {
    if (!selectedLocation || !singleClimateData || !singleClassification) return;
    
    setGeneratingPdf(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      await generatePDF(selectedLocation, singleClimateData, singleClassification, language, t, locationName);
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

  const mapPoints: MapPoint[] = comparePoints.map(p => ({
    id: p.id,
    location: p.location,
    color: p.color
  }));

  const activeClimateData = mode === 'game' ? gameClimateData : singleClimateData;
  const activeClassification = mode === 'game' ? gameClassification : singleClassification;
  const hasActiveData = activeClimateData && activeClimateData.data && activeClimateData.data.length > 0;

  const challengeGrade = showChallengeResults ? calculateGrade(challengeHistory) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      
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
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => attemptModeSwitch('single')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  mode === 'single' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <MousePointerClick className="w-4 h-4" />
                <span className="hidden sm:inline">{t.modeSingle}</span>
              </button>
              <button
                onClick={() => attemptModeSwitch('compare')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  mode === 'compare' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <SplitSquareHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">{t.modeCompare}</span>
              </button>
              <button
                onClick={() => attemptModeSwitch('game')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  mode === 'game' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t.modeGame}</span>
              </button>
              <button
                onClick={() => attemptModeSwitch('pvp')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  mode === 'pvp' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Swords className="w-4 h-4" />
                <span className="hidden sm:inline">{t.modePvp}</span>
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

      {/* Render PVP Game Component independently if mode is PVP */}
      {mode === 'pvp' ? (
        <main className="flex-1 w-full mx-auto">
          <PvpGame />
        </main>
      ) : (
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-auto">
          
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-1">
                {mode === 'game' ? <Gamepad2 className="w-5 h-5 text-indigo-600" /> : <MapIcon className="w-5 h-5 text-indigo-600" />}
                <h2 className="text-lg font-semibold text-slate-800">
                  {mode === 'single' ? t.selectLocation : mode === 'compare' ? t.compareTitle : t.gameTitle}
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                {mode === 'single' ? t.instructionMap : mode === 'compare' ? t.compareIntro : t.gameInstruction}
              </p>
            </div>

            {mode === 'single' && (
              <>
                <ExploreMenu onSelectCity={handleExploreCitySelect} />
                <CitySearchBox onLocationSelect={handleManualLocationSelect} />
                <LocationInput 
                  onLocationSelect={handleManualLocationSelect} 
                  selectedLocation={selectedLocation} 
                />
              </>
            )}

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
                            {p.name ? p.name : `${Math.abs(p.location.lat).toFixed(2)}°${p.location.lat >= 0 ? 'N' : 'S'}, ${Math.abs(p.location.lng).toFixed(2)}°${p.location.lng >= 0 ? 'E' : 'W'}`}
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
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <CitySearchBox onLocationSelect={handleComparisonLocationSelect} />
                </div>
              </div>
            )}

            {mode === 'game' && !showChallengeResults && (
              <div className="mb-6 space-y-4">
                 {isChallengeMode ? (
                   <div className="bg-indigo-900 text-white p-4 rounded-xl shadow-md">
                     <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center space-x-2">
                         <Medal className="w-5 h-5 text-amber-400" />
                         <span className="font-bold">{t.challengeMode}</span>
                       </div>
                       <div className="bg-indigo-800 px-3 py-1 rounded-full text-xs font-mono">
                         {t.challengeRound} {challengeRound}/5
                       </div>
                     </div>
                     <div className="flex items-center justify-between text-indigo-200 text-xs mt-2">
                        <span>{t.challengeHintsDisabled}</span>
                        <button 
                          type="button"
                          onClick={quitChallenge} 
                          className="text-red-300 hover:text-red-200 underline px-2 py-1 -mr-2 cursor-pointer z-10"
                        >
                          {t.challengeQuitBtn}
                        </button>
                     </div>
                   </div>
                 ) : (
                   <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white shadow-md flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Flag className="w-5 h-5 text-white" />
                        <span className="font-bold text-sm">{t.challengeMode}</span>
                      </div>
                      <button 
                        onClick={startChallenge}
                        className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
                      >
                        {t.startChallenge}
                      </button>
                   </div>
                 )}

                 {gameStatus === 'playing' && (
                   <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <Target className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold text-indigo-900">{t.gameInstructionGuess}</h3>
                      </div>
                      
                      {gameUserGuess ? (
                        <button 
                          onClick={handleGameGuess}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors shadow-sm"
                        >
                          {t.gameConfirmGuess}
                        </button>
                      ) : (
                        <div className="text-sm text-indigo-400 italic text-center py-2 border border-dashed border-indigo-200 rounded-lg">
                           {t.clickMapHint}
                        </div>
                      )}
                      
                      {!isChallengeMode && (
                        <div className="mt-4 pt-4 border-t border-indigo-200/60">
                           <div className="flex items-center justify-between mb-3">
                             <span className="text-sm text-indigo-900 font-semibold flex items-center gap-1.5">
                               <Lightbulb className="w-4 h-4 text-amber-500" />
                               {t.gameNeedHint}
                             </span>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-3">
                             <button 
                               onClick={() => setGameHintRevealed(true)}
                               disabled={gameHintRevealed}
                               className={`flex flex-col items-center justify-center p-3 rounded-xl text-xs font-medium transition-all duration-200 border ${
                                 gameHintRevealed 
                                   ? 'bg-amber-100/50 border-amber-200 text-amber-800 cursor-default' 
                                   : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 hover:shadow-sm'
                               }`}
                             >
                               {gameHintRevealed ? (
                                  <>
                                    <span className="font-bold text-lg text-amber-600 mb-0.5">
                                      {gameClassification?.data.find(c => c.type === 'K\u00f6ppen-Geiger')?.code || '?'}
                                    </span>
                                    <span className="opacity-70">{t.code}</span>
                                  </>
                               ) : (
                                  <>
                                    <span className="text-lg mb-1">🌡️</span>
                                    <span>{t.gameShowHint}</span>
                                  </>
                               )}
                             </button>

                             <button 
                               onClick={() => setGameCountryHintRevealed(true)}
                               disabled={gameCountryHintRevealed}
                               className={`flex flex-col items-center justify-center p-3 rounded-xl text-xs font-medium transition-all duration-200 border ${
                                 gameCountryHintRevealed 
                                   ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800 cursor-default' 
                                   : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-sm'
                               }`}
                             >
                               {gameCountryHintRevealed ? (
                                  <>
                                    <span className="font-bold text-sm text-emerald-700 mb-0.5 line-clamp-2 text-center leading-tight">
                                      {targetCity?.country}
                                    </span>
                                    <span className="opacity-70 mt-0.5">{t.gameCountry}</span>
                                  </>
                               ) : (
                                  <>
                                     <Globe className="w-5 h-5 mb-1 text-emerald-500/80" />
                                     <span>{t.gameShowCountryHint}</span>
                                  </>
                               )}
                             </button>
                           </div>
                        </div>
                      )}
                   </div>
                 )}

                 {gameStatus === 'revealed' && targetCity && (
                   <div className="bg-white border border-slate-200 p-0 rounded-xl overflow-hidden shadow-sm animate-in slide-in-from-top-2">
                     <div className="bg-emerald-500 p-4 text-white">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold flex items-center">
                            <Trophy className="w-5 h-5 mr-2" />
                            {isChallengeMode ? `${t.challengeRound} ${challengeRound}` : t.gameResult}
                          </h3>
                          <div className="text-2xl font-bold">{gameScore}</div>
                        </div>
                        <p className="text-emerald-100 text-xs uppercase tracking-wider font-semibold">{t.gameScore}</p>
                     </div>
                     <div className="p-5">
                       <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t.gameDistance}</p>
                            <p className="text-lg font-mono font-medium text-slate-700">
                              {gameDistance.toFixed(1)} km
                            </p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t.gameActualLocation}</p>
                             <p className="font-medium text-slate-800">{targetCity.city}, {targetCity.country}</p>
                          </div>
                       </div>
                       <button 
                         onClick={isChallengeMode ? handleNextChallengeRound : startNewGameRound}
                         className="w-full flex justify-center items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors"
                       >
                         <span>{t.gameNextRound}</span>
                         <ArrowRight className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 )}
              </div>
            )}

            {mode === 'game' && showChallengeResults && challengeGrade && (
               <div className="mb-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg animate-in zoom-in-95 duration-300">
                  <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 text-white text-center">
                     <div className="flex justify-center mb-4">
                        <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/10 shadow-inner">
                           <Award className="w-10 h-10 text-amber-300" />
                        </div>
                     </div>
                     
                     <h2 className="text-xl font-bold mb-6 text-indigo-100">{t.challengeComplete}</h2>
                     
                     <div className="mb-6">
                         <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">{t.challengeGrade}</div>
                         <div className={`text-8xl font-black ${challengeGrade.color} tracking-tight drop-shadow-2xl`} style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                            {(t[challengeGrade.grade === 'φ' ? 'gradePhi' : `grade${challengeGrade.grade.replace(' ', '')}` as keyof typeof t] as string) || challengeGrade.grade}
                         </div>
                     </div>

                     <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="font-mono font-bold text-lg">{challengeHistory.reduce((a,b) => a + b.score, 0)}</span>
                        <span className="text-xs text-indigo-200 uppercase tracking-wider ml-1">{t.gameScore}</span>
                     </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto bg-slate-50 border-t border-slate-200">
                    {challengeHistory.map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border-b border-slate-200 last:border-0 hover:bg-white transition-colors">
                         <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                              {idx + 1}
                            </div>
                            <div className="text-left">
                               <div className="font-bold text-sm text-slate-800">{res.targetCity.city}</div>
                               <div className="text-xs text-slate-500 font-medium">{res.targetCity.country}</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="font-bold text-emerald-600 font-mono text-lg">{res.score}</div>
                            <div className="text-xs text-slate-400 font-medium">{res.distance.toFixed(0)} km</div>
                         </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-white border-t border-slate-200">
                     <button 
                       onClick={() => {
                         setIsChallengeMode(false);
                         setShowChallengeResults(false);
                         startNewGameRound();
                       }}
                       className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-[0.98]"
                     >
                       {t.challengePlayAgain}
                     </button>
                  </div>
               </div>
            )}

            <MapPicker 
              mode={mode}
              selectedLocation={mode === 'game' ? gameUserGuess : selectedLocation}
              comparisonPoints={mapPoints}
              gameTargetLocation={mode === 'game' && gameStatus === 'revealed' && targetCity ? { 
                lat: typeof targetCity.lat === 'string' ? parseFloat(targetCity.lat) : targetCity.lat, 
                lng: typeof targetCity.lon === 'string' ? parseFloat(targetCity.lon) : targetCity.lon
              } : null}
              onLocationSelect={mode === 'single' ? handleManualLocationSelect : (mode === 'compare' ? handleComparisonLocationSelect : handleManualLocationSelect)} 
            />
          </div>

          <div className="lg:col-span-7">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-slate-100 mb-6">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">{mode === 'game' ? t.gameLoading : t.loading}</p>
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

            {(mode === 'single' || mode === 'game') && (
              <>
                {mode === 'single' && !selectedLocation && (
                  <div className="min-h-[500px] h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                    <div className="bg-indigo-50 p-4 rounded-full mb-4">
                      <MapIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">{t.noLocationTitle}</h3>
                    <p className="text-slate-500 max-w-xs mt-2">
                      {t.noLocationText}
                    </p>
                  </div>
                )}
                
                {mode === 'game' && !targetCity && !loading && !error && !showChallengeResults && (
                   <div className="min-h-[500px] h-full flex items-center justify-center">
                      <button onClick={startNewGameRound} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-colors">
                        Start Game
                      </button>
                   </div>
                )}

                {((mode === 'single' && selectedLocation) || (mode === 'game' && targetCity)) && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {!loading && !error && !hasActiveData && activeClimateData && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 flex flex-col items-center text-center">
                        <Waves className="w-12 h-12 text-blue-500 mb-4" />
                        <h3 className="text-blue-900 font-semibold text-lg">{t.noDataTitle}</h3>
                        <p className="text-blue-700 mt-2 max-w-sm">
                          {t.noDataText}
                        </p>
                      </div>
                    )}

                    {!loading && !error && hasActiveData && activeClimateData && activeClassification && (
                      <>
                        {mode === 'single' && (
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
                        )}
                        
                        {mode === 'single' && selectedCity && <CityAnalysisCard city={selectedCity} />}

                        {mode === 'game' && targetCity ? (
                           <ClassificationCard 
                             classificationData={activeClassification.data} 
                             lat={typeof targetCity.lat === 'string' ? parseFloat(targetCity.lat) : targetCity.lat} 
                             lng={typeof targetCity.lon === 'string' ? parseFloat(targetCity.lon) : targetCity.lon}
                             locationName={`${targetCity.city}, ${targetCity.country}`}
                             masked={gameStatus === 'playing'}
                             hintRevealed={gameHintRevealed} 
                           />
                        ) : (
                           selectedLocation && (
                             <ClassificationCard 
                               classificationData={activeClassification.data} 
                               lat={selectedLocation.lat} 
                               lng={selectedLocation.lng}
                               locationName={locationName} 
                             />
                           )
                        )}
                        
                        <ClimateChart 
                          data={activeClimateData.data} 
                          locationName={mode === 'game' && gameStatus === 'playing' ? t.mysteryLocation : (mode === 'game' && targetCity ? `${targetCity.city}` : locationName)} 
                        />
                        
                        <ClimateTable 
                          data={activeClimateData.data} 
                          locationName={mode === 'game' && gameStatus === 'playing' ? t.mysteryLocation : (mode === 'game' && targetCity ? `${targetCity.city}` : locationName)} 
                        />
                      </>
                    )}
                  </div>
                )}
              </>
            )}

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
        
        <NoticeFooter onOpenTutorial={() => setShowTutorial(true)} isChallengeMode={isChallengeMode} />
        <AboutFooter />

      </main>
      )}
    </div>
  );
};

export default App;