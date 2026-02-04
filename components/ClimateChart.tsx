
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
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { MonthlyClimateData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Mountain } from 'lucide-react';

interface ClimateChartProps {
  data: MonthlyClimateData[];
  locationName?: string | null;
  elevation?: number;
}

export const ClimateChart: React.FC<ClimateChartProps> = ({ data, locationName, elevation }) => {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map((d) => ({
    ...d,
    name: t.monthsShort[d.month - 1],
  }));

  // Calculate generic range for better visualization
  const minTemp = Math.min(...data.map(d => d.temp));
  const maxTemp = Math.max(...data.map(d => d.temp));
  
  // Add some padding to Y-axis
  const yAxisTempDomain = [Math.floor(minTemp - 5), Math.ceil(maxTemp + 5)];
  
  return (
    <div id="climate-chart-container" className="w-full h-[450px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 pb-8">
      <div className="flex justify-between items-center mb-4 pl-2 pr-2">
        <h3 className="text-lg font-semibold text-slate-800">
          {locationName ? `${locationName} - ` : ''}{t.climateGraph}
        </h3>
        {elevation !== undefined && elevation !== null && (
          <div className="flex items-center space-x-1 text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
            <Mountain className="w-4 h-4" />
            <span>{Math.round(elevation)} m</span>
          </div>
        )}
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
              if (value === null || value === undefined) return ['-', name];
              if (name === t.temp) return [`${value.toFixed(1)}°C`, name];
              if (name === t.precip) return [`${value.toFixed(1)}mm`, name];
              // Fallback if names don't match exactly (e.g. initial render vs update)
              return [value, name];
            }}
            labelFormatter={(label) => `${t.month}: ${label}`}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} verticalAlign="bottom" height={36}/>
          
          <Bar 
            yAxisId="left" 
            dataKey="prec" 
            name={t.precip} 
            barSize={20} 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            fillOpacity={0.6}
          />
          <ReferenceLine yAxisId="right" y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
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
};
