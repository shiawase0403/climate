import { CitySearchResult } from '../types';

// API endpoint provided by the user
const API_BASE_URL = 'https://api-forward.hywiki.org/climate/cities/?mode=1&name=';
const API_NEAREST_URL = 'https://api-forward.hywiki.org/climate/cities/?mode=2';

export const searchCities = async (query: string): Promise<CitySearchResult[]> => {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `${API_BASE_URL}${encodeURIComponent(query.trim())}`;
    
    // Revert to direct fetch as requested
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`City search API returned status: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      // Handle potential variations in API response keys
      city: item.city || item.name,
      // Fallback to city name if ascii version not provided
      city_ascii: item.city_ascii || item.name_ascii || item.city || item.name,
      lat: typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat,
      // Handle both 'lng' and 'lon' from API, supporting strings and numbers
      lng: typeof item.lng !== 'undefined' 
        ? (typeof item.lng === 'string' ? parseFloat(item.lng) : item.lng)
        : (typeof item.lon === 'string' ? parseFloat(item.lon) : item.lon),
      country: item.country || '',
      count: item.count !== undefined ? parseInt(item.count) : 0
    })).filter((item) => 
      item.city && 
      !isNaN(item.lat) && 
      !isNaN(item.lng)
    );

  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
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
    console.warn('Error fetching nearest city:', error);
    return null;
  }
};

// Deprecated: No longer loading the full CSV
export const loadCities = async (): Promise<CitySearchResult[]> => {
  return [];
};