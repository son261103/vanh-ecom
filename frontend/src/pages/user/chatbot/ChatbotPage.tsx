import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatbotService } from '../../../services/chatbotService';
import type { Message, ChatbotInfo, Product } from '../../../services/chatbotService';
import { ProductCard } from '../../../components/chatbot/ProductCard';

interface MessageWithProducts extends Message {
  products?: Product[];
}

export const ChatbotPage = () => {
  const [messages, setMessages] = useState<MessageWithProducts[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [chatbotInfo, setChatbotInfo] = useState<ChatbotInfo | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    // Scroll to top of page on mount
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Prevent scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    loadSuggestions();
    loadChatbotInfo();
    
    // Welcome message
    setMessages([
      {
        role: 'assistant',
        content: 'Xin chào! 👋 Tôi là trợ lý AI của Vanh Electronics. Tôi có thể giúp bạn tư vấn về các sản phẩm điện tử như điện thoại, laptop, TV, tai nghe và nhiều thiết bị khác. Bạn cần tư vấn gì hôm nay?',
        timestamp: new Date().toISOString(),
      },
    ]);
    
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Auto scroll to bottom of chat container only (not the whole page)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSuggestions = async () => {
    try {
      const data = await chatbotService.getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const loadChatbotInfo = async () => {
    try {
      const data = await chatbotService.getInfo();
      setChatbotInfo(data);
    } catch (error) {
      console.error('Failed to load chatbot info:', error);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    
    if (!textToSend) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send to API
      const response = await chatbotService.sendMessage({
        message: textToSend,
        conversation_history: history,
      });

      // Clean message - remove PRODUCTS marker
      const cleanMessage = response.message.replace(/```PRODUCTS:\[\d+(?:,\d+)*\]```/g, '').trim();
      
      // Add bot response with products
      const botMessage: MessageWithProducts = {
        role: 'assistant',
        content: cleanMessage,
        timestamp: response.timestamp,
        products: response.products || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error?.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div 
          className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Trợ lý AI Vanh Electronics</h1>
                  <p className="text-blue-100 text-sm">Tư vấn điện tử thông minh</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
              >
                {showInfo ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Info Panel */}
          {showInfo && chatbotInfo && (
            <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Khả năng</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {chatbotInfo.capabilities.map((cap, idx) => (
                      <li key={idx}>• {cap}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Giới hạn</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {chatbotInfo.limitations.map((lim, idx) => (
                      <li key={idx}>• {lim}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className="h-[500px] overflow-y-auto p-6 space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className={`prose max-w-none prose-sm prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-headings:mt-3 prose-headings:mb-2 ${
                    message.role === 'user' ? 'prose-invert' : ''
                  }`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                  
                  {/* Products grid */}
                  {message.products && message.products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {message.products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  )}
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-gray-600">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length === 1 && suggestions.length > 0 && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3 mt-4">Gợi ý câu hỏi:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 rounded-lg text-sm transition-all transform hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Gửi
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Powered by Gemini AI • Vanh Electronics 2025</p>
        </div>
      </div>
    </div>
  );
};
