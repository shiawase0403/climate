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
  downloadReport: string;
  generating: string;
  reportTitle: string;
  generatedOn: string;
  coords: string;
  latitude: string;
  longitude: string;
  searchLocation: string;
  invalidLat: string;
  invalidLng: string;
  manualInputTitle: string;
  mapLayers: {
    osm: string;
    gaode: string;
    gaodeSat: string;
    gaodeEn: string;
  };
  // Comparison Mode
  modeSingle: string;
  modeCompare: string;
  compareTitle: string;
  compareIntro: string;
  addPoint: string;
  maxPoints: string;
  clearAll: string;
  location: string;
  compareTemp: string;
  comparePrecip: string;
  // Footer Notice
  notice: {
    title: string;
    description: string;
    groupMajor: string;
    groupPrecip: string;
    groupTemp: string;
    keys: {
      A: string;
      B: string;
      C: string;
      D: string;
      E: string;
      f: string;
      w: string;
      s: string;
      a: string;
      b: string;
      c: string;
    }
  }
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
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    downloadReport: "Download PDF Report",
    generating: "Generating...",
    reportTitle: "Climate Analysis Report",
    generatedOn: "Generated on",
    coords: "Coordinates",
    latitude: "Latitude",
    longitude: "Longitude",
    searchLocation: "Get Climate Data",
    invalidLat: "Invalid latitude (-90 to 90)",
    invalidLng: "Invalid longitude (-180 to 180)",
    manualInputTitle: "Manual Input",
    mapLayers: {
      osm: "OpenStreetMap",
      gaode: "GaoDe Map",
      gaodeSat: "GaoDe Satellite",
      gaodeEn: "GaoDe English/Chinese"
    },
    modeSingle: "Single Location",
    modeCompare: "Compare Locations",
    compareTitle: "Climate Comparison",
    compareIntro: "Select up to 5 points on the map to compare their climate data side-by-side.",
    addPoint: "Click map to add point",
    maxPoints: "Max 5 points reached",
    clearAll: "Clear All",
    location: "Location",
    compareTemp: "Temperature Comparison",
    comparePrecip: "Precipitation Comparison",
    notice: {
      title: "About Climate Classification",
      description: "This site uses the Köppen climate classification system. Please note there may be differences compared to standard geography curricula due to data sources. Below is a key to the classification codes:",
      groupMajor: "Major Climate Types",
      groupPrecip: "Precipitation Patterns",
      groupTemp: "Temperature Patterns",
      keys: {
        A: "Tropical",
        B: "Arid / Semi-Arid",
        C: "Temperate / Subtropical",
        D: "Continental / Subarctic",
        E: "Polar",
        f: "Fully Humid (No Dry Season)",
        w: "Winter Dry (Summer Rain)",
        s: "Summer Dry (Winter Rain)",
        a: "Hot Summer",
        b: "Warm Summer",
        c: "Cold Summer"
      }
    }
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
    monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    downloadReport: "下载 PDF 报告",
    generating: "正在生成...",
    reportTitle: "气候分析报告",
    generatedOn: "生成时间",
    coords: "坐标",
    latitude: "纬度",
    longitude: "经度",
    searchLocation: "获取气候数据",
    invalidLat: "无效纬度 (-90 到 90)",
    invalidLng: "无效经度 (-180 到 180)",
    manualInputTitle: "手动输入",
    mapLayers: {
      osm: "OpenStreetMap",
      gaode: "高德地图",
      gaodeSat: "高德卫星地图",
      gaodeEn: "高德中英地图"
    },
    modeSingle: "单点模式",
    modeCompare: "对比模式",
    compareTitle: "气候对比",
    compareIntro: "在地图上选择最多 5 个点以并排比较它们的气候数据。",
    addPoint: "点击地图添加地点",
    maxPoints: "已达最大数量 (5)",
    clearAll: "全部清除",
    location: "地点",
    compareTemp: "温度对比",
    comparePrecip: "降水量对比",
    notice: {
      title: "关于气候分类的说明",
      description: "由于数据源限制，本站采用柯本气候分类法，我们已经尽可能将其与课内所学对应，但是仍有较大出入，下面是柯本气候分类法的一些字母代号含义：",
      groupMajor: "气候带",
      groupPrecip: "降水特征",
      groupTemp: "温度特征",
      keys: {
        A: "热带气候",
        B: "干旱半干旱气候",
        C: "亚热带/温带气候",
        D: "温带亚寒带气候",
        E: "极地气候",
        f: "全年多雨",
        w: "夏季多雨",
        s: "冬季多雨",
        a: "热夏",
        b: "凉夏",
        c: "冷夏"
      }
    }
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