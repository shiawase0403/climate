
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
