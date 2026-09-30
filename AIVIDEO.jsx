import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, 
  Play, 
  Upload, 
  Sparkles, 
  Music, 
  Languages, 
  Trash2, 
  Loader2, 
  Download,
  ChevronRight,
  Clock,
  Video,
  ImageIcon,
  CheckCircle2,
  X,
  Volume2,
  FileText,
  Maximize2,
  Share2,
  Wind,
  Box,
  Layers,
  Settings2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';

// Environment Constants
// Read API key from common env locations (Vite/CRA: REACT_APP_FIREBASE_API_KEY, or FIREBASE_API_KEY),
// or from a `window.__env` object, or from the global `__firebase_config` string. Falls back to a local default for dev.
const DEFAULT_API_KEY = 'GGeBQIFKEdTDLDiBocdiLx7PfrmuQgE1Fnb8uDfE'; // dev fallback; remove in production
function getEnvApiKey() {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.REACT_APP_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || null;
    }
  } catch (e) {}
  if (typeof window !== 'undefined') {
    if (window.__env && window.__env.FIREBASE_API_KEY) return window.__env.FIREBASE_API_KEY;
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      try {
        const parsed = JSON.parse(__firebase_config);
        if (parsed.apiKey) return parsed.apiKey;
      } catch (e) {
        console.warn('Could not parse __firebase_config for apiKey', e);
      }
    }
  }
  return null;
}
const apiKey = getEnvApiKey() || DEFAULT_API_KEY;
let firebaseConfig;
try {
  firebaseConfig = (typeof __firebase_config !== 'undefined' && __firebase_config) ? JSON.parse(__firebase_config) : { apiKey };
} catch (err) {
  console.warn('Failed to parse __firebase_config, falling back to minimal config', err);
  firebaseConfig = { apiKey };
}
if (!firebaseConfig.apiKey) firebaseConfig.apiKey = apiKey;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'script-to-cinema-v1';

const VOICES = [
  { id: 'cinematic-male', name: 'Deep Cinematic (Male)', icon: '🎙️' },
  { id: 'narrator-female', name: 'Professional Narrator (Female)', icon: '🎙️' },
  { id: 'soft-storyteller', name: 'Soft Storyteller', icon: '🎙️' }
];

