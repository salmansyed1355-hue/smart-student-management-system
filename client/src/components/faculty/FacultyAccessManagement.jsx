import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Search,
  Mail,
  User,
  ShieldAlert,
  Sparkles,
  KeyRound
} from 'lucide-react';
import {
  getFacultyWhitelist,
  addFacultyEmail,
  revokeFacultyEmail
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function FacultyAccessManagement({ onServerStatusChange }) {
  const { user } = useAuth();
  
  // Whitelist State
  const [whitelist, setWhitelist] = useState([]);
  const [loadingWhitelist, setLoadingWhitelist] = useState(true);
  const [whitelistSearch, setWhitelistSearch] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whitelistSuccess, setWhitelistSuccess] = useState('');
  const [whitelistError, setWhitelistError] = useState('');

  // Revoke state
  const [deletingEmail, setDeletingEmail] = useState(null);

  // Fetch Whitelist Data
  const loadWhitelist = async () => {
    try {
      setLoadingWhitelist(true);
      const res = await getFacultyWhitelist();
      if (res.success && res.data) {
        setWhitelist(res.data);
      }
      if (onServerStatusChange) onServerStatusChange(true);
    } catch (err) {
      console.error('Failed to load faculty whitelist:', err);
      setWhitelistError('Unable to load authorized faculty list. Please verify server connection.');
      if (onServerStatusChange) onServerStatusChange(false);
    } finally {
      setLoadingWhitelist(false);
    }
  };

  useEffect(() => {
    loadWhitelist();
  }, []);

  // Handle Authorizing a New Faculty Email
  const handleAddEmail = async (e) => {
    e.preventDefault();
    setWhitelistError('');
    setWhitelistSuccess('');

    if (!newEmail.trim()) {
      setWhitelistError('Please enter a valid faculty email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await addFacultyEmail(newEmail.trim().toLowerCase(), newName.trim());
      if (res.success) {
        setWhitelistSuccess(`Successfully authorized ${newEmail.trim().toLowerCase()} for faculty access.`);
        setNewEmail('');
        setNewName('');
        await loadWhitelist();
      }
    } catch (err) {
      setWhitelistError(err.message || 'Failed to authorize faculty email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Revoking a Faculty Email
  const handleRevoke = async (emailToRevoke) => {
    if (emailToRevoke.toLowerCase() === 'salmansyed@gmail.com') {
      alert('Cannot revoke access for primary super-admin (salmansyed@gmail.com).');
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke faculty portal access for ${emailToRevoke}?`)) {
      return;
    }

    try {
      setDeletingEmail(emailToRevoke);
      setWhitelistError('');
      setWhitelistSuccess('');
      const res = await revokeFacultyEmail(emailToRevoke);
      if (res.success) {
        setWhitelistSuccess(`Access revoked for ${emailToRevoke}.`);
        await loadWhitelist();
      }
    } catch (err) {
      setWhitelistError(err.message || 'Failed to revoke faculty authorization.');
    } finally {
      setDeletingEmail(null);
    }
  };

  // Filter Whitelist items
  const filteredWhitelist = whitelist.filter((item) => {
    if (!item) return false;
    const q = (whitelistSearch || '').toLowerCase().trim();
    if (!q) return true;
    const emailMatch = (item.email || '').toLowerCase().includes(q);
    const nameMatch = (item.name || '').toLowerCase().includes(q);
    return emailMatch || nameMatch;
  });

  const registeredCount = whitelist.filter((item) => item.isRegistered).length;
  const pendingCount = Math.max(0, whitelist.length - registeredCount);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict Faculty Whitelist Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Faculty Access Management</span>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Restrict faculty portal sign-in and registration exclusively to authorized email addresses. Only approved faculty accounts can manage student records, marks, and attendance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadWhitelist}
              disabled={loadingWhitelist}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingWhitelist ? 'animate-spin' : ''}`} />
              <span>Refresh Whitelist</span>
            </button>
          </div>
        </div>

        {/* Quick Security Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Primary Superadmin
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-300 truncate block mt-0.5" title="salmansyed@gmail.com">
              salmansyed@gmail.com
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Authorized Faculty
            </span>
            <span className="text-lg sm:text-xl font-black text-indigo-400 block mt-0.5">
              {whitelist.length}
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Active Accounts
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 block mt-0.5">
              {registeredCount}
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Pending Signup
            </span>
            <span className="text-lg sm:text-xl font-black text-sky-400 block mt-0.5">
              {pendingCount}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {whitelistSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{whitelistSuccess}</span>
          </div>
          <button onClick={() => setWhitelistSuccess('')} className="text-emerald-700 hover:text-emerald-900 font-bold ml-4">
            &times;
          </button>
        </div>
      )}

      {whitelistError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{whitelistError}</span>
          </div>
          <button onClick={() => setWhitelistError('')} className="text-rose-700 hover:text-rose-900 font-bold ml-4">
            &times;
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Faculty Form Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Authorize Faculty</h2>
                <p className="text-xs text-slate-500">Permit an email to sign up or log in as faculty</p>
              </div>
            </div>

            <form onSubmit={handleAddEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. colleague@university.edu"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Name / Department (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar (CSE)"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 leading-relaxed">
                <span className="font-bold block mb-0.5">🔒 Security Rule</span>
                Once authorized, this user can register or sign in with role <span className="font-semibold">Faculty</span> to manage student data, marks, and attendance.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Faculty Email</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Whitelisted Emails Table Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Approved Faculty Roster</h3>
                <p className="text-xs text-slate-500">Only these emails can authenticate as faculty</p>
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={whitelistSearch}
                  onChange={(e) => setWhitelistSearch(e.target.value)}
                  placeholder="Search faculty emails..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {loadingWhitelist ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                <p className="text-sm">Loading authorized faculty list...</p>
              </div>
            ) : filteredWhitelist.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No matching faculty emails found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                {filteredWhitelist.map((item) => {
                  const isRoot = item.isPrimaryAdmin || item.email.toLowerCase() === 'salmansyed@gmail.com';

                  return (
                    <div
                      key={item._id || item.email}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isRoot ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isRoot
                              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/40'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {isRoot ? <Lock className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">{item.email}</span>
                            {isRoot && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                ★ Primary Root Admin
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                item.isRegistered
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {item.isRegistered ? 'Account Active' : 'Pending Signup'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                            {item.name && <span className="font-medium text-slate-700">{item.name}</span>}
                            <span>Added by: <span className="text-slate-700 font-medium">{item.addedBy}</span></span>
                            <span>•</span>
                            <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Column */}
                      <div className="flex items-center justify-end">
                        {isRoot ? (
                          <span className="text-xs font-semibold text-slate-400 italic px-3 py-1 bg-slate-100 rounded-lg">
                            Protected Root
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRevoke(item.email)}
                            disabled={deletingEmail === item.email}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer disabled:opacity-50"
                            title="Revoke faculty access"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{deletingEmail === item.email ? 'Revoking...' : 'Revoke'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
