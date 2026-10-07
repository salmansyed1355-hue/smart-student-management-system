import React from 'react';
import { Sparkles, Code2 } from 'lucide-react';

const developers = [
  {
    name: 'SYED SALMAN',
    colorDark: 'from-cyan-300 via-sky-200 to-blue-400',
    colorLight: 'from-blue-600 via-indigo-600 to-sky-600',
    bgDark: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 shadow-cyan-500/20',
    bgLight: 'bg-blue-50/90 hover:bg-blue-100 border-blue-200/90 shadow-blue-200/40',
  },
  {
    name: 'SHAIK FARHAN',
    colorDark: 'from-emerald-300 via-teal-200 to-cyan-400',
    colorLight: 'from-emerald-600 via-teal-600 to-cyan-700',
    bgDark: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 shadow-emerald-500/20',
    bgLight: 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200/90 shadow-emerald-200/40',
  },
  {
    name: 'SYED KHAJA RAMTHULLA',
    colorDark: 'from-fuchsia-300 via-pink-200 to-purple-400',
    colorLight: 'from-purple-600 via-fuchsia-600 to-pink-600',
    bgDark: 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-500/30 shadow-fuchsia-500/20',
    bgLight: 'bg-fuchsia-50/90 hover:bg-fuchsia-100 border-fuchsia-200/90 shadow-fuchsia-200/40',
  },
  {
    name: 'T.GOPI SURAJ KUMAR',
    colorDark: 'from-amber-300 via-orange-200 to-rose-400',
    colorLight: 'from-amber-600 via-orange-600 to-rose-600',
    bgDark: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 shadow-amber-500/20',
    bgLight: 'bg-amber-50/90 hover:bg-amber-100 border-amber-200/90 shadow-amber-200/40',
  },
];

export default function Footer({ variant = 'light', className = '' }) {
  const isDark = variant === 'dark';

  return (
    <footer
      className={`w-full py-4 px-4 sm:px-6 flex flex-col xl:flex-row items-center justify-between gap-3 text-center transition-all ${
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
      <div className="relative group inline-flex items-center max-w-full">
        {/* Ambient Gradient Glow Background */}
        <div
          className={`absolute -inset-0.5 rounded-2xl sm:rounded-full blur-sm opacity-60 group-hover:opacity-100 transition duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 via-purple-500 to-pink-500'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 to-amber-500'
          }`}
        />

        {/* Badge Container */}
        <div
          className={`relative flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-2xl sm:rounded-full shadow-sm text-xs sm:text-sm transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/95 border border-slate-700/80 text-slate-200'
              : 'bg-white border border-indigo-100 text-slate-700 shadow-indigo-100/60'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 mr-1 shrink-0 font-bold tracking-wide">
            <Sparkles
              className={`w-4 h-4 animate-pulse ${
                isDark ? 'text-amber-400' : 'text-amber-500'
              }`}
            />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              Developed By :
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {developers.map((dev, idx) => (
              <React.Fragment key={dev.name}>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider text-[11px] sm:text-xs border transition-all duration-300 transform hover:scale-105 shadow-sm ${
                    isDark ? dev.bgDark : dev.bgLight
                  }`}
                >
                  <span
                    className={`bg-gradient-to-r ${
                      isDark ? dev.colorDark : dev.colorLight
                    } bg-clip-text text-transparent drop-shadow-sm`}
                  >
                    {dev.name}
                  </span>
                </span>
                {idx < developers.length - 1 && (
                  <span className={`font-bold select-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    ,
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <Code2
            className={`w-3.5 h-3.5 hidden sm:inline-block ml-1 shrink-0 ${
              isDark ? 'text-indigo-400' : 'text-indigo-500'
            }`}
          />
        </div>
      </div>
    </footer>
  );
}
