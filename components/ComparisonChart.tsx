import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CloudRain, Thermometer } from 'lucide-react';
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

  // 1. Calculate Combined Data (For Mobile View)
  const combinedData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i;
    const monthData: any = {
      name: t.monthsShort[monthIndex],
    };
    points.forEach((point) => {
      const pData = point.data.data.find(d => d.month === monthIndex + 1);
      if (pData) {
        monthData[`temp_${point.id}`] = pData.temp;
        monthData[`prec_${point.id}`] = pData.prec;
      }
    });
    return monthData;
  });

  // 2. Calculate Global Domains (For Desktop View consistency)
  // Precipitation: Start at 0, go to max + 10%
  const allPrecip = points.flatMap(p => p.data.data.map(d => d.prec));
  const maxPrecip = Math.max(...allPrecip, 10); 
  const precipDomain = [0, Math.ceil(maxPrecip * 1.1)];

  // Temperature: Min - 5 to Max + 5
  const allTemp = points.flatMap(p => p.data.data.map(d => d.temp));
  const minTemp = Math.min(...allTemp, 0);
  const maxTemp = Math.max(...allTemp, 10);
  const tempDomain = [Math.floor(minTemp - 5), Math.ceil(maxTemp + 5)];

  const LocationHeader: React.FC<{ point: ComparisonPoint }> = ({ point }) => (
    <div className="flex items-center space-x-2 mb-4 pl-1">
      <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: point.color }}></div>
      <h3 className="text-sm font-semibold text-slate-800 truncate" title={`${point.location.lat}, ${point.location.lng}`}>
        {Math.abs(point.location.lat).toFixed(2)}°{point.location.lat >= 0 ? 'N' : 'S'}, {Math.abs(point.location.lng).toFixed(2)}°{point.location.lng >= 0 ? 'E' : 'W'}
      </h3>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* --- PRECIPITATION SECTION --- */}
      <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
            <CloudRain className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t.comparePrecip}</h3>
        </div>
        
        {/* MOBILE VIEW: Single Combined Chart */}
        <div className="block xl:hidden w-full h-[400px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 pb-8">
           <ResponsiveContainer width="100%" height="90%">
              <BarChart data={combinedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                 <CartesianGrid stroke="#f1f5f9" vertical={false} />
                 <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                 <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    label={{ value: 'mm', angle: -90, position: 'insideLeft', offset: 10, style: {fill: '#64748b'} }} 
                 />
                 <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   cursor={{fill: '#f1f5f9'}}
                   formatter={(value: number, name: string) => {
                      const pointId = name.split('_')[1];
                      const point = points.find(p => p.id === pointId);
                      return [`${value.toFixed(1)}mm`, point ? `${Math.abs(point.location.lat).toFixed(1)}°` : ''];
                   }}
                 />
                 <Legend verticalAlign="bottom" height={36} />
                 {points.map(point => (
                    <Bar 
                      key={point.id}
                      dataKey={`prec_${point.id}`}
                      name={`${Math.abs(point.location.lat).toFixed(1)}°${point.location.lat >= 0 ? 'N' : 'S'}`} 
                      fill={point.color}
                      radius={[4, 4, 0, 0]}
                    />
                 ))}
              </BarChart>
           </ResponsiveContainer>
        </div>

        {/* DESKTOP VIEW: Grid of Individual Charts */}
        <div className="hidden xl:grid xl:grid-cols-2 gap-6">
          {points.map((point) => {
             const chartData = point.data.data.map((d) => ({
              ...d,
              name: t.monthsShort[d.month - 1],
            }));

            return (
              <div key={`prec-${point.id}`} className="w-full h-[320px] bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <LocationHeader point={point} />
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      domain={precipDomain}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value.toFixed(1)}mm`, t.precip]}
                    />
                    <Bar 
                      dataKey="prec" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]} 
                      name={t.precip}
                      fillOpacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- TEMPERATURE SECTION --- */}
      <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
           <div className="p-2.5 bg-red-100 rounded-xl text-red-600 shadow-sm">
            <Thermometer className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t.compareTemp}</h3>
        </div>
        
        {/* MOBILE VIEW: Single Combined Chart */}
        <div className="block xl:hidden w-full h-[400px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 pb-8">
           <ResponsiveContainer width="100%" height="90%">
              <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                 <CartesianGrid stroke="#f1f5f9" vertical={false} />
                 <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                 <YAxis 
                    domain={['auto', 'auto']} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    label={{ value: '°C', angle: -90, position: 'insideLeft', offset: 10, style: {fill: '#64748b'} }} 
                 />
                 <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value: number, name: string) => {
                      const pointId = name.split('_')[1];
                      const point = points.find(p => p.id === pointId);
                      return [`${value.toFixed(1)}°C`, point ? `${Math.abs(point.location.lat).toFixed(1)}°` : ''];
                   }}
                 />
                 <Legend verticalAlign="bottom" height={36} />
                 {points.map(point => (
                    <Line 
                      key={point.id}
                      type="monotone"
                      dataKey={`temp_${point.id}`}
                      name={`${Math.abs(point.location.lat).toFixed(1)}°${point.location.lat >= 0 ? 'N' : 'S'}`}
                      stroke={point.color}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                 ))}
              </LineChart>
           </ResponsiveContainer>
        </div>

        {/* DESKTOP VIEW: Grid of Individual Charts */}
        <div className="hidden xl:grid xl:grid-cols-2 gap-6">
          {points.map((point) => {
            const chartData = point.data.data.map((d) => ({
              ...d,
              name: t.monthsShort[d.month - 1],
            }));

            return (
              <div key={`temp-${point.id}`} className="w-full h-[320px] bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <LocationHeader point={point} />
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      domain={tempDomain}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                     <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value.toFixed(1)}°C`, t.temp]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                      name={t.temp}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};