import { useState } from "react";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const askQuestion = async () => {
    if (!question) return;

    const newMessages = [...messages, { role: "user", text: question }, { role: "bot", text: "" }];
    setMessages(newMessages);
    setQuestion("");

    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let botText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (let line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.replace("data: ", "");

          if (data === "[DONE]") return;

          botText += data;

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].text = botText;
            return updated;
          });
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>OpsMind SOP Chat</h2>

      <div style={{ border: "1px solid #ccc", padding: 10, height: 300, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "8px 0" }}>
            <b>{m.role === "user" ? "You:" : "Bot:"}</b> {m.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask SOP question..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={askQuestion} style={{ padding: 8 }}>Send</button>
      </div>
    </div>
  );
}
