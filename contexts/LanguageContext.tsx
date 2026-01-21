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
  downloadComparison: string;
  generating: string;
  reportTitle: string;
  comparisonReportTitle: string;
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
  // City Search
  searchCity: string;
  searchCityPlaceholder: string;
  noResults: string;
  // Comparison Mode
  modeSingle: string;
  modeCompare: string;
  modeGame: string;
  modePvp: string; // New
  compareTitle: string;
  compareIntro: string;
  addPoint: string;
  maxPoints: string;
  clearAll: string;
  location: string;
  compareTemp: string;
  comparePrecip: string;
  tempComparisonTable: string;
  precipComparisonTable: string;
  // Game Mode
  gameTitle: string;
  gameInstruction: string;
  gameInstructionGuess: string;
  gameConfirmGuess: string;
  gameResult: string;
  gameScore: string;
  gameDistance: string;
  gameActualLocation: string;
  gameNextRound: string;
  gameLoading: string;
  mysteryLocation: string;
  gameNeedHint: string;
  gameShowHint: string;
  gameShowCountryHint: string;
  gameCountry: string;
  // Challenge Mode
  challengeMode: string;
  startChallenge: string;
  challengeRound: string;
  challengeTotal: string;
  challengeGrade: string;
  challengeComplete: string;
  challengeQuitConfirm: string;
  challengeQuitBtn: string;
  challengePlayAgain: string;
  challengeHintsDisabled: string;
  gradePhi: string;
  gradeBlueV: string;
  gradeV: string;
  gradeA: string;
  gradeB: string;
  gradeC: string;
  gradeF: string;
  // Explore Mode
  exploreCities: string;
  climateExplorer: string;
  exploreInstruction: string;
  exploreDataCredit: string;
  climateDynamicsAnalysis: string;
  // Vegetation Card
  vegetationAnalysis: string;
  vegetationType: string;
  typicalVegetation: string;
  keySpecies: string;
  // Tutorial
  openTutorial: string;
  tutorialTitle: string;
  closeTutorial: string;
  // PVP Mode (New)
  pvpLoginTitle: string;
  pvpUsername: string;
  pvpPassword: string;
  pvpLoginBtn: string;
  pvpCreateRoom: string;
  pvpJoinRoom: string;
  pvpRoomIdPlaceholder: string;
  pvpWaitingForPlayers: string;
  pvpStartGame: string;
  pvpPlayers: string;
  pvpRoomId: string;
  pvpRound: string;
  pvpTimeLeft: string;
  pvpAnswerSubmitted: string;
  pvpWaitingOthers: string;
  pvpRoundResults: string;
  pvpGameOver: string;
  pvpFinalRank: string;
  pvpRatingChange: string;
  pvpBackToLobby: string;
  pvpHP: string;
  pvpScore: string;
  // Specific Descriptions
  climateDescriptions: Record<string, string>;
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
      d: string;
    };
  };
  // About Us
  aboutUs: {
    title: string;
    design: string;
    geo: string;
    server: string;
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
    downloadComparison: "Download Comparison PDF",
    generating: "Generating...",
    reportTitle: "Climate Analysis Report",
    comparisonReportTitle: "Climate Comparison Report",
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
    searchCity: "City Search",
    searchCityPlaceholder: "Enter city name...",
    noResults: "No cities found",
    modeSingle: "Single Location",
    modeCompare: "Compare Locations",
    modeGame: "Game",
    modePvp: "PVP Battle",
    compareTitle: "Climate Comparison",
    compareIntro: "Select up to 5 points on the map to compare their climate data side-by-side.",
    addPoint: "Click map to add point",
    maxPoints: "Max 5 points reached",
    clearAll: "Clear All",
    location: "Location",
    compareTemp: "Temperature Comparison",
    comparePrecip: "Precipitation Comparison",
    tempComparisonTable: "Temperature Comparison Data (°C)",
    precipComparisonTable: "Precipitation Comparison Data (mm)",
    gameTitle: "Climate Treasure Hunt",
    gameInstruction: "Analyze the climate data on the right. Can you guess where this location is? Click on the map to place your guess.",
    gameInstructionGuess: "Place your marker on the map",
    gameConfirmGuess: "Confirm Guess",
    gameResult: "Round Result",
    gameScore: "Score",
    gameDistance: "Distance",
    gameActualLocation: "Actual Location",
    gameNextRound: "Next Round",
    gameLoading: "Finding a random city...",
    mysteryLocation: "Mystery Location",
    gameNeedHint: "Need a hint?",
    gameShowHint: "Show Climate Code",
    gameShowCountryHint: "Show Country",
    gameCountry: "Country",
    challengeMode: "Challenge Mode",
    startChallenge: "Start 5-Round Challenge",
    challengeRound: "Round",
    challengeTotal: "Total Score",
    challengeGrade: "Final Grade",
    challengeComplete: "Challenge Complete!",
    challengeQuitConfirm: "Are you sure you want to quit the challenge? Your progress will be lost.",
    challengeQuitBtn: "Quit Challenge",
    challengePlayAgain: "Play Again",
    challengeHintsDisabled: "Hints are banned in Challenge Mode",
    gradePhi: "Golden Phi (φ)",
    gradeBlueV: "Blue V",
    gradeV: "V",
    gradeA: "A",
    gradeB: "B",
    gradeC: "C",
    gradeF: "F",
    exploreCities: "Explore Cities",
    climateExplorer: "Climate Explorer",
    exploreInstruction: "Select a climate classification code to view classic city examples and their deep climate analysis.",
    exploreDataCredit: "Data provided by Detailed Analysis Report of Global Classic Urban Geo-Climatology",
    climateDynamicsAnalysis: "Climate Dynamics Depth Analysis",
    vegetationAnalysis: "Vegetation & Ecosystem Analysis",
    vegetationType: "Vegetation Type",
    typicalVegetation: "Ecological Characteristics",
    keySpecies: "Key Species",
    openTutorial: "Tutorial",
    tutorialTitle: "App Tutorial",
    closeTutorial: "Close",
    pvpLoginTitle: "Login to PVP",
    pvpUsername: "Username",
    pvpPassword: "Password",
    pvpLoginBtn: "Login",
    pvpCreateRoom: "Create Room",
    pvpJoinRoom: "Join Room",
    pvpRoomIdPlaceholder: "Enter 5-digit Room ID",
    pvpWaitingForPlayers: "Waiting for players...",
    pvpStartGame: "Start Game",
    pvpPlayers: "Players",
    pvpRoomId: "Room ID",
    pvpRound: "Round",
    pvpTimeLeft: "Time Left",
    pvpAnswerSubmitted: "Answer Submitted! Waiting for others...",
    pvpWaitingOthers: "Waiting for other players to answer...",
    pvpRoundResults: "Round Results",
    pvpGameOver: "Game Over",
    pvpFinalRank: "Final Ranking",
    pvpRatingChange: "Rating Change",
    pvpBackToLobby: "Back to Lobby",
    pvpHP: "HP",
    pvpScore: "Score",
    climateDescriptions: {}, // Empty for English
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
        c: "Cold Summer",
        d: "Extremely Cold Winter"
      }
    },
    aboutUs: {
      title: "About Us",
      design: "Project Design & Production: shiawase.",
      geo: "Geography Consultant: 台风来了砖家",
      server: "Technical Support: nth_element"
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
    downloadComparison: "下载对比报告 PDF",
    generating: "正在生成...",
    reportTitle: "气候分析报告",
    comparisonReportTitle: "气候对比报告",
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
    searchCity: "城市搜索",
    searchCityPlaceholder: "输入城市名称...",
    noResults: "未找到城市",
    modeSingle: "单点模式",
    modeCompare: "对比模式",
    modeGame: "气候寻宝",
    modePvp: "PVP对战",
    compareTitle: "气候对比",
    compareIntro: "在地图上选择最多 5 个点以并排比较它们的气候数据。",
    addPoint: "点击地图添加地点",
    maxPoints: "已达最大数量 (5)",
    clearAll: "全部清除",
    location: "地点",
    compareTemp: "温度对比",
    comparePrecip: "降水量对比",
    tempComparisonTable: "温度对比数据 (°C)",
    precipComparisonTable: "降水量对比数据 (mm)",
    gameTitle: "气候寻宝模式",
    gameInstruction: "观察右侧的气候数据，猜猜看这是世界上的哪个地方？点击地图进行猜测。",
    gameInstructionGuess: "在地图上标记你的猜测",
    gameConfirmGuess: "确认猜测",
    gameResult: "本轮结果",
    gameScore: "得分",
    gameDistance: "距离",
    gameActualLocation: "实际位置",
    gameNextRound: "下一轮",
    gameLoading: "正在寻找随机城市...",
    mysteryLocation: "神秘地点",
    gameNeedHint: "需要提示吗？",
    gameShowHint: "显示气候代码",
    gameShowCountryHint: "显示国家",
    gameCountry: "国家",
    challengeMode: "挑战模式",
    startChallenge: "开始 5 轮挑战",
    challengeRound: "轮次",
    challengeTotal: "总分",
    challengeGrade: "最终评级",
    challengeComplete: "挑战完成！",
    challengeQuitConfirm: "确定要退出挑战吗？当前进度将丢失。",
    challengeQuitBtn: "退出挑战",
    challengePlayAgain: "再次挑战",
    challengeHintsDisabled: "挑战模式下禁止使用提示",
    gradePhi: "金 Phi (φ)",
    gradeBlueV: "蓝 V",
    gradeV: "V",
    gradeA: "A",
    gradeB: "B",
    gradeC: "C",
    gradeF: "F",
    exploreCities: "探索城市",
    climateExplorer: "气候探索",
    exploreInstruction: "选择一个气候分类代码以查看经典城市案例及其深度气候分析。",
    exploreDataCredit: "数据来源：《全球经典城市地理气候详细分析报告》",
    climateDynamicsAnalysis: "气候动力学深度分析",
    vegetationAnalysis: "植被与生态系统分析",
    vegetationType: "植被类型",
    typicalVegetation: "典型植被与生态特征",
    keySpecies: "关键物种",
    openTutorial: "使用教程",
    tutorialTitle: "应用教程",
    closeTutorial: "关闭",
    pvpLoginTitle: "登录 PVP",
    pvpUsername: "用户名",
    pvpPassword: "密码",
    pvpLoginBtn: "登录",
    pvpCreateRoom: "创建房间",
    pvpJoinRoom: "加入房间",
    pvpRoomIdPlaceholder: "输入5位房间号",
    pvpWaitingForPlayers: "等待玩家加入...",
    pvpStartGame: "开始游戏",
    pvpPlayers: "玩家列表",
    pvpRoomId: "房间号",
    pvpRound: "回合",
    pvpTimeLeft: "剩余时间",
    pvpAnswerSubmitted: "答案已提交！等待其他玩家...",
    pvpWaitingOthers: "正在等待其他玩家作答...",
    pvpRoundResults: "本轮结果",
    pvpGameOver: "游戏结束",
    pvpFinalRank: "最终排名",
    pvpRatingChange: "积分变动",
    pvpBackToLobby: "返回大厅",
    pvpHP: "生命值",
    pvpScore: "分数",
    climateDescriptions: {
      "Af": "分布于赤道两侧，以及海洋信风的迎风坡",
      "Am": "在柯本气候分类法中位于热带雨林两侧，属于过渡型，与课内定义不同。",
      "BWh": "沙漠气候，自然植被为荒漠",
      "BWk": "沙漠气候，自然植被为荒漠",
      "BSh": "半干旱气候，自然植被为灌丛、草原",
      "BSk": "半干旱气候，自然植被为灌丛、草原",
      "Cfa": "亚热带季风和亚热带湿润气候，降水较为均匀",
      "Cwa": "亚热带季风气候，降水分配不均匀",
      "Cfb": "温带海洋性气候，广泛分布于大陆西岸中纬度和海岛",
      "Cfc": "温带海洋性气候向极地的延伸",
      "Cwb": "亚热带高原季风气候，如昆明",
      "Cwc": "亚热带高原季风气候，如昆明",
      "Csa": "热夏型地中海气候，多分布于地中海周围，如伊斯坦布尔，罗马",
      "Csb": "凉夏型地中海气候，多分布于寒流影响的大陆西岸，如珀斯（澳大利亚），旧金山，波尔图（葡萄牙）",
      "Dfa": "主要分布在北美大陆东岸",
      "Dfb": "主要分布在温带海洋性气候向大陆延伸的一侧以及大陆东岸中纬度",
      "Dwa": "广泛分布于亚洲受季风影响的区域",
      "Dwb": "广泛分布于亚洲受季风影响的区域",
      "Dwc": "广泛分布于亚洲受季风影响的区域"
    },
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
        c: "冷夏",
        d: "冬季极寒"
      }
    },
    aboutUs: {
      title: "关于我们",
      design: "项目设计与制作：shiawase.",
      geo: "地理顾问：台风来了砖家",
      server: "技术支持：nth_element"
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
  const [language, setLanguage] = useState<Language>('zh');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};