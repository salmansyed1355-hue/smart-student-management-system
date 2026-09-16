import React, { useState } from 'react';
import { X, Award, AlertCircle, Loader2, Plus } from 'lucide-react';
import { BASE_URL } from '../../services/api';

export default function AddMarksModal({ isOpen, onClose, students, onMarksAdded }) {
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('Data Structures');
  const [examType, setExamType] = useState('Internal');
  const [maxMarks, setMaxMarks] = useState('30');
  const [obtainedMarks, setObtainedMarks] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const subjectsList = [
    'Data Structures',
    'Database Management Systems',
    'Computer Networks',
    'Operating Systems',
    'Software Engineering',
    'Web Technologies'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Frontend validation
    if (!studentId) {
      setErrorMessage('Please select a student.');
      return;
    }
    if (!subject.trim()) {
      setErrorMessage('Subject is required.');
      return;
    }

    const numMax = Number(maxMarks);
    const numObtained = Number(obtainedMarks);

    if (isNaN(numMax) || numMax <= 0) {
      setErrorMessage('Maximum marks must be greater than 0.');
      return;
    }
    if (isNaN(numObtained) || numObtained < 0) {
      setErrorMessage('Obtained marks cannot be negative.');
      return;
    }
    if (numObtained > numMax) {
      setErrorMessage('Obtained marks cannot exceed maximum marks.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        studentId,
        subject: subject.trim(),
        examType,
        maxMarks: numMax,
        obtainedMarks: numObtained
      };

      const response = await fetch(`${BASE_URL}/marks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to record marks.');
      }

      // Reset form
      setObtainedMarks('');
      onMarksAdded(result.data);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Server error while saving marks.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Record Student Marks</h2>
              <p className="text-xs text-slate-500">Add assessment or exam marks for a student.</p>
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Student Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer font-medium text-slate-800"
            >
              <option value="" disabled>
                -- Choose a student --
              </option>
              {students.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.rollNumber} - {st.fullName} ({st.department})
                </option>
              ))}
            </select>
          </div>

          {/* Subject & Exam Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                {subjectsList.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exam Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Internal">Internal (e.g. 30)</option>
                <option value="Midterm">Midterm (e.g. 50)</option>
                <option value="Assignment">Assignment (e.g. 20)</option>
                <option value="Final">Final (e.g. 100)</option>
              </select>
            </div>
          </div>

          {/* Max Marks & Obtained Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Marks <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Obtained Marks <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={obtainedMarks}
                onChange={(e) => setObtainedMarks(e.target.value)}
                placeholder="e.g. 85"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-semibold"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Marks</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
