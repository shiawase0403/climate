
import React, { useState, useEffect } from 'react';
import { MapPicker } from '../components/MapPicker';
import { ClimateChart } from '../components/ClimateChart';
import { ClimateTable } from '../components/ClimateTable';
import { ClassificationCard } from '../components/ClassificationCard';
import { MobileDataViewer } from '../components/MobileDataViewer';
import { fetchClimateData, fetchClassification } from '../services/climateService';
import { fetchRandomCity } from '../services/csvService';
import { GeoLocation, ClimateDataResponse, ClassificationResponse, RandomCityResponse, GameStatus, ChallengeRoundResult } from '../types';
import { Gamepad2, Loader2, AlertCircle, Trophy, Target, ArrowRight, Lightbulb, Globe, Award, Medal, Flag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

// Helper functions for scoring
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const toRad = (deg: number) => deg * Math.PI / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lon2 - lon1);
  const cosCentralAngle = Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const clampedCos = Math.max(-1, Math.min(1, cosCentralAngle));
  return R * Math.acos(clampedCos);
};

const calculateScore = (distanceInKm: number): number => {
  return Math.round(5000 / Math.sqrt(1 + Math.pow(distanceInKm / 1000, 2)));
};

const calculateGrade = (history: ChallengeRoundResult[]): { grade: string, color: string } => {
  const totalScore = history.reduce((acc, curr) => acc + curr.score, 0);
  const minScore = Math.min(...history.map(r => r.score));
  if (totalScore >= 24000) return { grade: 'φ', color: 'text-amber-300' };
  if (minScore >= 4000) return { grade: 'Blue V', color: 'text-blue-300' };
  if (totalScore >= 22000) return { grade: 'V', color: 'text-white' };
  if (totalScore >= 18000) return { grade: 'A', color: 'text-white' };
  if (totalScore >= 14000) return { grade: 'B', color: 'text-white' };
  if (totalScore >= 10000) return { grade: 'C', color: 'text-white' };
  return { grade: 'F', color: 'text-white' };
};

