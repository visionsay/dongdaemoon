import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        text: data.response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chatbot Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-purple-500 rounded-t-lg flex justify-between items-center">
            <h3 className="text-white font-medium">AI 챗봇</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-purple-300"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
