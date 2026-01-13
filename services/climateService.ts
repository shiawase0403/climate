import { ClimateDataResponse, ClassificationResponse } from '../types';

const BASE_URL = 'https://climate.mapresso.com/api';

// Switched to corsproxy.io which is often more reliable for direct API piping
const PROXY_URL = 'https://corsproxy.io/?';

const fetchWithProxy = async (url: string) => {
  // corsproxy.io expects the target URL encoded
  const proxyUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response;
};

export const fetchClimateData = async (lat: number, lon: number): Promise<ClimateDataResponse> => {
  // Limit precision to 4 decimal places to ensure API compatibility
  const latParam = lat.toFixed(4);
  const lonParam = lon.toFixed(4);
  const url = `${BASE_URL}/data/?lat=${latParam}&lon=${lonParam}`;
  const response = await fetchWithProxy(url);
  return response.json();
};

export const fetchClassification = async (lat: number, lon: number): Promise<ClassificationResponse> => {
  const latParam = lat.toFixed(4);
  const lonParam = lon.toFixed(4);
  const url = `${BASE_URL}/koeppen/?lat=${latParam}&lon=${lonParam}`;
  const response = await fetchWithProxy(url);
  return response.json();
};