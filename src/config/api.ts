/**
 * API Configuration
 * 
 * To use your API endpoint, update the API_BASE_URL below with your actual API URL.
 * 
 * Example:
 *   export const API_BASE_URL = 'https://api.example.com/api';
 * 
 * For production, consider using environment variables or a config service.
 * 
 * Note: The API should return data in the same format as mockChartData.json:
 * {
 *   dailyConsumption: number[],
 *   tokens: number[],
 *   penalties: boolean[],
 *   threshold: number,
 *   metadata: {
 *     date: string,
 *     unit: string,
 *     interval: string,
 *     totalIntervals: number,
 *     tokenCollectionWindows: {
 *       morning: string,
 *       evening: string
 *     }
 *   }
 * }
 */

// Default API endpoint - UPDATE THIS with your actual API URL
export const API_BASE_URL = 'https://your-api-endpoint.com/api';

// API endpoints - adjust these paths to match your API routes
export const API_ENDPOINTS = {
  CHART_DATA: '/chart-data', // Adjust this path to match your API endpoint
};

/**
 * Get the full API URL for a given endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

