import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  GraduationCap, 
  Layers,
  X
} from 'lucide-react';
import StudentTable from './StudentTable';
import AddStudentModal from './AddStudentModal';
import ViewStudentModal from './ViewStudentModal';
import EditStudentModal from './EditStudentModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { BASE_URL } from '../../services/api';

export default function StudentDirectory({ onServerStatusChange }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);

  // Success toast notification
  const [successToast, setSuccessToast] = useState(null);

  const showToast = (message) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Fetch all students from Express API
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/students`);
      if (!response.ok) {
        throw new Error(`Server responded with HTTP ${response.status}`);
      }
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        setStudents(json.data);
        if (onServerStatusChange) onServerStatusChange(true);
      } else {
        throw new Error(json.message || 'Invalid data format from API');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Unable to connect to backend.');
      if (onServerStatusChange) onServerStatusChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 1. Handle student added
  const handleStudentAdded = (newStudent) => {
    showToast(`Student "${newStudent.fullName}" (${newStudent.rollNumber}) added successfully!`);
    fetchStudents();
  };

  // 2. Handle student updated
  const handleStudentUpdated = (updatedStudent) => {
    showToast(`Student "${updatedStudent.fullName}" (${updatedStudent.rollNumber}) updated successfully!`);
    // Optimistically update local state & refresh from database
    setStudents((prev) =>
      prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
    );
    fetchStudents();
  };

  // 3. Handle student deleted
  const handleStudentDeleted = (deletedStudent) => {
    showToast(`Student "${deletedStudent.fullName}" (${deletedStudent.rollNumber}) deleted successfully!`);
    // Optimistically remove from state & refresh
    setStudents((prev) => prev.filter((s) => s._id !== deletedStudent._id));
    fetchStudents();
  };

  // Filter students based on search query and department dropdown
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = 
        student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = 
        selectedDept === 'ALL' || 
        student.department?.toUpperCase() === selectedDept.toUpperCase();

      return matchesSearch && matchesDept;
    });
  }, [students, searchQuery, selectedDept]);

  // Department counts for stats
  const deptCount = useMemo(() => {
    const depts = new Set(students.map((s) => s.department).filter(Boolean));
    return depts.size;
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm shadow-xs animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button 
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section: Title, Subtitle, Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Student Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and view all registered students.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Students</span>
            <span className="text-2xl font-bold text-slate-900">{students.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Active Status</span>
            <span className="text-2xl font-bold text-slate-900">
              {students.filter((s) => (s.status || 'Active') === 'Active').length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Departments</span>
            <span className="text-2xl font-bold text-slate-900">{deptCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, roll number, email, or dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Department Filter Dropdown */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchStudents}
            disabled={loading}
            title="Refresh list"
            className="p-2 text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Student Table with View, Edit, Delete Actions */}
      <StudentTable
        students={filteredStudents}
        loading={loading}
        error={error}
        onRetry={fetchStudents}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        searchQuery={searchQuery}
        onView={(student) => setViewingStudent(student)}
        onEdit={(student) => setEditingStudent(student)}
        onDelete={(student) => setDeletingStudent(student)}
      />

      {/* Modal 1: Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStudentAdded={handleStudentAdded}
      />

      {/* Modal 2: View Student Details Modal */}
      <ViewStudentModal
        isOpen={Boolean(viewingStudent)}
        onClose={() => setViewingStudent(null)}
        student={viewingStudent}
      />

      {/* Modal 3: Edit Student Modal */}
      <EditStudentModal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onStudentUpdated={handleStudentUpdated}
      />

      {/* Modal 4: Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingStudent)}
        onClose={() => setDeletingStudent(null)}
        student={deletingStudent}
        onStudentDeleted={handleStudentDeleted}
      />
    </div>
  );
}
