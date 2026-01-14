import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ClimateDataResponse, GeoLocation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export interface ComparisonPoint {
  id: string;
  location: GeoLocation;
  data: ClimateDataResponse;
  color: string;
}

interface ComparisonChartProps {
  points: ComparisonPoint[];
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ points }) => {
  const { t } = useLanguage();

  if (!points || points.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in duration-500">
      {points.map((point) => {
        // Transform data for Recharts for this specific point
        const chartData = point.data.data.map((d) => ({
          ...d,
          name: t.monthsShort[d.month - 1],
        }));

        // Calculate generic range for better visualization
        const minTemp = Math.min(...point.data.data.map(d => d.temp));
        const maxTemp = Math.max(...point.data.data.map(d => d.temp));
        const yAxisTempDomain = [Math.floor(minTemp - 5), Math.ceil(maxTemp + 5)];

        return (
          <div key={point.id} className="w-full h-[400px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 pb-8">
            <div className="flex items-center space-x-2 mb-4 pl-2">
               <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: point.color }}></div>
               <h3 className="text-lg font-semibold text-slate-800 truncate">
                 {Math.abs(point.location.lat).toFixed(2)}°{point.location.lat >= 0 ? 'N' : 'S'}, {Math.abs(point.location.lng).toFixed(2)}°{point.location.lng >= 0 ? 'E' : 'W'}
               </h3>
            </div>
            
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  scale="point" 
                  padding={{ left: 10, right: 10 }} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                {/* Precipitation Axis (Left) */}
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#3b82f6" 
                  label={{ value: t.precipMm, angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fill: '#3b82f6', fontSize: 12 } }}
                  tick={{ fill: '#3b82f6', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                {/* Temperature Axis (Right) */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#ef4444" 
                  domain={yAxisTempDomain}
                  label={{ value: t.tempC, angle: 90, position: 'insideRight', offset: 5, style: { textAnchor: 'middle', fill: '#ef4444', fontSize: 12 } }}
                  tick={{ fill: '#ef4444', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string) => {
                    if (name === t.temp) return [`${value.toFixed(1)}°C`, name];
                    if (name === t.precip) return [`${value.toFixed(1)}mm`, name];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `${t.month}: ${label}`}
                />
                <Legend verticalAlign="bottom" height={36}/>
                
                <Bar 
                  yAxisId="left" 
                  dataKey="prec" 
                  name={t.precip} 
                  barSize={20} 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.6}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="temp" 
                  name={t.temp} 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
};