import { CitySearchResult } from '../types';

// API endpoint provided by the user
const API_BASE_URL = 'https://api-forward.hywiki.org/climate/cities.php?mode=1&name=';

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
      lng: typeof item.lng === 'string' ? parseFloat(item.lng) : item.lng,
      country: item.country || ''
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

// Deprecated: No longer loading the full CSV
export const loadCities = async (): Promise<CitySearchResult[]> => {
  return [];
};