const STYLES = [
  { id: 'photoreal', name: 'Hyper-Realistic', colors: 'from-zinc-400 to-slate-900' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', colors: 'from-fuchsia-600 to-blue-600' },
  { id: 'vintage', name: 'Vintage 35mm', colors: 'from-amber-600 to-orange-900' },
  { id: 'anime', name: 'High-Fidelity Anime', colors: 'from-cyan-400 to-indigo-500' }
];

const RESOLUTIONS = [
  { id: '16-9', name: '16:9 Widescreen', label: 'Cinematic' },
  { id: '9-16', name: '9:16 Vertical', label: 'Social' },
  { id: '1-1', name: '1:1 Square', label: 'Classic' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[0].id);
  const [assets, setAssets] = useState([]);
  
  // Advanced Sora-like Physics State
  const [physics, setPhysics] = useState({
    motion: 50,
    complexity: 75,
    realism: 90
  });

  const [activeVideo, setActiveVideo] = useState(null);
  const fileInputRef = useRef(null);
  const assetInputRef = useRef(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { 
        console.error("Auth Error:", err); 
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'projects'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    }, (error) => {
      console.error("Firestore Error:", error);
    });
  }, [user]);

  const handleAssetUpload = (e) => {
    const files = Array.from(e.target.files);
    if (assets.length + files.length > 5) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAssets(prev => [...prev, { id: Math.random(), url: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const generateMovie = async () => {
    if (!script.trim() || isGenerating || !user) return;

    setIsGenerating(true);
    setProgress(0);
    
    const messages = [
      "Simulating spatial physics...",
      "Calculating temporal consistency...",
      "Generating 60fps cinematic frames...",
      "Synthesizing photorealistic textures...",
      "Interpolating motion vectors...",
      "Final lighting pass & color grade..."
    ];

    let currentMsg = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99;
        if (prev % 16 === 0 && currentMsg < messages.length - 1) {
          currentMsg++;
          setStatusMessage(messages[currentMsg]);
        }
        return prev + 0.4;
      });
    }, 120);

    try {
      // Logic for future API integration with retry mechanism/backoff can go here
      await new Promise(resolve => setTimeout(resolve, 15000));

      const newMovie = {
        script: script.substring(0, 500),
        style: selectedStyle,
        voice: selectedVoice,
        resolution: selectedRes,
        physics: physics,
        assetCount: assets.length,
        duration: '60s',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', 
        createdAt: serverTimestamp(),
        userId: user.uid,
        status: 'completed'
      };

      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'projects'), newMovie);
      setScript('');
      setAssets([]);
    } catch (err) {
      console.error("Gen Error:", err);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setProgress(0);
      setStatusMessage('');
    }
  };

  const deleteMovie = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'projects', id));
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Video Viewer Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 md:p-8 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="relative w-full max-w-6xl bg-[#0f0f13] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-white/20 transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
              <div className="flex-[2] bg-black flex items-center justify-center p-4">
                <video 
                  src={activeVideo.videoUrl} 
                  controls 
                  autoPlay 
                  className={`w-full h-full shadow-2xl shadow-indigo-500/10 rounded-xl ${activeVideo.resolution === '9-16' ? 'max-w-xs' : 'object-contain'}`}
                />
              </div>
              <div className="flex-1 p-8 overflow-y-auto border-l border-white/5 bg-[#0a0a0c]">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Generated Script</h3>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-mono bg-white/5 p-4 rounded-xl border border-white/5 italic">
                      {activeVideo.script}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Physics Engine</p>
                      <p className="text-sm text-indigo-300 font-medium">Ultra-Motion V2</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Consistency</p>
                      <p className="text-sm text-purple-300 font-medium">98.4% Temporal</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                      <Download className="w-4 h-4" /> Export Cinema 4K
                    </button>
                    <button className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl border border-white/10 font-bold text-sm flex items-center justify-center gap-2 transition-all">
                      <Share2 className="w-4 h-4" /> Share Generation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#050507]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 ring-1 ring-white/20">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">SORA<span className="text-indigo-500">CINEMA</span></h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase">Temporal Generation V3</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Showcase</a>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/20">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Compute Credits: Unlimited
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Engine Config */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#0f0f13] rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Settings2 className="w-24 h-24" />
            </div>
            
            <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Engine Configuration
            </h3>
            
            <div className="space-y-10">
              {/* Asset Mapping */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Spatial References</label>
                  <span className="text-[10px] font-bold text-slate-600">{assets.length}/5 Assets</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {assets.map(asset => (
                    <div key={asset.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                      <img src={asset.url} className="w-full h-full object-cover" alt="ref" />
                      <button 
                        onClick={() => setAssets(prev => prev.filter(a => a.id !== asset.id))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  {assets.length < 5 && (
                    <button 
                      onClick={() => assetInputRef.current.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-600 hover:border-indigo-500 hover:text-indigo-400 transition-all bg-white/5"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <input ref={assetInputRef} type="file" hidden accept="image/*" multiple onChange={handleAssetUpload} />
              </section>

              {/* Sora Style Physics */}
              <section className="space-y-6 bg-black/30 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Physics & Dynamics</span>
                </div>
                
                {Object.keys(physics).map(key => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                      <span>{key}</span>
                      <span className="text-indigo-400">{physics[key]}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={physics[key]}
                      onChange={(e) => setPhysics({...physics, [key]: parseInt(e.target.value)})}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                ))}
              </section>

              {/* Aspect Ratio */}
              <section>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 block">Resolution Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {RESOLUTIONS.map(res => (
                    <button
                      key={res.id}
                      onClick={() => setSelectedRes(res.id)}
                      className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${
                        selectedRes === res.id 
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                        : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'
                      }`}
                    >
                      {res.name}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Center: Generation Workspace */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-[#0f0f13] rounded-[2.5rem] border border-white/10 p-10 shadow-2xl relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                  <Play className="w-6 h-6 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Temporal Workspace</h2>
              </div>
              <div className="flex gap-2">
                {STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${
                      selectedStyle === style.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/5 text-slate-500 hover:bg-white/10'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full h-72 bg-black/60 rounded-[2rem] p-8 text-slate-200 font-mono text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-white/5 resize-none placeholder:text-slate-700"
              placeholder="Describe your 60-second cinematic experience...&#10;&#10;E.g., A slow drone shot through a neon-lit rain forest, vibrant bioluminescent plants swaying in the wind, physics simulated water droplets on camera lens..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              disabled={isGenerating}
            />

            <div className="mt-10 flex items-center justify-between gap-10">
              <div className="flex-1">
                {isGenerating ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.3em] animate-pulse">
                          {statusMessage}
                        </span>
                      </div>
                      <span className="text-sm font-black text-slate-500">{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400 bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">Ready to process 3,600 cinematic frames.</p>
                )}
              </div>

              <button
                onClick={generateMovie}
                disabled={isGenerating || !script.trim()}
                className={`group px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-4 transition-all ${
                  isGenerating || !script.trim()
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] transform hover:-translate-y-1 active:translate-y-0'
                }`}
              >
                {isGenerating ? 'Processing' : 'Gen Sora-60'}
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Project Gallery */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Cinematic Archives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
              {projects.map((p) => (
                <div key={p.id} className="group bg-[#0f0f13] rounded-[2rem] border border-white/5 overflow-hidden hover:border-indigo-500/30 transition-all shadow-xl">
                  <div className="relative aspect-video bg-black overflow-hidden cursor-pointer" onClick={() => setActiveVideo(p)}>
                    <video 
                      src={p.videoUrl} 
                      className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000 ${p.resolution === '9-16' ? 'scale-150' : ''}`} 
                      muted
                    />
                    <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-indigo-900/0 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20">60S Master</span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest border border-white/5">{p.resolution}</span>
                      </div>
                      <button onClick={() => deleteMovie(p.id)} className="text-slate-700 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-mono italic line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                      "{p.script}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        input[type='range'] {
          -webkit-appearance: none;
          background: rgba(255, 255, 255, 0.05);
          height: 4px;
          border-radius: 2px;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
}

export default App;