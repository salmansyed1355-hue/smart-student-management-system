import React from 'react';
import { 
  Mail, 
  Phone, 
  SearchX, 
  Users, 
  Eye, 
  Edit2,
  Trash2,
  AlertCircle, 
  RefreshCw,
  Plus
} from 'lucide-react';

export default function StudentTable({ 
  students, 
  loading, 
  error, 
  onRetry, 
  onOpenAddModal, 
  searchQuery,
  onView,
  onEdit,
  onDelete
}) {
  // Department badge color mapper
  const getDeptBadgeStyle = (dept) => {
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

  // Helper for name initials
  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // 1. Loading State: Skeleton Loader
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-36"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between animate-pulse gap-4">
              <div className="flex items-center gap-3 w-1/4">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-24 hidden md:block"></div>
              <div className="h-4 bg-slate-100 rounded w-16 hidden lg:block"></div>
              <div className="h-6 bg-slate-100 rounded-full w-14"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-800">Failed to Load Students</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // 3. Empty State (No records at all)
  if (!students || students.length === 0) {
    if (searchQuery) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No matching students</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            No students match your query "{searchQuery}". Try checking for spelling errors or clear the search.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
          <Users className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">No Students Registered Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your database currently has no student records. Click the button below to add your first student.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Student</span>
        </button>
      </div>
    );
  }

  // 4. Normal Populated Table
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4 sm:px-6">Roll Number</th>
              <th className="py-3.5 px-4">Student Name</th>
              <th className="py-3.5 px-4 hidden md:table-cell">Contact</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">Semester</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {students.map((student) => (
              <tr 
                key={student._id || student.rollNumber} 
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* Roll Number */}
                <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                  <span className="font-mono font-semibold text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    {student.rollNumber}
                  </span>
                </td>

                {/* Name & Avatar */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {getInitials(student.fullName)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {student.fullName}
                      </div>
                      <div className="text-xs text-slate-400 md:hidden flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 inline" />
                        <span>{student.email}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact (Email + Phone) */}
                <td className="py-4 px-4 hidden md:table-cell whitespace-nowrap">
                  <div className="space-y-0.5">
                    <div className="text-xs text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.email}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.phone}</span>
                    </div>
                  </div>
                </td>

                {/* Department */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getDeptBadgeStyle(student.department)}`}>
                    {student.department}
                  </span>
                </td>

                {/* Semester */}
                <td className="py-4 px-4 hidden sm:table-cell whitespace-nowrap">
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    Sem {student.semester}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {student.status || 'Active'}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View Button */}
                    <button
                      onClick={() => onView && onView(student)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="View Student Details"
                      aria-label={`View details of ${student.fullName}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => onEdit && onEdit(student)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Student"
                      aria-label={`Edit ${student.fullName}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDelete && onDelete(student)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Student"
                      aria-label={`Delete ${student.fullName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Summary */}
      <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span>Showing {students.length} student{students.length === 1 ? '' : 's'}</span>
        <span className="text-[11px] text-slate-400">Stored in MongoDB Atlas</span>
      </div>
    </div>
  );
}
