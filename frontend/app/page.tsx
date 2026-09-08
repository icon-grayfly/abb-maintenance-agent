"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  externalEngines?: string[];
  externalResults?: ExternalResultItem[];
  showExternal?: boolean;
}

interface ExternalResultItem {
  title: string;
  snippet: string;
  url: string;
  mediaType?: "doc" | "image" | "video";
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

interface CategorySearchResult {
  id: string;
  category: "Tab" | "Document" | "History Query" | "Diagnostic Keyword";
  title: string;
  snippet: string;
  details?: string;
  targetTab?: "controls" | "history";
  action: () => void;
}

const SEARCH_ENGINES = [
  { id: "google", name: "Google", icon: "🌐" },
  { id: "openai", name: "OpenAI", icon: "🤖" },
  { id: "duckduckgo", name: "DuckDuckGo", icon: "🦆" },
  { id: "gemini", name: "Gemini", icon: "✨" },
  { id: "wikipedia", name: "Wikipedia", icon: "📚" },
  { id: "bing", name: "Bing Search", icon: "🔍" },
];

function IntroSplash({ onEnter }: { onEnter: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onEnter, 600);
    }, 4500);
    return () => clearTimeout(timer);
  }, [onEnter]);

  const enterDashboard = () => {
    setFadeOut(true);
    setTimeout(onEnter, 700);
  };

  return (
    <div className={`intro-splash ${fadeOut ? "intro-splash--out" : ""}`}>
      <div className="intro-splash__grid" />
      <div className="intro-splash__rings" />
      <div className="intro-splash__particles" />
      <div className="intro-splash__vignette" />

      <main className="intro-panel">
        <div className="intro-panel__bolt" aria-hidden="true">
          <span>⚡</span>
        </div>
        <div className="intro-panel__bracket intro-panel__bracket--left" />
        <div className="intro-panel__bracket intro-panel__bracket--right" />

        <div className="intro-mark" aria-label="ABB maintenance intelligence">
          <span className="intro-mark__wave intro-mark__wave--one" />
          <span className="intro-mark__wave intro-mark__wave--two" />
          <span className="intro-mark__wave intro-mark__wave--three" />
          <span className="intro-mark__wave intro-mark__wave--four" />
          <span className="intro-mark__wave intro-mark__wave--five" />
        </div>

        <div className="intro-panel__copy">
          <p className="intro-kicker">ABB // INDUSTRIAL INTELLIGENCE</p>
          <h1>ICONOVOUS AI</h1>
          <p>Multimodal diagnostics for safer, smarter operations.</p>
          <button className="intro-enter" onClick={enterDashboard}>
            <span>Initialize system</span>
            <strong aria-hidden="true">-&gt;</strong>
          </button>
        </div>

        <div className="intro-panel__status">
          <span className="status-dot" />
          SECURE RAG VECTOR PIPELINE // ONLINE
        </div>
      </main>

      <div className="intro-corner intro-corner--top">SYS.01 / 2026</div>
      <div className="intro-corner intro-corner--bottom">ABB ACCELERATOR / THEME 02</div>
      <button className="intro-skip" onClick={enterDashboard}>Skip intro</button>
    </div>
  );
}

