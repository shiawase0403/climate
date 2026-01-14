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

  // Transform data for Recharts
  // We need an array of 12 months, where each object has keys for each point
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i;
    const monthData: any = {
      name: t.monthsShort[monthIndex],
    };

    points.forEach((point) => {
      const pointMonthData = point.data.data.find(d => d.month === monthIndex + 1);
      if (pointMonthData) {
        monthData[`temp_${point.id}`] = pointMonthData.temp;
        monthData[`prec_${point.id}`] = pointMonthData.prec;
      }
    });

    return monthData;
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in duration-500">
      
      {/* Temperature Chart */}
      <div className="w-full h-[400px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 pb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 pl-2">{t.compareTemp}</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis 
              label={{ value: t.tempC, angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12 } }}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number, name: string) => {
                // name will be temp_id, we need to map back to location
                const pointId = name.split('_')[1];
                const point = points.find(p => p.id === pointId);
                const label = point 
                  ? `${Math.abs(point.location.lat).toFixed(1)}°${point.location.lat >= 0 ? 'N' : 'S'}`
                  : name;
                return [`${value.toFixed(1)}°C`, label];
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
            {points.map((point) => (
              <Line
                key={point.id}
                type="monotone"
                dataKey={`temp_${point.id}`}
                name={`${Math.abs(point.location.lat).toFixed(1)}°${point.location.lat >= 0 ? 'N' : 'S'}, ${Math.abs(point.location.lng).toFixed(1)}°${point.location.lng >= 0 ? 'E' : 'W'}`}
                stroke={point.color}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Precipitation Chart */}
      <div className="w-full h-[400px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 pb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 pl-2">{t.comparePrecip}</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis 
              label={{ value: t.precipMm, angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12 } }}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
               cursor={{fill: '#f1f5f9'}}
               formatter={(value: number, name: string) => {
                const pointId = name.split('_')[1];
                const point = points.find(p => p.id === pointId);
                const label = point 
                  ? `${Math.abs(point.location.lat).toFixed(1)}°${point.location.lat >= 0 ? 'N' : 'S'}`
                  : name;
                return [`${value.toFixed(1)}mm`, label];
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
            {points.map((point) => (
              <Bar
                key={point.id}
                dataKey={`prec_${point.id}`}
                name={`${Math.abs(point.location.lat).toFixed(1)}°${point.location.lat >= 0 ? 'N' : 'S'}, ${Math.abs(point.location.lng).toFixed(1)}°${point.location.lng >= 0 ? 'E' : 'W'}`}
                fill={point.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};