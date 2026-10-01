import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Award, 
  TrendingUp, 
  Percent, 
  FileText, 
  Loader2,
  Sparkles,
  BarChart3,
  CalendarCheck
} from 'lucide-react';
import { apiRequest } from '../../services/api';

export default function ViewStudentModal({ isOpen, onClose, student }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'marks' | 'attendance'
  const [attendanceData, setAttendanceData] = useState({ summary: null, data: [] });
  const [marksData, setMarksData] = useState({ summary: null, data: [] });
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [errorProgress, setErrorProgress] = useState(null);

  // Fetch student's real-time progress (attendance and marks) whenever modal opens
  const fetchStudentProgress = async () => {
    if (!student?._id) return;
    setLoadingProgress(true);
    setErrorProgress(null);

    try {
      const [attRes, marksRes] = await Promise.all([
        apiRequest(`/attendance/student/${student._id}`),
        apiRequest(`/marks/student/${student._id}`)
      ]);

      if (attRes.success) {
        setAttendanceData({
          summary: attRes.summary || {
            totalClasses: attRes.count || attRes.data?.length || 0,
            present: attRes.data?.filter((r) => r.status === 'Present').length || 0,
            absent: attRes.data?.filter((r) => r.status === 'Absent').length || 0,
            late: attRes.data?.filter((r) => r.status === 'Late').length || 0,
            attendancePercentage: attRes.count > 0 
              ? Math.round(((attRes.data?.filter((r) => r.status === 'Present').length || 0) / attRes.count) * 100) 
              : 0
          },
          data: attRes.data || []
        });
      }

      if (marksRes.success) {
        setMarksData({
          summary: marksRes.summary || null,
          data: marksRes.data || []
        });
      }
    } catch (err) {
      console.error('[ViewStudentModal] Error fetching progress:', err);
      setErrorProgress(err.message || 'Unable to load real-time student progress.');
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    if (isOpen && student?._id) {
      setActiveTab('overview');
      fetchStudentProgress();
    } else {
      setAttendanceData({ summary: null, data: [] });
      setMarksData({ summary: null, data: [] });
    }
  }, [isOpen, student?._id]);

  if (!isOpen || !student) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Graduated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Suspended':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDeptBadgeStyle = (dept) => {
    const d = dept?.toUpperCase().replace(/\s+/g, '');
    switch (d) {
      case 'CSE':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'AI&ML':
      case 'AIML':
        return 'bg-violet-50 text-violet-700 border-violet-200';
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

  // Metrics summary
  const attSummary = attendanceData.summary || {
    totalClasses: 0,
    present: 0,
    absent: 0,
    late: 0,
    attendancePercentage: 0
  };

  const marksSummary = marksData.summary || {
    totalExams: 0,
    totalObtained: 0,
    totalMax: 0,
    overallPercentage: 0
  };

  const marksPct = marksSummary.overallPercentage || 0;
  const attPct = attSummary.attendancePercentage || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog: Full Progress Dashboard */}
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header & Student Profile Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/40 border border-indigo-400/30">
                {student.fullName?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {student.fullName}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(student.status)}`}>
                    {student.status || 'Active'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-300">
                  <span className="font-mono bg-white/10 px-2.5 py-0.5 rounded-md font-semibold text-indigo-200">
                    {student.rollNumber}
                  </span>
                  <span>&bull;</span>
                  <span className="font-semibold text-slate-200">
                    {student.department}
                  </span>
                  <span>&bull;</span>
                  <span>Semester {student.semester}</span>
                  <span>&bull;</span>
                  <span>Batch {student.batchYear}</span>
                </div>
              </div>
            </div>

            {/* Actions: Refresh & Close */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={fetchStudentProgress}
                disabled={loadingProgress}
                title="Refresh student academic progress"
                className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loadingProgress ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-2 border-t border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Progress Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('marks')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'marks'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Academic Marks ({marksData.data.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Attendance History ({attendanceData.data.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loadingProgress ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-xs font-semibold">Loading student progress and records...</span>
            </div>
          ) : errorProgress ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorProgress}</span>
            </div>
          ) : activeTab === 'overview' ? (
            /* TAB 1: OVERVIEW & PROGRESS DASHBOARD */
            <div className="space-y-6 animate-in fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* Academic Score */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  <div className="flex items-center justify-between text-indigo-600 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Academic Score</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {marksPct}%
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {marksSummary.totalObtained} / {marksSummary.totalMax} marks
                  </span>
                </div>

                {/* Attendance Rate */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  <div className="flex items-center justify-between text-emerald-600 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attendance</span>
                    <Percent className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {attPct}%
                  </div>
                  <span className={`text-[11px] font-semibold mt-0.5 block ${attPct >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {attPct >= 75 ? 'Satisfactory (>=75%)' : 'Shortage Warning (<75%)'}
                  </span>
                </div>

                {/* Classes Attended */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  <div className="flex items-center justify-between text-purple-600 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Classes</span>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {attSummary.present} <span className="text-sm font-normal text-slate-400">/ {attSummary.totalClasses}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {attSummary.absent} absent &bull; {attSummary.late} late
                  </span>
                </div>

                {/* Assessments Taken */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  <div className="flex items-center justify-between text-amber-600 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Exams Taken</span>
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {marksSummary.totalExams}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Graded assessments
                  </span>
                </div>
              </div>

              {/* Progress Visuals: Academic & Attendance Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Academic Standing */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      Academic Performance
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                      marksPct >= 85 ? 'bg-emerald-50 text-emerald-700' :
                      marksPct >= 75 ? 'bg-indigo-50 text-indigo-700' :
                      marksPct >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {marksPct >= 85 ? 'Distinction' : marksPct >= 75 ? 'First Class' : marksPct >= 60 ? 'Second Class' : 'Pass / Remedial'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Overall Score</span>
                      <span>{marksPct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          marksPct >= 75 ? 'bg-indigo-600' : marksPct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(marksPct, 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 pt-1">
                    Based on {marksSummary.totalExams} evaluated exam(s) totaling {marksSummary.totalObtained} out of {marksSummary.totalMax} marks.
                  </p>
                </div>

                {/* Attendance Standing */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      Attendance Distribution
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                      attPct >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {attPct >= 75 ? 'Eligible for Finals' : 'Action Required'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Present Ratio</span>
                      <span>{attPct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${attSummary.totalClasses > 0 ? (attSummary.present / attSummary.totalClasses) * 100 : 0}%` }}
                        title={`Present: ${attSummary.present}`}
                      />
                      <div 
                        className="h-full bg-amber-400" 
                        style={{ width: `${attSummary.totalClasses > 0 ? (attSummary.late / attSummary.totalClasses) * 100 : 0}%` }}
                        title={`Late: ${attSummary.late}`}
                      />
                      <div 
                        className="h-full bg-rose-500" 
                        style={{ width: `${attSummary.totalClasses > 0 ? (attSummary.absent / attSummary.totalClasses) * 100 : 0}%` }}
                        title={`Absent: ${attSummary.absent}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present: {attSummary.present}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Late: {attSummary.late}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent: {attSummary.absent}</span>
                  </div>
                </div>
              </div>

              {/* Student Details Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  Student Bio &amp; Enrollment Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  {/* Email */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Email Address</span>
                    </div>
                    <div className="font-semibold text-slate-800 break-all">{student.email}</div>
                  </div>

                  {/* Phone */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Phone Number</span>
                    </div>
                    <div className="font-semibold text-slate-800">{student.phone}</div>
                  </div>

                  {/* Department */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                      <span>Department</span>
                    </div>
                    <div className="font-semibold text-slate-800">{student.department}</div>
                  </div>

                  {/* Semester */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Current Semester</span>
                    </div>
                    <div className="font-semibold text-slate-800">Semester {student.semester}</div>
                  </div>

                  {/* Batch Year */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>Batch Year</span>
                    </div>
                    <div className="font-semibold text-slate-800">{student.batchYear}</div>
                  </div>

                  {/* Registered On */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Enrollment Date</span>
                    </div>
                    <div className="font-semibold text-slate-800">{formatDate(student.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'marks' ? (
            /* TAB 2: MARKS & EXAMS BREAKDOWN */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Academic Assessments &amp; Scores</h3>
                  <p className="text-xs text-slate-500">Graded exams, tests, and quizzes recorded for this student.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Overall Score</span>
                  <span className="text-lg font-black text-indigo-600">{marksPct}%</span>
                </div>
              </div>

              {marksData.data.length === 0 ? (
                <div className="py-14 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <Award className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No marks recorded yet</p>
                  <p className="text-xs">Faculty has not uploaded any test marks for this student yet.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Exam Name</th>
                        <th className="py-3 px-4 text-center">Marks</th>
                        <th className="py-3 px-4 text-center">Percentage</th>
                        <th className="py-3 px-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {marksData.data.map((m) => {
                        const pct = m.maxMarks > 0 ? Math.round((m.obtainedMarks / m.maxMarks) * 100) : 0;
                        return (
                          <tr key={m._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-800">{m.subject}</td>
                            <td className="py-3 px-4 text-slate-600">{m.examName}</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-900">
                              {m.obtainedMarks} <span className="font-normal text-slate-400">/ {m.maxMarks}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                pct >= 75 ? 'bg-emerald-50 text-emerald-700' :
                                pct >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {pct}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-slate-500">{formatDate(m.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: ATTENDANCE HISTORY */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Attendance Log</h3>
                  <p className="text-xs text-slate-500">History of lecture attendances recorded for this student.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Present: {attSummary.present}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Absent: {attSummary.absent}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Late: {attSummary.late}
                  </span>
                </div>
              </div>

              {attendanceData.data.length === 0 ? (
                <div className="py-14 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No attendance records found</p>
                  <p className="text-xs">No lecture attendances have been logged for this student yet.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Recorded</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceData.data.map((r) => {
                        return (
                          <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-800">{formatDate(r.date)}</td>
                            <td className="py-3 px-4 text-slate-600">{r.subject}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                r.status === 'Present'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : r.status === 'Absent'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {r.status === 'Present' ? <CheckCircle2 className="w-3 h-3" /> :
                                 r.status === 'Absent' ? <XCircle className="w-3 h-3" /> :
                                 <Clock className="w-3 h-3" />}
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-slate-400">{formatDate(r.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div>
            Viewing student profile: <strong className="text-slate-700">{student.rollNumber}</strong> ({student.fullName})
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
