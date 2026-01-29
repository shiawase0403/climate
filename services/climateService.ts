
import { ClimateDataResponse, ClassificationResponse } from '../types';

// Centralize API base. HyWiki acts as a reliable forwarder/cache.
const HYWIKI_API_URL = 'https://api-forward.hywiki.org/climate';

/**
 * Tries to fetch a URL using multiple CORS proxies.
 * If the first one fails, it tries the next one.
 */
export const fetchWithFallback = async (targetUrl: string) => {
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

export const fetchClimateData = async (lat: number, lon: number, useLegacy: boolean = false): Promise<ClimateDataResponse> => {
  // precise=0 uses enhanced data (elev, max/min temp)
  // precise=1 uses mapresso data (legacy)
  const precise = useLegacy ? 1 : 0;
  
  // Use the HyWiki forwarding API for reliable data access
  const url = `${HYWIKI_API_URL}/data/?lat=${lat}&lon=${lon}&precise=${precise}`;
  
  try {
    // Try direct fetch first as the forwarding service likely enables CORS
    let response = await fetch(url);
    
    // Fallback logic for network errors or specific CORS issues not handled by forwarder
    if (!response.ok && response.status === 0) { 
       response = await fetchWithFallback(url);
    } else if (!response.ok) {
       // If it's a 4xx/5xx from the API itself, throwing here lets the caller handle it.
       // Only try fallback if it looks like a block (403)
       if (response.status === 403) {
          response = await fetchWithFallback(url);
       }
    }

    return await response.json();
  } catch (e) {
    // Last resort fallback
    try {
      const response = await fetchWithFallback(url);
      return await response.json();
    } catch (fallbackError) {
      throw new Error('Invalid JSON response from server');
    }
  }
};

export const fetchClassification = async (lat: number, lon: number): Promise<ClassificationResponse> => {
  const latParam = lat.toFixed(4);
  const lonParam = lon.toFixed(4);
  
  // Use HyWiki forwarder for classification as well to consolidate requests and reduce distinct domain lookups
  // This avoids calling Mapresso directly via proxy, reducing total request overhead/failure points.
  const url = `${HYWIKI_API_URL}/koeppen/?lat=${latParam}&lon=${lonParam}`;
  
  try {
    let response = await fetch(url);
    
    if (!response.ok && response.status === 0) {
        response = await fetchWithFallback(url);
    } else if (!response.ok && response.status === 403) {
        response = await fetchWithFallback(url);
    }
    
    return await response.json();
  } catch (e) {
    // Fallback to original proxy method if the new endpoint fails completely
    const legacyUrl = `https://climate.mapresso.com/api/koeppen/?lat=${latParam}&lon=${lonParam}`;
    try {
        const response = await fetchWithFallback(legacyUrl);
        return await response.json();
    } catch (finalError) {
        throw new Error('Invalid JSON response from server');
    }
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
    'Cfa': '亚热带季风和亚热带湿润气候',
    'Cfb': '温带海洋性气候',
    'Cfc': '温带海洋性气候(副极地型)',
    'Cwa': '亚热带季风和亚热带湿润气候',
    'Cwb': '亚热带高原季风气候',
    'Cwc': '冷夏高原季风气候',
    'Dsa': '温带大陆性气候(冬雨型)',
    'Dsb': '温带大陆性气候(冬雨型)',
    'Dsc': '亚寒带针叶林气候',
    'Dfa': '温带大陆性湿润气候',
    'Dfb': '温带大陆性湿润气候',
    'Dfc': '亚寒带针叶林气候',
    'Dfd': '亚寒带针叶林气候（冬季极寒型）',
    'Dwa': '温带季风气候',
    'Dwb': '温带季风气候',
    'Dwc': '亚寒带针叶林气候',
    'Dwd': '亚寒带针叶林气候（冬季极寒型）',
    'EF': '冰原气候',
    'ET': '苔原气候'
  };
  return map[code];
};
