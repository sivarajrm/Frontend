import { useState, useEffect, useRef } from "react";
import "../styles/chatbot.css";

/* 🔹 CLEAN + SHORTEN AI RESPONSE */
const cleanAndShortenText = (text, maxSentences = 4) => {
  if (!text) return "";

  const cleaned = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`/g, "")
    .replace(/#+\s?/g, "")
    .replace(/\b\d+\.\s*/g, "")
    .replace(/(\d+\.)\s+/g, "\n$1 ")
    .trim();

  // 🔥 SHORTEN RESPONSE
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, maxSentences).join(" ");
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  /* 🔹 Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* 🔹 Welcome message */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          from: "bot",
          text:
            "👋 Hi! I’m your AI Health Assistant. Ask me about diet, sleep, heart rate, or your health reports.",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  /* 🔹 Send Message */
  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      const data = await res.json();

      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: cleanAndShortenText(
              data.response || "⚠️ Unable to fetch response."
            ),
          },
        ]);
      }, 600);
    } catch {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ AI connection failed." },
      ]);
    }
  };

  return (
    <>
      {/* 🤖 FLOATING ROBOT */}
      <div
        className="floating-robot"
        onClick={() => setIsOpen((p) => !p)}
      >
        <img src="/medi-robot.png" alt="AI Assistant" />
      </div>

      {/* 💬 CHAT WINDOW */}
      {isOpen && (
        <div className="chat-window">
          {/* HEADER */}
          <div className="chat-header">
            <h3>AI Health Assistant</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {/* QUICK ACTIONS */}
          <div className="quick-actions">
            {[
              "Diet tips",
              "Improve sleep",
              "Heart rate meaning",
              "Explain my health data",
            ].map((q) => (
              <button key={q} onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          {/* CHAT BODY */}
          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                {m.text}
              </div>
            ))}

            {typing && (
              <div className="msg bot typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="send-btn" onClick={() => sendMessage()}>
              ⬆
            </button>
          </div>
        </div>
      )}
    </>
  );
}
