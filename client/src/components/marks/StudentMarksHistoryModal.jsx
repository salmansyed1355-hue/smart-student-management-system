import React, { useState, useEffect } from 'react';
import { 
  X, 
  Award, 
  BookOpen, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { BASE_URL } from '../../services/api';

export default function StudentMarksHistoryModal({ isOpen, onClose, studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMarksHistory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/marks/student/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to load marks history (HTTP ${response.status})`);
      }
      const json = await response.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.message || 'Error fetching marks records.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && studentId) {
      fetchMarksHistory(studentId);
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

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

  const getPercentageColor = (pct) => {
    if (pct >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (pct >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {data?.student ? `${data.student.fullName} - Marks Report` : 'Student Marks Report'}
              </h2>
              <p className="text-xs text-slate-500">
                {data?.student 
                  ? `Roll: ${data.student.rollNumber} • ${data.student.department} Sem ${data.student.semester}`
                  : 'Subject and assessment-wise scores.'}
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
              <span className="text-xs">Loading student marks...</span>
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
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Assessments</span>
                  <span className="text-lg font-bold text-slate-800">{data.summary.totalExams}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Marks</span>
                  <span className="text-lg font-bold text-slate-800">{data.summary.totalObtained}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Max Marks</span>
                  <span className="text-lg font-bold text-slate-800">{data.summary.totalMax}</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-semibold text-indigo-600 block">Percentage</span>
                  <span className="text-lg font-bold text-indigo-700">{data.summary.overallPercentage}%</span>
                </div>
              </div>

              {/* Records Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      <th className="py-2.5 px-3.5">Subject</th>
                      <th className="py-2.5 px-3.5">Exam Type</th>
                      <th className="py-2.5 px-3.5">Obtained</th>
                      <th className="py-2.5 px-3.5">Max</th>
                      <th className="py-2.5 px-3.5 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No marks records found for this student.
                        </td>
                      </tr>
                    ) : (
                      data.data.map((record) => {
                        const pct = record.maxMarks > 0 ? Math.round((record.obtainedMarks / record.maxMarks) * 100) : 0;
                        return (
                          <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3.5 font-medium text-slate-800">
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                <span>{record.subject}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getExamBadgeColor(record.examType)}`}>
                                {record.examType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 font-semibold text-slate-800">
                              {record.obtainedMarks}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-500">
                              {record.maxMarks}
                            </td>
                            <td className="py-2.5 px-3.5 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${getPercentageColor(pct)}`}>
                                {pct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
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
