import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Wallet,
  FileBarChart,
  Plus,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Filter,
  DollarSign,
  Briefcase,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Paperclip,
  Camera,
  Globe,
  Upload,
  Building2,
} from 'lucide-react';

import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  Language,
  AttendanceStatus,
  isPrivilegedRole,
} from './types';

import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  loadStoredEmployees,
  saveStoredEmployees,
  loadStoredAttendance,
  saveStoredAttendance,
  loadStoredLeaves,
  saveStoredLeaves,
} from './data/initialData';

import {
  generateMonthlyPayroll,
  exportPayrollStatutoryCSV,
  exportStatutoryComplianceCSV,
  exportAttendanceCSV,
  exportLeavesCSV,
} from './utils/statutoryCalculations';

import { Header } from './components/Header';
import { PayslipModal } from './components/PayslipModal';
import { EmployeeModal } from './components/EmployeeModal';
import { LeaveRequestModal } from './components/LeaveRequestModal';
import { ClockInModal } from './components/ClockInModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { LoginScreen } from './components/LoginScreen';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hr_enterprise_auth_v2') === 'true';
    } catch {
      return false;
    }
  });

  // Application State
  const [lang, setLang] = useState<Language>('ms');
  const [currentView, setCurrentView] = useState<'dashboard' | 'employees' | 'attendance' | 'leaves' | 'payroll' | 'reports'>('dashboard');

  // Core Data
  const [employees, setEmployees] = useState<Employee[]>(() => loadStoredEmployees());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadStoredAttendance());
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => loadStoredLeaves());
  
  // Active User / Session (default: Siti Nurhidayah HR Manager)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      return localStorage.getItem('hr_enterprise_auth_user_v2') || 'EMP001';
    } catch {
      return 'EMP001';
    }
  });

  // Login handler
  const handleLogin = (user: Employee) => {
    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('hr_enterprise_auth_v2', 'true');
      localStorage.setItem('hr_enterprise_auth_user_v2', user.id);
    } catch (e) {
      console.error(e);
    }
    showToast(lang === 'ms' ? `Selamat datang, ${user.name}!` : `Welcome, ${user.name}!`);
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('hr_enterprise_auth_v2');
      localStorage.removeItem('hr_enterprise_auth_user_v2');
    } catch (e) {
      console.error(e);
    }
    showToast(lang === 'ms' ? 'Anda telah berjaya log keluar.' : 'You have been logged out.');
  };

  // Filters & Selections
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-10');
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>('All');

  // Modals State
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployeeBiodata, setViewingEmployeeBiodata] = useState<Employee | null>(null);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [viewingAttachmentLeave, setViewingAttachmentLeave] = useState<LeaveRequest | null>(null);

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  const [isGoogleSyncModalOpen, setIsGoogleSyncModalOpen] = useState(false);

  // Quick edit attendance modal
  const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Avatar Upload from Gallery Handler
  const handleAvatarGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === currentUser.id ? { ...emp, avatar: result } : emp))
        );
        showToast(
          lang === 'ms'
            ? 'Foto profil berjaya dikemaskini dari galeri!'
            : 'Profile photo updated from gallery!'
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Import / Sync Employees from Google Sheets or CSV
  const handleImportEmployeesFromSheets = (newEmployees: Employee[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setEmployees(newEmployees);
      // Ensure current user is still valid
      if (!newEmployees.some((e) => e.id === currentUserId)) {
        setCurrentUserId(newEmployees[0]?.id || 'EMP001');
      }
    } else {
      setEmployees((prev) => {
        const merged = [...prev];
        for (const newEmp of newEmployees) {
          const idx = merged.findIndex(
            (e) =>
              e.id.toLowerCase() === newEmp.id.toLowerCase() ||
              e.name.toLowerCase() === newEmp.name.toLowerCase()
          );
          if (idx !== -1) {
            merged[idx] = { ...merged[idx], ...newEmp };
          } else {
            merged.push(newEmp);
          }
        }
        return merged;
      });
    }
    showToast(
      lang === 'ms'
        ? `Berjaya menyelaraskan ${newEmployees.length} rekod karyawan ke dalam sistem!`
        : `Successfully synchronized ${newEmployees.length} employee records into the system!`
    );
  };

  // Sync to localStorage
  useEffect(() => {
    saveStoredEmployees(employees);
  }, [employees]);

  useEffect(() => {
    saveStoredAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    saveStoredLeaves(leaves);
  }, [leaves]);

  const currentUser = useMemo(() => {
    return employees.find((e) => e.id === currentUserId) || employees[0];
  }, [employees, currentUserId]);

  const isHR = isPrivilegedRole(currentUser);

  // Redirect non-HR away from company-wide payroll & reports if active
  useEffect(() => {
    if (!isHR && (currentView === 'payroll' || currentView === 'reports')) {
      setCurrentView('dashboard');
    }
  }, [isHR, currentView]);

  // Generate Monthly Payroll Records automatically
  const monthlyPayroll = useMemo(() => {
    return generateMonthlyPayroll(employees, attendance, leaves, selectedMonth);
  }, [employees, attendance, leaves, selectedMonth]);

  // Current user's monthly payroll record
  const currentUserPayroll = useMemo(() => {
    return monthlyPayroll.find((p) => p.empId === currentUser.id);
  }, [monthlyPayroll, currentUser.id]);

  // Today's attendance for current user
  const todayRecord = useMemo(() => {
    return attendance.find((a) => a.empId === currentUser.id && a.date === selectedDate);
  }, [attendance, currentUser.id, selectedDate]);

  const todayClockedIn = Boolean(todayRecord && todayRecord.clockIn !== '--:--');

  // Pending leaves count
  const pendingLeaves = useMemo(() => {
    return leaves.filter((l) => l.status === 'Pending');
  }, [leaves]);

  // Attendance for selected date
  const selectedDateAttendance = useMemo(() => {
    return attendance.filter((a) => a.date === selectedDate);
  }, [attendance, selectedDate]);

  // Handle Save Employee
  const handleSaveEmployee = (empData: Employee) => {
    setEmployees((prev) => {
      const exists = prev.some((e) => e.id === empData.id);
      if (exists) {
        return prev.map((e) => (e.id === empData.id ? empData : e));
      }
      return [empData, ...prev];
    });
    showToast(lang === 'ms' ? `Profil biodata ${empData.name} berjaya disimpan!` : `Employee profile for ${empData.name} saved!`);
  };

  // Handle Delete Employee
  const handleDeleteEmployee = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!confirm(lang === 'ms' ? `Adakah anda pasti mahu memadam rekod ${emp?.name}?` : `Are you sure you want to delete ${emp?.name}?`)) {
      return;
    }
    setEmployees((prev) => prev.filter((e) => e.id !== empId));
    showToast(lang === 'ms' ? `Karyawan ${emp?.name} telah dipadam.` : `Employee deleted.`);
  };

  // Handle Clock In
  const handlePunchIn = (record: AttendanceRecord) => {
    setAttendance((prev) => {
      const filtered = prev.filter((a) => !(a.empId === record.empId && a.date === record.date));
      return [record, ...filtered];
    });
    showToast(lang === 'ms' ? `Punch Masuk berjaya direkodkan jam ${record.clockIn}!` : `Clock-in recorded at ${record.clockIn}!`);
  };

  // Handle Clock Out
  const handlePunchOut = (recordId: string, clockOutTime: string, notes: string) => {
    setAttendance((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          // Calculate work hours
          let workHours = 8;
          let otHours = 0;
          if (rec.clockIn !== '--:--') {
            const [inH, inM] = rec.clockIn.split(':').map(Number);
            const [outH, outM] = clockOutTime.split(':').map(Number);
            const totalHours = Math.max(0, (outH + outM / 60) - (inH + inM / 60));
            workHours = Number(totalHours.toFixed(1));
            // OT beyond 8.5 hours
            if (totalHours > 8.5) {
              otHours = Number((totalHours - 8.5).toFixed(1));
            }
          }
          return {
            ...rec,
            clockOut: clockOutTime,
            workHours,
            otHours,
            notes,
          };
        }
        return rec;
      })
    );
    showToast(lang === 'ms' ? `Punch Keluar berjaya direkodkan jam ${clockOutTime}!` : `Clock-out recorded at ${clockOutTime}!`);
  };

  // Handle Submit Leave Request
  const handleSubmitLeave = (newReq: LeaveRequest) => {
    setLeaves((prev) => [newReq, ...prev]);
    showToast(
      lang === 'ms'
        ? `Permohonan cuti dihantar! Menunggu kelulusan pengurus.`
        : `Leave request submitted! Awaiting manager approval.`
    );
  };

  // Real-time Leave Approval Workflow
  const handleReviewLeave = (leaveId: string, status: 'Approved' | 'Rejected', reviewNotes?: string) => {
    const leave = leaves.find((l) => l.id === leaveId);
    if (!leave) return;

    const applicant = employees.find((e) => e.id === leave.empId);

    // Update leave record
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status,
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              reviewNotes: reviewNotes || (status === 'Approved' ? 'Diluluskan oleh Pengurus HR' : 'Permohonan ditolak.'),
            }
          : l
      )
    );

    // If approved, deduct from leave balance and record in attendance!
    if (status === 'Approved' && applicant) {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === applicant.id) {
            const bal = { ...emp.leaveBalance };
            if (leave.type === 'Annual Leave') bal.annualTaken += leave.daysCount;
            else if (leave.type === 'Medical Leave') bal.medicalTaken += leave.daysCount;
            else if (leave.type === 'Emergency Leave') bal.emergencyTaken += leave.daysCount;
            else if (leave.type === 'Maternity/Paternity Leave') bal.maternityTaken += leave.daysCount;
            return { ...emp, leaveBalance: bal };
          }
          return emp;
        })
      );

      // Auto create attendance log with "On Leave" status for start date
      setAttendance((prev) => {
        const existing = prev.find((a) => a.empId === leave.empId && a.date === leave.startDate);
        if (existing) {
          return prev.map((a) =>
            a.id === existing.id
              ? { ...a, status: 'On Leave', notes: `Cuti diluluskan: ${leave.type} (${leave.reason})` }
              : a
          );
        } else {
          const newAtt: AttendanceRecord = {
            id: `ATT-${leave.startDate.replace(/-/g, '')}-${leave.empId}`,
            empId: leave.empId,
            date: leave.startDate,
            clockIn: '--:--',
            clockOut: '--:--',
            status: 'On Leave',
            workHours: 0,
            otHours: 0,
            notes: `Cuti diluluskan: ${leave.type} (${leave.reason})`,
            location: '-',
            verificationMethod: 'Manual HR',
          };
          return [newAtt, ...prev];
        }
      });
    }

    showToast(
      lang === 'ms'
        ? `Permohonan cuti ${applicant?.name} telah ${status === 'Approved' ? 'DILULUSKAN' : 'DITOLAK'}!`
        : `Leave request for ${applicant?.name} has been ${status.toUpperCase()}!`
    );
  };

  // Quick edit attendance record inline
  const handleUpdateAttendanceInline = (attId: string, clockIn: string, clockOut: string, status: AttendanceStatus, otHours: number) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.id === attId
          ? {
              ...a,
              clockIn,
              clockOut,
              status,
              otHours,
            }
          : a
      )
    );
    setEditingAttendanceId(null);
    showToast(lang === 'ms' ? 'Rekod kehadiran berjaya dikemaskini.' : 'Attendance record updated.');
  };

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.id.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.nric.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.role.toLowerCase().includes(employeeSearch.toLowerCase());
      const matchDept = deptFilter === 'All' || emp.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [employees, employeeSearch, deptFilter]);

  // Aggregate stats for Dashboard & Reports
  const stats = useMemo(() => {
    const totalStaff = employees.length;
    const presentTodayCount = selectedDateAttendance.filter((a) => a.status === 'Present').length;
    const lateTodayCount = selectedDateAttendance.filter((a) => a.status === 'Late').length;
    const leaveTodayCount = selectedDateAttendance.filter((a) => a.status === 'On Leave').length;
    const absentCount = Math.max(0, totalStaff - (presentTodayCount + lateTodayCount + leaveTodayCount));

    const totalNetPayroll = monthlyPayroll.reduce((sum, p) => sum + p.netSalary, 0);
    const totalGrossPayroll = monthlyPayroll.reduce((sum, p) => sum + p.grossSalary, 0);
    const totalEPF = monthlyPayroll.reduce((sum, p) => sum + (p.epfEmployee + p.epfEmployer), 0);
    const totalSOCSO = monthlyPayroll.reduce((sum, p) => sum + (p.socsoEmployee + p.socsoEmployer), 0);
    const totalEIS = monthlyPayroll.reduce((sum, p) => sum + (p.eisEmployee + p.eisEmployer), 0);
    const totalCompanyCost = monthlyPayroll.reduce((sum, p) => sum + p.totalCompanyCost, 0);

    return {
      totalStaff,
      presentTodayCount,
      lateTodayCount,
      leaveTodayCount,
      absentCount,
      totalNetPayroll,
      totalGrossPayroll,
      totalEPF,
      totalSOCSO,
      totalEIS,
      totalCompanyCost,
    };
  }, [employees, selectedDateAttendance, monthlyPayroll]);

  // If not authenticated, render LoginScreen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        employees={employees}
        onLogin={handleLogin}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ms' ? 'en' : 'ms')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/40 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 animate-spin" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        currentLang={lang}
        onToggleLang={() => setLang(lang === 'ms' ? 'en' : 'ms')}
        currentUser={currentUser}
        allEmployees={employees}
        onSelectUser={(u) => setCurrentUserId(u.id)}
        pendingLeavesCount={pendingLeaves.length}
        onNavigateToLeaves={() => setCurrentView('leaves')}
        onOpenClockIn={() => setIsClockInModalOpen(true)}
        todayClockedIn={todayClockedIn}
        onLogout={handleLogout}
      />

      {/* Main Layout Container with Sidebar and Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="w-64 shrink-0 flex flex-col space-y-2">
          
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-2">
            <div className="flex items-center space-x-3">
              <div className="relative group shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500 shadow-sm"
                />
                <label
                  title={lang === 'ms' ? 'Tukar Foto dari Galeri' : 'Change Photo from Gallery'}
                  className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded-full cursor-pointer shadow-md transition group-hover:scale-110"
                >
                  <Camera className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarGalleryUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[11px] text-indigo-600 font-semibold truncate">{currentUser.role}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate">
                    {currentUser.department}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${
                    currentUser.roleLevel === 'admin'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {currentUser.roleLevel === 'admin' ? 'Admin' : 'Staff'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">{lang === 'ms' ? 'Gaji Pokok:' : 'Basic Pay:'}</span>
              <span className="font-mono font-bold text-slate-800">
                {currentUser.salaryCurrency && currentUser.salaryCurrency !== 'MYR' ? (
                  <span>
                    <span className="text-[10px] text-slate-400 mr-1">{currentUser.salaryCurrency} {currentUser.originalSalaryAmount?.toLocaleString()} →</span>
                    RM {currentUser.basicSalary.toLocaleString()}
                  </span>
                ) : (
                  `RM ${currentUser.basicSalary.toLocaleString()}`
                )}
              </span>
            </div>
          </div>

          {/* Navigation Links (Role-Based Access) */}
          <nav className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 space-y-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>{isHR ? (lang === 'ms' ? 'Utama (Dashboard HR)' : 'HR Dashboard') : (lang === 'ms' ? 'Utama (Dashboard Saya)' : 'My Dashboard')}</span>
            </button>

            <button
              onClick={() => setCurrentView('employees')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'employees'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 shrink-0" />
                <span>{isHR ? (lang === 'ms' ? 'Biodata Karyawan' : 'Employees') : (lang === 'ms' ? 'Profil Biodata Saya' : 'My Profile')}</span>
              </div>
              {isHR && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  currentView === 'employees' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {employees.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('attendance')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span>{isHR ? (lang === 'ms' ? 'Kehadiran & Absensi' : 'Attendance Log') : (lang === 'ms' ? 'Kehadiran Saya' : 'My Attendance')}</span>
            </button>

            <button
              onClick={() => setCurrentView('leaves')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'leaves'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span>{isHR ? (lang === 'ms' ? 'Pengurusan Cuti' : 'Leave Management') : (lang === 'ms' ? 'Permohonan Cuti Saya' : 'My Leaves')}</span>
              </div>
              {isHR && pendingLeaves.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {pendingLeaves.length}
                </span>
              )}
            </button>

            {/* If HR / Manager / Director: Full Payroll & Reports */}
            {isHR ? (
              <>
                <button
                  onClick={() => setCurrentView('payroll')}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    currentView === 'payroll'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Wallet className="w-4 h-4 shrink-0" />
                  <span>{lang === 'ms' ? 'Penggajian & Statutori' : 'Payroll & Statutori'}</span>
                </button>

                <button
                  onClick={() => setCurrentView('reports')}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    currentView === 'reports'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileBarChart className="w-4 h-4 shrink-0" />
                  <span>{lang === 'ms' ? 'Laporan Otomatis' : 'Automated Reports'}</span>
                </button>
              </>
            ) : (
              /* If regular employee: Direct My Payslip button with PDF download */
              <button
                onClick={() => {
                  const myPay = monthlyPayroll.find((p) => p.empId === currentUser.id);
                  if (myPay) {
                    setSelectedPayslip(myPay);
                    setIsPayslipModalOpen(true);
                  }
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{lang === 'ms' ? 'Slip Gaji Saya (PDF)' : 'My Payslip (PDF)'}</span>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                  PDF
                </span>
              </button>
            )}
          </nav>

          {/* Quick Action Widget */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-sm border border-indigo-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 block mb-1">
              {lang === 'ms' ? 'Tindakan Pantas' : 'Quick Action'}
            </span>
            <p className="text-xs text-slate-300 mb-3">
              {lang === 'ms' ? 'Mohon cuti rehat atau rekod kehadiran hari ini.' : 'Apply leave or record attendance.'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setIsClockInModalOpen(true)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{lang === 'ms' ? 'Punch Kehadiran' : 'Punch Attendance'}</span>
              </button>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ms' ? 'Borang Cuti Baru' : 'New Leave Form'}</span>
              </button>
            </div>
          </div>

        </aside>

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 min-w-0">
          
          {/* ========================================================
              VIEW 1: DASHBOARD (UTAMA)
             ======================================================== */}
          {currentView === 'dashboard' && (
            !isHR ? (
              /* ========================================================
                 EMPLOYEE SELF-SERVICE DASHBOARD (DATA SENDIRI SAHAJA)
                 ======================================================== */
              <div className="space-y-6">
                {/* Employee Welcome Banner */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {lang === 'ms' ? `Selamat Kembali, ${currentUser.name}!` : `Welcome Back, ${currentUser.name}!`}
                      </h1>
                      <span className="bg-indigo-100 text-indigo-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                        {currentUser.role}
                      </span>
                      <span className="bg-slate-100 text-slate-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-slate-200">
                        {currentUser.company || 'Solusi Serumpun Senusantara SDN. BHD.'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>ID: <strong className="text-slate-800">{currentUser.id}</strong></span>
                      <span>•</span>
                      <span>Jabatan: <strong className="text-slate-800">{currentUser.department}</strong></span>
                      {currentUser.isRemoteOverseas && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            🌐 Remote: {currentUser.workLocationCountry || 'Luar Malaysia'} (Dikecualikan Caruman Statutori)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsClockInModalOpen(true)}
                      className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>{lang === 'ms' ? 'Punch Kehadiran' : 'Clock In/Out'}</span>
                    </button>

                    <button
                      onClick={() => setIsLeaveModalOpen(true)}
                      className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'ms' ? 'Mohon Cuti' : 'Apply Leave'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (currentUserPayroll) {
                          setSelectedPayslip(currentUserPayroll);
                          setIsPayslipModalOpen(true);
                        }
                      }}
                      className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>{lang === 'ms' ? 'Slip Gaji (PDF)' : 'Payslip (PDF)'}</span>
                    </button>
                  </div>
                </div>

                {/* 4 Personal KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Today Attendance Status */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-semibold">{lang === 'ms' ? 'Kehadiran Hari Ini' : 'Today Attendance'}</span>
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <h3 className={`text-xl font-black ${
                        todayRecord?.status === 'Present' ? 'text-emerald-600' :
                        todayRecord?.status === 'Late' ? 'text-amber-600' :
                        todayRecord?.status === 'On Leave' ? 'text-blue-600' : 'text-slate-700'
                      }`}>
                        {todayRecord ? todayRecord.status : 'Belum Punch Masuk'}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      {todayRecord ? `${todayRecord.clockIn} - ${todayRecord.clockOut}` : '--:--'}
                      {todayRecord?.otHours ? ` (+${todayRecord.otHours}h OT)` : ''}
                    </p>
                  </div>

                  {/* 2. Annual Leave Remaining */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-semibold">{lang === 'ms' ? 'Baki Cuti Tahunan' : 'Annual Leave Left'}</span>
                      <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <h3 className="text-2xl font-black text-indigo-700 font-mono">
                        {currentUser.leaveBalance.annual - currentUser.leaveBalance.annualTaken}
                      </h3>
                      <span className="text-xs text-slate-500">/ {currentUser.leaveBalance.annual} {lang === 'ms' ? 'hari' : 'days'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, ((currentUser.leaveBalance.annual - currentUser.leaveBalance.annualTaken) / currentUser.leaveBalance.annual) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. Medical Leave Remaining */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-semibold">{lang === 'ms' ? 'Baki Cuti Sakit (MC)' : 'Medical Leave Left'}</span>
                      <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <h3 className="text-2xl font-black text-amber-600 font-mono">
                        {currentUser.leaveBalance.medical - currentUser.leaveBalance.medicalTaken}
                      </h3>
                      <span className="text-xs text-slate-500">/ {currentUser.leaveBalance.medical} {lang === 'ms' ? 'hari' : 'days'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, ((currentUser.leaveBalance.medical - currentUser.leaveBalance.medicalTaken) / currentUser.leaveBalance.medical) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Current Month Net Pay */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-semibold">{lang === 'ms' ? 'Gaji Bersih Bulan Ini' : 'This Month Net Pay'}</span>
                      <div className="p-2 bg-cyan-50 rounded-xl text-cyan-700">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <h3 className="text-xl font-black text-slate-900 font-mono">
                        RM {currentUserPayroll ? currentUserPayroll.netSalary.toFixed(2) : currentUser.basicSalary.toLocaleString()}
                      </h3>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Bulan: {selectedMonth}</span>
                      <button
                        onClick={() => {
                          if (currentUserPayroll) {
                            setSelectedPayslip(currentUserPayroll);
                            setIsPayslipModalOpen(true);
                          }
                        }}
                        className="text-[11px] text-indigo-600 font-bold hover:underline"
                      >
                        Papar Slip PDF →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Two Columns: Recent Attendance & Recent Leaves */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Attendance Log Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CalendarCheck className="w-4 h-4 text-indigo-600" />
                        <h2 className="font-bold text-sm text-slate-900">
                          {lang === 'ms' ? 'Log Kehadiran Saya' : 'My Attendance Log'}
                        </h2>
                      </div>
                      <button
                        onClick={() => setCurrentView('attendance')}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        {lang === 'ms' ? 'Lihat Semua' : 'View All'}
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {attendance.filter((a) => a.empId === currentUser.id).slice(0, 5).map((att) => (
                        <div key={att.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                          <div>
                            <span className="font-mono font-bold text-slate-800 block">{att.date}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Masuk: {att.clockIn} • Keluar: {att.clockOut}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            {att.otHours > 0 && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded font-mono">
                                +{att.otHours}h OT
                              </span>
                            )}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              att.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                              att.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                              att.status === 'On Leave' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {att.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leave Requests Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="w-4 h-4 text-indigo-600" />
                        <h2 className="font-bold text-sm text-slate-900">
                          {lang === 'ms' ? 'Permohonan Cuti Saya' : 'My Leave Applications'}
                        </h2>
                      </div>
                      <button
                        onClick={() => setIsLeaveModalOpen(true)}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        + {lang === 'ms' ? 'Mohon Cuti' : 'Apply'}
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {leaves.filter((l) => l.empId === currentUser.id).length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          {lang === 'ms' ? 'Tiada permohonan cuti aktif.' : 'No active leave requests.'}
                        </div>
                      ) : (
                        leaves.filter((l) => l.empId === currentUser.id).slice(0, 5).map((l) => (
                          <div key={l.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-900">{l.type}</span>
                                <span className="font-mono text-[11px] text-slate-500">({l.daysCount} hari)</span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono block">
                                {l.startDate} {l.startDate !== l.endDate ? `→ ${l.endDate}` : ''}
                              </span>
                              {l.attachmentName && (
                                <button
                                  type="button"
                                  onClick={() => setViewingAttachmentLeave(l)}
                                  className="mt-1 inline-flex items-center space-x-1 text-[10px] text-indigo-600 font-semibold hover:underline"
                                >
                                  <Paperclip className="w-3 h-3" />
                                  <span>{l.attachmentName}</span>
                                </button>
                              )}
                            </div>
                            <div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                l.status === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {l.status === 'Approved' ? 'Diluluskan' : l.status === 'Pending' ? 'Menunggu' : 'Ditolak'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Card: Official Employment & Statutory Particulars */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs mb-3">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    <span>Maklumat Rasmi Penggajian & Statutori Saya</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Syarikat Majikan:</span>
                      <span className="font-bold text-slate-900 truncate block">{currentUser.company || 'Solusi Serumpun Senusantara SDN. BHD.'}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Akaun Bank:</span>
                      <span className="font-mono font-bold text-slate-900 truncate block">
                        {currentUser.bankName === 'Lainnya' ? (currentUser.customBankName || 'Bank Lainnya') : currentUser.bankName} - {currentUser.bankAccount}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">No. KWSP (EPF):</span>
                      <span className="font-mono font-bold text-slate-900 truncate block">
                        {currentUser.isRemoteOverseas ? 'Dikecualikan (Remote)' : currentUser.epfNumber}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">No. PERKESO (SOCSO):</span>
                      <span className="font-mono font-bold text-slate-900 truncate block">
                        {currentUser.isRemoteOverseas ? 'Dikecualikan (Remote)' : currentUser.socsoNumber}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      🔒 <strong>Privasi Terpelihara:</strong> Maklumat biodata, gaji dan caruman ini dikhaskan untuk anda sahaja.
                    </span>
                    <button
                      onClick={() => {
                        if (currentUserPayroll) {
                          setSelectedPayslip(currentUserPayroll);
                          setIsPayslipModalOpen(true);
                        }
                      }}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Buka Penyata Gaji Penuh (PDF) →
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* ========================================================
                 HR & MANAGEMENT EXECUTIVE DASHBOARD (AKSES PENUH)
                 ======================================================== */
              <div className="space-y-6">
                
                {/* Welcome Banner */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {lang === 'ms' ? `Selamat Kembali, ${currentUser.name}!` : `Welcome Back, ${currentUser.name}!`}
                      </h1>
                      <span className="bg-indigo-100 text-indigo-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'ms'
                        ? 'Ringkasan operasi HRD, kehadiran harian, kelulusan cuti masa-nyata & anggaran statutori bulanan.'
                        : 'Overview of HR operations, daily attendance, real-time leave approvals & monthly statutory estimates.'}
                    </p>
                  </div>
                    {lang === 'ms'
                      ? 'Ringkasan operasi HRD, kehadiran harian, kelulusan cuti masa-nyata & anggaran statutori bulanan.'
                      : 'Overview of HR operations, daily attendance, real-time leave approvals & monthly statutory estimates.'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ms' ? 'Mohon Cuti' : 'Apply Leave'}</span>
                  </button>
                  <button
                    onClick={() => {
                      exportPayrollStatutoryCSV(monthlyPayroll, employees, selectedMonth);
                      showToast(lang === 'ms' ? 'Fail CSV Penggajian & Statutori berjaya dimuat turun!' : 'Payroll CSV downloaded!');
                    }}
                    className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'ms' ? 'Muat Turun CSV Statutori' : 'Export Statutory CSV'}</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Staff */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">{lang === 'ms' ? 'Jumlah Karyawan' : 'Total Employees'}</span>
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-2xl font-black text-slate-900">{stats.totalStaff}</h3>
                    <span className="text-xs text-slate-500">{lang === 'ms' ? 'orang' : 'staff'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    100% {lang === 'ms' ? 'aktif berkhidmat' : 'active workforce'}
                  </p>
                </div>

                {/* 2. Today's Attendance */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">{lang === 'ms' ? 'Kehadiran Hari Ini' : 'Today Attendance'}</span>
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-2xl font-black text-emerald-600">
                      {stats.presentTodayCount + stats.lateTodayCount} / {stats.totalStaff}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      ({Math.round(((stats.presentTodayCount + stats.lateTodayCount) / stats.totalStaff) * 100)}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {stats.lateTodayCount} {lang === 'ms' ? 'lewat' : 'late'} • {stats.leaveTodayCount} {lang === 'ms' ? 'sedang cuti' : 'on leave'}
                  </p>
                </div>

                {/* 3. Pending Leaves */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">{lang === 'ms' ? 'Permohonan Cuti' : 'Pending Leaves'}</span>
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-2xl font-black text-amber-600">{pendingLeaves.length}</h3>
                    <span className="text-xs text-slate-500">{lang === 'ms' ? 'menunggu kelulusan' : 'pending'}</span>
                  </div>
                  <button
                    onClick={() => setCurrentView('leaves')}
                    className="text-[11px] text-indigo-600 font-bold hover:underline mt-1 flex items-center"
                  >
                    <span>{lang === 'ms' ? 'Semak sekarang' : 'Review now'}</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>

                {/* 4. Estimated Monthly Payroll */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">{lang === 'ms' ? 'Anggaran Gaji Bersih' : 'Est. Net Payroll'}</span>
                    <div className="p-2 bg-cyan-50 rounded-xl text-cyan-700">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <h3 className="text-2xl font-black text-slate-900 font-mono">
                      RM {stats.totalNetPayroll.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Bulan: {selectedMonth} • {employees.length} slip gaji
                  </p>
                </div>

              </div>

              {/* REAL-TIME HR APPROVAL CALLOUT (If pending leaves exist) */}
              {isHR && pendingLeaves.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-amber-900">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-sm">
                        {lang === 'ms' ? 'Tindakan Pengurus HR Diperlukan: Permohonan Cuti Masuk' : 'Manager Action Required: New Leave Requests'}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
                      {pendingLeaves.length} {lang === 'ms' ? 'permohonan belum diproses' : 'unprocessed'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingLeaves.slice(0, 2).map((req) => {
                      const emp = employees.find((e) => e.id === req.empId);
                      return (
                        <div key={req.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={emp?.avatar}
                                  alt={emp?.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{emp?.name}</p>
                                  <p className="text-[10px] text-slate-500">{emp?.department}</p>
                                </div>
                              </div>
                              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                                {req.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                              📅 {req.startDate} {req.startDate !== req.endDate ? `hingga ${req.endDate}` : ''} ({req.daysCount} hari)
                            </p>
                            <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg">
                              "{req.reason}"
                            </p>
                            {req.attachmentName && (
                              <button
                                type="button"
                                onClick={() => setViewingAttachmentLeave(req)}
                                className="mt-2 inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition cursor-pointer"
                              >
                                <Paperclip className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">{req.attachmentName}</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-end space-x-2 mt-3 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => handleReviewLeave(req.id, 'Rejected')}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                            >
                              {lang === 'ms' ? 'Tolak (Reject)' : 'Reject'}
                            </button>
                            <button
                              onClick={() => handleReviewLeave(req.id, 'Approved')}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition cursor-pointer"
                            >
                              {lang === 'ms' ? 'Luluskan (Approve)' : 'Approve'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Two Columns: Daily Attendance Snapshot & Statutory Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1 & 2: Today's Attendance Overview */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-sm text-slate-900">
                        {lang === 'ms' ? 'Log Kehadiran Harian' : 'Daily Attendance Log'}
                      </h2>
                      <p className="text-xs text-slate-500">Tarikh: {selectedDate}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-mono"
                      />
                      <button
                        onClick={() => setCurrentView('attendance')}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        {lang === 'ms' ? 'Lihat Semua' : 'View All'}
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {employees.map((emp) => {
                      const att = attendance.find((a) => a.empId === emp.id && a.date === selectedDate);
                      const isPresent = att?.status === 'Present';
                      const isLate = att?.status === 'Late';
                      const isOnLeave = att?.status === 'On Leave';

                      return (
                        <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition">
                          <div className="flex items-center space-x-3">
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{emp.name}</p>
                              <p className="text-[11px] text-slate-500">{emp.role} • {emp.department}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                              <span className="text-xs font-mono font-bold text-slate-800">
                                {att ? `${att.clockIn} - ${att.clockOut}` : '--:--'}
                              </span>
                              {att && att.otHours > 0 && (
                                <span className="block text-[10px] text-indigo-600 font-semibold font-mono">
                                  + {att.otHours}h OT
                                </span>
                              )}
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isPresent
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isLate
                                  ? 'bg-amber-100 text-amber-800'
                                  : isOnLeave
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {att ? att.status : 'Absent'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Statutory Summary Box (EPF, SOCSO, EIS) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-indigo-950 mb-3">
                      <ShieldAlert className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-sm">
                        {lang === 'ms' ? 'Ringkasan Statutori Malaysia' : 'Malaysian Statutory Summary'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      {lang === 'ms'
                        ? `Caruman berkanun untuk bulan ${selectedMonth} mengikut garis panduan KWSP, PERKESO dan SIP EIS.`
                        : `Statutory deductions for ${selectedMonth} as per Malaysian EPF, SOCSO and EIS laws.`}
                    </p>

                    <div className="space-y-3">
                      {/* KWSP / EPF */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">KWSP / EPF (11% / 12-13%)</span>
                          <span className="font-mono font-bold text-indigo-900">
                            RM {stats.totalEPF.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-indigo-600 h-full w-[78%]"></div>
                        </div>
                      </div>

                      {/* PERKESO / SOCSO */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">PERKESO / SOCSO (Kategori 1)</span>
                          <span className="font-mono font-bold text-indigo-900">
                            RM {stats.totalSOCSO.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-emerald-600 h-full w-[16%]"></div>
                        </div>
                      </div>

                      {/* SIP / EIS */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">SIP / EIS (0.2% + 0.2%)</span>
                          <span className="font-mono font-bold text-indigo-900">
                            RM {stats.totalEIS.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-cyan-600 h-full w-[6%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => {
                        exportStatutoryComplianceCSV(monthlyPayroll, employees, selectedMonth);
                        showToast(lang === 'ms' ? 'Laporan Borang Caruman Berkanun dimuat turun!' : 'Statutory CSV downloaded!');
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'ms' ? 'Eksport Laporan Caruman CSV' : 'Export Statutory CSV'}</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('payroll')}
                      className="w-full text-center text-xs text-indigo-600 font-bold hover:underline py-1"
                    >
                      {lang === 'ms' ? 'Lihat Perincian Penggajian Lengkap →' : 'View Full Payroll Breakdown →'}
                    </button>
                  </div>
                </div>

              </div>
            )
          )}

          {/* ========================================================
              VIEW 2: BIODATA KARYAWAN (EMPLOYEE DIRECTORY)
             ======================================================== */}
          {currentView === 'employees' && (
            !isHR ? (
              /* ========================================================
                 EMPLOYEE PERSONAL BIODATA PROFILE (STAFF VIEW - DATA SENDIRI)
                 ======================================================== */
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-black text-slate-900">
                      {lang === 'ms' ? 'Profil & Biodata Peribadi Saya' : 'My Personal Biodata Profile'}
                    </h1>
                    <p className="text-xs text-slate-500">
                      {lang === 'ms'
                        ? 'Maklumat profil, nombor kad pengenalan, akaun bank, dan kuota cuti anda yang berdaftar.'
                        : 'Your registered personal biodata, NRIC, bank details, and leave quotas.'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingEmployee(currentUser);
                        setIsEmployeeModalOpen(true);
                      }}
                      className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{lang === 'ms' ? 'Kemaskini Maklumat Peribadi' : 'Edit Personal Info'}</span>
                    </button>
                  </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  {/* Top Hero Banner inside Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center space-x-5">
                      <div className="relative group shrink-0">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-lg"
                        />
                        <label
                          title={lang === 'ms' ? 'Muat Naik Foto dari Galeri' : 'Upload Photo from Gallery'}
                          className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl cursor-pointer shadow-lg transition transform hover:scale-110 flex items-center justify-center"
                        >
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarGalleryUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-black text-slate-900">{currentUser.name}</h2>
                          <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                            {currentUser.id}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-indigo-600 mt-0.5">{currentUser.role}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg">
                            {currentUser.department}
                          </span>
                          <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-lg border border-indigo-200 flex items-center space-x-1">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{currentUser.company || 'Solusi Serumpun Senusantara SDN. BHD.'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Remote Overseas Status Badge */}
                    {currentUser.isRemoteOverseas && (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl max-w-sm">
                        <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs mb-1">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          <span>Pekerja Remote Luar Malaysia ({currentUser.workLocationCountry || 'Luar Malaysia'})</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 leading-relaxed">
                          Berdasarkan undang-undang statutori Malaysia, pekerja remote di luar negara dikecualikan sepenuhnya (0%) daripada caruman KWSP, SOCSO dan EIS.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3 Detail Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    {/* 1. Maklumat Peribadi */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Maklumat Peribadi</span>
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">No. IC / Passport:</span>
                          <span className="font-mono font-bold text-slate-900">{currentUser.nric}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Jantina:</span>
                          <span className="font-semibold text-slate-800">{currentUser.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Emel:</span>
                          <span className="text-slate-900 font-medium truncate max-w-[160px]">{currentUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">No. Telefon:</span>
                          <span className="font-mono text-slate-900">{currentUser.phone}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-slate-400 block mb-0.5">Alamat Kediaman:</span>
                          <span className="text-slate-800 font-medium text-[11px]">{currentUser.address || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Gaji & Perbankan */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span>Gaji & Maklumat Bank</span>
                      </h3>
                      <div className="space-y-2 text-xs">
                        {currentUser.salaryCurrency && currentUser.salaryCurrency !== 'MYR' ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Mata Wang Asal:</span>
                              <span className="font-mono font-bold text-indigo-700">
                                {currentUser.salaryCurrency} {currentUser.originalSalaryAmount?.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Kadar Pertukaran:</span>
                              <span className="font-mono text-slate-600">
                                1 {currentUser.salaryCurrency} = RM {currentUser.exchangeRateToMYR}
                              </span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-200">
                              <span className="font-bold text-slate-800">Gaji Bersih (MYR):</span>
                              <span className="font-mono font-extrabold text-emerald-700">
                                RM {currentUser.basicSalary.toLocaleString()}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Gaji Pokok:</span>
                            <span className="font-mono font-extrabold text-emerald-700 text-sm">
                              RM {currentUser.basicSalary.toLocaleString()}
                            </span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Nama Bank:</span>
                            <span className="font-semibold text-slate-900">
                              {currentUser.bankName === 'Lainnya' ? (currentUser.customBankName || 'Bank Lainnya') : currentUser.bankName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">No. Akaun:</span>
                            <span className="font-mono font-bold text-slate-900">{currentUser.bankAccount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Statutori & Kuota Cuti */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                        <ShieldAlert className="w-4 h-4 text-cyan-600" />
                        <span>Statutori & Baki Cuti</span>
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">No. KWSP:</span>
                          <span className="font-mono text-slate-900">
                            {currentUser.isRemoteOverseas ? 'Dikecualikan (0%)' : currentUser.epfNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">No. SOCSO:</span>
                          <span className="font-mono text-slate-900">
                            {currentUser.isRemoteOverseas ? 'Dikecualikan (0%)' : currentUser.socsoNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">No. Cukai LHDN:</span>
                          <span className="font-mono text-slate-900">{currentUser.taxNumber}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-200 space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Cuti Tahunan:</span>
                            <span className="font-bold text-slate-900">
                              {currentUser.leaveBalance.annual - currentUser.leaveBalance.annualTaken} baki / {currentUser.leaveBalance.annual} hari
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Cuti Sakit (MC):</span>
                            <span className="font-bold text-slate-900">
                              {currentUser.leaveBalance.medical - currentUser.leaveBalance.medicalTaken} baki / {currentUser.leaveBalance.medical} hari
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================
                 HR & MANAGER FULL EMPLOYEE DIRECTORY
                 ======================================================== */
              <div className="space-y-6">
                
                {/* Top Controls */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-black text-slate-900">
                      {lang === 'ms' ? 'Direktori & Profil Biodata Karyawan' : 'Employee Directory & Biodata'}
                    </h1>
                    <p className="text-xs text-slate-500">
                      {lang === 'ms'
                        ? 'Urus rekod peribadi, nombor kad pengenalan, nombor KWSP, SOCSO, akaun bank & baki cuti.'
                        : 'Manage personal biodata, NRIC, EPF, SOCSO, bank details & leave quotas.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Google Sheets Sync Button */}
                    <button
                      onClick={() => setIsGoogleSyncModalOpen(true)}
                      className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{lang === 'ms' ? 'Sinkronkan Google Sheets' : 'Sync Google Sheets'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingEmployee(null);
                        setIsEmployeeModalOpen(true);
                      }}
                      className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'ms' ? 'Tambah Karyawan Baru' : 'Add Employee'}</span>
                    </button>
                  </div>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder={lang === 'ms' ? 'Cari nama, ID pekerja, atau No. IC...' : 'Search name, ID, or NRIC...'}
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                    >
                      <option value="All">{lang === 'ms' ? 'Semua Jabatan' : 'All Departments'}</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Administration">Administration</option>
                      <option value="Finance & Accounts">Finance & Accounts</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>

                {/* Employee Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500 shadow-sm"
                            />
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                  {emp.id}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  emp.roleLevel === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {emp.roleLevel === 'admin' ? 'Admin' : 'Staff'}
                                </span>
                              </div>
                              <h3 className="font-bold text-sm text-slate-900 mt-1 leading-snug">{emp.name}</h3>
                              <p className="text-[11px] text-slate-500">{emp.role}</p>
                            </div>
                          </div>
                        </div>

                        {/* Company & Remote Badges */}
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-100">
                            {emp.company || 'Solusi Serumpun Senusantara SDN. BHD.'}
                          </span>
                          {emp.isRemoteOverseas && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                              🌐 Remote: {emp.workLocationCountry || 'Luar Malaysia'} (0% Statutori)
                            </span>
                          )}
                        </div>

                        {/* Particulars badges */}
                        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[11px]">No. IC / NRIC:</span>
                            <span className="font-mono font-semibold text-slate-800">{emp.nric}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[11px]">No. KWSP / EPF:</span>
                            <span className="font-mono text-slate-800">
                              {emp.isRemoteOverseas ? 'Dikecualikan (0%)' : emp.epfNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[11px]">No. PERKESO:</span>
                            <span className="font-mono text-slate-800">
                              {emp.isRemoteOverseas ? 'Dikecualikan (0%)' : emp.socsoNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[11px]">Akaun Bank:</span>
                            <span className="font-medium text-slate-800 truncate max-w-[150px]">
                              {emp.bankName === 'Lainnya' ? (emp.customBankName || 'Bank Lainnya') : emp.bankName}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                            <span>Gaji Asas:</span>
                            <span className="font-mono text-emerald-700">
                              {emp.salaryCurrency && emp.salaryCurrency !== 'MYR' ? (
                                <span>
                                  <span className="text-[10px] text-slate-400 mr-1 font-normal">
                                    {emp.salaryCurrency} {emp.originalSalaryAmount?.toLocaleString()} →
                                  </span>
                                  RM {emp.basicSalary.toLocaleString()}
                                </span>
                              ) : (
                                `RM ${emp.basicSalary.toLocaleString()}`
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Leave Balances overview */}
                        <div className="flex justify-between text-[11px] text-slate-500 px-1 mb-2">
                          <span>Cuti Tahunan: <strong className="text-slate-800">{emp.leaveBalance.annual - emp.leaveBalance.annualTaken}/{emp.leaveBalance.annual}</strong></span>
                          <span>Cuti MC: <strong className="text-slate-800">{emp.leaveBalance.medical - emp.leaveBalance.medicalTaken}/{emp.leaveBalance.medical}</strong></span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button
                          onClick={() => setViewingEmployeeBiodata(emp)}
                          className="flex items-center space-x-1 text-xs text-indigo-600 font-bold hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{lang === 'ms' ? 'Profil Penuh' : 'View Full'}</span>
                        </button>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingEmployee(emp);
                              setIsEmployeeModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition"
                            title="Sunting Biodata"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Padam Karyawan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )
          )}

          {/* ========================================================
              VIEW 3: KEHADIRAN & ABSENSI (ATTENDANCE)
             ======================================================== */}
          {currentView === 'attendance' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900">
                    {lang === 'ms' ? 'Sistem Kehadiran & Rekod Absensi' : 'Attendance Tracking & Daily Punch Log'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {lang === 'ms'
                      ? 'Pengesahan swafoto GPS geolokasi, rekod jam kerja, dan pengiraan kerja lebih masa (OT).'
                      : 'GPS geofencing verification, work hours calculation, and automated overtime (OT) tracking.'}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsClockInModalOpen(true)}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{lang === 'ms' ? 'Punch Kehadiran Sekarang' : 'Punch Clock Now'}</span>
                  </button>

                  <button
                    onClick={() => {
                      exportAttendanceCSV(attendance, employees, selectedDate);
                      showToast(lang === 'ms' ? 'Fail CSV Kehadiran berjaya dimuat turun!' : 'Attendance CSV downloaded!');
                    }}
                    className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'ms' ? 'Eksport CSV Absensi' : 'Export CSV'}</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-700">{lang === 'ms' ? 'Pilih Tarikh:' : 'Select Date:'}</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs border border-slate-300 rounded-xl px-3 py-1.5 font-mono bg-slate-50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-slate-500">{lang === 'ms' ? 'Tapis Status:' : 'Filter Status:'}</span>
                  <select
                    value={attendanceStatusFilter}
                    onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded-xl px-3 py-1.5 bg-white font-medium"
                  >
                    <option value="All">{lang === 'ms' ? 'Semua Status' : 'All Status'}</option>
                    <option value="Present">Present (Hadir)</option>
                    <option value="Late">Late (Lewat)</option>
                    <option value="On Leave">On Leave (Bercuti)</option>
                    <option value="Absent">Absent (Alpa)</option>
                  </select>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4">Karyawan</th>
                        <th className="p-4">Tarikh</th>
                        <th className="p-4">Masuk (In)</th>
                        <th className="p-4">Keluar (Out)</th>
                        <th className="p-4">Jam Kerja</th>
                        <th className="p-4">OT (Jam)</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Catatan & Lokasi</th>
                        <th className="p-4 text-right">Tindakan HR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {employees.map((emp) => {
                        const att = attendance.find((a) => a.empId === emp.id && a.date === selectedDate);
                        const isEditing = editingAttendanceId === att?.id;

                        // Check status filter
                        const currentStatus = att?.status || 'Absent';
                        if (attendanceStatusFilter !== 'All' && currentStatus !== attendanceStatusFilter) {
                          return null;
                        }

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={emp.avatar}
                                  alt={emp.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-bold text-slate-900">{emp.name}</p>
                                  <p className="text-[10px] text-slate-500">{emp.department} • {emp.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-slate-600">{selectedDate}</td>
                            
                            {/* Clock In */}
                            <td className="p-4 font-mono font-medium">
                              {isEditing && att ? (
                                <input
                                  type="time"
                                  id={`edit-cin-${att.id}`}
                                  defaultValue={att.clockIn !== '--:--' ? att.clockIn : '08:00'}
                                  className="border rounded px-2 py-1 text-xs font-mono"
                                />
                              ) : (
                                <span className={att?.status === 'Late' ? 'text-amber-600 font-bold' : 'text-slate-800'}>
                                  {att?.clockIn || '--:--'}
                                </span>
                              )}
                            </td>

                            {/* Clock Out */}
                            <td className="p-4 font-mono font-medium">
                              {isEditing && att ? (
                                <input
                                  type="time"
                                  id={`edit-cout-${att.id}`}
                                  defaultValue={att.clockOut !== '--:--' ? att.clockOut : '17:00'}
                                  className="border rounded px-2 py-1 text-xs font-mono"
                                />
                              ) : (
                                <span className="text-slate-800">{att?.clockOut || '--:--'}</span>
                              )}
                            </td>

                            {/* Work Hours */}
                            <td className="p-4 font-mono font-bold text-slate-700">
                              {att ? `${att.workHours}h` : '0h'}
                            </td>

                            {/* Overtime (OT) */}
                            <td className="p-4 font-mono">
                              {isEditing && att ? (
                                <input
                                  type="number"
                                  step="0.5"
                                  id={`edit-ot-${att.id}`}
                                  defaultValue={att.otHours}
                                  className="w-16 border rounded px-2 py-1 text-xs font-mono"
                                />
                              ) : att && att.otHours > 0 ? (
                                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                  {att.otHours} jam
                                </span>
                              ) : (
                                <span className="text-slate-400">0</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              {isEditing && att ? (
                                <select
                                  id={`edit-stat-${att.id}`}
                                  defaultValue={att.status}
                                  className="border rounded px-2 py-1 text-xs"
                                >
                                  <option value="Present">Present</option>
                                  <option value="Late">Late</option>
                                  <option value="On Leave">On Leave</option>
                                  <option value="Absent">Absent</option>
                                </select>
                              ) : (
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                    att?.status === 'Present'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : att?.status === 'Late'
                                      ? 'bg-amber-100 text-amber-800'
                                      : att?.status === 'On Leave'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {att ? att.status : 'Absent'}
                                </span>
                              )}
                            </td>

                            {/* Notes & Location */}
                            <td className="p-4 text-slate-500 max-w-xs truncate">
                              <p className="truncate">{att?.notes || '-'}</p>
                              <span className="text-[10px] text-slate-400 block truncate">
                                📍 {att?.location || 'HQ Office'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right">
                              {att ? (
                                isEditing ? (
                                  <div className="flex items-center justify-end space-x-1">
                                    <button
                                      onClick={() => {
                                        const cin = (document.getElementById(`edit-cin-${att.id}`) as HTMLInputElement)?.value;
                                        const cout = (document.getElementById(`edit-cout-${att.id}`) as HTMLInputElement)?.value;
                                        const stat = (document.getElementById(`edit-stat-${att.id}`) as HTMLSelectElement)?.value as AttendanceStatus;
                                        const ot = Number((document.getElementById(`edit-ot-${att.id}`) as HTMLInputElement)?.value || 0);
                                        handleUpdateAttendanceInline(att.id, cin, cout, stat, ot);
                                      }}
                                      className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold"
                                    >
                                      Simpan
                                    </button>
                                    <button
                                      onClick={() => setEditingAttendanceId(null)}
                                      className="bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs font-semibold"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setEditingAttendanceId(att.id)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition"
                                  >
                                    Sunting
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() => {
                                    const newRecord: AttendanceRecord = {
                                      id: `ATT-${selectedDate.replace(/-/g, '')}-${emp.id}`,
                                      empId: emp.id,
                                      date: selectedDate,
                                      clockIn: '08:00',
                                      clockOut: '17:00',
                                      status: 'Present',
                                      workHours: 9,
                                      otHours: 0,
                                      notes: 'Dicatat manual oleh HR',
                                      location: 'HQ Office',
                                      verificationMethod: 'Manual HR',
                                    };
                                    handlePunchIn(newRecord);
                                  }}
                                  className="text-xs text-slate-600 hover:text-slate-900 font-medium bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                                >
                                  + Rekod Hadir
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 4: PENGURUSAN CUTI (LEAVE MANAGEMENT & APPROVAL)
             ======================================================== */}
          {currentView === 'leaves' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900">
                    {lang === 'ms' ? 'Pengurusan Permohonan & Kelulusan Cuti Karyawan' : 'Employee Leave Management & Approvals'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {lang === 'ms'
                      ? 'Persetujuan secara masa-nyata oleh Pengurus / HRD dengan pemotongan automatik baki kuota tahunan.'
                      : 'Real-time approval workflow by Manager / HR with automatic leave balance deductions.'}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ms' ? 'Borang Cuti Baru' : 'New Leave Request'}</span>
                  </button>

                  <button
                    onClick={() => {
                      exportLeavesCSV(leaves, employees);
                      showToast(lang === 'ms' ? 'Fail CSV Permohonan Cuti dimuat turun!' : 'Leave CSV downloaded!');
                    }}
                    className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'ms' ? 'Eksport CSV Cuti' : 'Export CSV'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Pending Approvals Queue */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                    <h2 className="font-extrabold text-sm text-slate-900">
                      {lang === 'ms' ? 'Permohonan Menunggu Kelulusan (Masa-Nyata)' : 'Pending Real-Time Approval Queue'}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    {pendingLeaves.length} {lang === 'ms' ? 'permohonan' : 'requests'}
                  </span>
                </div>

                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">
                      {lang === 'ms' ? 'Tiada permohonan cuti tertangguh!' : 'No pending leave requests!'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'ms' ? 'Semua permohonan telah selesai disemak.' : 'All leave applications are up to date.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingLeaves.map((req) => {
                      const emp = employees.find((e) => e.id === req.empId);
                      return (
                        <div
                          key={req.id}
                          className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200 shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={emp?.avatar}
                                  alt={emp?.name}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                                />
                                <div>
                                  <h3 className="font-bold text-sm text-slate-900">{emp?.name}</h3>
                                  <p className="text-[11px] text-slate-500">{emp?.role} • {emp?.department}</p>
                                </div>
                              </div>
                              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full border border-indigo-200">
                                {req.type}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-amber-100 mb-3">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Tempoh Cuti:</span>
                                <span className="font-semibold text-slate-900">
                                  {req.startDate} {req.startDate !== req.endDate ? `hingga ${req.endDate}` : ''}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Jumlah Hari:</span>
                                <span className="font-bold text-indigo-700 font-mono">{req.daysCount} Hari</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Tarikh Mohon:</span>
                                <span className="text-slate-600 font-mono text-[11px]">{req.appliedAt}</span>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <span className="text-[11px] text-slate-400 block mb-0.5">Sebab Cuti:</span>
                                <p className="italic text-slate-800 bg-slate-50 p-2 rounded-lg">
                                  "{req.reason}"
                                </p>
                              </div>

                              {req.attachmentName && (
                                <div className="mt-2 flex items-center justify-between p-2 rounded-xl bg-indigo-50/80 border border-indigo-200">
                                  <div className="flex items-center space-x-1.5 truncate">
                                    <Paperclip className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span className="text-[11px] font-semibold text-slate-800 truncate">
                                      {req.attachmentName} {req.attachmentSize ? `(${req.attachmentSize})` : ''}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setViewingAttachmentLeave(req)}
                                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2 py-0.5 rounded-lg border border-indigo-200 transition cursor-pointer shrink-0 shadow-xs"
                                  >
                                    Lihat Lampiran
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-amber-200/60">
                            <button
                              onClick={() => handleReviewLeave(req.id, 'Rejected')}
                              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{lang === 'ms' ? 'Tolak Permohonan' : 'Reject'}</span>
                            </button>
                            <button
                              onClick={() => handleReviewLeave(req.id, 'Approved')}
                              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center space-x-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{lang === 'ms' ? 'Luluskan Sekarang' : 'Approve'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Historical Leaves Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="font-bold text-sm text-slate-900">
                    {lang === 'ms' ? 'Semua Rekod Permohonan Cuti' : 'Complete Leave History'}
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4">Pekerja</th>
                        <th className="p-4">Jenis Cuti</th>
                        <th className="p-4">Tarikh Cuti</th>
                        <th className="p-4">Bil. Hari</th>
                        <th className="p-4">Alasan & Dokumen</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Tindakan / Pengesahan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {leaves.map((l) => {
                        const emp = employees.find((e) => e.id === l.empId);
                        return (
                          <tr key={l.id} className="hover:bg-slate-50/70 transition">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={emp?.avatar}
                                  alt={emp?.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-bold text-slate-900">{emp?.name}</p>
                                  <p className="text-[10px] text-slate-500">{emp?.department}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-800">{l.type}</span>
                            </td>
                            <td className="p-4 font-mono text-slate-700">
                              {l.startDate} {l.startDate !== l.endDate ? `→ ${l.endDate}` : ''}
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-800">
                              {l.daysCount} Hari
                            </td>
                            <td className="p-4 text-slate-600 max-w-xs">
                              <p className="truncate">"{l.reason}"</p>
                              {l.attachmentName && (
                                <button
                                  type="button"
                                  onClick={() => setViewingAttachmentLeave(l)}
                                  className="mt-1 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] border border-indigo-200 transition cursor-pointer"
                                >
                                  <Paperclip className="w-3 h-3 text-indigo-500" />
                                  <span className="truncate max-w-[150px]">{l.attachmentName}</span>
                                </button>
                              )}
                              {l.reviewNotes && (
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                  Nota HR: {l.reviewNotes}
                                </p>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  l.status === 'Approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : l.status === 'Pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {l.status === 'Approved' ? 'Diluluskan' : l.status === 'Pending' ? 'Menunggu' : 'Ditolak'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 text-[11px]">
                              {l.status === 'Pending' ? (
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleReviewLeave(l.id, 'Approved')}
                                    className="text-emerald-700 font-bold hover:underline"
                                  >
                                    Luluskan
                                  </button>
                                  <span>•</span>
                                  <button
                                    onClick={() => handleReviewLeave(l.id, 'Rejected')}
                                    className="text-rose-600 font-bold hover:underline"
                                  >
                                    Tolak
                                  </button>
                                </div>
                              ) : (
                                <span>{l.reviewedBy ? `Oleh: ${l.reviewedBy.split(' ')[0]}` : '-'}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 5: PENGGAJIAN & STATUTORI (PAYROLL, EPF, SOCSO, EIS)
             ======================================================== */}
          {currentView === 'payroll' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900">
                    {lang === 'ms' ? 'Penggajian Bulanan & Perhitungan Statutori (EPF, SOCSO, EIS)' : 'Monthly Payroll & Statutory Integration (EPF, SOCSO, EIS)'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {lang === 'ms'
                      ? 'Integrasi automatik jam OT dari absensi, potongan cuti tanpa gaji & jadual statutori rasmi.'
                      : 'Automatic integration of overtime from attendance, unpaid leave deductions & statutory compliance.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600">Bulan:</span>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="text-xs border-0 bg-transparent font-mono font-bold text-indigo-700 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      exportPayrollStatutoryCSV(monthlyPayroll, employees, selectedMonth);
                      showToast(lang === 'ms' ? 'Fail CSV Penggajian Lengkap dimuat turun!' : 'Full Payroll CSV downloaded!');
                    }}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'ms' ? 'Muat Turun CSV Gaji & Statutori' : 'Export Full CSV'}</span>
                  </button>

                  <button
                    onClick={() => {
                      exportStatutoryComplianceCSV(monthlyPayroll, employees, selectedMonth);
                      showToast(lang === 'ms' ? 'Borang Caruman Berkanun CSV dimuat turun!' : 'Statutory CSV downloaded!');
                    }}
                    className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'ms' ? 'CSV Borang Statutori' : 'Statutory Compliance CSV'}</span>
                  </button>
                </div>
              </div>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold block">{lang === 'ms' ? 'Jumlah Gaji Kasar' : 'Gross Salary'}</span>
                  <span className="font-mono font-extrabold text-base text-slate-900 block mt-1">
                    RM {stats.totalGrossPayroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 shadow-sm">
                  <span className="text-[11px] text-indigo-600 font-semibold block">KWSP / EPF (Jumlah)</span>
                  <span className="font-mono font-extrabold text-base text-indigo-950 block mt-1">
                    RM {stats.totalEPF.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 shadow-sm">
                  <span className="text-[11px] text-emerald-700 font-semibold block">PERKESO / SOCSO</span>
                  <span className="font-mono font-extrabold text-base text-emerald-950 block mt-1">
                    RM {stats.totalSOCSO.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-cyan-50/60 p-4 rounded-xl border border-cyan-100 shadow-sm">
                  <span className="text-[11px] text-cyan-700 font-semibold block">SIP / EIS (0.2%+0.2%)</span>
                  <span className="font-mono font-extrabold text-base text-cyan-950 block mt-1">
                    RM {stats.totalEIS.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-4 rounded-xl text-white shadow-sm">
                  <span className="text-[11px] text-cyan-300 font-semibold block">{lang === 'ms' ? 'Gaji Bersih (Net Pay)' : 'Net Payable'}</span>
                  <span className="font-mono font-black text-base text-white block mt-1">
                    RM {stats.totalNetPayroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Comprehensive Payroll Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {lang === 'ms' ? `Senarai Penggajian bagi Bulan: ${selectedMonth}` : `Payroll List for Month: ${selectedMonth}`}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    * Semua pengiraan berlandaskan Akta Kerja 1955 & Akta Statutori Malaysia
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                        <th className="p-4">Karyawan</th>
                        <th className="p-4">Gaji Asas</th>
                        <th className="p-4">OT Pay</th>
                        <th className="p-4">Gaji Kasar</th>
                        <th className="p-4 text-rose-700">EPF (11%)</th>
                        <th className="p-4 text-rose-700">SOCSO</th>
                        <th className="p-4 text-rose-700">EIS (0.2%)</th>
                        <th className="p-4 font-bold text-emerald-700">Gaji Bersih</th>
                        <th className="p-4 text-indigo-700">Kos Majikan</th>
                        <th className="p-4 text-right">Slip Gaji</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {monthlyPayroll.map((pay) => {
                        const emp = employees.find((e) => e.id === pay.empId);
                        return (
                          <tr key={pay.id} className="hover:bg-slate-50/80 transition font-sans">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={emp?.avatar}
                                  alt={emp?.name}
                                  className="w-8 h-8 rounded-full object-cover shrink-0"
                                />
                                <div>
                                  <div className="flex items-center space-x-1.5">
                                    <p className="font-bold text-slate-900">{emp?.name}</p>
                                    <span className="text-[10px] font-mono text-slate-500 font-bold">({emp?.id})</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    {emp?.bankName === 'Lainnya' ? (emp?.customBankName || 'Bank Luar Negara') : emp?.bankName} • {emp?.bankAccount}
                                  </p>
                                  {emp?.isRemoteOverseas ? (
                                    <span className="inline-block mt-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                                      🌐 Remote ({emp?.workLocationCountry || 'Luar Malaysia'}) - 0% Statutori
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-slate-400">
                                      {emp?.company || 'Solusi Serumpun Senusantara SDN. BHD.'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="p-4 font-mono font-medium">
                              <div>
                                <span className="font-bold text-slate-900">RM {pay.basicSalary.toLocaleString()}</span>
                                {emp?.salaryCurrency && emp?.salaryCurrency !== 'MYR' && (
                                  <span className="block text-[10px] text-indigo-600 font-sans">
                                    {emp.salaryCurrency} {emp.originalSalaryAmount?.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-4 font-mono">
                              {pay.otPay > 0 ? (
                                <div>
                                  <span className="font-bold text-indigo-700">RM {pay.otPay.toFixed(2)}</span>
                                  <span className="text-[10px] text-slate-400 block font-sans">({pay.otHours}h)</span>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            <td className="p-4 font-mono font-bold text-slate-900">
                              RM {pay.grossSalary.toFixed(2)}
                            </td>

                            <td className="p-4 font-mono">
                              {pay.epfEmployee > 0 ? (
                                <span className="text-rose-600 font-medium">-RM {pay.epfEmployee.toFixed(2)}</span>
                              ) : (
                                <span className="text-emerald-700 font-semibold text-[11px]">RM 0.00 (Exempt)</span>
                              )}
                            </td>

                            <td className="p-4 font-mono">
                              {pay.socsoEmployee > 0 ? (
                                <span className="text-rose-600 font-medium">-RM {pay.socsoEmployee.toFixed(2)}</span>
                              ) : (
                                <span className="text-emerald-700 font-semibold text-[11px]">RM 0.00 (Exempt)</span>
                              )}
                            </td>

                            <td className="p-4 font-mono">
                              {pay.eisEmployee > 0 ? (
                                <span className="text-rose-600 font-medium">-RM {pay.eisEmployee.toFixed(2)}</span>
                              ) : (
                                <span className="text-emerald-700 font-semibold text-[11px]">RM 0.00 (Exempt)</span>
                              )}
                            </td>

                            <td className="p-4 font-mono font-extrabold text-emerald-600 text-sm">
                              RM {pay.netSalary.toFixed(2)}
                            </td>

                            <td className="p-4 font-mono text-indigo-900 font-semibold">
                              RM {pay.totalCompanyCost.toFixed(2)}
                            </td>

                            <td className="p-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedPayslip(pay);
                                  setIsPayslipModalOpen(true);
                                }}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                {lang === 'ms' ? 'Papar Slip' : 'Payslip'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 6: LAPORAN OTOMATIS (AUTOMATED HR REPORTS)
             ======================================================== */}
          {currentView === 'reports' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900">
                    {lang === 'ms' ? 'Laporan Analisis Automatik HR & Statutori' : 'Automated HR Analytics & Statutory Reports'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {lang === 'ms'
                      ? 'Laporan agregat automatik untuk audit kepatuhan, kecekapan operasi dan kos sumber manusia.'
                      : 'Automated executive reports for compliance audits, operational punctuality, and payroll costs.'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      exportPayrollStatutoryCSV(monthlyPayroll, employees, selectedMonth);
                      exportAttendanceCSV(attendance, employees, selectedDate);
                      exportLeavesCSV(leaves, employees);
                      showToast(lang === 'ms' ? 'Semua laporan CSV berjaya dieksport!' : 'All CSV reports exported!');
                    }}
                    className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'ms' ? 'Eksport Semua Laporan (CSV)' : 'Export All Reports (CSV)'}</span>
                  </button>
                </div>
              </div>

              {/* Analytics Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Attendance & Punctuality Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-sm text-slate-900">
                      {lang === 'ms' ? 'Analisis Kehadiran & Ketepatan Masa' : 'Attendance & Punctuality Distribution'}
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">{selectedDate}</span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Hadir Tepat Waktu (Present):</span>
                        <span className="text-emerald-700 font-bold">{stats.presentTodayCount} orang</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${(stats.presentTodayCount / stats.totalStaff) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Hadir Lewat (Late):</span>
                        <span className="text-amber-700 font-bold">{stats.lateTodayCount} orang</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all"
                          style={{ width: `${(stats.lateTodayCount / stats.totalStaff) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Cuti Diluluskan (On Leave):</span>
                        <span className="text-blue-700 font-bold">{stats.leaveTodayCount} orang</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: `${(stats.leaveTodayCount / stats.totalStaff) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Tidak Hadir / Alpa (Absent):</span>
                        <span className="text-rose-700 font-bold">{stats.absentCount} orang</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all"
                          style={{ width: `${(stats.absentCount / stats.totalStaff) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between text-xs">
                    <span className="text-slate-500">Kadar Kepatuhan Purata:</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      {Math.round(((stats.presentTodayCount + stats.lateTodayCount) / stats.totalStaff) * 100)}%
                    </span>
                  </div>
                </div>

                {/* 2. Statutory Contributions Proportion */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-sm text-slate-900">
                      {lang === 'ms' ? 'Pecahan Caruman Berkanun Malaysia' : 'Malaysian Statutory Cost Breakdown'}
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">{selectedMonth}</span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-slate-800">KWSP / EPF (Pekerja 11% + Majikan 12/13%)</span>
                        <span className="font-mono font-bold text-indigo-700">
                          RM {stats.totalEPF.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Kumpulan Wang Simpanan Pekerja Malaysia
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-slate-800">PERKESO / SOCSO (Kategori 1 Skim Bencana)</span>
                        <span className="font-mono font-bold text-emerald-700">
                          RM {stats.totalSOCSO.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Pertubuhan Keselamatan Sosial
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-slate-800">SIP / EIS (Sistem Insurans Pekerjaan 0.2%)</span>
                        <span className="font-mono font-bold text-cyan-700">
                          RM {stats.totalEIS.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Perlindungan kehilangan pekerjaan
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-900">
                    <span>Jumlah Caruman Statutori:</span>
                    <span className="font-mono text-indigo-950">
                      RM {(stats.totalEPF + stats.totalSOCSO + stats.totalEIS).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

              </div>

              {/* Department Distribution Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="font-bold text-sm text-slate-900">
                    {lang === 'ms' ? 'Ringkasan Kos Penggajian Mengikut Jabatan' : 'Payroll Cost by Department'}
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                        <th className="p-4">Jabatan (Department)</th>
                        <th className="p-4">Bil. Staf</th>
                        <th className="p-4">Jumlah Gaji Pokok</th>
                        <th className="p-4">Jumlah OT Pay</th>
                        <th className="p-4">Gaji Bersih Diterima</th>
                        <th className="p-4 font-bold text-indigo-900">Jumlah Kos Syarikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {[
                        'Human Resources',
                        'Administration',
                        'Finance & Accounts',
                        'Information Technology',
                        'Marketing',
                        'Operations',
                      ].map((dept) => {
                        const deptEmps = employees.filter((e) => e.department === dept);
                        const deptPayroll = monthlyPayroll.filter((p) =>
                          deptEmps.some((e) => e.id === p.empId)
                        );
                        if (deptEmps.length === 0) return null;

                        const totalBasic = deptPayroll.reduce((s, p) => s + p.basicSalary, 0);
                        const totalOT = deptPayroll.reduce((s, p) => s + p.otPay, 0);
                        const totalNet = deptPayroll.reduce((s, p) => s + p.netSalary, 0);
                        const totalCost = deptPayroll.reduce((s, p) => s + p.totalCompanyCost, 0);

                        return (
                          <tr key={dept} className="hover:bg-slate-50/70 font-sans">
                            <td className="p-4 font-bold text-slate-800">{dept}</td>
                            <td className="p-4 font-mono">{deptEmps.length}</td>
                            <td className="p-4 font-mono">RM {totalBasic.toLocaleString()}</td>
                            <td className="p-4 font-mono">RM {totalOT.toFixed(2)}</td>
                            <td className="p-4 font-mono font-bold text-emerald-600">RM {totalNet.toFixed(2)}</td>
                            <td className="p-4 font-mono font-bold text-indigo-900">RM {totalCost.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ========================================================
          MODALS & DRAWERS
         ======================================================== */}

      {/* 1. Payslip Modal */}
      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => {
          setIsPayslipModalOpen(false);
          setSelectedPayslip(null);
        }}
        payroll={selectedPayslip}
        employee={employees.find((e) => e.id === selectedPayslip?.empId) || null}
        lang={lang}
      />

      {/* 2. Employee Add / Edit Modal */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        employeeToEdit={editingEmployee}
        lang={lang}
      />

      {/* 3. Leave Request Application Modal */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={handleSubmitLeave}
        currentUser={currentUser}
        allEmployees={employees}
        lang={lang}
      />

      {/* 4. Clock In / Out Punch Modal */}
      <ClockInModal
        isOpen={isClockInModalOpen}
        onClose={() => setIsClockInModalOpen(false)}
        currentUser={currentUser}
        todayRecord={todayRecord}
        onPunchIn={handlePunchIn}
        onPunchOut={handlePunchOut}
        lang={lang}
      />

      {/* 5. Detailed Employee Full Biodata Modal (View Mode) */}
      {viewingEmployeeBiodata && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 relative">
              <button
                onClick={() => setViewingEmployeeBiodata(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-4">
                <img
                  src={viewingEmployeeBiodata.avatar}
                  alt={viewingEmployeeBiodata.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-cyan-400 shadow-md"
                />
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-800/80 px-2 py-0.5 rounded">
                    {viewingEmployeeBiodata.id}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">{viewingEmployeeBiodata.name}</h2>
                  <p className="text-xs text-indigo-300">{viewingEmployeeBiodata.role} • {viewingEmployeeBiodata.department}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">No. Kad Pengenalan (NRIC):</span>
                  <span className="font-mono font-bold text-slate-900">{viewingEmployeeBiodata.nric}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Jantina:</span>
                  <span className="font-semibold text-slate-900">{viewingEmployeeBiodata.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Emel Syarikat:</span>
                  <span className="text-slate-900">{viewingEmployeeBiodata.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">No. Telefon:</span>
                  <span className="font-mono text-slate-900">{viewingEmployeeBiodata.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Alamat Kediaman:</span>
                  <span className="text-slate-800">{viewingEmployeeBiodata.address || '-'}</span>
                </div>
              </div>

              {/* Statutory info */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <h4 className="font-bold text-indigo-950 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>Maklumat Statutori & Perbankan</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 text-[11px] block">No. KWSP / EPF:</span>
                    <span className="font-mono font-bold text-slate-900">{viewingEmployeeBiodata.epfNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">No. PERKESO / SOCSO:</span>
                    <span className="font-mono font-bold text-slate-900">{viewingEmployeeBiodata.socsoNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">No. Cukai LHDN:</span>
                    <span className="font-mono font-bold text-slate-900">{viewingEmployeeBiodata.taxNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Akaun Bank:</span>
                    <span className="font-mono font-bold text-slate-900">{viewingEmployeeBiodata.bankName} - {viewingEmployeeBiodata.bankAccount}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[11px] block">Waris / Kontak Kecemasan:</span>
                <p className="font-bold text-slate-900">
                  {viewingEmployeeBiodata.emergencyContactName} ({viewingEmployeeBiodata.emergencyContactRelation})
                </p>
                <p className="font-mono text-slate-600">{viewingEmployeeBiodata.emergencyContactPhone}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingEmployeeBiodata(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Document Viewer Modal for MC / Supporting Documents */}
      <DocumentViewerModal
        isOpen={Boolean(viewingAttachmentLeave)}
        onClose={() => setViewingAttachmentLeave(null)}
        leaveRequest={viewingAttachmentLeave}
        employee={employees.find((e) => e.id === viewingAttachmentLeave?.empId) || null}
        lang={lang}
      />

    </div>
  );
}
