import React, { useEffect, useRef, useState } from "react";

const API_BASE = "https://opsmind-ai-lr65.onrender.com/api";

export default function Chat() {
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

      if (!res.ok) {
        const err = await res.text();
        console.error("Upload error:", err);
        throw new Error("Upload failed");
      }

      alert("SOP uploaded successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }


  };

  const askQuestion = async () => {
    if (!question.trim()) return;


    const userQuestion = question;

    setMessages((prev) => [...prev, { role: "user", text: userQuestion }]);
    setQuestion("");

    setMessages((prev) => [...prev, { role: "bot", text: "", sources: [] }]);

    setLoading(true);

    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: userQuestion }),
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

        // ignore metrics event
        if (evt.startsWith("event: metrics")) {
          continue;
        }

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
          } catch { }
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
    window.open(
      `${API_BASE.replace("/api", "")}/uploads/${src.filename}`,
      "_blank"
    );
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
          maxWidth: 900,
          height: "95vh",
          background: "white",
          display: "flex",
          flexDirection: "column",
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: "linear-gradient(90deg,#2563eb,#1d4ed8)",
            color: "white",
            padding: 16,
            fontSize: 18,
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          OpsMind AI – SOP Assistant

          ```
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
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {uploading ? "Uploading..." : "Upload SOP"}
            </button>
          </div>
        </div>

        {/* CHAT AREA */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                marginBottom: 16,
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {m.role === "bot" && (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#2563eb",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                    fontWeight: "bold",
                  }}
                >
                  AI
                </div>
              )}

              <div
                style={{
                  maxWidth: 600,
                  padding: 14,
                  borderRadius: 14,
                  background: m.role === "user" ? "#2563eb" : "#f1f5f9",
                  color: m.role === "user" ? "white" : "#111",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {m.text}

                {m.role === "bot" && m.sources?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#2563eb",
                        fontWeight: 600,
                      }}
                    >
                      Sources
                    </div>

                    {m.sources.map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => openSource(s)}
                        style={{
                          fontSize: 12,
                          marginTop: 4,
                          cursor: "pointer",
                          background: "#eef2ff",
                          padding: 6,
                          borderRadius: 6,
                        }}
                      >
                        📄 {s.filename} (Page {s.page})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ color: "#666", fontSize: 13 }}>
              AI is thinking...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT AREA */}
        <div
          style={{
            borderTop: "1px solid #eee",
            padding: 14,
            display: "flex",
            gap: 8,
          }}
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask SOP question..."
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />

          <button
            onClick={askQuestion}
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "12px 18px",
              borderRadius: 10,
              border: "none",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>


  );
}
