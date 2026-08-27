"use client";

import { useState, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  timestamp: string;
  chunksIndexed?: number;
}

interface QueryRecord {
  id: string;
  query: string;
  answer: string;
  sources?: string[];
  timestamp: string;
}

// Futuristic Intro Splash using the exact VFX image background
function IntroSplash({ onEnter }: { onEnter: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onEnter, 600);
    }, 4500);
    return () => clearTimeout(timer);
  }, [onEnter]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white overflow-hidden transition-opacity duration-700 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Graphic Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-opacity opacity-40 scale-105 filter contrast-125 brightness-90 animate-pulse"
        style={{ backgroundImage: "url('/background.jpg')", animationDuration: '8s' }}
      />
      
      {/* High-Tech VFX Overlay Layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)] pointer-events-none" />

      {/* Glassmorphic Central Card Container */}
      <div className="relative z-10 w-full max-w-4xl mx-4 p-8 sm:p-12 md:p-14 rounded-3xl backdrop-blur-2xl bg-slate-950/60 border border-cyan-500/40 shadow-[0_0_80px_rgba(6,182,212,0.25)] flex flex-col items-center text-center space-y-6">
        
        {/* Double Neon Ring Bolt Badge */}
        <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-cyan-400 bg-slate-900/90 shadow-[0_0_40px_rgba(6,182,212,0.6)]">
          <div className="absolute inset-0 rounded-full border border-cyan-300/50 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-300 drop-shadow-[0_0_15px_#06b6d4]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]">
          Industrial Maintenance AI Agent
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl font-light tracking-wide leading-relaxed">
          ABB Accelerator 2026 — Multimodal Intelligence
          <br className="hidden sm:inline" /> & Real-Time Compliance Monitoring System
        </p>

        {/* Enter Dashboard Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              setFadeOut(true);
              setTimeout(onEnter, 600);
            }}
            className="group relative px-9 py-3.5 rounded-xl border border-cyan-400/80 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-100 font-medium text-base shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(6,182,212,0.8)] hover:border-cyan-200 cursor-pointer backdrop-blur-md overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-cyan-400/15 group-hover:translate-x-full transition-transform duration-500 ease-out transform -translate-x-full" />
            <span className="relative z-10 flex items-center gap-2">
              Enter Dashboard &rarr;
            </span>
          </button>
        </div>

        {/* Card Footer Status */}
        <div className="w-full text-right pt-2 text-xs text-slate-400 font-mono tracking-wider">
          Status: Secure RAG Vector Pipeline Online
        </div>
      </div>
    </div>
  );
}

