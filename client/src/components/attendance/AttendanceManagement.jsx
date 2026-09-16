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
  Loader2, 
  AlertCircle, 
  X 
} from 'lucide-react';
import AttendanceHistoryModal from './AttendanceHistoryModal';
import { BASE_URL } from '../../services/api';

export default function AttendanceManagement({ onServerStatusChange }) {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState(null);

  // Class Sheet state
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('Data Structures');
  // Map of studentId -> 'Present' | 'Absent' | 'Late'
  const [attendanceMap, setAttendanceMap] = useState({});

  // Submission & Notification state
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formError, setFormError] = useState(null);

  // History Modal state
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const subjectsList = [
    'Data Structures',
    'Database Management Systems',
    'Computer Networks',
    'Operating Systems',
    'Software Engineering',
    'Web Technologies'
  ];

  // Fetch all students from Express API
  const fetchStudents = async () => {
    setLoadingStudents(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/students`);
      if (!response.ok) {
        throw new Error(`Failed to load students (HTTP ${response.status})`);
      }
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        setStudents(json.data);
        // Default everyone to 'Present' initially for teacher convenience
        const initialMap = {};
        json.data.forEach((st) => {
          initialMap[st._id] = 'Present';
        });
        setAttendanceMap(initialMap);
        if (onServerStatusChange) onServerStatusChange(true);
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

  // Update status for a specific student
  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Helper action: "Mark All Present"
  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((st) => {
      updated[st._id] = 'Present';
    });
    setAttendanceMap(updated);
  };

  // Attendance summary calculations from the active attendance map
  const summary = useMemo(() => {
    const total = students.length;
    let present = 0;
    let absent = 0;
    let late = 0;

    Object.values(attendanceMap).forEach((st) => {
      if (st === 'Present') present += 1;
      else if (st === 'Absent') absent += 1;
      else if (st === 'Late') late += 1;
    });

    const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      late,
      attendancePercentage
    };
  }, [students, attendanceMap]);

  // Submit attendance to POST /api/attendance
  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!date) {
      setFormError('Please select a date.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Please specify a subject.');
      return;
    }
    if (students.length === 0) {
      setFormError('No students available to mark attendance.');
      return;
    }

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

      const response = await fetch(`${BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to record attendance.');
      }

      setSuccessMessage(`Attendance successfully recorded for ${result.count} students in ${subject}!`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
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

      {/* Error Alert Banner */}
      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-sm shadow-xs animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{formError}</span>
          </div>
          <button 
            onClick={() => setFormError(null)}
            className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Attendance Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage student attendance.
          </p>
        </div>

        {/* Quick Student History Selector */}
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) openHistoryFor(e.target.value);
            }}
            value=""
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Total</span>
            <span className="text-xl font-bold text-slate-800">{summary.total}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 block">Present</span>
            <span className="text-xl font-bold text-emerald-700">{summary.present}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 block">Absent</span>
            <span className="text-xl font-bold text-rose-700">{summary.absent}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 block">Late</span>
            <span className="text-xl font-bold text-amber-700">{summary.late}</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-indigo-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 block">Rate</span>
            <span className="text-xl font-bold text-indigo-700">{summary.attendancePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Teacher Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Class Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 cursor-pointer"
            >
              {subjectsList.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-2 md:pt-0">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
            title="Set status of all students to Present"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitAttendance}
            disabled={submitting || loadingStudents}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Mark Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loadingStudents ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs">Loading students for attendance sheet...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            No students found. Please register students in the Student Directory first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Roll Number</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Department</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((student) => {
                  const currentStatus = attendanceMap[student._id] || 'Present';
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Roll Number */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <span className="font-mono font-semibold text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          {student.rollNumber}
                        </span>
                      </td>

                      {/* Student Name */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{student.fullName}</div>
                        <div className="text-xs text-slate-400 sm:hidden">{student.department}</div>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-4 hidden sm:table-cell whitespace-nowrap">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {student.department}
                        </span>
                      </td>

                      {/* Status Selection Buttons */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student._id, 'Present')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            Present
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student._id, 'Absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            Absent
                          </button>

                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student._id, 'Late')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>

                      {/* History Trigger */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
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
