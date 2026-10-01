import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Percent, 
  History, 
  Save, 
  CheckCheck, 
  RotateCcw,
  Search, 
  Filter, 
  AlertTriangle, 
  AlertCircle, 
  Loader2, 
  X,
  Sparkles,
  Check
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import AttendanceHistoryModal from './AttendanceHistoryModal';

export default function AttendanceManagement({ onServerStatusChange }) {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState(null);

  // Form input state: Date and Subject at the top
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('Data Structures');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active status filter: 'ALL' | 'EXCEPTIONS' | 'ABSENT' | 'LATE' | 'PRESENT'
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Attendance status mapping: { [studentId]: 'Present' | 'Absent' | 'Late' }
  const [attendanceMap, setAttendanceMap] = useState({});
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Confirmation dialog and submission state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formError, setFormError] = useState(null);

  // History Modal state
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const subjectsList = [
    'Data Structures',
    'Computer Networks',
    'Operating Systems',
    'Database Management',
    'Software Engineering',
    'Web Technologies'
  ];

  // Helper to load existing attendance for selected date & subject
  const loadExistingAttendance = async (studentList, selectedDate, selectedSubject) => {
    if (!selectedDate || !selectedSubject || !studentList || studentList.length === 0) return;
    setCheckingExisting(true);
    try {
      const query = new URLSearchParams({
        date: selectedDate,
        subject: selectedSubject.trim()
      }).toString();

      const json = await apiRequest(`/attendance?${query}`);
      
      // Default every student to 'Present' first
      const map = {};
      studentList.forEach((st) => {
        map[st._id] = 'Present';
      });

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        let matchedCount = 0;
        json.data.forEach((rec) => {
          const sId = rec.studentId?._id || rec.studentId;
          if (sId && map[sId] !== undefined) {
            map[sId] = rec.status;
            matchedCount++;
          }
        });

        setAttendanceMap(map);
        setIsExistingRecord(matchedCount > 0);
      } else {
        setAttendanceMap(map);
        setIsExistingRecord(false);
      }
    } catch (err) {
      console.warn('Could not check existing attendance:', err.message);
      // Fallback: make sure all students are defaulted to 'Present'
      setAttendanceMap((prev) => {
        const fallback = {};
        studentList.forEach((st) => {
          fallback[st._id] = prev[st._id] || 'Present';
        });
        return fallback;
      });
      setIsExistingRecord(false);
    } finally {
      setCheckingExisting(false);
    }
  };

  // Fetch all students from Express API using authenticated apiRequest
  const fetchStudents = async () => {
    setLoadingStudents(true);
    setError(null);
    try {
      const json = await apiRequest('/students');
      if (json.success && Array.isArray(json.data)) {
        setStudents(json.data);
        
        // Requirement 1 & 2: Automatically set EVERY student to "Present"
        const initialMap = {};
        json.data.forEach((st) => {
          initialMap[st._id] = 'Present';
        });
        setAttendanceMap(initialMap);

        if (onServerStatusChange) onServerStatusChange(true);

        // Check if there is already saved attendance for the default date & subject
        await loadExistingAttendance(json.data, date, subject);
      } else {
        throw new Error(json.message || 'Invalid response from student API');
      }
    } catch (err) {
      setError(err.message);
      if (onServerStatusChange) onServerStatusChange(false);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // When date or subject changes, re-sync with any existing records or keep everyone Present
  const handleDateOrSubjectChange = (newDate, newSubject) => {
    setDate(newDate);
    setSubject(newSubject);
    if (students.length > 0) {
      loadExistingAttendance(students, newDate, newSubject);
    }
  };

  // Update status for a specific student (Absent, Late, or Present)
  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => {
      // If clicking the current non-present status again, toggle back to Present for convenience
      const current = prev[studentId] || 'Present';
      const nextStatus = current === status && status !== 'Present' ? 'Present' : status;
      return {
        ...prev,
        [studentId]: nextStatus
      };
    });
  };

  // Helper action: "Reset All to Present"
  const handleResetAllToPresent = () => {
    const updated = {};
    students.forEach((st) => {
      updated[st._id] = 'Present';
    });
    setAttendanceMap(updated);
  };

  // Extract unique departments for filtering
  const departments = useMemo(() => {
    const set = new Set();
    students.forEach((st) => {
      if (st.department) set.add(st.department);
    });
    return Array.from(set).sort();
  }, [students]);

  // Attendance summary calculations from active attendance map
  const summary = useMemo(() => {
    const total = students.length;
    let present = 0;
    let absent = 0;
    let late = 0;

    students.forEach((st) => {
      const status = attendanceMap[st._id] || 'Present';
      if (status === 'Present') present += 1;
      else if (status === 'Absent') absent += 1;
      else if (status === 'Late') late += 1;
    });

    const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;
    const exceptions = absent + late;

    return {
      total,
      present,
      absent,
      late,
      exceptions,
      attendancePercentage
    };
  }, [students, attendanceMap]);

  // Filtered students according to search query, active filter button, and department
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const status = attendanceMap[st._id] || 'Present';

      // Status filter
      if (activeFilter === 'EXCEPTIONS') {
        if (status !== 'Absent' && status !== 'Late') return false;
      } else if (activeFilter === 'ABSENT') {
        if (status !== 'Absent') return false;
      } else if (activeFilter === 'LATE') {
        if (status !== 'Late') return false;
      } else if (activeFilter === 'PRESENT') {
        if (status !== 'Present') return false;
      }

      // Department filter
      if (selectedDept !== 'ALL' && st.department !== selectedDept) {
        return false;
      }

      // Search by student name or roll number
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (st.fullName || '').toLowerCase().includes(q);
        const matchesRoll = (st.rollNumber || '').toLowerCase().includes(q);
        const matchesDept = (st.department || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesDept) return false;
      }

      return true;
    });
  }, [students, attendanceMap, activeFilter, selectedDept, searchQuery]);

  // List of students marked as Absent or Late for the confirmation dialog
  const exceptionStudents = useMemo(() => {
    return students.filter((st) => {
      const status = attendanceMap[st._id] || 'Present';
      return status === 'Absent' || status === 'Late';
    });
  }, [students, attendanceMap]);

  // Pre-submission validation: Trigger confirmation modal
  const handleInitiateSubmit = (e) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (!date) {
      setFormError('Please select a valid class date.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Please specify a subject name.');
      return;
    }
    if (students.length === 0) {
      setFormError('No students available to mark attendance.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Submit attendance to POST /api/attendance using authenticated apiRequest()
  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    setFormError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const records = students.map((st) => ({
        studentId: st._id,
        status: attendanceMap[st._id] || 'Present'
      }));

      const payload = {
        date,
        subject: subject.trim(),
        records
      };

      const result = await apiRequest('/attendance', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setIsExistingRecord(true);
      setSuccessMessage(
        `Attendance successfully saved for ${result.count || students.length} students in ${subject.trim()} on ${date}!`
      );

      // Auto-clear success message after 6 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 6000);
    } catch (err) {
      setFormError(err.message || 'Could not save attendance to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  const openHistoryFor = (studentId) => {
    setSelectedStudentForHistory(studentId);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Success Message Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-900 text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block">{successMessage}</span>
              <span className="text-xs text-emerald-700">
                Idempotent save: You can adjust attendance and re-save anytime to correct records without duplicates.
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Error Message Alert */}
      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between text-rose-900 text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-rose-100 rounded-xl text-rose-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="font-semibold">{formError}</span>
          </div>
          <button 
            type="button"
            onClick={() => setFormError(null)}
            className="text-rose-700 hover:text-rose-950 p-1.5 rounded-lg hover:bg-rose-100/60 transition-colors cursor-pointer"
            aria-label="Close error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Card: Date, Subject, Fast Actions, and Attendance Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Attendance Management
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Fast Mode: Present by Default
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              All students are marked Present automatically. Only mark exceptions (Absent or Late).
            </p>
          </div>

          {/* Quick History Selector */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <select
              onChange={(e) => {
                if (e.target.value) openHistoryFor(e.target.value);
              }}
              value=""
              className="px-3.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
            >
              <option value="" disabled>
                Check Student History...
              </option>
              {students.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.rollNumber} - {st.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date, Subject, and Session Status Controls at the Top */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Class Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Class Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateOrSubjectChange(e.target.value, subject)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
            />
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => handleDateOrSubjectChange(date, e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 cursor-pointer"
            >
              {subjectsList.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Action Button at Top */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInitiateSubmit}
              disabled={submitting || loadingStudents}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Existing Session Indicator */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            {checkingExisting ? (
              <span className="flex items-center gap-1 text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                Checking existing records...
              </span>
            ) : isExistingRecord ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Existing attendance found for this date &amp; subject. Updating will correct records without duplicates.
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                New attendance session. Every student defaulted to Present.
              </span>
            )}
          </div>
          <span className="text-slate-400">
            Total Class Strength: <strong className="text-slate-700">{summary.total}</strong>
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Total Students */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Students</span>
            <span className="text-2xl font-black text-slate-800">{summary.total}</span>
          </div>
        </div>

        {/* Present */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Present</span>
            <span className="text-2xl font-black text-emerald-700">{summary.present}</span>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">Absent</span>
            <span className="text-2xl font-black text-rose-700">{summary.absent}</span>
          </div>
        </div>

        {/* Late */}
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">Late</span>
            <span className="text-2xl font-black text-amber-700">{summary.late}</span>
          </div>
        </div>

        {/* Attendance % */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-indigo-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">Attendance %</span>
            <span className="text-2xl font-black text-indigo-700">{summary.attendancePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Fast Faculty Controls: Search, Filters, Absent/Late View, and Reset */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search by Name or Roll Number */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 placeholder:text-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons: Reset All to Present & Secondary Save */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={handleResetAllToPresent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Reset all students to Present"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset All to Present</span>
            </button>

            <button
              type="button"
              onClick={handleInitiateSubmit}
              disabled={submitting || loadingStudents}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Filter Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {/* Prominent "Absent / Late Only" Exception View */}
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'EXCEPTIONS' ? 'ALL' : 'EXCEPTIONS')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'EXCEPTIONS'
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/50'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
            title="Show only students marked Absent or Late to quickly review exceptions"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${activeFilter === 'EXCEPTIONS' ? 'text-white' : 'text-rose-600'}`} />
            <span>Absent / Late Only</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeFilter === 'EXCEPTIONS' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-800'
            }`}>
              {summary.exceptions}
            </span>
          </button>

          <span className="text-slate-300">|</span>

          {/* All */}
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            All ({summary.total})
          </button>

          {/* Present */}
          <button
            type="button"
            onClick={() => setActiveFilter('PRESENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'PRESENT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            Present ({summary.present})
          </button>

          {/* Absent */}
          <button
            type="button"
            onClick={() => setActiveFilter('ABSENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'ABSENT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            Absent ({summary.absent})
          </button>

          {/* Late */}
          <button
            type="button"
            onClick={() => setActiveFilter('LATE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'LATE'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
            }`}
          >
            Late ({summary.late})
          </button>
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loadingStudents ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="text-xs font-medium">Loading students for attendance sheet...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchStudents}
              className="px-4 py-1.5 text-xs bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm">No students found. Please register students in the Student Directory first.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <div className="p-3 bg-slate-50 rounded-2xl w-fit mx-auto border border-slate-200 text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">No students match current filter</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeFilter === 'EXCEPTIONS'
                  ? 'All students are marked Present! No absent or late students to show.'
                  : 'Try clearing your search query or selecting a different status filter.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('ALL');
                setSearchQuery('');
                setSelectedDept('ALL');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Show All Students
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Roll Number</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Department</th>
                  <th className="py-3.5 px-4 text-center">Current Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.map((student) => {
                  const currentStatus = attendanceMap[student._id] || 'Present';
                  const isAbsent = currentStatus === 'Absent';
                  const isLate = currentStatus === 'Late';

                  return (
                    <tr 
                      key={student._id} 
                      className={`transition-colors ${
                        isAbsent 
                          ? 'bg-rose-50/50 hover:bg-rose-50 border-l-4 border-l-rose-500' 
                          : isLate 
                          ? 'bg-amber-50/50 hover:bg-amber-50 border-l-4 border-l-amber-500' 
                          : 'hover:bg-slate-50/60 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Roll Number */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          {student.rollNumber}
                        </span>
                      </td>

                      {/* Student Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                            isAbsent
                              ? 'bg-rose-100 text-rose-700'
                              : isLate
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {(student.fullName || 'S').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{student.fullName}</div>
                            <div className="text-xs text-slate-400 sm:hidden">{student.department}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 hidden sm:table-cell whitespace-nowrap">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {student.department}
                        </span>
                      </td>

                      {/* Status Selection Buttons */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 gap-1 shadow-2xs">
                          {/* Present Button: Default Visually */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student._id, 'Present')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title="Mark Present"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student._id, 'Absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                            }`}
                            title="Mark Absent"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>

                          {/* Late Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student._id, 'Late')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                            title="Mark Late"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Late</span>
                          </button>
                        </div>
                      </td>

                      {/* History Trigger */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => openHistoryFor(student._id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View Attendance History"
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

      {/* Confirmation Dialog Before Final Submission */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => !submitting && setIsConfirmModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 z-10 space-y-5 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${
                  summary.exceptions > 0 ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  <Save className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Confirm Attendance Submission
                  </h3>
                  <p className="text-xs text-slate-500">
                    {subject} &bull; {date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt Description Requirement */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <p className="text-sm font-semibold text-slate-800">
                You are marking <span className="text-rose-600 font-bold">{summary.absent} student{summary.absent !== 1 ? 's' : ''} absent</span> and{' '}
                <span className="text-amber-600 font-bold">{summary.late} student{summary.late !== 1 ? 's' : ''} late</span>. Continue?
              </p>
              <p className="text-xs text-slate-500">
                The remaining <strong className="text-emerald-700 font-semibold">{summary.present} student{summary.present !== 1 ? 's' : ''}</strong> will be recorded as Present.
              </p>
            </div>

            {/* Attendance Breakdown Pills */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-600">Present</span>
                <span className="text-lg font-black">{summary.present}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-600">Absent</span>
                <span className="text-lg font-black">{summary.absent}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-600">Late</span>
                <span className="text-lg font-black">{summary.late}</span>
              </div>
            </div>

            {/* Exception List Preview if any students are Absent or Late */}
            {exceptionStudents.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Exceptions Preview ({exceptionStudents.length})
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  {exceptionStudents.map((st) => {
                    const stStatus = attendanceMap[st._id];
                    return (
                      <div key={st._id} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-slate-100">
                        <span className="font-semibold text-slate-800 truncate mr-2">
                          <span className="font-mono text-slate-500 mr-1.5">{st.rollNumber}</span>
                          {st.fullName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                          stStatus === 'Absent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {stStatus}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Review / Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    <span>Confirm &amp; Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Attendance History Modal */}
      <AttendanceHistoryModal
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
