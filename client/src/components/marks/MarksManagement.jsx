import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Users, 
  Percent, 
  BookOpen, 
  FileText, 
  History, 
  X, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import AddMarksModal from './AddMarksModal';
import StudentMarksHistoryModal from './StudentMarksHistoryModal';

export default function MarksManagement({ onServerStatusChange }) {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedExamType, setSelectedExamType] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Notification state
  const [successMessage, setSuccessMessage] = useState(null);

  const subjectsList = [
    'Data Structures',
    'Database Management Systems',
    'Computer Networks',
    'Operating Systems',
    'Software Engineering',
    'Web Technologies'
  ];

  const examTypes = ['Internal', 'Midterm', 'Assignment', 'Final'];

  // 1. Fetch Students
  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/students');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setStudents(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  // 2. Fetch Marks
  const fetchMarks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/marks');
      if (!res.ok) {
        throw new Error(`Failed to load marks records (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMarks(json.data);
        if (onServerStatusChange) onServerStatusChange(true);
      } else {
        throw new Error(json.message || 'Invalid format from marks API');
      }
    } catch (err) {
      setError(err.message);
      if (onServerStatusChange) onServerStatusChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchMarks();
  }, []);

  const handleMarksAdded = (newMark) => {
    setSuccessMessage(`Marks recorded successfully for ${newMark.studentId?.fullName || 'student'}!`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
    fetchMarks();
  };

  // Filtered marks records
  const filteredMarks = useMemo(() => {
    return marks.filter((mark) => {
      const studentName = mark.studentId?.fullName?.toLowerCase() || '';
      const roll = mark.studentId?.rollNumber?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();

      const matchesSearch = studentName.includes(query) || roll.includes(query);
      const matchesSubject = selectedSubject === 'ALL' || mark.subject === selectedSubject;
      const matchesExam = selectedExamType === 'ALL' || mark.examType === selectedExamType;

      return matchesSearch && matchesSubject && matchesExam;
    });
  }, [marks, searchQuery, selectedSubject, selectedExamType]);

  // Overall summary cards calculations
  const summary = useMemo(() => {
    const totalRecords = marks.length;
    const uniqueStudents = new Set(marks.map((m) => m.studentId?._id || m.studentId).filter(Boolean)).size;

    let totalObtained = 0;
    let totalMax = 0;
    marks.forEach((m) => {
      totalObtained += m.obtainedMarks || 0;
      totalMax += m.maxMarks || 0;
    });

    const averagePercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 10) / 10 : 0;

    return {
      totalRecords,
      uniqueStudents,
      averagePercentage
    };
  }, [marks]);

  const getExamBadgeColor = (type) => {
    switch (type) {
      case 'Internal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Midterm':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Assignment':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Final':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPercentageBadge = (pct) => {
    let color = 'text-rose-700 bg-rose-50 border-rose-200';
    if (pct >= 75) color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    else if (pct >= 50) color = 'text-amber-700 bg-amber-50 border-amber-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
        {pct}%
      </span>
    );
  };

  const openHistoryFor = (studentId) => {
    setSelectedStudentForHistory(studentId);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm shadow-xs animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Marks Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track, record and evaluate student examination performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Student Report Quick Select */}
          <select
            onChange={(e) => {
              if (e.target.value) openHistoryFor(e.target.value);
            }}
            value=""
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" disabled>
              View Student Report...
            </option>
            {students.map((st) => (
              <option key={st._id} value={st._id}>
                {st.rollNumber} - {st.fullName}
              </option>
            ))}
          </select>

          {/* Add Marks Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Marks</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Records</span>
            <span className="text-2xl font-bold text-slate-900">{summary.totalRecords}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Students with Marks</span>
            <span className="text-2xl font-bold text-slate-900">{summary.uniqueStudents}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Average Score</span>
            <span className="text-2xl font-bold text-slate-900">{summary.averagePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="w-full md:w-auto flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Subjects</option>
            {subjectsList.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Exam Type Filter */}
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Exams</option>
            {examTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchMarks}
            disabled={loading}
            title="Refresh marks records"
            className="p-2 text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs">Loading marks records...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filteredMarks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Award className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No marks records found.</p>
            <p className="text-xs text-slate-400">Click "Add Marks" to record marks for a student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Student</th>
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Exam Type</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4 text-center">Percentage</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredMarks.map((mark) => {
                  const student = mark.studentId;
                  const pct = mark.maxMarks > 0 ? Math.round((mark.obtainedMarks / mark.maxMarks) * 100) : 0;
                  return (
                    <tr key={mark._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Student Name & Avatar */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {student?.fullName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{student?.fullName || 'Unknown Student'}</div>
                            <div className="text-xs text-slate-400">{student?.department} Sem {student?.semester}</div>
                          </div>
                        </div>
                      </td>

                      {/* Roll Number */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          {student?.rollNumber || 'N/A'}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <span>{mark.subject}</span>
                        </div>
                      </td>

                      {/* Exam Type */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getExamBadgeColor(mark.examType)}`}>
                          {mark.examType}
                        </span>
                      </td>

                      {/* Score: Obtained / Max */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className="font-bold text-slate-900">{mark.obtainedMarks}</span>
                        <span className="text-slate-400 text-xs"> / {mark.maxMarks}</span>
                      </td>

                      {/* Percentage */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        {getPercentageBadge(pct)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        <button
                          onClick={() => student?._id && openHistoryFor(student._id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View Student Report"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Marks Modal */}
      <AddMarksModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        students={students}
        onMarksAdded={handleMarksAdded}
      />

      {/* Student Marks History Modal */}
      <StudentMarksHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedStudentForHistory(null);
        }}
        studentId={selectedStudentForHistory}
      />
    </div>
  );
}
