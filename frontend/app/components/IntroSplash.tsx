// Futuristic Glassmorphism Intro Splash Component
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
      {/* 1. Cyber Matrix Grid & Converging Light Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.25)_0%,rgba(2,6,23,0.95)_75%)] pointer-events-none" />
      
      {/* Perspective Grid Background */}
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#06b6d420_1px,transparent_1px),linear-gradient(to_bottom,#06b6d420_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_100%,transparent_100%)] pointer-events-none" />

      {/* Floating Ambient Light Flares */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* 2. Frosted Glass Central Container Card */}
      <div className="relative z-10 w-full max-w-4xl mx-4 p-8 sm:p-12 md:p-16 rounded-3xl backdrop-blur-xl bg-slate-950/40 border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.18)] flex flex-col items-center text-center space-y-6">
        
        {/* Neon Circular Icon Badge */}
        <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-cyan-400/80 bg-slate-900/80 shadow-[0_0_35px_rgba(6,182,212,0.5)]">
          <div className="absolute inset-0 rounded-full border border-cyan-300/40 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-300 drop-shadow-[0_0_12px_#06b6d4]"
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

        {/* Main Title with Emerald to Cyan Gradient */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.25)]">
          Industrial Maintenance AI Agent
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl font-light tracking-wide leading-relaxed">
          ABB Accelerator 2026 — Multimodal Intelligence
          <br className="hidden sm:inline" /> & Real-Time Compliance Monitoring System
        </p>

        {/* Glassmorphic Neon Button */}
        <div className="pt-4">
          <button
            onClick={() => {
              setFadeOut(true);
              setTimeout(onEnter, 600);
            }}
            className="group relative px-8 py-3.5 rounded-xl border border-cyan-400/80 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-100 font-medium text-base shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] hover:border-cyan-300 cursor-pointer backdrop-blur-md overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-cyan-400/10 group-hover:translate-x-full transition-transform duration-500 ease-out transform -translate-x-full" />
            <span className="relative z-10 flex items-center gap-2">
              Enter Dashboard &rarr;
            </span>
          </button>
        </div>

        {/* Status indicator anchored inside bottom right of card */}
        <div className="w-full text-right pt-4 text-xs text-slate-400 font-mono tracking-wider">
          Status: Secure RAG Vector Pipeline Online
        </div>
      </div>
    </div>
  );
}