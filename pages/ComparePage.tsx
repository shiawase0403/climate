import React, { useState } from 'react';
import { MapPicker, MapPoint } from '../components/MapPicker';
import { ComparisonChart } from '../components/ComparisonChart';
import { CitySearchBox } from '../components/CitySearchBox';
import { fetchClimateData } from '../services/climateService';
import { findNearestCity } from '../services/csvService';
import { generateComparisonPDF } from '../services/pdfService';
import { GeoLocation, ComparisonPoint } from '../types';
import { Map as MapIcon, Loader2, AlertCircle, Download, SplitSquareHorizontal, Import, Trash2, X, PlayCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const PALETTE = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const GAME_API_BASE = 'https://climate-game.hywiki.org/API';

export const ComparePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { isMarsMode, isRetroMode, primaryColor } = useTheme();

  const [comparePoints, setComparePoints] = useState<ComparisonPoint[]>([]);
  const [importRoomId, setImportRoomId] = useState('');
  const [importRound, setImportRound] = useState(1);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number, total: number } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

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

  const handleImportGameRound = async () => {
    if (!importRoomId) return;
    setImportLoading(true);
    setComparePoints([]); 
    setError(null);
    setImportProgress({ current: 0, total: 0 });

    try {
      const res = await fetch(`${GAME_API_BASE}/match/${importRoomId}`);
      if (!res.ok) throw new Error("Match not found or invalid Room ID");
      const data = await res.json();
      if (!data || !data.details) throw new Error("Invalid match data format");

      const roundData = data.details.find((d: any) => d.round === Number(importRound));
      if (!roundData) throw new Error(`Round ${importRound} not found in this match`);

      const targets = [];
      targets.push({
        lat: Number(roundData.city.lat),
        lon: Number(roundData.city.lon),
        name: `Target: ${roundData.city.city}`,
        isTarget: true
      });
      
      roundData.answers.slice(0, 5).forEach((ans: any) => {
         targets.push({
           lat: Number(ans.lat),
           lon: Number(ans.lon),
           name: `${ans.username}`,
           isTarget: false
         });
      });

      const total = targets.length;
      setImportProgress({ current: 0, total });

      for (let i = 0; i < total; i++) {
          setImportProgress({ current: i + 1, total });
          const t = targets[i];
          try {
             const climateRes = await fetchClimateData(t.lat, t.lon);
             let color;
             if (t.isTarget) {
                color = '#10b981';
             } else {
                const otherColors = PALETTE.filter(c => c !== '#10b981'); 
                color = otherColors[(i - 1) % otherColors.length] || PALETTE[i % PALETTE.length];
             }
             const newPoint: ComparisonPoint = {
                id: `import-${i}-${Date.now()}`,
                location: { lat: t.lat, lng: t.lon },
                name: t.name,
                data: climateRes,
                color: color
             };
             setComparePoints(prev => [...prev, newPoint]);
          } catch (e) {
             console.error("Failed to fetch point", t.name, e);
          }
          if (i < total - 1) await new Promise(r => setTimeout(r, 800));
      }
    } catch (e: any) {
      setError(e.message || "Failed to import game data");
    } finally {
      setImportLoading(false);
      setImportProgress(null);
    }
  };

  const removeComparePoint = (id: string) => {
    setComparePoints(prev => prev.filter(p => p.id !== id));
  };

  const clearComparePoints = () => {
    setComparePoints([]);
    setError(null);
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

  return (
    <>
      <div className="lg:col-span-5 lg:sticky lg:top-24">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <MapIcon className={`w-5 h-5 ${primaryColor}`} />
            <h2 className="text-lg font-semibold text-slate-800">{t.compareTitle}</h2>
          </div>
          <p className="text-sm text-slate-500">{t.compareIntro}</p>
        </div>

        {/* Import Game Round Section */}
        <div className="mb-6 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 text-indigo-800 font-semibold">
            <Import className="w-4 h-4" />
            <h3 className="text-sm">{t.importGameTitle}</h3>
          </div>
          <div className="flex space-x-2 mb-3">
            <div className="flex-1">
              <input 
                type="text" 
                value={importRoomId}
                onChange={(e) => setImportRoomId(e.target.value.toUpperCase())}
                placeholder={t.pvpRoomIdPlaceholder || "Room ID"}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono"
              />
            </div>
            <div className="w-20">
              <input 
                type="number" 
                min="1"
                max="10"
                value={importRound}
                onChange={(e) => setImportRound(parseInt(e.target.value) || 1)}
                placeholder={t.importRoundPlaceholder}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          
          {importLoading ? (
            <div className="w-full bg-slate-100 rounded-lg overflow-hidden h-9 relative">
               <div 
                 className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-300 ease-out"
                 style={{ width: `${importProgress ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
               ></div>
               <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 z-10">
                  {importProgress ? t.importFetching.replace('{current}', String(importProgress.current)).replace('{total}', String(importProgress.total)) : t.importInitializing}
               </div>
            </div>
          ) : (
            <button 
              onClick={handleImportGameRound}
              disabled={!importRoomId || importLoading}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{t.importCompareBtn}</span>
            </button>
          )}
        </div>

        <div className="mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-800">{t.selectedLocation} ({comparePoints.length})</h3>
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
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }}></div>
                    <span className="text-sm text-slate-700 font-medium truncate" title={p.name || ''}>
                      {p.name ? p.name : `${Math.abs(p.location.lat).toFixed(2)}°, ${Math.abs(p.location.lng).toFixed(2)}°`}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeComparePoint(p.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {comparePoints.length >= 5 && !importLoading && (
            <div className="mt-3 text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-100 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1.5" /> {t.maxPoints}
            </div>
          )}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <CitySearchBox onLocationSelect={handleComparisonLocationSelect} />
          </div>
        </div>

        <MapPicker 
          mode="compare"
          selectedLocation={null}
          comparisonPoints={mapPoints}
          onLocationSelect={handleComparisonLocationSelect}
          isMarsMode={isMarsMode}
          isRetroMode={isRetroMode}
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

        {comparePoints.length === 0 && !loading && (
          <div className="min-h-[500px] h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
            <div className={`${isMarsMode ? 'bg-orange-50' : 'bg-indigo-50'} p-4 rounded-full mb-4`}>
              <SplitSquareHorizontal className={`w-8 h-8 ${isMarsMode ? 'text-orange-400' : 'text-indigo-400'}`} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">{t.compareTitle}</h3>
            <p className="text-slate-500 max-w-xs mt-2">{t.compareIntro}</p>
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
                {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{generatingPdf ? t.generating : t.downloadComparison}</span>
              </button>
            </div>
            <ComparisonChart points={comparePoints} />
          </>
        )}
      </div>
    </>
  );
};