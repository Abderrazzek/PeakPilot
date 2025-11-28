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
  CHATBOT_ASK: 'http://44.250.202.199/chatbot/ask',
};

/**
 * Get the full API URL for a given endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Chatbot API request interface
 */
export interface ChatbotRequest {
  metering_point_code: string;
  from: string;
  to: string;
  p_ref_kw: number;
  question: string;
}

/**
 * Chatbot API response interface
 */
export interface ChatbotResponse {
  answer?: string;
  response?: string;
  [key: string]: any; // Allow for other response fields
}

/**
 * Ask the chatbot a question
 * @param question - The user's question
 * @returns Promise with the chatbot response
 */
export const askChatbot = async (question: string): Promise<string> => {
  try {
    const requestBody: ChatbotRequest = {
      metering_point_code: 'LU_ENO_DELPHI_LU_virtual_ind_00002',
      from: '2023-06-14T23:00:00',
      to: '2023-06-15T01:00:00',
      p_ref_kw: 10,
      question: question,
    };

    const response = await fetch(API_ENDPOINTS.CHATBOT_ASK, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: ChatbotResponse = await response.json();

    // Handle different possible response formats
    return data.answer || data.response || JSON.stringify(data);
  } catch (error) {
    console.error('Chatbot API error:', error);
    throw error;
  }
};
