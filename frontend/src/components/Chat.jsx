import React, { useEffect, useRef, useState } from "react";

const API_BASE = "https://opsmind-ai-lr65.onrender.com/api";

export default function OpsMindChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const formatSteps = (text) => {
    if (!text) return text;
    if (text.toLowerCase().includes("i don't know")) return "I don't know";

    const stepRegex = /(Step\s*\d+:.*?)(?=Step\s*\d+:|$)/gis;
    const matches = text.match(stepRegex);

    if (!matches) return text;

    return (
      <div>
        {matches.map((step, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            • {step.trim()}
          </div>
        ))}
      </div>
    );
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const res = await fetch(`${API_BASE}/sop/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      alert("SOP uploaded & embedded successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setQuestion("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "bot", text: "", sources: [] }]);

    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      const chunk = decoder.decode(value || new Uint8Array());
      const events = chunk.split("\n\n");

      for (let evt of events) {
        if (!evt.includes("data:")) continue;

        const dataLine = evt.split("data:")[1]?.trim();
        if (!dataLine) continue;

        if (dataLine === "[DONE]") {
          setLoading(false);
          return;
        }

        if (evt.startsWith("event: sources")) {
          try {
            const src = JSON.parse(dataLine);
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = { ...last, sources: src };
              return updated;
            });
          } catch {}
          continue;
        }

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            text: (last.text || "") + dataLine,
          };
          return updated;
        });
      }
    }
  };

  const openSource = (src) => {
    window.open(`http://localhost:5000/uploads/${src.filename}`, "_blank");
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      
      <div
        style={{
          width: "100%",
          maxWidth: 850,
          height: "95vh",
          background: "white",
          display: "flex",
          flexDirection: "column",
          borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        
        <div
          style={{
            background: "#2563eb",
            color: "white",
            padding: 14,
            fontSize: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          SOP Assistant

          <div>
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) => handleUpload(e.target.files[0])}
            />

            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              style={{
                background: "white",
                color: "#2563eb",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {uploading ? "Uploading..." : "Upload SOP"}
            </button>
          </div>
        </div>

       
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div
                style={{
                  maxWidth: 600,
                  padding: 12,
                  borderRadius: 12,
                  background: m.role === "user" ? "#2563eb" : "#f9fafb",
                  color: m.role === "user" ? "white" : "black",
                  marginLeft: m.role === "user" ? "auto" : "0",
                }}
              >
                {formatSteps(m.text)}
              </div>

              {m.role === "bot" && m.sources?.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12 }}>
                  <div style={{ color: "#2563eb", fontWeight: 500 }}>
                    Sources
                  </div>
                  {m.sources.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => openSource(s)}
                      style={{
                        cursor: "pointer",
                        color: "#2563eb",
                        textDecoration: "underline",
                      }}
                    >
                      {s.filename} (p.{s.page})
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        
        <div
          style={{
            padding: 14,
            borderTop: "1px solid #eee",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
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
              border: "none",
            }}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}