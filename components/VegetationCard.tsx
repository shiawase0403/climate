
import React, { useMemo } from 'react';
import { Leaf, Sprout, TreeDeciduous } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getVegetationInfo } from '../data/vegetationData';
import { ClassificationEntry, MonthlyClimateData } from '../types';
import { getClimateClassification } from '../services/logic';

interface VegetationCardProps {
  classificationData: ClassificationEntry[];
  climateData?: MonthlyClimateData[];
  lat?: number;
}

export const VegetationCard: React.FC<VegetationCardProps> = ({ classificationData, climateData, lat }) => {
  const { t } = useLanguage();

  // Determine the code: prefer API classification, fall back to calculation if available
  const code = useMemo(() => {
    // 1. Try API Classification
    const mainClass = classificationData?.find(c => c.type === 'K\u00f6ppen-Geiger' && c.text) || classificationData?.[0];
    if (mainClass?.code && mainClass.code !== 'Calculated') {
      return mainClass.code;
    }

    // 2. Try Calculation (Fast Mode)
    if (climateData && climateData.length === 12 && lat !== undefined) {
      const temps = climateData.map(d => d.temp);
      const precips = climateData.map(d => d.prec);
      return getClimateClassification(temps, precips, lat);
    }

    return null;
  }, [classificationData, climateData, lat]);

  if (!code) return null;

  const vegetationInfo = getVegetationInfo(code);

  if (!vegetationInfo) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden mb-6 mt-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <TreeDeciduous className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-emerald-900">{t.vegetationAnalysis}</h3>
        </div>
      </div>
      <div className="p-5">
        {/* Vegetation Name */}
        <div className="mb-4">
           <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">{t.vegetationType}</span>
           <div className="text-lg font-semibold text-slate-800">{vegetationInfo.name}</div>
        </div>

        {/* Description */}
        <div className="mb-4">
           <div className="flex items-start space-x-2">
              <Sprout className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                 <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">{t.typicalVegetation}</span>
                 <p className="text-slate-700 text-sm leading-relaxed text-justify">
                   {vegetationInfo.description}
                 </p>
              </div>
           </div>
        </div>

        {/* Key Species */}
        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
           <div className="flex items-center space-x-2 mb-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t.keySpecies}</span>
           </div>
           <div className="text-sm text-emerald-900 font-medium pl-6">
              {vegetationInfo.species}
           </div>
        </div>
      </div>
    </div>
  );
};
