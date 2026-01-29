
import React from 'react';
import { MonthlyClimateData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ClimateTableProps {
  data: MonthlyClimateData[];
  locationName?: string | null;
}

export const ClimateTable: React.FC<ClimateTableProps> = ({ data, locationName }) => {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return null;
  }

  // Calculations for averages/sums
  const totalPrecip = data.reduce((acc, curr) => acc + curr.prec, 0);
  const avgTemp = data.reduce((acc, curr) => acc + curr.temp, 0) / data.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <h3 className="text-lg font-semibold text-slate-800">
          {locationName ? `${locationName} - ` : ''}{t.monthlyBreakdown}
        </h3>
        <div className="text-xs font-medium text-slate-500 flex space-x-4">
            <span>{t.avgTemp}: <strong className="text-slate-800">{avgTemp.toFixed(1)}°C</strong></span>
            <span>{t.totalPrecip}: <strong className="text-slate-800">{Math.round(totalPrecip)}mm</strong></span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.month}</th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t.tempC}</th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t.precipMm}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((row) => (
              <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 sm:px-6 py-2 sm:py-3 text-sm font-medium text-slate-900 whitespace-nowrap">
                  {t.monthsShort[row.month - 1]}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-3 text-right whitespace-nowrap">
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-slate-800 font-medium">{row.temp.toFixed(1)}</span>
                    {(row.tempmax !== undefined && row.tempmin !== undefined) && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="flex items-center" title="Min"><ArrowDown className="w-2.5 h-2.5 mr-0.5" />{row.tempmin.toFixed(1)}</span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center" title="Max"><ArrowUp className="w-2.5 h-2.5 mr-0.5" />{row.tempmax.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-3 text-sm text-slate-600 text-right whitespace-nowrap">
                  {row.prec.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
