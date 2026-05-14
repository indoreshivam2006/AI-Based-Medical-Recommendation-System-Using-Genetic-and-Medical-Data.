"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
} from "lucide-react";

/**
 * AIChatWidget — Conversational AI chat for asking questions about drug recommendations.
 * Calls POST /api/chat with message, drug context, patient data, and chat history.
 * Displays a scrollable chat UI with typing indicators.
 */
export default function AIChatWidget({ drugName, patientData, apiUrl }) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hello! I can answer questions about your ${drugName || "drug"} recommendation. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Add user message
    const userMsg = { role: "user", text: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Build chat history for context
      const chatHistory = updatedMessages.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      }));

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          drug_name: drugName,
          patient_data: patientData,
          chat_history: chatHistory,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer || data.reply || "No response generated." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "I'm sorry, I couldn't process your question right now. Please try again or consult a qualified doctor.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="ai-chat-card"
    >
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-left">
          <div className="ai-chat-icon-wrap">
            <MessageCircle size={18} />
          </div>
          <div>
            <h3 className="ai-chat-title">Ask about your recommendation</h3>
            <p className="ai-chat-subtitle">AI-powered medical assistant</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ai-chat-toggle"
          title={isOpen ? "Minimize" : "Expand"}
        >
          {isOpen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Messages Area */}
            <div className="ai-chat-messages">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`ai-chat-msg ${msg.role === "user" ? "user" : "ai"}`}
                >
                  <div className="ai-chat-msg-avatar">
                    {msg.role === "ai" ? (
                      <Bot size={14} />
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                  <div className={`ai-chat-msg-bubble ${msg.role === "ai" ? "markdown-body" : ""}`}>
                    {msg.role === "ai" ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ai-chat-msg ai"
                >
                  <div className="ai-chat-msg-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="ai-chat-msg-bubble">
                    <div className="ai-chat-typing">
                      <span className="ai-chat-typing-dot" />
                      <span className="ai-chat-typing-dot" />
                      <span className="ai-chat-typing-dot" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="ai-chat-input-area">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question here..."
                className="ai-chat-input"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="ai-chat-send-btn"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
