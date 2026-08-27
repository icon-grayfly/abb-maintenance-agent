"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function MaintenanceAgentDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [formatFilter, setFormatFilter] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadStatus("Uploading and indexing...");
    try {
      const res = await fetch("http://127.0.0.1:8000/ingest", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus(`Success! Indexed ${data.total_chunks_indexed} chunks from ${data.filename}`);
      } else {
        setUploadStatus(`Error: ${data.detail}`);
      }
    } catch (err) {
      setUploadStatus("Failed to connect to backend server.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          file_format_filter: formatFilter || null,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            sources: data.sources,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.detail || "Something went wrong."}` },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error: Could not reach the AI agent backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar for Document Ingestion & Filters */}
      <aside className="w-80 border-r border-gray-800 p-6 flex flex-col justify-between bg-gray-950">
        <div>
          <h1 className="text-xl font-bold mb-4 text-emerald-400">⚡ Maintenance AI</h1>
          <p className="text-sm text-gray-400 mb-6">Industrial RAG & Compliance Agent</p>

          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-2 uppercase tracking-wider text-gray-300">1. Ingest Document</h2>
            <form onSubmit={handleUpload} className="space-y-3">
              <input
                type="file"
                accept=".pdf,.docx,.md"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition"
              >
                Upload & Index
              </button>
            </form>
            {uploadStatus && <p className="text-xs mt-2 text-emerald-300">{uploadStatus}</p>}
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-2 uppercase tracking-wider text-gray-300">2. Metadata Filter</h2>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Formats (Global Search)</option>
              <option value="pdf">PDF Only</option>
              <option value="docx">Word (.docx) Only</option>
              <option value="markdown">Markdown (.md) Only</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 border-t border-gray-800 pt-4">
          Status: <span className="text-emerald-400 font-semibold">Online</span> (Ollama / OpenAI Fallback Active)
        </div>
      </aside>

      {/* Main Chat Interface */}
      <section className="flex-1 flex flex-col">
        <header className="border-b border-gray-800 p-4 bg-gray-950 flex items-center justify-between">
          <h2 className="font-medium text-sm text-gray-300">Expert Technical Assistant & Compliance Monitor</h2>
        </header>

        {/* Message History Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
              <p className="text-lg font-medium">No messages yet.</p>
              <p className="text-sm">Upload a technical document and start asking maintenance or compliance questions!</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-2xl rounded-lg p-4 text-sm ${
                  msg.role === "user" ? "bg-emerald-600 text-white" : "bg-gray-800 border border-gray-700 text-gray-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-700/60 text-xs text-emerald-300">
                    <span className="font-semibold">Sources Cited:</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {msg.sources.map((src, sIdx) => (
                        <li key={sIdx}>{src}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-400 animate-pulse">
                Synthesizing response from documents...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <footer className="p-4 bg-gray-950 border-t border-gray-800">
          <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about compliance rules, error codes, or maintenance workflows..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
            >
              Send
            </button>
          </form>
        </footer>
      </section>
    </main>
  );
}