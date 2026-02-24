// src/components/ChatBot.jsx
import React, { useState, useEffect, useRef } from "react";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your Grievance Assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e, textOverride = null) => {
    if (e) e.preventDefault();

    const messageText = textOverride || input;
    if (!messageText.trim()) return;

    // Add User Message
    const userMsg = { text: messageText, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Static Bot Logic
    setTimeout(() => {
      const lowerInput = messageText.toLowerCase();
      let botResponse = "";

      if (lowerInput.includes("status") || lowerInput.includes("track")) {
        botResponse =
          "You can track your grievances in the 'My Complaints' section. Look for status labels like Pending or Resolved.";
      } else if (lowerInput.includes("file") || lowerInput.includes("new")) {
        botResponse =
          "To file a new grievance, go to the 'Complaint Form' page and fill in the details.";
      } else if (lowerInput.includes("time") || lowerInput.includes("delay")) {
        botResponse =
          "Most grievances are reviewed by the Municipal Admin within 48-72 hours.";
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        botResponse =
          "Hello! Do you need help with a new complaint or checking an existing one?";
      } else {
        botResponse =
          "I'm a static assistant. You can ask me about 'filing a complaint', 'checking status', or 'timelines'.";
      }

      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
    }, 600);
  };

  return (
    // FIXED TO BOTTOM RIGHT CORNER
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Symbol (The Button) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      >
        {isOpen ? (
          <span className="text-xl font-bold">✕</span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-medium">
              Help?
            </span>
          </div>
        )}
      </button>

      {/* Modern Drawer / Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[320px] sm:w-[360px] h-[480px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-bold text-sm">Grievance AI Assistance </h3>
                <p className="text-[10px] text-indigo-100">
                  Ask Me Your Questions
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                    msg.isBot
                      ? "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none"
                      : "bg-indigo-600 text-white rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Quick Action Suggestions */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {["Check Status", "New Complaint", "Contact Info"].map(
                  (action) => (
                    <button
                      key={action}
                      onClick={() => handleSend(null, action)}
                      className="text-[11px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                    >
                      {action}
                    </button>
                  ),
                )}
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Static Input Area */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your query..."
              className="flex-1 bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
