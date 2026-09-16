import React, { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState({ summary: null, data: [] });
  const [marksData, setMarksData] = useState({ summary: null, data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudentData = async () => {
    try {
      setError(null);

      // Fetch student profile, attendance history, and marks history in parallel using secure /me endpoints
      const [studentRes, attendanceRes, marksRes] = await Promise.all([
        apiRequest('/students/me'),
        apiRequest('/attendance/me'),
        apiRequest('/marks/me')
      ]);

      if (studentRes.success && studentRes.data) {
        setStudent(studentRes.data);
      }
      if (attendanceRes.success) {
        setAttendanceData({
          summary: attendanceRes.summary,
          data: attendanceRes.data || []
        });
      }
      if (marksRes.success) {
        setMarksData({
          summary: marksRes.summary,
          data: marksRes.data || []
        });
      }
    } catch (err) {
      console.error('[StudentDashboard] Error fetching academic data:', err);
      setError(err.message || 'Unable to load your student academic records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudentData();
  };

  // Helper for department badge styling
  const getDeptBadge = (dept) => {
    switch (dept?.toUpperCase()) {
      case 'CSE':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'IT':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'ECE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MECH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CIVIL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Absent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Late':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPercentageColor = (pct) => {
    if (pct >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (pct >= 75) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (pct >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-72 bg-slate-100 rounded-lg"></div>
          </div>
        </div>
        <div className="h-48 bg-white rounded-2xl border border-slate-200"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Dashboard</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Student
            </span>
          </div>
          <p className="text-sm text-slate-500">
            View your academic information and performance.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 text-sm font-medium">{error}</div>
          <button
            onClick={fetchStudentData}
            className="text-xs font-semibold text-red-800 underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. My Profile Card */}
      {student ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-600/30 shrink-0">
                {student.fullName
                  ?.split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'ST'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{student.fullName}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                    Roll: {student.rollNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getDeptBadge(student.department)}`}>
                    {student.department}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                    Semester {student.semester}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                    Batch {student.batchYear}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Status: {student.status || 'Active'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 text-sm">
            <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Email</span>
                <span className="text-xs font-medium text-slate-800 truncate block">{student.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Contact</span>
                <span className="text-xs font-medium text-slate-800 truncate block">{student.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Department</span>
                <span className="text-xs font-medium text-slate-800 truncate block">{student.department} Engineering</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Academic Year</span>
                <span className="text-xs font-medium text-slate-800 truncate block">Year {Math.ceil(student.semester / 2)} (Sem {student.semester})</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-600">No student profile linked to your user account.</p>
        </div>
      )}

      {/* 2 & 3. Key Summary Cards Grid (Attendance Summary & Marks Performance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Percentage Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attendance Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {attendanceData.summary?.attendancePercentage ?? 0}%
            </span>
            <span className="text-xs text-slate-500">overall</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                (attendanceData.summary?.attendancePercentage || 0) >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, attendanceData.summary?.attendancePercentage || 0)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Minimum req: 75%</span>
            <span>
              {(attendanceData.summary?.attendancePercentage || 0) >= 75 ? 'On Track' : 'Low Attendance'}
            </span>
          </div>
        </div>

        {/* Classes Attended Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Class Attendance</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {attendanceData.summary?.present ?? 0}
            </span>
            <span className="text-xs text-slate-500">
              / {attendanceData.summary?.totalClasses ?? 0} Classes
            </span>
          </div>
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {attendanceData.summary?.present ?? 0} Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {attendanceData.summary?.absent ?? 0} Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {attendanceData.summary?.late ?? 0} Late
            </span>
          </div>
        </div>

        {/* Academic Performance / Marks Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Academic Score</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {marksData.summary?.overallPercentage ?? 0}%
            </span>
            <span className="text-xs text-slate-500">avg score</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, marksData.summary?.overallPercentage || 0)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>
              {marksData.summary?.totalObtained ?? 0} / {marksData.summary?.totalMax ?? 0} marks
            </span>
            <span>
              {(marksData.summary?.overallPercentage || 0) >= 80 ? 'Distinction' : 'Passing'}
            </span>
          </div>
        </div>

        {/* Total Exams Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exams Evaluated</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {marksData.summary?.totalExams ?? 0}
            </span>
            <span className="text-xs text-slate-500">Exams</span>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
            {marksData.data.length > 0 
              ? `Latest: ${marksData.data[0]?.subject || 'N/A'}`
              : 'No evaluation records yet'}
          </div>
        </div>
      </div>

      {/* Two Column Layout: 4. Marks History & 5. Attendance History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4. Marks History */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Academic Marks & Grades</h3>
                <p className="text-xs text-slate-400">Detailed examination performance</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {marksData.data.length} Record{marksData.data.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {marksData.data.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No marks records available yet.</p>
                <p className="text-xs text-slate-400 mt-0.5">Your exam marks will appear here once graded by faculty.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Exam Type</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marksData.data.map((item, idx) => {
                    const pct = item.maxMarks > 0 ? Math.round((item.obtainedMarks / item.maxMarks) * 100) : 0;
                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {item.subject}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                            {item.examType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          <span className="font-bold text-slate-900">{item.obtainedMarks}</span>
                          <span className="text-slate-400"> / {item.maxMarks}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs border ${getPercentageColor(pct)}`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 5. Attendance History */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attendance History</h3>
                <p className="text-xs text-slate-400">Day-to-day session attendance</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {attendanceData.data.length} Record{attendanceData.data.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {attendanceData.data.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No attendance sessions logged yet.</p>
                <p className="text-xs text-slate-400 mt-0.5">Faculty class attendance entries will appear here.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceData.data.slice(0, 15).map((item, idx) => {
                    const dateStr = item.date 
                      ? new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'N/A';
                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {dateStr}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {item.subject}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                            {item.status === 'Present' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {item.status === 'Absent' && <XCircle className="w-3 h-3 text-rose-600" />}
                            {item.status === 'Late' && <Clock className="w-3 h-3 text-amber-600" />}
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
