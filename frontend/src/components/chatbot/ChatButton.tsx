import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ChatButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate immediately without smooth scroll
    navigate('/user/chatbot');
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[9999]" style={{ position: 'fixed' }}>
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 animate-bounce hover:animate-none focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Mở trợ lý AI"
          type="button"
        >
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-30 animate-ping"></div>
          
          {/* Icon */}
          <MessageCircle className="w-7 h-7 relative z-10" />
          
          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            AI
          </div>
        </button>

        {/* Tooltip */}
        {isHovered && (
          <div
            className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-xl animate-fade-in"
            style={{ animation: 'fadeIn 0.2s ease-in-out' }}
          >
            <div className="flex items-center gap-2">
              <span>💬 Trợ lý AI</span>
              <span className="text-blue-300">- Tư vấn miễn phí</span>
            </div>
            {/* Arrow */}
            <div className="absolute top-full right-4 -mt-1">
              <div className="border-8 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>

      {/* Add keyframe animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </>
  );
};
