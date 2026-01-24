
// Raw Climate Data Types
export interface MonthlyClimateData {
  month: number;
  temp: number; // Temperature in Celsius
  prec: number; // Precipitation in mm
}

export interface ClimateDataResponse {
  results: {
    location: {
      lat: string;
      lon: string;
    };
  };
  status: string;
  data: MonthlyClimateData[];
}

// Classification Types
export interface ClassificationEntry {
  type: string;
  code: string;
  short: string;
  text?: string;
}

export interface ClassificationResponse {
  results: {
    lat: string;
    lon: string;
    version: string;
  };
  status: string;
  data: ClassificationEntry[];
}

export interface GeoLocation {
  lat: number;
  lng: number;
  name?: string;
}

// Comparison Types
export interface ComparisonPoint {
  id: string;
  location: GeoLocation;
  name?: string;
  data: ClimateDataResponse;
  color: string;
}

// Explore Feature Types
export interface CityDefinition {
  name: string;
  country: string;
  lat: number;
  lng: number;
  description: string;
}

export interface ClimateCategory {
  code: string;
  title: string;
  cities: CityDefinition[];
}

// Search Types
export interface CitySearchResult {
  city: string;
  city_ascii: string;
  lat: number;
  lng: number;
  country: string;
  count?: number;
}

// Game Types
export interface RandomCityResponse {
  city: string;
  lat: string | number;
  lon: string | number;
  country: string;
}

export type GameStatus = 'playing' | 'revealed';

export interface ChallengeRoundResult {
  round: number;
  targetCity: RandomCityResponse;
  userGuess: GeoLocation;
  distance: number;
  score: number;
}

// PVP Mode Types
export interface PvpPlayer {
  id: string;
  name: string;
  score: number;
  hp?: number; // For 1v1 mode
  isOwner?: boolean;
  hasAnswered?: boolean;
  isOnline?: boolean;
}

export interface PvpRoomInfo {
  roomId: string;
  players: PvpPlayer[];
  status: 'waiting' | 'playing' | 'finished';
  mode: '1v1' | 'multi'; // Inferred from player count/logic
}

export interface PvpRoundResult {
  answer: {
    city: string;
    country: string;
    lat: number;
    lon: number;
    climate?: ClassificationResponse;
  };
  players: {
    id: string;
    name: string;
    lat: number; // User guess
    lon: number; // User guess
    score: number; // Round score
    totalScore: number;
    distance: number;
    delta?: number; // Score change
  }[];
}

export interface PvpGameResult {
  rank: number;
  name: string;
  score: number;
  delta: number; // Final rating change
  rating: number; // Final rating
}

// Match Review Types
export interface MatchReviewAnswer {
  userId: number | string;
  username: string;
  lat: number;
  lon: number;
  score: number;
}

export interface MatchReviewDetail {
  round: number;
  city: {
    city: string;
    id: number;
    lat: string | number;
    lon: string | number;
    country: string;
  };
  answers: MatchReviewAnswer[];
  scores: any[];
}

export interface MatchReviewData {
  id: number;
  room_id: string;
  start_time: string;
  end_time: string;
  details: MatchReviewDetail[];
}