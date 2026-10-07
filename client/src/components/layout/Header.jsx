import React from 'react';
import { Menu, Bell, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onToggleSidebar, serverConnected, activeTab }) {
  const { user, logout } = useAuth();

  const isStudent = (user?.role || '').toLowerCase() === 'student';

  const getTabLabel = () => {
    if (isStudent) {
      return 'Student Dashboard';
    }

    switch (activeTab) {
      case 'dashboard':
        return 'Faculty Dashboard';
      case 'attendance':
        return 'Attendance Management';
      case 'marks':
        return 'Marks & Grades';
      case 'faculty-access':
        return 'Faculty Access & Security Logs';
      case 'students':
      default:
        return 'Students Directory';
    }
  };

  // Extract initials from user name (e.g. "Admin User" -> "AU")
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left side: Hamburger button + breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-slate-400">Portal</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">{getTabLabel()}</span>
        </div>
      </div>

      {/* Right side: Status indicator, Role badge & Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Backend health status badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700">
          <span className={`w-2 h-2 rounded-full ${serverConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span>{serverConnected ? 'Server Online' : 'Connecting'}</span>
        </div>

        {/* Notification Bell */}
        <button 
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile pill */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-semibold text-xs shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-semibold text-slate-800 block leading-tight">
              {user?.name || (isStudent ? 'Student' : 'Faculty')}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className={`w-3 h-3 ${isStudent ? 'text-indigo-600' : 'text-emerald-600'} inline`} />
              {isStudent ? 'Student' : 'Faculty'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
