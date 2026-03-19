import React, { useEffect, useRef, useState } from "react";

const API_BASE = "https://opsmind-ai-lr65.onrender.com/api";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("uploadedFiles");
    if (saved) setUploadedFiles(JSON.parse(saved));
  }, []);

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

      if (!res.ok) throw new Error("Upload failed");

      const fileName = file.name;

      setUploadedFiles((prev) => {
        const updated = [...prev, fileName];
        localStorage.setItem("uploadedFiles", JSON.stringify(updated));
        return updated;
      });

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `📄 ${fileName} uploaded successfully.` },
      ]);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // DELETE PDF
  const handleDelete = async (fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    try {
      // Optionally call backend delete API if available
      // await fetch(`${API_BASE}/sop/delete/${fileName}`, { method: "DELETE" });

      setUploadedFiles((prev) => {
        const updated = prev.filter((f) => f !== fileName);
        localStorage.setItem("uploadedFiles", JSON.stringify(updated));
        return updated;
      });

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `🗑️ ${fileName} deleted successfully.` },
      ]);
    } catch (err) {
      console.error(err);
      alert("Error deleting file");
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userQuestion = question;
    setMessages((prev) => [...prev, { role: "user", text: userQuestion }]);
    setQuestion("");
    setMessages((prev) => [...prev, { role: "bot", text: "" }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          const dataLine = evt.split("data:")[1]?.trim();
          if (dataLine === "[DONE]") {
            setLoading(false);
            return;
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
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4">
        {/* BACK BUTTON */}
        <button
          onClick={() => window.location.href = "/"} // replace with React Router navigate if using
          className="mb-4 px-3 py-1 rounded hover:bg-gray-800 hover:text-purple-400 font-bold text-lg transition"
        >
          ← Back
        </button>

        <h2 className="text-lg font-semibold mb-4">Documents</h2>

        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleUpload(e.target.files[0])}
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 mb-4 transition"
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm"
            >
              <span className="cursor-pointer">{file}</span>
              <button
                onClick={() => handleDelete(file)}
                className="text-red-500 hover:text-red-400 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex flex-1 flex-col">

        <div className="bg-gray-900 border-b border-gray-800 p-4 font-semibold">
          SmartDocs AI - Document Assistant
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xl px-4 py-3 rounded-xl ${
                  m.role === "user" ? "bg-purple-600" : "bg-gray-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-400 text-sm">AI is thinking...</div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-gray-800 p-4 flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") askQuestion(); }}
            placeholder="Ask question about your document..."
            className="flex-1 bg-gray-800 rounded-lg px-4 py-2 outline-none"
          />

          <button
            onClick={askQuestion}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-6 rounded-lg transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}