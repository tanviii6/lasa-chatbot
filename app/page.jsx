"use client";

import { useState } from "react";

export default function LasaPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/lasa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const reply = data.reply?.content || "Sorry, I couldn't respond.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops — LASA had trouble responding.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 700, margin: "0 auto" }}>
      <h1>LASA — BU Dining Assistant</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          height: 400,
          overflowY: "auto",
          marginBottom: 16,
          background: "#4c2727ff",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <strong>{m.role === "user" ? "You" : "LASA"}:</strong>{" "}
            <span>{m.content}</span>
          </div>
        ))}
        {loading && <div>LASA is thinking…</div>}
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: 12 }}>
        <input
          type="text"
          value={input}
          placeholder="Ask about BU Dining…"
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 20px",
            borderRadius: 6,
            background: "#c00",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
