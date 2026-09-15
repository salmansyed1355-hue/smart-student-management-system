import React, { useState } from 'react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, student, onStudentDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/students/${student._id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete student.');
      }

      onStudentDeleted(student);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Could not connect to the server to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Confirmation Card */}
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-bold text-slate-900">Delete Student Record</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently delete this student from the database? This action cannot be undone.
          </p>
        </div>

        {/* Student Target Summary Box */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">{student.fullName}</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
              {student.rollNumber}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {student.department} &bull; Semester {student.semester} &bull; {student.email}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-600/30 transition-all disabled:opacity-60 cursor-pointer"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Student</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
