import React, { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:5000/api";

export default function OpsMindChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/history`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMsg = { role: "user", text: question };
    setMessages(prev => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    // placeholder bot message
    setMessages(prev => [...prev, { role: "bot", text: "" }]);

    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      const chunk = decoder.decode(value || new Uint8Array());
      const lines = chunk.split("\n\n");

      for (let line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.replace("data:", "").trim();

        if (data === "[DONE]") {
          setLoading(false);
          return;
        }

        // safe streaming append
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];

          updated[updated.length - 1] = {
            ...last,
            text: (last.text || "") + data
          };

          return updated;
        });
      }
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f3f4f6" }}>
      {/* Header */}
      <div style={{ background: "#2563eb", color: "white", padding: 16, fontSize: 20 }}>
        OpsMind AI — SOP Assistant
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              maxWidth: 600,
              padding: 12,
              marginBottom: 10,
              borderRadius: 12,
              background: m.role === "user" ? "#2563eb" : "white",
              color: m.role === "user" ? "white" : "black",
              marginLeft: m.role === "user" ? "auto" : "0"
            }}
          >
            {m.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 16, background: "white", borderTop: "1px solid #ddd", display: "flex", gap: 8 }}>
        <input
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask SOP question..."
        />
        <button
          onClick={askQuestion}
          disabled={loading}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "10px 16px",
            borderRadius: 8,
            border: "none"
          }}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}
