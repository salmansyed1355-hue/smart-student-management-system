import { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle2, Server, Globe, Cpu, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    connected: false,
    message: '',
    timestamp: null
  });

  const checkBackendHealth = async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true }));
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBackendStatus({
        loading: false,
        connected: data.success || false,
        message: data.message || 'API responded successfully',
        timestamp: data.timestamp || new Date().toISOString()
      });
    } catch (err) {
      setBackendStatus({
        loading: false,
        connected: false,
        message: 'Could not connect to backend (http://localhost:5000). Make sure server is running.',
        timestamp: null
      });
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      <main className="max-w-3xl mx-auto w-full space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Smart Student Management System
          </h1>
          <p className="text-lg font-medium text-emerald-600 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Project foundation is working.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">Backend API Connectivity</h2>
            </div>
            <button
              onClick={checkBackendHealth}
              disabled={backendStatus.loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${backendStatus.loading ? 'animate-spin' : ''}`} />
              Check Again
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-medium text-slate-600">Status:</span>
              {backendStatus.loading ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Checking connection...
                </span>
              ) : backendStatus.connected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected (200 OK)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Offline / Not Running
                </span>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono text-slate-700 break-all">
              {backendStatus.message || 'Waiting for response...'}
              {backendStatus.timestamp && (
                <div className="text-[11px] text-slate-400 mt-1">
                  Response timestamp: {backendStatus.timestamp}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stack Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <Globe className="w-4 h-4" />
              Frontend (Client)
            </div>
            <p className="text-xs text-slate-500">React + Vite + Tailwind CSS + Lucide Icons</p>
            <p className="text-xs text-slate-700 font-mono bg-slate-100 p-2 rounded-lg">Port: 5173</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              Backend (Server)
            </div>
            <p className="text-xs text-slate-500">Node.js + Express.js REST API</p>
            <p className="text-xs text-slate-700 font-mono bg-slate-100 p-2 rounded-lg">Port: 5000</p>
          </div>
        </div>

        {/* Next Steps Guide */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-indigo-950 text-sm space-y-2">
          <h3 className="font-semibold text-indigo-900">Next Step: Phase 2</h3>
          <p className="text-xs text-indigo-800 leading-relaxed">
            In Phase 2, we will connect MongoDB Atlas, create our Student schema, and implement the database models.
          </p>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 mt-8">
        Smart Student Management System &bull; Phase 1 Foundation
      </footer>
    </div>
  );
}
