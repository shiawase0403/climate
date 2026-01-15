import React from 'react';
import { BookOpen, MapPin } from 'lucide-react';
import { CityDefinition } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CityAnalysisCardProps {
  city: CityDefinition | null;
}

export const CityAnalysisCard: React.FC<CityAnalysisCardProps> = ({ city }) => {
  const { t } = useLanguage();

  if (!city) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden mb-6 animate-in slide-in-from-left-4 duration-500">
      <div className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-emerald-800">{t.climateDynamicsAnalysis}</h3>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center space-x-2 mb-3">
             <MapPin className="w-4 h-4 text-slate-400" />
             <span className="font-semibold text-slate-800">{city.name}</span>
             <span className="text-slate-400 text-sm">•</span>
             <span className="text-slate-500 text-sm">{city.country}</span>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed text-justify">
          {city.description}
        </p>
      </div>
    </div>
  );
};