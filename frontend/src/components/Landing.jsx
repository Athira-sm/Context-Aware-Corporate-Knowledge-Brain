import React from "react";

export default function Landing({ startApp }) {
  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg,#2563eb,#1e40af)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: 48, marginBottom: 10 }}>
          OpsMind AI
        </h1>

        <h2 style={{ fontWeight: 400, marginBottom: 20 }}>
          AI Document Assistant
        </h2>

        <p style={{ fontSize: 18, marginBottom: 30 }}>
          Upload PDFs and ask questions from your documents
          using AI powered retrieval.
        </p>

        <button
          onClick={startApp}
          style={{
            background: "white",
            color: "#2563eb",
            border: "none",
            padding: "14px 28px",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Try Demo
        </button>

        <div style={{ marginTop: 60, fontSize: 14, opacity: 0.9 }}>
          Features
          <div style={{ marginTop: 10 }}>
            • Upload PDFs  
            • Ask AI questions  
            • Get answers with sources  
            • Real-time streaming responses
          </div>
        </div>
      </div>
    </div>
  );
}
