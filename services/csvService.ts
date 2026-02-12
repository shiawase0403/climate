
import { CitySearchResult, RandomCityResponse } from '../types';

// API endpoint provided by the user
const API_BASE_URL_DEFAULT = 'https://api-forward.hywiki.org/climate/cities/?mode=1&name=';
const API_BASE_URL_CITY = 'https://api-forward.hywiki.org/climate/cities/?mode=1.1&name=';
const API_BASE_URL_COUNTRY = 'https://api-forward.hywiki.org/climate/cities/?mode=1.2&name=';
const API_NEAREST_URL = 'https://api-forward.hywiki.org/climate/cities/?mode=2';
const API_RANDOM_URL = 'https://api-forward.hywiki.org/climate/cities/?mode=3';

// Fallback data in case API is down
const FALLBACK_CITIES: RandomCityResponse[] = [
  { city: 'Tokyo', lat: 35.6895, lon: 139.6917, country: 'Japan' },
  { city: 'New York', lat: 40.7128, lon: -74.0060, country: 'United States' },
  { city: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
  { city: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
  { city: 'Moscow', lat: 55.7558, lon: 37.6173, country: 'Russia' },
  { city: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
  { city: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'Egypt' },
  { city: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
  { city: 'Sao Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil' },
  { city: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore' },
  { city: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'United Arab Emirates' },
  { city: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'United States' },
  { city: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'Thailand' },
  { city: 'Istanbul', lat: 41.0082, lon: 28.9784, country: 'Turkey' },
  { city: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India' },
  { city: 'Shanghai', lat: 31.2304, lon: 121.4737, country: 'China' },
  { city: 'Mexico City', lat: 19.4326, lon: -99.1332, country: 'Mexico' },
  { city: 'Lima', lat: -12.0464, lon: -77.0428, country: 'Peru' },
  { city: 'Nairobi', lat: -1.2921, lon: 36.8219, country: 'Kenya' },
  { city: 'Cape Town', lat: -33.9249, lon: 18.4241, country: 'South Africa' },
  { city: 'Buenos Aires', lat: -34.6037, lon: -58.3816, country: 'Argentina' },
  { city: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea' },
  { city: 'Jakarta', lat: -6.2088, lon: 106.8456, country: 'Indonesia' },
  { city: 'Karachi', lat: 24.8607, lon: 67.0011, country: 'Pakistan' },
  { city: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'Spain' },
  { city: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'Canada' },
  { city: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany' },
  { city: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy' },
  { city: 'Kiev', lat: 50.4501, lon: 30.5234, country: 'Ukraine' },
  { city: 'New Delhi', lat: 28.6139, lon: 77.2090, country: 'India' }
];

export type SearchMode = 'default' | 'city' | 'country';

export const searchCities = async (query: string, mode: SearchMode = 'default', limit: number = 0): Promise<CitySearchResult[]> => {
  if (!query || query.trim().length < 2) return [];

  let baseUrl = API_BASE_URL_DEFAULT;
  if (mode === 'city') baseUrl = API_BASE_URL_CITY;
  if (mode === 'country') baseUrl = API_BASE_URL_COUNTRY;

  try {
    const url = `${baseUrl}${encodeURIComponent(query.trim())}`;
    
    // Attempt fetch
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        let results = data.map((item: any) => ({
          city: item.city || item.name,
          city_ascii: item.city_ascii || item.name_ascii || item.city || item.name,
          lat: typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat,
          lng: typeof item.lng !== 'undefined' 
            ? (typeof item.lng === 'string' ? parseFloat(item.lng) : item.lng)
            : (typeof item.lon === 'string' ? parseFloat(item.lon) : item.lon),
          country: item.country || '',
          count: item.count !== undefined ? parseInt(item.count) : 0
        })).filter((item) => item.city && !isNaN(item.lat) && !isNaN(item.lng));

        if (limit > 0) {
          results = results.slice(0, limit);
        }
        return results;
      }
    }
  } catch (error) {
    // Silent fallback
  }

  // Fallback local search if API fails or returns empty
  const lowerQuery = query.toLowerCase();
  let fallbackResults = FALLBACK_CITIES.map(c => ({
      city: c.city,
      city_ascii: c.city,
      lat: typeof c.lat === 'string' ? parseFloat(c.lat) : c.lat,
      lng: typeof c.lon === 'string' ? parseFloat(c.lon) : c.lon,
      country: c.country,
      count: 0
    }));

  if (mode === 'city') {
    fallbackResults = fallbackResults.filter(c => c.city.toLowerCase().includes(lowerQuery));
  } else if (mode === 'country') {
    fallbackResults = fallbackResults.filter(c => c.country.toLowerCase().includes(lowerQuery));
  } else {
    fallbackResults = fallbackResults.filter(c => c.city.toLowerCase().includes(lowerQuery) || c.country.toLowerCase().includes(lowerQuery));
  }

  if (limit > 0) {
    fallbackResults = fallbackResults.slice(0, limit);
  }

  return fallbackResults;
};

export const findNearestCity = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const url = `${API_NEAREST_URL}&lat=${lat}&lon=${lng}`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // API returns { message: "No city found..." } if no city is near
    if (data.message) return null;
    
    if (data.city && data.country) {
      return `${data.city}, ${data.country}`;
    }
    
    return null;
  } catch (error) {
    // Silent fail
    return null;
  }
};

export const fetchRandomCity = async (): Promise<RandomCityResponse | null> => {
  try {
    const response = await fetch(API_RANDOM_URL);
    if (response.ok) {
        return await response.json();
    }
  } catch (error) {
    // Silent fallback
  }

  // Fallback
  const randomIndex = Math.floor(Math.random() * FALLBACK_CITIES.length);
  return FALLBACK_CITIES[randomIndex];
};

// Deprecated: No longer loading the full CSV
export const loadCities = async (): Promise<CitySearchResult[]> => {
  return [];
};
