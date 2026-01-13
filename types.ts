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
}
