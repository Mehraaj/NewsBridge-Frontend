import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      // Build conversation context from history
      let prompt = '';
      
      // Add system context
      prompt += `You are a helpful AI assistant for NewsBridge, an intelligent news analysis platform. You can help users understand news articles, provide context about current events, and answer questions about the platform. Be concise, informative, and friendly.\n\n`;
      
      // Add conversation history
      conversationHistory.forEach((msg) => {
        if (msg.role === 'user') {
          prompt += `User: ${msg.content}\n`;
        } else {
          prompt += `Assistant: ${msg.content}\n`;
        }
      });
      
      // Add current message
      prompt += `User: ${message}\n`;
      prompt += `Assistant: `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      if (!response) {
        throw new Error('Failed to get response from Gemini');
      }
      
      return response.text();
    } catch (error) {
      console.error('Chatbot service error:', error);
      throw new Error('Failed to get response from chatbot. Please try again.');
    }
  }
}