export const GamePage: React.FC = () => {
  const { t } = useLanguage();
  const { isMarsMode, isRetroMode, primaryColor, primaryBg, primaryBgHover } = useTheme();

  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [targetCity, setTargetCity] = useState<RandomCityResponse | null>(null);
  const [userGuess, setUserGuess] = useState<GeoLocation | null>(null);
  const [climateData, setClimateData] = useState<ClimateDataResponse | null>(null);
  const [classification, setClassification] = useState<ClassificationResponse | null>(null);
  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  
  const [hintRevealed, setHintRevealed] = useState<boolean>(false);
  const [countryHintRevealed, setCountryHintRevealed] = useState<boolean>(false);

  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [challengeRound, setChallengeRound] = useState<number>(1);
  const [challengeHistory, setChallengeHistory] = useState<ChallengeRoundResult[]>([]);
  const [showChallengeResults, setShowChallengeResults] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startNewGameRound = async () => {
    setLoading(true);
    setError(null);
    setGameStatus('playing');
    setUserGuess(null);
    setTargetCity(null);
    setClimateData(null);
    setClassification(null);
    setScore(0);
    setDistance(0);
    setHintRevealed(false);
    setCountryHintRevealed(false);

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
      
      setClimateData(climateRes);
      setClassification(classRes);

    } catch (err) {
      console.error(err);
      setError(t.errorText);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!targetCity && !isChallengeMode) {
      startNewGameRound();
    }
  }, []);

  const handleGameGuess = () => {
    if (!userGuess || !targetCity) return;
    
    const targetLat = typeof targetCity.lat === 'string' ? parseFloat(targetCity.lat) : targetCity.lat;
    const targetLng = typeof targetCity.lon === 'string' ? parseFloat(targetCity.lon) : targetCity.lon;

    const dist = calculateDistance(userGuess.lat, userGuess.lng, targetLat, targetLng);
    const roundScore = calculateScore(dist);
    
    setDistance(dist);
    setScore(roundScore);
    setGameStatus('revealed');

    if (isChallengeMode) {
      setChallengeHistory(prev => [
        ...prev, 
        {
          round: challengeRound,
          targetCity: targetCity,
          userGuess: userGuess,
          distance: dist,
          score: roundScore
        }
      ]);
    }
  };

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

  const challengeGrade = showChallengeResults ? calculateGrade(challengeHistory) : null;

  return (
    <>
      <div className="lg:col-span-5 lg:sticky lg:top-24">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <Gamepad2 className={`w-5 h-5 ${primaryColor}`} />
            <h2 className="text-lg font-semibold text-slate-800">{t.gameTitle}</h2>
          </div>
          <p className="text-sm text-slate-500">{t.gameInstruction}</p>
        </div>

        {!showChallengeResults && (
          <div className="mb-6 space-y-4">
             {isChallengeMode ? (
               <div className={`${isMarsMode ? 'bg-orange-900' : 'bg-indigo-900'} text-white p-4 rounded-xl shadow-md`}>
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center space-x-2">
                     <Medal className="w-5 h-5 text-amber-400" />
                     <span className="font-bold">{t.challengeMode}</span>
                   </div>
                   <div className={`${isMarsMode ? 'bg-orange-800' : 'bg-indigo-800'} px-3 py-1 rounded-full text-xs font-mono`}>
                     {t.challengeRound} {challengeRound}/5
                   </div>
                 </div>
                 <div className={`flex items-center justify-between ${isMarsMode ? 'text-orange-200' : 'text-indigo-200'} text-xs mt-2`}>
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
               <div className={`bg-gradient-to-r ${isMarsMode ? 'from-orange-500 to-red-600' : 'from-indigo-500 to-purple-600'} p-4 rounded-xl text-white shadow-md flex items-center justify-between`}>
                  <div className="flex items-center space-x-2">
                    <Flag className="w-5 h-5 text-white" />
                    <span className="font-bold text-sm">{t.challengeMode}</span>
                  </div>
                  <button 
                    onClick={startChallenge}
                    className={`px-4 py-1.5 bg-white ${primaryColor} rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors`}
                  >
                    {t.startChallenge}
                  </button>
               </div>
             )}

             {gameStatus === 'playing' && (
               <div className={`${isMarsMode ? 'bg-orange-50 border-orange-100' : 'bg-indigo-50 border-indigo-100'} border p-4 rounded-xl`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <Target className={`w-5 h-5 ${primaryColor}`} />
                    <h3 className={`font-semibold ${isMarsMode ? 'text-orange-900' : 'text-indigo-900'}`}>{t.gameInstructionGuess}</h3>
                  </div>
                  
                  {userGuess ? (
                    <button 
                      onClick={handleGameGuess}
                      className={`w-full ${primaryBg} ${primaryBgHover} text-white font-medium py-2 rounded-lg transition-colors shadow-sm`}
                    >
                      {t.gameConfirmGuess}
                    </button>
                  ) : (
                    <div className={`text-sm ${isMarsMode ? 'text-orange-400 border-orange-200' : 'text-indigo-400 border-indigo-200'} italic text-center py-2 border border-dashed rounded-lg`}>
                       {t.clickMapHint}
                    </div>
                  )}
                  
                  {!isChallengeMode && (
                    <div className={`mt-4 pt-4 border-t ${isMarsMode ? 'border-orange-200/60' : 'border-indigo-200/60'}`}>
                       <div className="flex items-center justify-between mb-3">
                         <span className={`text-sm ${isMarsMode ? 'text-orange-900' : 'text-indigo-900'} font-semibold flex items-center gap-1.5`}>
                           <Lightbulb className="w-4 h-4 text-amber-500" />
                           {t.gameNeedHint}
                         </span>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                         <button 
                           onClick={() => setHintRevealed(true)}
                           disabled={hintRevealed}
                           className={`flex flex-col items-center justify-center p-3 rounded-xl text-xs font-medium transition-all duration-200 border ${
                             hintRevealed 
                               ? 'bg-amber-100/50 border-amber-200 text-amber-800 cursor-default' 
                               : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 hover:shadow-sm'
                           }`}
                         >
                           {hintRevealed ? (
                              <>
                                <span className="font-bold text-lg text-amber-600 mb-0.5">
                                  {classification?.data.find(c => c.type === 'K\u00f6ppen-Geiger')?.code || '?'}
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
                           onClick={() => setCountryHintRevealed(true)}
                           disabled={countryHintRevealed}
                           className={`flex flex-col items-center justify-center p-3 rounded-xl text-xs font-medium transition-all duration-200 border ${
                             countryHintRevealed 
                               ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800 cursor-default' 
                               : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-sm'
                           }`}
                         >
                           {countryHintRevealed ? (
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
                      <div className="text-2xl font-bold">{score}</div>
                    </div>
                    <p className="text-emerald-100 text-xs uppercase tracking-wider font-semibold">{t.gameScore}</p>
                 </div>
                 <div className="p-5">
                   <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t.gameDistance}</p>
                        <p className="text-lg font-mono font-medium text-slate-700">
                          {distance.toFixed(1)} km
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

        {showChallengeResults && challengeGrade && (
           <div className="mb-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg animate-in zoom-in-95 duration-300">
              <div className={`bg-gradient-to-br ${isMarsMode ? 'from-orange-900 via-red-900 to-slate-900' : 'from-indigo-900 via-purple-900 to-slate-900'} p-8 text-white text-center`}>
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
                        <div className={`w-8 h-8 rounded-full ${isMarsMode ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'} flex items-center justify-center text-sm font-bold`}>
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
          mode="game"
          selectedLocation={userGuess}
          gameTargetLocation={gameStatus === 'revealed' && targetCity ? { 
            lat: typeof targetCity.lat === 'string' ? parseFloat(targetCity.lat) : targetCity.lat, 
            lng: typeof targetCity.lon === 'string' ? parseFloat(targetCity.lon) : targetCity.lon
          } : null}
          onLocationSelect={(loc) => setUserGuess(loc)}
          isMarsMode={isMarsMode}
          isRetroMode={isRetroMode}
        />
      </div>

      <div className="lg:col-span-7">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-slate-100 mb-6">
            <Loader2 className={`w-10 h-10 ${primaryColor} animate-spin mb-4`} />
            <p className="text-slate-600 font-medium">{t.gameLoading}</p>
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

        {!targetCity && !loading && !error && !showChallengeResults && (
           <div className="min-h-[500px] h-full flex items-center justify-center">
              <button onClick={startNewGameRound} className={`${primaryBg} ${primaryBgHover} text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors`}>
                Start Game
              </button>
           </div>
        )}

        {targetCity && !loading && !error && climateData && classification && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <MobileDataViewer>
               <ClassificationCard 
                 classificationData={classification.data} 
                 lat={typeof targetCity.lat === 'string' ? parseFloat(targetCity.lat) : targetCity.lat} 
                 lng={typeof targetCity.lon === 'string' ? parseFloat(targetCity.lon) : targetCity.lon}
                 locationName={`${targetCity.city}, ${targetCity.country}`}
                 masked={gameStatus === 'playing'}
                 hintRevealed={hintRevealed}
                 climateData={climateData.data}
               />
               <ClimateChart 
                 data={climateData.data} 
                 locationName={gameStatus === 'playing' ? t.mysteryLocation : `${targetCity.city}`} 
               />
               <ClimateTable 
                 data={climateData.data} 
                 locationName={gameStatus === 'playing' ? t.mysteryLocation : `${targetCity.city}`} 
               />
             </MobileDataViewer>
          </div>
        )}
      </div>
    </>
  );
};
