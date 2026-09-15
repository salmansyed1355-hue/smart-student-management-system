import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Clock, 
  BadgeCheck 
} from 'lucide-react';

export default function ViewStudentModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/30">
              {student.fullName?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{student.fullName}</h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {student.rollNumber}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Content */}
        <div className="mt-5 space-y-4">
          {/* Status & Department Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Academic Program
              </span>
              <span className="text-sm font-bold text-slate-800">
                {student.department} &bull; Semester {student.semester}
              </span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(student.status)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {student.status || 'Active'}
            </span>
          </div>

          {/* Key-Value Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
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

            {/* Batch Year */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Batch Year</span>
              </div>
              <div className="font-semibold text-slate-800">{student.batchYear}</div>
            </div>

            {/* Current Semester */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>Semester</span>
              </div>
              <div className="font-semibold text-slate-800">Semester {student.semester}</div>
            </div>
          </div>

          {/* Registration Date & System Info */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5 text-xs text-slate-600">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 mr-1">Registered:</span>
              <span className="font-medium text-slate-700">{formatDate(student.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
