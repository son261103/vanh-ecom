import { api } from '../lib/axios';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SendMessageRequest {
  message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface Product {
  id: string; // UUID từ backend
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  image: string;
  description: string;
  category_name: string;
  brand_name: string;
  product_url?: string; // Link đầy đủ từ chatbot API
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  products?: Product[];
  timestamp: string;
}

export interface ChatbotInfo {
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  limitations: string[];
}

export const chatbotService = {
  /**
   * Send message to chatbot
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await api.post<SendMessageResponse>('/public/chatbot/send', data);
    return response.data;
  },

  /**
   * Get suggested questions
   */
  async getSuggestions(): Promise<string[]> {
    const response = await api.get<{ success: boolean; suggestions: string[] }>('/public/chatbot/suggestions');
    return response.data.suggestions;
  },

  /**
   * Get chatbot info
   */
  async getInfo(): Promise<ChatbotInfo> {
    const response = await api.get<{ success: boolean; data: ChatbotInfo }>('/public/chatbot/info');
    return response.data.data;
  },
};