export default function MaintenanceAgentDashboard() {
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"controls" | "history">("controls");
  
  // 1. Left pane auto-search state & details reveal
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const [revealedResultId, setRevealedResultId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [formatFilter, setFormatFilter] = useState<string>("");
  
  // 2. Multi-select search engines & click-outside auto-close ref
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [selectedSearchEngines, setSelectedSearchEngines] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 3. Sent Query Editing & Copying state
  const [editingMsgIndex, setEditingMsgIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [copiedMsgIndex, setCopiedMsgIndex] = useState<number | null>(null);

  // Multi-file upload states[cite: 1]
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [temperature, setTemperature] = useState(0.2);

  // Persistent History States[cite: 1]
  const [uploadedHistory, setUploadedHistory] = useState<UploadedDocument[]>([]);
  const [queryHistory, setQueryHistory] = useState<QueryRecord[]>([]);
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  // Auto-close "+" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSourceDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load past history from LocalStorage on mount[cite: 1]
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

  // Sync uploaded docs to LocalStorage[cite: 1]
  const saveUploadedDoc = (doc: UploadedDocument) => {
    setUploadedHistory((prev) => {
      const updated = [doc, ...prev];
      localStorage.setItem("abb_uploaded_docs", JSON.stringify(updated));
      return updated;
    });
  };

  // Sync query records to LocalStorage[cite: 1]
  const saveQueryRecord = (record: QueryRecord) => {
    setQueryHistory((prev) => {
      const updated = [record, ...prev];
      localStorage.setItem("abb_query_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Targeted Deletion Handlers[cite: 1]
  const deleteUploadedDoc = (id: string) => {
    setUploadedHistory((prev) => {
      const updated = prev.filter(doc => doc.id !== id);
      localStorage.setItem("abb_uploaded_docs", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteQueryRecord = (id: string) => {
    setQueryHistory((prev) => {
      const updated = prev.filter(q => q.id !== id);
      localStorage.setItem("abb_query_history", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleDateCollapse = (date: string) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [date]: !(prev[date] ?? true),
    }));
  };

  const toggleExternalResults = (msgIndex: number) => {
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === msgIndex ? { ...msg, showExternal: !msg.showExternal } : msg
      )
    );
  };

  // 1. Unified Multi-Category Auto-Search in Left Pane
  const PRESET_QUERIES = [
    "What are the key privacy & consent rules in the policy?",
    "What is Rosalyn's policy about warranties?",
    "Rosalyn system architecture and vector indexing",
    "Safety guidelines and maintenance protocols"
  ];

  const searchResults: CategorySearchResult[] = [];
  const queryLower = sidebarSearchQuery.toLowerCase().trim();

  if (queryLower) {
    // Search Tabs
    if ("control panel".includes(queryLower) || "controls".includes(queryLower) || "ingest".includes(queryLower)) {
      searchResults.push({
        id: "tab-controls",
        category: "Tab",
        title: "🛠️ Control Panel Tab",
        snippet: "Document Ingestion, Metadata Filters, Vector Metrics & Presets",
        details: "Location: Left Sidebar -> Control Panel. Manage system settings and uploads.",
        targetTab: "controls",
        action: () => setSidebarTab("controls")
      });
    }
    if ("history".includes(queryLower) || "timeline".includes(queryLower) || "log".includes(queryLower)) {
      searchResults.push({
        id: "tab-history",
        category: "Tab",
        title: "📜 History Log Tab",
        snippet: "Timeline of uploaded files and past user queries",
        details: "Location: Left Sidebar -> History. Stores full records and logs.",
        targetTab: "history",
        action: () => setSidebarTab("history")
      });
    }

    // Search Documents
    uploadedHistory.forEach((doc) => {
      if (
        doc.name.toLowerCase().includes(queryLower) ||
        doc.type.toLowerCase().includes(queryLower) ||
        doc.timestamp.toLowerCase().includes(queryLower)
      ) {
        searchResults.push({
          id: `doc-${doc.id}`,
          category: "Document",
          title: `📁 ${doc.name}`,
          snippet: `Type: ${doc.type} | Size: ${(doc.size / 1024).toFixed(1)} KB`,
          details: `Uploaded on: ${doc.timestamp} | Indexed Chunks: ${doc.chunksIndexed || 0}`,
          targetTab: "history",
          action: () => setSidebarTab("history")
        });
      }
    });

    // Search Past Queries
    queryHistory.forEach((q) => {
      if (
        q.query.toLowerCase().includes(queryLower) ||
        q.answer.toLowerCase().includes(queryLower) ||
        q.timestamp.toLowerCase().includes(queryLower)
      ) {
        searchResults.push({
          id: `query-${q.id}`,
          category: "History Query",
          title: `💬 "${q.query}"`,
          snippet: q.answer.substring(0, 75) + "...",
          details: `Full Answer: "${q.answer}" | Time: ${q.timestamp}`,
          targetTab: "history",
          action: () => {
            setSidebarTab("history");
            handleSendMessage(q.query);
          }
        });
      }
    });

    // Search Diagnostic Keywords & Presets
    PRESET_QUERIES.forEach((preset, pIdx) => {
      if (preset.toLowerCase().includes(queryLower)) {
        searchResults.push({
          id: `preset-${pIdx}`,
          category: "Diagnostic Keyword",
          title: `🔍 "${preset}"`,
          snippet: "Quick diagnostic query preset",
          details: "Executes instant vector RAG search against active knowledgebase.",
          targetTab: "controls",
          action: () => {
            setSidebarTab("controls");
            handleSendMessage(preset);
          }
        });
      }
    });
  }

  // Handle Enter Key in Left Pane Search Input
  const handleLeftPaneSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      e.preventDefault();
      const topMatch = searchResults[0];
      topMatch.action();
    }
  };

  // Grouped History Log[cite: 1]
  type HistoryItem = 
    | { type: "upload"; data: UploadedDocument }
    | { type: "query"; data: QueryRecord };

  const filteredUploads = uploadedHistory.filter(doc =>
    doc.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) ||
    doc.timestamp.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
  );

  const filteredQueries = queryHistory.filter(q =>
    q.query.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) ||
    q.answer.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) ||
    q.timestamp.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
  );

  const allHistory: HistoryItem[] = [
    ...filteredUploads.map((doc) => ({ type: "upload" as const, data: doc })),
    ...filteredQueries.map((q) => ({ type: "query" as const, data: q })),
  ];

  allHistory.sort((a, b) => {
    const timeA = parseInt(a.data.id.split("-")[0]);
    const timeB = parseInt(b.data.id.split("-")[0]);
    return timeB - timeA; 
  });

  const groupedHistory = allHistory.reduce((acc, item) => {
    const datePart = item.data.timestamp.split(",")[0].trim();
    if (!acc[datePart]) acc[datePart] = [];
    acc[datePart].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

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

    const activeEngines = [...selectedSearchEngines];
    if (!userQuery) setInput("");
    setShowSourceDropdown(false);
    
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

        // Build multi-engine external search results if engines selected
        let extResults: ExternalResultItem[] | undefined;
        if (activeEngines.length > 0) {
          extResults = activeEngines.flatMap((engineName) => [
            {
              title: `${engineName} Search: "${queryToSend}"`,
              snippet: `Retrieved technical overview, safety protocols, and documentation matched via ${engineName}.`,
              url: engineName === "Google"
                ? `https://www.google.com/search?q=${encodeURIComponent(queryToSend)}`
                : engineName === "Wikipedia"
                ? `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(queryToSend)}`
                : `https://duckduckgo.com/?q=${encodeURIComponent(queryToSend)}`,
              mediaType: "doc" as const,
            },
            {
              title: `${engineName} Visual Diagrams`,
              snippet: `Schematic drawings and visual maintenance guides matched via ${engineName}.`,
              url: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(queryToSend)}`,
              mediaType: "image" as const,
            }
          ]);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: answerText,
            sources: sourceList,
            externalEngines: activeEngines.length > 0 ? activeEngines : undefined,
            externalResults: extResults,
            showExternal: false,
          },
        ]);

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

  // 3. Sent Query Editing & Copy Handlers
  const handleCopyQuery = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIndex(idx);
    setTimeout(() => setCopiedMsgIndex(null), 2000);
  };

  const handleStartEditQuery = (text: string, idx: number) => {
    setEditingMsgIndex(idx);
    setEditText(text);
  };

  const handleSaveEditQuery = (idx: number) => {
    if (!editText.trim()) return;
    const updated = [...messages];
    updated[idx].content = editText;
    setMessages(updated);
    setEditingMsgIndex(null);
    setEditText("");
  };

  const clearHistory = () => {
    localStorage.removeItem("abb_uploaded_docs");
    localStorage.removeItem("abb_query_history");
    setUploadedHistory([]);
    setQueryHistory([]);
  };

  // Toggle multi-selection of external search engines
  const toggleSearchEngine = (engineName: string) => {
    setSelectedSearchEngines((prev) =>
      prev.includes(engineName)
        ? prev.filter((e) => e !== engineName)
        : [...prev, engineName]
    );
  };

  return (
    <>
      {/* Global CSS for Waving Hand VFX Animation[cite: 1] */}
      <style jsx global>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-8deg); }
          45% { transform: rotate(14deg); }
          60% { transform: rotate(-4deg); }
          75% { transform: rotate(10deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {showSplash && <IntroSplash onEnter={() => setShowSplash(false)} />}

      <main className="flex h-screen bg-slate-900 text-gray-100 font-sans overflow-hidden">
        
        {/* Collapsible Left Sidebar[cite: 1] */}
        <aside
          className={`${
            sidebarOpen ? "w-80" : "w-16"
          } transition-all duration-300 border-r border-slate-800 flex flex-col justify-between bg-slate-950 relative z-20 shrink-0`}
        >
          {/* Header & Sidebar Toggle[cite: 1] */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            {sidebarOpen ? (
              <div>
                <h1 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  ⚡ ICONOVOUS AI
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

          {/* Navigation Tab Switcher[cite: 1] */}
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

          {/* 1. Left Pane Auto-Search Bar (Tabs, Docs, Words, History) */}
          {sidebarOpen && (
            <div className="px-3 py-2 border-b border-slate-800/60 bg-slate-950/40">
              <div className="relative">
                <input
                  type="text"
                  value={sidebarSearchQuery}
                  onChange={(e) => setSidebarSearchQuery(e.target.value)}
                  onKeyDown={handleLeftPaneSearchKeyDown}
                  placeholder="Auto-search (e.g. Rosalyn, tab, doc)..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg py-1.5 pl-8 pr-7 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  🔍
                </span>
                {sidebarSearchQuery && (
                  <button
                    onClick={() => setSidebarSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sidebar Body Content / Auto-Search Results View */}
          {sidebarOpen ? (
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
              
              {/* Active Left Pane Auto-Search Results Overlay Panel */}
              {sidebarSearchQuery.trim() !== "" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Search Results ({searchResults.length})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Press Enter to select top</span>
                  </div>

                  {searchResults.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No matching items or tabs found.</p>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((res) => {
                        const isRevealed = revealedResultId === res.id;
                        return (
                          <div
                            key={res.id}
                            onClick={res.action}
                            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-xs cursor-pointer transition group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200 group-hover:text-cyan-300">
                                {res.title}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950 text-cyan-400 border border-cyan-900/40">
                                {res.category}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-1">{res.snippet}</p>

                            {/* Click to Reveal Deeper Details */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRevealedResultId(isRevealed ? null : res.id);
                              }}
                              className="mt-2 text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                            >
                              <span>{isRevealed ? "▲ Hide details" : "▼ Click to reveal details"}</span>
                            </button>

                            {isRevealed && res.details && (
                              <div className="mt-2 p-2 bg-slate-950 rounded text-[11px] text-slate-300 font-mono border border-slate-800 leading-relaxed">
                                {res.details}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : sidebarTab === "controls" ? (
                <>
                  {/* 1. Multi-file Batch Document Ingestion[cite: 1] */}
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

                  {/* 2. Metadata Filter[cite: 1] */}
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

                  {/* 3. Real-Time Vector DB Stats[cite: 1] */}
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

                  {/* 4. Model Control Tuning[cite: 1] */}
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

                  {/* 5. Quick Diagnostic Presets[cite: 1] */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Quick Diagnostic Queries
                    </h2>
                    <div className="space-y-1.5">
                      {PRESET_QUERIES.map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(preset)}
                          className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition cursor-pointer"
                        >
                          🔍 {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* UNIFIED TIMELINE HISTORY TAB CONTENT[cite: 1] */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      📅 Timeline History
                    </h2>
                    {(uploadedHistory.length > 0 || queryHistory.length > 0) && (
                      <button
                        onClick={clearHistory}
                        className="text-[10px] py-1 px-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded transition cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {Object.keys(groupedHistory).length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No matching history records found.</p>
                  ) : (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                      {Object.entries(groupedHistory).map(([date, items]) => {
                        const isCollapsed = collapsedDates[date] ?? true;

                        return (
                          <div key={date} className="space-y-2">
                            
                            {/* Accordion Date Header[cite: 1] */}
                            <button
                              onClick={() => toggleDateCollapse(date)}
                              className="w-full flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                            >
                              <span>{date} <span className="text-slate-500 font-normal ml-1">({items.length} items)</span></span>
                              <span className="text-[10px] text-slate-400">{isCollapsed ? "▶ Expand" : "▼ Collapse"}</span>
                            </button>

                            {/* Grouped Children Items[cite: 1] */}
                            {!isCollapsed && (
                              <div className="space-y-2 pl-1 border-l-2 border-slate-800/50 ml-1">
                                {items.map((item) => {
                                  if (item.type === "upload") {
                                    const doc = item.data as UploadedDocument;
                                    return (
                                      <div key={doc.id} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex flex-col space-y-1 relative group">
                                        <div className="flex justify-between items-start gap-2">
                                          <div className="flex items-start gap-2 overflow-hidden w-full">
                                            <button 
                                              onClick={() => deleteUploadedDoc(doc.id)}
                                              className="text-slate-600 hover:text-rose-500 transition-colors shrink-0 mt-0.5"
                                              title="Delete file history"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                            <span className="font-medium text-slate-200 truncate" title={doc.name}>📁 {doc.name}</span>
                                          </div>
                                          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800/50 shrink-0">
                                            {doc.type}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400 font-mono ml-6">
                                          <span>{(doc.size / 1024).toFixed(1)} KB</span>
                                          <span>{doc.timestamp.split(',')[1]?.trim() || doc.timestamp}</span>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    const q = item.data as QueryRecord;
                                    return (
                                      <div key={q.id} className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs transition flex flex-col space-y-1 relative group">
                                        <div className="flex items-start gap-2 overflow-hidden w-full">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); deleteQueryRecord(q.id); }}
                                            className="text-slate-600 hover:text-rose-500 transition-colors shrink-0 mt-0.5 z-10"
                                            title="Delete query history"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                          </button>
                                          <div 
                                            className="flex-1 cursor-pointer"
                                            onClick={() => handleSendMessage(q.query)}
                                          >
                                            <p className="font-medium text-slate-300 group-hover:text-emerald-300 line-clamp-2">
                                              💬 "{q.query}"
                                            </p>
                                            <div className="text-[10px] text-slate-500 font-mono text-right mt-1">
                                              {q.timestamp.split(',')[1]?.trim() || q.timestamp}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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

          {/* Footer & Developer Credit[cite: 1] */}
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

        {/* Main Interface Workspace[cite: 1] */}
        <section className="flex-1 flex flex-col h-full bg-slate-900">
          
          {/* Header Bar with Profile Badge[cite: 1] */}
          <header className="border-b border-slate-800 p-4 bg-slate-950 flex items-center justify-between">
            <h2 className="font-medium text-sm text-slate-300">
              Expert Technical Assistant & Compliance Monitor
            </h2>

            {/* Top-Right Profile Badge[cite: 1] */}
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                
                {/* Message Outer Wrapper with Group Hover state for Sent Queries */}
                <div className="relative group max-w-2xl">
                  
                  {/* Sent Query Box */}
                  <div
                    className={`rounded-xl p-4 text-sm leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-emerald-600 text-white shadow-md" 
                        : "bg-slate-950 border border-slate-800 text-slate-200 shadow-lg"
                    }`}
                  >
                    {/* Inline Editing Mode for Sent Queries */}
                    {editingMsgIndex === idx ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingMsgIndex(null)}
                            className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEditQuery(idx)}
                            className="px-2 py-1 text-[11px] bg-cyan-600 hover:bg-cyan-500 rounded text-white font-medium"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                    
                    {/* Internal Vector Store Sources[cite: 1] */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <p className="text-xs font-semibold text-cyan-400 mb-1.5 uppercase tracking-wider">
                          📑 Sourced References:
                        </p>
                        <ul className="text-xs text-slate-400 space-y-1 ml-4 list-disc">
                          {msg.sources.map((src, i) => (
                            <li key={i} className="truncate" title={src}>{src}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* External Search Source Toggle Button & Waving Hand Animation[cite: 1] */}
                    {msg.externalResults && msg.externalResults.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleExternalResults(idx)}
                            className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-all duration-300 flex items-center gap-2 cursor-pointer border border-cyan-300/40"
                          >
                            <span>Other Source</span>
                            <span className="bg-slate-900/50 px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-200">
                              {msg.externalEngines?.join(", ")}
                            </span>
                          </button>

                          {/* 3D / Animated / VFX Waving Hand[cite: 1] */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                            <span className="text-lg inline-block animate-[wave_1.2s_infinite] origin-[70%_70%] filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]">
                              👋
                            </span>
                            <span className="font-medium text-[11px] tracking-wide text-amber-200">
                              External details available!
                            </span>
                          </div>
                        </div>

                        {/* Expanded External Source Card[cite: 1] */}
                        {msg.showExternal && (
                          <div className="mt-3 p-3.5 rounded-xl bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                                🌐 External Engines ({msg.externalEngines?.join(", ")}) Results
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">Click link to open in new tab</span>
                            </div>

                            <div className="space-y-2.5">
                              {msg.externalResults.map((extItem, eIdx) => (
                                <div key={eIdx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/30 transition">
                                  <div className="flex items-start justify-between gap-2">
                                    <a
                                      href={extItem.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 truncate"
                                    >
                                      <span>🔗 {extItem.title}</span>
                                      <span className="text-[10px] text-slate-500 font-normal">↗</span>
                                    </a>
                                    {extItem.mediaType && (
                                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-cyan-300 uppercase shrink-0">
                                        {extItem.mediaType}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    {extItem.snippet}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. Copy & Edit Logo Icons (Appears below the box at the lower right edge on hover) */}
                  {msg.role === "user" && editingMsgIndex !== idx && (
                    <div className="absolute -bottom-3.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-slate-950 border border-slate-700/80 text-slate-300 rounded-lg px-2 py-0.5 shadow-lg text-xs z-10">
                      <button
                        onClick={() => handleCopyQuery(msg.content, idx)}
                        className="hover:text-cyan-400 p-0.5 transition"
                        title="Copy query text"
                      >
                        {copiedMsgIndex === idx ? (
                          <span className="text-emerald-400 font-bold">✓</span>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      <div className="w-[1px] h-3 bg-slate-700/80" />
                      <button
                        onClick={() => handleStartEditQuery(msg.content, idx)}
                        className="hover:text-cyan-400 p-0.5 transition"
                        title="Edit query text"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start">
                <div className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl p-4 text-sm shadow-lg flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  </div>
                  <span className="text-emerald-400/80 font-mono text-xs pl-2">Synthesizing compliance data...</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input Box & Multi-Select "+" Source Menu */}
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="max-w-4xl mx-auto flex items-center space-x-2.5 bg-slate-900 border border-slate-800 focus-within:border-emerald-500/50 p-2 rounded-2xl shadow-inner transition-colors relative"
            >
              {/* "+" Icon with Multi-Select & Auto-Close Outside Listener */}
              <div className="relative flex items-center shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg transition cursor-pointer border ${
                    selectedSearchEngines.length > 0 
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                  title="Select External Search Engines (Multi-Select)"
                >
                  +
                </button>

                {/* Selected Engines Chips */}
                {selectedSearchEngines.length > 0 && (
                  <div className="ml-2 flex items-center gap-1 max-w-[200px] overflow-x-auto py-0.5">
                    {selectedSearchEngines.map((engine) => (
                      <div
                        key={engine}
                        className="px-2 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-medium flex items-center gap-1 shrink-0"
                      >
                        <span>{SEARCH_ENGINES.find((e) => e.name === engine)?.icon || "🔍"}</span>
                        <span>{engine}</span>
                        <button
                          type="button"
                          onClick={() => toggleSearchEngine(engine)}
                          className="text-cyan-400 hover:text-white font-bold ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search Source Multi-Selector Popup */}
                {showSourceDropdown && (
                  <div className="absolute bottom-12 left-0 w-64 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_30px_rgba(0,0,0,0.8)] p-2.5 z-50 space-y-1.5 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        External Search Engines
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {selectedSearchEngines.length} selected
                      </span>
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {SEARCH_ENGINES.map((engine) => {
                        const isSelected = selectedSearchEngines.includes(engine.name);
                        return (
                          <button
                            key={engine.id}
                            type="button"
                            onClick={() => toggleSearchEngine(engine.name)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                              isSelected
                                ? "bg-cyan-600/30 text-cyan-200 border border-cyan-500/50 font-semibold"
                                : "text-slate-300 hover:bg-slate-900 hover:text-emerald-300"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{engine.icon}</span>
                              <span>{engine.name}</span>
                            </span>
                            {isSelected && (
                              <span className="text-emerald-400 font-bold text-xs">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Query Text Area[cite: 1] */}
              <textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }}
  placeholder="Query system protocols, query compliance rules, or generate maintenance diagnostics..."
  className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 p-2 focus:outline-none resize-none max-h-32 min-h-[44px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
  rows={1}
/>

              {/* Submit Button[cite: 1] */}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition shadow-md disabled:shadow-none cursor-pointer shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}