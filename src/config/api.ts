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

// API endpoints - adjust these paths to match your API routes
export const API_ENDPOINTS = {
  CHART_DATA:
    'http://44.250.202.199/metering-data/?metering_point_code=LU_ENO_DELPHI_LU_virtual_ind_00012&start_time=2022-01-03%2000%3A00%3A00&end_time=2022-01-03%2023%3A59%3A59&limit=10000', // Adjust this path to match your API endpoint
  CHATBOT_ASK: 'http://44.250.202.199/chatbot/ask',
};

/**
 * Get the full API URL for a given endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${endpoint}`;
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
  analysis_result?: {
    answer?: string;
    [key: string]: any;
  };
  [key: string]: any; // Allow for other response fields
}

/**
 * Ask the chatbot a question
 * @param question - The user's question
 * @returns Promise with the chatbot response object
 */
export const askChatbot = async (
  question: string,
): Promise<ChatbotResponse> => {
  const startTime = Date.now();
  const requestBody: ChatbotRequest = {
    metering_point_code: 'LU_ENO_DELPHI_LU_virtual_ind_00002',
    from: '2023-06-14T23:00:00',
    to: '2023-06-15T01:00:00',
    p_ref_kw: 10,
    question: question,
  };

  // Log API request to Reactotron
  if (__DEV__ && console.tron?.display) {
    console.tron.display({
      name: 'API Request',
      value: {
        url: API_ENDPOINTS.CHATBOT_ASK,
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: requestBody,
      },
      preview: `POST ${API_ENDPOINTS.CHATBOT_ASK}`,
    });
  }

  try {
    const response = await fetch(API_ENDPOINTS.CHATBOT_ASK, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const duration = Date.now() - startTime;
    const data: ChatbotResponse = await response.json();

    // Log API response to Reactotron
    if (__DEV__ && console.tron?.display) {
      console.tron.display({
        name: 'API Response',
        value: {
          url: API_ENDPOINTS.CHATBOT_ASK,
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          data: data,
        },
        preview: `Response ${response.status} - ${duration}ms`,
      });
    }

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Return the full response object
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log API error to Reactotron
    if (__DEV__ && console.tron?.error) {
      console.tron.error(
        {
          name: 'API Error',
          value: {
            url: API_ENDPOINTS.CHATBOT_ASK,
            duration: `${duration}ms`,
            error: error instanceof Error ? error.message : String(error),
          },
          preview: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
        false,
      );
    }

    console.error('Chatbot API error:', error);
    throw error;
  }
};
