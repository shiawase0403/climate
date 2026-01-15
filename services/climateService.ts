import { ClimateDataResponse, ClassificationResponse } from '../types';

const BASE_URL = 'https://climate.mapresso.com/api';

/**
 * Tries to fetch a URL using multiple CORS proxies.
 * If the first one fails, it tries the next one.
 */
const fetchWithFallback = async (targetUrl: string) => {
  // List of proxies to try in order
  const proxies = [
    // Primary: corsproxy.io (usually fast and reliable)
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    // Fallback: allorigins.win (good reliability, supports raw)
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  ];

  let lastError: any = null;

  for (const proxyGen of proxies) {
    try {
      const proxyUrl = proxyGen(targetUrl);
      const response = await fetch(proxyUrl);
      
      // If the request was successful, return the response
      if (response.ok) {
        return response;
      }
      
      // If we get a server error (5xx) or forbidden (403) from the proxy/upstream, try the next one
      if (response.status === 403 || response.status >= 500) {
        console.warn(`Proxy ${proxyUrl} returned ${response.status}. Trying next...`);
        lastError = new Error(`Status ${response.status}: ${response.statusText}`);
        continue;
      }
      
      // For client errors (400, 404), it might be a valid API response (e.g. no data for location),
      // so we return it to let the app handle the specific error structure.
      return response;

    } catch (err) {
      console.warn(`Failed to fetch via proxy`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Network request failed after multiple attempts');
};

export const fetchClimateData = async (lat: number, lon: number): Promise<ClimateDataResponse> => {
  // Limit precision to 4 decimal places to ensure API compatibility
  const latParam = lat.toFixed(4);
  const lonParam = lon.toFixed(4);
  const url = `${BASE_URL}/data/?lat=${latParam}&lon=${lonParam}`;
  
  const response = await fetchWithFallback(url);
  
  // Handle case where proxy returns OK but body is not JSON (e.g. proxy error page)
  try {
    return await response.json();
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }
};

export const fetchClassification = async (lat: number, lon: number): Promise<ClassificationResponse> => {
  const latParam = lat.toFixed(4);
  const lonParam = lon.toFixed(4);
  const url = `${BASE_URL}/koeppen/?lat=${latParam}&lon=${lonParam}`;
  
  const response = await fetchWithFallback(url);
  
  try {
    return await response.json();
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }
};

export const getChineseClimateClassification = (code: string): string | undefined => {
  const map: Record<string, string> = {
    'Af': '热带雨林气候',
    'Am': '热带季风气候',
    'As': '热带稀树草原气候',
    'Aw': '热带稀树草原气候',
    'As/Aw': '热带稀树草原气候',
    'BSh': '热带半干旱气候',
    'BSk': '温带半干旱气候',
    'BWh': '热带沙漠气候',
    'BWk': '温带沙漠气候',
    'Csa': '（热夏型）地中海气候',
    'Csb': '（凉夏型）地中海气候',
    'Csc': '（冷夏型）地中海气候',
    'Cfa': '亚热带湿润气候',
    'Cfb': '温带海洋性气候',
    'Cfc': '亚寒带/温带大陆性气候',
    'Cwa': '亚热带季风气候',
    'Cwb': '亚热带高原季风气候',
    'Cwc': '亚热带高原季风气候',
    'Dsa': '温带大陆性湿润气候',
    'Dsb': '温带大陆性湿润气候',
    'Dsc': '亚寒带针叶林气候',
    'Dfa': '温带大陆性湿润气候',
    'Dfb': '温带大陆性湿润气候',
    'Dfc': '亚寒带针叶林气候',
    'Dwa': '温带季风气候',
    'Dwb': '温带季风气候',
    'Dwc': '亚寒带针叶林气候',
    'EF': '冰原气候',
    'ET': '苔原气候'
  };
  return map[code];
};