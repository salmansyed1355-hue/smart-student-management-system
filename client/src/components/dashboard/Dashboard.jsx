import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Layers, 
  CalendarCheck, 
  FileText, 
  Award, 
  Percent, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  UserPlus, 
  Clock, 
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

export default function Dashboard({ onServerStatusChange }) {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data sources from Express APIs concurrently
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, attendanceRes, marksRes] = await Promise.all([
        fetch('http://localhost:5000/api/students'),
        fetch('http://localhost:5000/api/attendance'),
        fetch('http://localhost:5000/api/marks')
      ]);

      if (!studentsRes.ok || !attendanceRes.ok || !marksRes.ok) {
        throw new Error('One or more dashboard API endpoints failed to respond.');
      }

      const [studentsData, attendanceData, marksData] = await Promise.all([
        studentsRes.json(),
        attendanceRes.json(),
        marksRes.json()
      ]);

      if (studentsData.success && attendanceData.success && marksData.success) {
        setStudents(studentsData.data || []);
        setAttendance(attendanceData.data || []);
        setMarks(marksData.data || []);
        if (onServerStatusChange) onServerStatusChange(true);
      } else {
        throw new Error('API returned unsuccessful response structure.');
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Could not connect to backend server.');
      if (onServerStatusChange) onServerStatusChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 1. Core Summary Metrics
  const metrics = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'Active').length;
    const departments = new Set(students.map((s) => s.department).filter(Boolean)).size;
    const totalAttendanceRecords = attendance.length;
    const totalMarksRecords = marks.length;

    // Overall Average Marks %
    let totalObtained = 0;
    let totalMax = 0;
    marks.forEach((m) => {
      totalObtained += m.obtainedMarks || 0;
      totalMax += m.maxMarks || 0;
    });
    const avgMarksPercentage = totalMax > 0 
      ? Math.round((totalObtained / totalMax) * 100 * 10) / 10 
      : 0;

    // Overall Attendance %
    const presentCount = attendance.filter((a) => a.status === 'Present').length;
    const overallAttendancePercentage = totalAttendanceRecords > 0 
      ? Math.round((presentCount / totalAttendanceRecords) * 100) 
      : 0;

    return {
      totalStudents,
      activeStudents,
      departments,
      totalAttendanceRecords,
      totalMarksRecords,
      avgMarksPercentage,
      overallAttendancePercentage,
      presentCount
    };
  }, [students, attendance, marks]);

  // 2. Attendance Status Distribution (for Recharts Pie/Bar Chart)
  const attendanceChartData = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;

    attendance.forEach((a) => {
      if (a.status === 'Present') present += 1;
      else if (a.status === 'Absent') absent += 1;
      else if (a.status === 'Late') late += 1;
    });

    return [
      { name: 'Present', value: present, color: '#10b981' },
      { name: 'Absent', value: absent, color: '#f43f5e' },
      { name: 'Late', value: late, color: '#f59e0b' }
    ];
  }, [attendance]);

  // 3. Marks Performance by Subject (for Recharts Bar Chart)
  const subjectPerformanceData = useMemo(() => {
    const subjectMap = {};

    marks.forEach((m) => {
      const sub = m.subject || 'Other';
      if (!subjectMap[sub]) {
        subjectMap[sub] = { obtained: 0, max: 0 };
      }
      subjectMap[sub].obtained += m.obtainedMarks || 0;
      subjectMap[sub].max += m.maxMarks || 0;
    });

    return Object.keys(subjectMap).map((sub) => {
      const item = subjectMap[sub];
      const pct = item.max > 0 ? Math.round((item.obtained / item.max) * 100 * 10) / 10 : 0;
      return {
        subject: sub,
        percentage: pct
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [marks]);

  // 4. Top Performing Students (Top 5)
  const topStudents = useMemo(() => {
    const studentMarksMap = {};

    marks.forEach((m) => {
      const studentId = m.studentId?._id || m.studentId;
      if (!studentId) return;

      if (!studentMarksMap[studentId]) {
        studentMarksMap[studentId] = {
          name: m.studentId?.fullName || 'Unknown',
          roll: m.studentId?.rollNumber || 'N/A',
          dept: m.studentId?.department || '',
          obtained: 0,
          max: 0,
          count: 0
        };
      }
      studentMarksMap[studentId].obtained += m.obtainedMarks || 0;
      studentMarksMap[studentId].max += m.maxMarks || 0;
      studentMarksMap[studentId].count += 1;
    });

    return Object.values(studentMarksMap)
      .map((st) => {
        const percentage = st.max > 0 ? Math.round((st.obtained / st.max) * 100 * 10) / 10 : 0;
        return { ...st, percentage };
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }, [marks]);

  // 5. Low Attendance Alert (< 75%)
  const lowAttendanceStudents = useMemo(() => {
    return students
      .map((st) => {
        const studentRecords = attendance.filter(
          (a) => (a.studentId?._id || a.studentId) === st._id
        );
        const totalClasses = studentRecords.length;
        if (totalClasses === 0) return null; // No attendance logged yet for this student

        const presentCount = studentRecords.filter((a) => a.status === 'Present').length;
        const percentage = Math.round((presentCount / totalClasses) * 100);

        if (percentage < 75) {
          return {
            id: st._id,
            name: st.fullName,
            roll: st.rollNumber,
            dept: st.department,
            totalClasses,
            presentCount,
            percentage
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.percentage - b.percentage);
  }, [students, attendance]);

  // 6. Recent Activity Log (Top 6 combined entries)
  const recentActivity = useMemo(() => {
    const list = [];

    // Recent Students
    students.forEach((s) => {
      if (s.createdAt) {
        list.push({
          type: 'student',
          title: `Student Registered`,
          desc: `${s.fullName} (${s.rollNumber}) added to ${s.department}`,
          date: new Date(s.createdAt)
        });
      }
    });

    // Recent Marks
    marks.forEach((m) => {
      if (m.createdAt) {
        list.push({
          type: 'mark',
          title: `Marks Recorded`,
          desc: `${m.studentId?.fullName || 'Student'} scored ${m.obtainedMarks}/${m.maxMarks} in ${m.subject} (${m.examType})`,
          date: new Date(m.createdAt)
        });
      }
    });

    // Recent Attendance
    attendance.forEach((a) => {
      if (a.createdAt || a.date) {
        list.push({
          type: 'attendance',
          title: `Attendance Marked`,
          desc: `${a.studentId?.fullName || 'Student'} marked ${a.status} for ${a.subject}`,
          date: new Date(a.createdAt || a.date)
        });
      }
    });

    return list
      .sort((a, b) => b.date - a.date)
      .slice(0, 6);
  }, [students, marks, attendance]);

  const formatDate = (date) => {
    try {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-7">
      {/* Top Header & Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            System Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analytics and performance overview across all modules.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="text-xs font-semibold px-2.5 py-1 bg-rose-100 hover:bg-rose-200 rounded-lg text-rose-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* 7 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Total Students
            </span>
            <span className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</span>
          </div>
        </div>

        {/* Card 2: Active Students */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Active Students
            </span>
            <span className="text-2xl font-bold text-slate-900">{metrics.activeStudents}</span>
          </div>
        </div>

        {/* Card 3: Total Departments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Departments
            </span>
            <span className="text-2xl font-bold text-slate-900">{metrics.departments}</span>
          </div>
        </div>

        {/* Card 4: Attendance Records */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Attendance Logs
            </span>
            <span className="text-2xl font-bold text-slate-900">{metrics.totalAttendanceRecords}</span>
          </div>
        </div>

        {/* Card 5: Marks Records */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Exam Records
            </span>
            <span className="text-2xl font-bold text-slate-900">{metrics.totalMarksRecords}</span>
          </div>
        </div>

        {/* Card 6: Average Marks % */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Avg Marks %
            </span>
            <span className="text-2xl font-bold text-slate-900">{metrics.avgMarksPercentage}%</span>
          </div>
        </div>

        {/* Card 7: Overall Attendance % */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-2 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-2xl p-4 shadow-md shadow-indigo-600/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wide text-indigo-100 uppercase block">
              Overall Attendance Rate
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold">{metrics.overallAttendancePercentage}%</span>
              <span className="text-xs text-indigo-200 font-medium">
                ({metrics.presentCount} / {metrics.totalAttendanceRecords} Present)
              </span>
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <Percent className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Attendance Analytics (Recharts Pie Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Attendance Overview</h3>
                <p className="text-xs text-slate-400">Distribution of present, absent, and late entries</p>
              </div>
            </div>
          </div>

          {metrics.totalAttendanceRecords === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-slate-400">
              No attendance records available for chart.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-1/2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val, name) => [`${val} records`, name]}
                      contentStyle={{ borderRadius: '10px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Attendance Counts Legend Box */}
              <div className="w-full sm:w-1/2 space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
                {attendanceChartData.map((item) => {
                  const pct = metrics.totalAttendanceRecords > 0
                    ? Math.round((item.value / metrics.totalAttendanceRecords) * 100)
                    : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-700">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.value}</span>
                        <span className="text-slate-400 text-[11px]">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: Marks Analytics (Recharts Bar Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Marks Overview by Subject</h3>
                <p className="text-xs text-slate-400">Average academic percentage per subject</p>
              </div>
            </div>
          </div>

          {subjectPerformanceData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-slate-400">
              No examination marks recorded yet.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    unit="%"
                  />
                  <Tooltip 
                    formatter={(val) => [`${val}%`, 'Average Score']}
                    contentStyle={{ borderRadius: '10px', fontSize: '12px' }}
                  />
                  <Bar dataKey="percentage" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top Students & Low Attendance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section: Top Performing Students */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Top Performing Students</h3>
                <p className="text-xs text-slate-400">Highest overall marks percentage</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Top 5</span>
          </div>

          {topStudents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No student marks recorded yet to rank.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {topStudents.map((st, index) => (
                <div key={st.roll} className="py-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      index === 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : index === 1 
                        ? 'bg-slate-200 text-slate-700' 
                        : index === 2 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">{st.name}</div>
                      <div className="text-[11px] text-slate-400">{st.roll} &bull; {st.dept}</div>
                    </div>
                  </div>
                  <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {st.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Low Attendance Alert (< 75%) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Low Attendance Alert</h3>
                <p className="text-xs text-slate-400">Students with attendance rate below 75%</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              Threshold: 75%
            </span>
          </div>

          {lowAttendanceStudents.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                No students currently have attendance below 75%.
              </p>
              <p className="text-[11px] text-slate-400">All registered students are meeting the requirement.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {lowAttendanceStudents.map((st) => (
                <div key={st.roll} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-800">{st.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {st.roll} &bull; {st.dept} ({st.presentCount}/{st.totalClasses} classes attended)
                    </div>
                  </div>
                  <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                    {st.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section: Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Activity Log</h3>
              <p className="text-xs text-slate-400">Chronological feed of latest database operations</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Live Feed</span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent activity logged yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {recentActivity.map((act, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    act.type === 'student' 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : act.type === 'mark' 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {act.type === 'student' ? (
                      <UserPlus className="w-3.5 h-3.5" />
                    ) : act.type === 'mark' ? (
                      <Award className="w-3.5 h-3.5" />
                    ) : (
                      <CalendarCheck className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">{act.title}</span>
                    <span className="text-slate-500 text-[11px] block">{act.desc}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium">
                  {formatDate(act.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
