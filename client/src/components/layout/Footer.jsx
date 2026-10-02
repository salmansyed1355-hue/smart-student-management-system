import React from 'react';
import { Sparkles, Code2 } from 'lucide-react';

export default function Footer({ variant = 'light', className = '' }) {
  const isDark = variant === 'dark';

  return (
    <footer
      className={`w-full py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center transition-all ${
        isDark
          ? 'bg-transparent text-slate-400'
          : 'bg-white/90 backdrop-blur-sm border-t border-slate-200/80 text-slate-500'
      } ${className}`}
    >
      {/* Portal / System Branding */}
      <div className="text-xs font-medium tracking-wide">
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Smart Student Management System
        </span>
        <span className="mx-2 opacity-50">&bull;</span>
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          BTech Academic Portal
        </span>
      </div>

      {/* Bold & Eye-Catchy Developer Credit */}
      <div className="relative group inline-flex items-center">
        {/* Ambient Gradient Glow Background */}
        <div
          className={`absolute -inset-0.5 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
          }`}
        />

        {/* Badge Container */}
        <div
          className={`relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-sm text-xs sm:text-sm transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/90 border border-slate-700/80 text-slate-200'
              : 'bg-white border border-indigo-100 text-slate-700 shadow-indigo-100'
          }`}
        >
          <Sparkles
            className={`w-4 h-4 animate-pulse ${
              isDark ? 'text-amber-400' : 'text-amber-500'
            }`}
          />
          <span className="font-bold tracking-wide">
            Developed By -{' '}
          </span>
          <span
            className={`font-black uppercase tracking-wider ${
              isDark
                ? 'bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_1px_8px_rgba(56,189,248,0.4)]'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm'
            }`}
          >
            SYED SALMAN
          </span>
          <Code2
            className={`w-3.5 h-3.5 ${
              isDark ? 'text-indigo-400' : 'text-indigo-500'
            }`}
          />
        </div>
      </div>
    </footer>
  );
}