export default function MaintenanceAgentDashboard() {
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"controls" | "history">("controls");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [formatFilter, setFormatFilter] = useState<string>("");
  
  // Multi-file upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [temperature, setTemperature] = useState(0.2);

  // Persistent History States
  const [uploadedHistory, setUploadedHistory] = useState<UploadedDocument[]>([]);
  const [queryHistory, setQueryHistory] = useState<QueryRecord[]>([]);

  // Load past history from LocalStorage on mount
  useEffect(() => {
    const savedDocs = localStorage.getItem("abb_uploaded_docs");
    const savedQueries = localStorage.getItem("abb_query_history");
    if (savedDocs) {
      try { setUploadedHistory(JSON.parse(savedDocs)); } catch {}
    }
    if (savedQueries) {
      try { setQueryHistory(JSON.parse(savedQueries)); } catch {}
    }
  }, []);

  // Sync uploaded docs to LocalStorage
  const saveUploadedDoc = (doc: UploadedDocument) => {
    setUploadedHistory((prev) => {
      const updated = [doc, ...prev];
      localStorage.setItem("abb_uploaded_docs", JSON.stringify(updated));
      return updated;
    });
  };

  // Sync query records to LocalStorage
  const saveQueryRecord = (record: QueryRecord) => {
    setQueryHistory((prev) => {
      const updated = [record, ...prev];
      localStorage.setItem("abb_query_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setSelectedFiles(fileList);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploadStatus(`Uploading & indexing ${selectedFiles.length} document(s)...`);
    
    let totalChunks = 0;
    let successCount = 0;

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://127.0.0.1:8000/ingest", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        if (res.ok) {
          successCount++;
          const chunks = data.total_chunks_indexed || 0;
          totalChunks += chunks;

          // Add to persistent upload history
          saveUploadedDoc({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: file.size,
            type: file.name.split(".").pop()?.toUpperCase() || "FILE",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
            chunksIndexed: chunks,
          });
        }
      } catch (err) {
        console.error("Upload error for file:", file.name, err);
      }
    }

    if (successCount > 0) {
      setUploadStatus(`Indexed ${successCount} file(s) (${totalChunks} chunks)`);
      setSelectedFiles([]);
    } else {
      setUploadStatus("Failed to process documents.");
    }
  };

  const handleSendMessage = async (userQuery?: string) => {
    const queryToSend = userQuery || input;
    if (!queryToSend.trim() || loading) return;

    if (!userQuery) setInput("");
    setMessages((prev) => [...prev, { role: "user", content: queryToSend }]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: queryToSend,
          file_format_filter: formatFilter || null,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        const answerText = data.answer;
        const sourceList = data.sources || [];

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: answerText,
            sources: sourceList,
          },
        ]);

        // Save Query to Persistent History
        saveQueryRecord({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          query: queryToSend,
          answer: answerText,
          sources: sourceList,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.detail || "Something went wrong."}` },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error: Could not reach backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("abb_uploaded_docs");
    localStorage.removeItem("abb_query_history");
    setUploadedHistory([]);
    setQueryHistory([]);
  };

  return (
    <>
      {showSplash && <IntroSplash onEnter={() => setShowSplash(false)} />}

      <main className="flex h-screen bg-slate-900 text-gray-100 font-sans overflow-hidden">
        
        {/* Collapsible Left Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-80" : "w-16"
          } transition-all duration-300 border-r border-slate-800 flex flex-col justify-between bg-slate-950 relative z-20 shrink-0`}
        >
          {/* Header & Sidebar Toggle */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            {sidebarOpen ? (
              <div>
                <h1 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  ⚡ Maintenance AI
                </h1>
                <p className="text-xs text-slate-400">Industrial RAG Agent</p>
              </div>
            ) : (
              <span className="text-xl mx-auto">⚡</span>
            )}
            
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>

          {/* Navigation Tab Switcher (Visible when expanded) */}
          {sidebarOpen && (
            <div className="flex border-b border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setSidebarTab("controls")}
                className={`flex-1 py-2.5 text-center transition ${
                  sidebarTab === "controls"
                    ? "bg-slate-900 text-emerald-400 border-b-2 border-emerald-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🛠️ Control Panel
              </button>
              <button
                onClick={() => setSidebarTab("history")}
                className={`flex-1 py-2.5 text-center transition ${
                  sidebarTab === "history"
                    ? "bg-slate-900 text-cyan-400 border-b-2 border-cyan-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📜 History Log ({uploadedHistory.length + queryHistory.length})
              </button>
            </div>
          )}

          {/* Sidebar Body Content */}
          {sidebarOpen ? (
            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              
              {sidebarTab === "controls" ? (
                <>
                  {/* 1. Multi-file Batch Document Ingestion */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      1. Ingest Documents (Multi-Upload)
                    </h2>
                    <form onSubmit={handleUpload} className="space-y-2.5">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.doc,.md,.txt,.csv,.json"
                        onChange={handleFileChange}
                        className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                      />
                      
                      {selectedFiles.length > 0 && (
                        <div className="text-[11px] text-cyan-300 font-mono bg-slate-900/90 p-2 rounded border border-cyan-500/30 max-h-24 overflow-y-auto">
                          <p className="font-semibold text-slate-300 mb-1">Selected {selectedFiles.length} file(s):</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {selectedFiles.map((f, i) => (
                              <li key={i} className="truncate">{f.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={selectedFiles.length === 0}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-md text-xs font-semibold transition cursor-pointer"
                      >
                        Upload & Index Selected Batch
                      </button>
                    </form>
                    {uploadStatus && <p className="text-xs mt-2 text-emerald-400 font-medium">{uploadStatus}</p>}
                  </div>

                  {/* 2. Metadata Filter */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      2. Format Metadata Filter
                    </h2>
                    <select
                      value={formatFilter}
                      onChange={(e) => setFormatFilter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">All Formats (Global Search)</option>
                      <option value="pdf">PDF Manuals (.pdf)</option>
                      <option value="docx">Word Specs (.docx, .doc)</option>
                      <option value="markdown">Markdown Notes (.md)</option>
                      <option value="text">Plain Text / CSV (.txt, .csv)</option>
                    </select>
                  </div>

                  {/* 3. Real-Time Vector DB Stats */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Vector Store Metrics
                    </h2>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Engine:</span>
                      <span className="font-mono text-slate-100">ChromaDB</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Indexed Files:</span>
                      <span className="font-mono text-cyan-400">{uploadedHistory.length} files</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Pipeline:</span>
                      <span className="text-emerald-400 font-semibold">Active</span>
                    </div>
                  </div>

                  {/* 4. Model Control Tuning */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Model Temperature:</span>
                      <span className="font-mono text-emerald-400">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* 5. Quick Diagnostic Presets */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Quick Diagnostic Queries
                    </h2>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => handleSendMessage("What are the key privacy & consent rules in the policy?")}
                        className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
                      >
                        🔍 Privacy & Consent Rules
                      </button>
                      <button
                        onClick={() => handleSendMessage("What is Rosalyn's policy about warranties?")}
                        className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
                      >
                        ⚙️ Warranty & Liability Disclaimer
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* HISTORY TAB CONTENT */
                <div className="space-y-6">
                  {/* Past Uploaded Documents */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                        📁 Uploaded Files History ({uploadedHistory.length})
                      </h2>
                    </div>
                    {uploadedHistory.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No document upload records found.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {uploadedHistory.map((doc) => (
                          <div key={doc.id} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex flex-col space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-slate-200 truncate max-w-[180px]" title={doc.name}>{doc.name}</span>
                              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800/50">
                                {doc.type}
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>{(doc.size / 1024).toFixed(1)} KB</span>
                              <span>{doc.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Past Query / Conversation Log */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                      💬 Query History ({queryHistory.length})
                    </h2>
                    {queryHistory.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No past query history recorded.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {queryHistory.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => handleSendMessage(item.query)}
                            className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs cursor-pointer transition flex flex-col space-y-1 group"
                          >
                            <p className="font-medium text-slate-300 group-hover:text-emerald-300 line-clamp-2">
                              "{item.query}"
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono text-right">{item.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Clear History Button */}
                  {(uploadedHistory.length > 0 || queryHistory.length > 0) && (
                    <button
                      onClick={clearHistory}
                      className="w-full py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded text-xs transition cursor-pointer"
                    >
                      Clear All Saved History
                    </button>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center py-6 space-y-6 text-slate-400">
              <span title="Controls" onClick={() => { setSidebarOpen(true); setSidebarTab("controls"); }} className="cursor-pointer hover:text-white">⚙️</span>
              <span title="History Log" onClick={() => { setSidebarOpen(true); setSidebarTab("history"); }} className="cursor-pointer hover:text-white">📜</span>
            </div>
          )}

          {/* Footer & Developer Credit */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-center">
            {sidebarOpen ? (
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Developed by <span className="text-emerald-400 font-semibold">Eriadura Oloyede</span>
              </p>
            ) : (
              <span className="text-xs font-bold text-emerald-400">EO</span>
            )}
          </div>
        </aside>

        {/* Main Interface Workspace */}
        <section className="flex-1 flex flex-col h-full bg-slate-900">
          
          {/* Header Bar with Profile Badge */}
          <header className="border-b border-slate-800 p-4 bg-slate-950 flex items-center justify-between">
            <h2 className="font-medium text-sm text-slate-300">
              Expert Technical Assistant & Compliance Monitor
            </h2>

            {/* Top-Right Profile Badge */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-200">Eriadura Oloyede</p>
                <p className="text-[10px] text-emerald-400 font-mono">System Architect</p>
              </div>
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-emerald-300">
                    EO
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
              </div>
            </div>
          </header>

          {/* Message History Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <p className="text-lg font-medium text-slate-300">No active queries yet.</p>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Upload multiple technical documents or select a past query from your History tab to inspect real-time maintenance advice!
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-2xl rounded-xl p-4 text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-emerald-600 text-white shadow-md" 
                      : "bg-slate-950 border border-slate-800 text-slate-200 shadow-lg"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs text-emerald-400">
                      <span className="font-semibold">Sources Cited:</span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-emerald-300/90">
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
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-400 animate-pulse flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Synthesizing response from vector knowledge base...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Footer Bar */}
          <footer className="p-4 bg-slate-950 border-t border-slate-800">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }} 
              className="flex gap-3 max-w-4xl mx-auto"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about compliance rules, error codes, or maintenance workflows..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Send
              </button>
            </form>
          </footer>
        </section>
      </main>
    </>
  );
}