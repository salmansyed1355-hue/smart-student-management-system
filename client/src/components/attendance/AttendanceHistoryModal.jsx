import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Percent, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { BASE_URL } from '../../services/api';

export default function AttendanceHistoryModal({ isOpen, onClose, studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentHistory(studentId);
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, studentId]);

  const fetchStudentHistory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/attendance/student/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to load attendance history (HTTP ${response.status})`);
      }
      const json = await response.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.message || 'Error fetching records.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Present
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Absent
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Late
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {data?.student ? `${data.student.fullName} - Attendance History` : 'Attendance History'}
              </h2>
              <p className="text-xs text-slate-500">
                {data?.student 
                  ? `Roll: ${data.student.rollNumber} • ${data.student.department} Sem ${data.student.semester}`
                  : 'Detailed class-by-class attendance logs.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-5 space-y-5">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs">Loading attendance history...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Classes</span>
                  <span className="text-lg font-bold text-slate-800">{data.summary.totalClasses}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-semibold text-emerald-600 block">Present</span>
                  <span className="text-lg font-bold text-emerald-700">{data.summary.present}</span>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-semibold text-rose-600 block">Absent</span>
                  <span className="text-lg font-bold text-rose-700">{data.summary.absent}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-semibold text-amber-600 block">Late</span>
                  <span className="text-lg font-bold text-amber-700">{data.summary.late}</span>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-semibold text-indigo-600 block">Rate</span>
                  <span className="text-lg font-bold text-indigo-700">{data.summary.attendancePercentage}%</span>
                </div>
              </div>

              {/* Records Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      <th className="py-2.5 px-3.5">Date</th>
                      <th className="py-2.5 px-3.5">Subject</th>
                      <th className="py-2.5 px-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-400">
                          No attendance records found for this student.
                        </td>
                      </tr>
                    ) : (
                      data.data.map((record) => (
                        <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3.5 font-medium text-slate-800">
                            {formatDate(record.date)}
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-600 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>{record.subject}</span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            {getStatusBadge(record.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
