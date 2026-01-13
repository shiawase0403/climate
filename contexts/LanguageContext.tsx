import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'en' | 'zh';

export interface Translations {
  appTitle: string;
  providedBy: string;
  selectLocation: string;
  instructionMap: string;
  noLocationTitle: string;
  noLocationText: string;
  loading: string;
  errorTitle: string;
  errorText: string;
  noDataTitle: string;
  noDataText: string;
  climateGraph: string;
  precip: string;
  precipMm: string;
  temp: string;
  tempC: string;
  monthlyBreakdown: string;
  avgTemp: string;
  totalPrecip: string;
  month: string;
  selectedLocation: string;
  code: string;
  basedOn: string;
  unknownClimate: string;
  clickMapHint: string;
  months: string[];
  monthsShort: string[];
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: "Global Climate Explorer",
    providedBy: "Data provided by Mapresso",
    selectLocation: "Select Location",
    instructionMap: "Click on any landmass to view its climate classification and monthly weather averages.",
    noLocationTitle: "No Location Selected",
    noLocationText: "Explore the world map on the left and click on a location to reveal its climate secrets.",
    loading: "Fetching climate intelligence...",
    errorTitle: "Data Unavailable",
    errorText: "Unable to retrieve climate data. The service may be temporarily unavailable.",
    noDataTitle: "No Climate Data",
    noDataText: "The selected location appears to be in the ocean or lacks recorded climate data. Please select a location on land.",
    climateGraph: "Climate Graph",
    precip: "Precipitation",
    precipMm: "Precipitation (mm)",
    temp: "Temperature",
    tempC: "Temperature (°C)",
    monthlyBreakdown: "Monthly Breakdown",
    avgTemp: "Avg Temp",
    totalPrecip: "Total Precip",
    month: "Month",
    selectedLocation: "Selected Location",
    code: "Code",
    basedOn: "Based on Köppen-Geiger classification version 0.80",
    unknownClimate: "Unknown Climate",
    clickMapHint: "Click anywhere on the map",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  zh: {
    appTitle: "全球气候探索",
    providedBy: "数据来源 Mapresso",
    selectLocation: "选择地点",
    instructionMap: "点击地图上的任意陆地以查看其气候分类和月度天气平均值。",
    noLocationTitle: "未选择地点",
    noLocationText: "探索左侧的世界地图并点击一个地点以揭示其气候数据。",
    loading: "正在获取气候数据...",
    errorTitle: "数据不可用",
    errorText: "无法获取气候数据。服务可能暂时不可用。",
    noDataTitle: "无气候数据",
    noDataText: "所选地点似乎位于海洋中或缺乏记录的气候数据。请选择陆地上的地点。",
    climateGraph: "气候图表",
    precip: "降水量",
    precipMm: "降水量 (mm)",
    temp: "温度",
    tempC: "温度 (°C)",
    monthlyBreakdown: "月度数据",
    avgTemp: "平均温度",
    totalPrecip: "总降水量",
    month: "月份",
    selectedLocation: "已选地点",
    code: "代码",
    basedOn: "基于 Köppen-Geiger 气候分类 0.80 版",
    unknownClimate: "未知气候",
    clickMapHint: "点击地图任意位置",
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
