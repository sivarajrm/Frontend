import { useState, useEffect, useRef } from "react";
import "../styles/chatbot.css";

export default function ChatBot({ sidebarOpen }) {
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem("chatHistory")) || [];
  });

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false); // 👈 AI typing indicator
  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Save history
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);


  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    setTyping(true); // ⏳ show typing UI

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      const data = await res.json();

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: data.response || data.summary || "⚠ AI error." },
        ]);
        setTyping(false);
      }, 1500);

    } catch {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "⚠ Failed to connect to AI" },
      ]);
      setTyping(false);
    }
  };


  // 🧹 Clear chat
  const clearChat = () => {
    localStorage.removeItem("chatHistory");
    setMessages([]);
  };


  return (
    <div className={`chat-container ${sidebarOpen ? "shifted" : "full"}`}>
      <div className="chat-header">
        <h1>AI Health Assistant</h1>
        <button className="clear-btn" onClick={clearChat}>Clear Chat</button>
      </div>

      <p className="subtitle">Ask anything about your health</p>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}

        {/* AI typing indicator */}
        {typing && (
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
