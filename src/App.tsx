/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Upload, 
  LogOut, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Scan
} from "lucide-react";
import { cn } from "./lib/utils";
import { detectFabricDefect, type DetectionResult } from "./services/fabricService";

type Page = "login" | "dashboard" | "live" | "upload";

export default function App() {
  const [page, setPage] = useState<Page>("login");
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  // Simple Auth Check
  useEffect(() => {
    const savedUser = localStorage.getItem("fabric_guard_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setPage("dashboard");
    }
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("fabric_guard_user", JSON.stringify(data.user));
        setPage("dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      alert("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("fabric_guard_user");
    setPage("login");
  };

  const resetDetection = () => {
    setResult(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">FABRIC GUARD AI</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:inline">
                Welcome, <span className="text-slate-100 font-medium">{user.username}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-400"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {page === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-slate-400">Sign in to start fabric inspection</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                    <input 
                      name="username"
                      type="text" 
                      required
                      placeholder="Enter your name"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                  >
                    Quick Login
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {page === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <DashboardCard 
                icon={<Camera className="w-8 h-8" />}
                title="Live Camera Detection"
                description="Real-time inspection using your device's webcam"
                onClick={() => setPage("live")}
                accent="emerald"
              />
              <DashboardCard 
                icon={<Upload className="w-8 h-8" />}
                title="Upload Image Detection"
                description="Analyze existing photos from your gallery"
                onClick={() => setPage("upload")}
                accent="blue"
              />
            </motion.div>
          )}

          {page === "live" && (
            <LiveCamera 
              onBack={() => setPage("dashboard")} 
              onDetect={async (img) => {
                setLoading(true);
                try {
                  const res = await detectFabricDefect(img, "image/jpeg");
                  setResult(res);
                } catch (e) {
                  alert("Error detecting defect");
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              result={result}
              onReset={resetDetection}
            />
          )}

          {page === "upload" && (
            <ImageUpload 
              onBack={() => setPage("dashboard")} 
              onDetect={async (img, type) => {
                setLoading(true);
                try {
                  const res = await detectFabricDefect(img, type);
                  setResult(res);
                } catch (e) {
                  alert("Error detecting defect");
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              result={result}
              onReset={resetDetection}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-slate-500 text-sm border-t border-slate-900">
        &copy; 2026 FABRIC GUARD AI • Industrial Quality Control
      </footer>
    </div>
  );
}

function DashboardCard({ icon, title, description, onClick, accent }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  onClick: () => void,
  accent: "emerald" | "blue"
}) {
  return (
    <button 
      onClick={onClick}
      className="group relative bg-slate-900 border border-slate-800 p-8 rounded-3xl text-left transition-all hover:border-slate-600 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
    >
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 transition-transform group-hover:scale-150",
        accent === "emerald" ? "bg-emerald-500" : "bg-blue-500"
      )} />
      
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors",
        accent === "emerald" ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950" : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-slate-950"
      )}>
        {icon}
      </div>
      
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
      
      <div className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
        Start Now <ChevronLeft className="w-4 h-4 rotate-180" />
      </div>
    </button>
  );
}

function LiveCamera({ onBack, onDetect, loading, result, onReset }: { 
  onBack: () => void, 
  onDetect: (img: string) => void,
  loading: boolean,
  result: DetectionResult | null,
  onReset: () => void
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (e) {
        console.error("Camera error:", e);
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);
      const data = canvas.toDataURL("image/jpeg");
      onDetect(data);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
          Live Feed
        </div>
      </div>

      <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlay */}
        <div className="absolute inset-0 border-[40px] border-slate-950/40 pointer-events-none">
          <div className="w-full h-full border-2 border-emerald-500/30 rounded-lg relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1" />
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-lg font-medium animate-pulse">Analyzing Fabric...</p>
          </div>
        )}

        {result && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
            <ResultDisplay result={result} onReset={onReset} />
          </div>
        )}
      </div>

      {!result && !loading && (
        <button 
          onClick={capture}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20"
        >
          <Scan className="w-6 h-6" /> Capture & Analyze
        </button>
      )}
    </motion.div>
  );
}

function ImageUpload({ onBack, onDetect, loading, result, onReset }: { 
  onBack: () => void, 
  onDetect: (img: string, type: string) => void,
  loading: boolean,
  result: DetectionResult | null,
  onReset: () => void
}) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onDetect(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-lg font-medium">Analyzing Image...</p>
          </div>
        )}

        {result ? (
          <ResultDisplay result={result} onReset={() => { setPreview(null); onReset(); }} />
        ) : preview ? (
          <div className="w-full h-full flex flex-col items-center gap-6">
            <img src={preview} className="max-h-[300px] rounded-2xl shadow-2xl border border-slate-700" />
            <button 
              onClick={() => { setPreview(null); onReset(); }}
              className="text-slate-400 hover:text-white underline underline-offset-4"
            >
              Choose different image
            </button>
          </div>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center gap-6 cursor-pointer group">
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all">
              <Upload className="w-10 h-10" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold mb-2">Click to Upload</p>
              <p className="text-slate-400">or drag and drop fabric image</p>
            </div>
          </label>
        )}
      </div>
    </motion.div>
  );
}

function ResultDisplay({ result, onReset }: { result: DetectionResult, onReset: () => void }) {
  const isDefect = result.label !== "No defect" && result.label !== "Not fabric";
  const isNotFabric = result.label === "Not fabric";

  return (
    <div className="flex flex-col items-center gap-6 max-w-md">
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center mb-2",
        isDefect ? "bg-red-500/20 text-red-500" : isNotFabric ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"
      )}>
        {isDefect ? <AlertCircle className="w-10 h-10" /> : isNotFabric ? <AlertCircle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
      </div>
      
      <div>
        <h3 className={cn(
          "text-4xl font-black mb-2 uppercase tracking-tighter",
          isDefect ? "text-red-500" : isNotFabric ? "text-amber-500" : "text-emerald-500"
        )}>
          {result.label}
        </h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full", isDefect ? "bg-red-500" : "bg-emerald-500")} 
              style={{ width: `${result.confidence * 100}%` }} 
            />
          </div>
          <span className="text-xs font-bold text-slate-400">{(result.confidence * 100).toFixed(0)}% Confidence</span>
        </div>
        <p className="text-slate-300 leading-relaxed italic">"{result.description}"</p>
      </div>

      <button 
        onClick={onReset}
        className="mt-4 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
      >
        Try Another
      </button>
    </div>
  );
}
