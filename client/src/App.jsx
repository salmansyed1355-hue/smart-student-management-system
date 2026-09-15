import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import StudentDirectory from './components/students/StudentDirectory';
import AttendanceManagement from './components/attendance/AttendanceManagement';
import MarksManagement from './components/marks/MarksManagement';
import { Loader2 } from 'lucide-react';

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serverConnected, setServerConnected] = useState(true);

  // Initial authentication verification loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-medium text-slate-300">Loading Smart Student Management System...</p>
      </div>
    );
  }

  // Unauthenticated: Protected routing displays only Login or Signup
  if (!isAuthenticated) {
    if (authMode === 'signup') {
      return <Signup onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <Login onSwitchToSignup={() => setAuthMode('signup')} />;
  }

  // Authenticated: Access granted to Dashboard and Management modules
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        serverConnected={serverConnected}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          serverConnected={serverConnected}
          activeTab={activeTab}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' ? (
            <Dashboard onServerStatusChange={setServerConnected} />
          ) : activeTab === 'attendance' ? (
            <AttendanceManagement onServerStatusChange={setServerConnected} />
          ) : activeTab === 'marks' ? (
            <MarksManagement onServerStatusChange={setServerConnected} />
          ) : (
            <StudentDirectory onServerStatusChange={setServerConnected} />
          )}
        </main>

        {/* Dashboard Footer */}
        <footer className="border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 bg-white">
          Smart Student Management System &bull; BTech Academic Portal &bull; Powered by React & MongoDB Atlas
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
