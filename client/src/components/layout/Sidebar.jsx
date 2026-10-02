import React from 'react';
import { 
  GraduationCap, 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  Award, 
  Settings, 
  X, 
  Server,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose, serverConnected, activeTab, onSelectTab }) {
  const { user, logout } = useAuth();

  const isStudent = (user?.role || '').toLowerCase() === 'student';

  const facultyNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, disabled: false },
    { id: 'students', label: 'Student Directory', icon: Users, disabled: false },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, disabled: false },
    { id: 'marks', label: 'Marks & Grades', icon: Award, disabled: false },
    { id: 'settings', label: 'Settings', icon: Settings, disabled: true }
  ];

  const studentNavItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, disabled: false }
  ];

  const navItems = isStudent ? studentNavItems : facultyNavItems;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">Smart SMS</span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase block">
                {isStudent ? 'Student Portal' : 'Faculty Admin'}
              </span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {isStudent ? 'Student Navigation' : 'Faculty Navigation'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.disabled && onSelectTab) {
                    onSelectTab(item.id);
                    if (onClose) onClose();
                  }
                }}
                disabled={item.disabled}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
                    : item.disabled
                    ? 'text-slate-500 opacity-60 cursor-not-allowed'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 truncate">
                <span className="text-xs font-semibold text-white block truncate leading-tight">
                  {user?.name || (isStudent ? 'Student' : 'Faculty')}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {isStudent ? 'Role: Student' : 'Role: Faculty'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* System Status Footer */}
        <div className="px-4 pb-2 bg-slate-900">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-700/30">
            <Server className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div className="text-xs truncate">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${serverConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[11px] font-medium text-slate-300 truncate">
                  {serverConnected ? 'Atlas DB Connected' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Credit in Sidebar */}
        <div className="px-4 pb-4 bg-slate-900">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/70 via-purple-950/70 to-slate-900 border border-indigo-500/30 shadow-inner text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-300">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
              <span>Developed By -</span>
            </div>
            <div className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent mt-0.5">
              SYED SALMAN
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
