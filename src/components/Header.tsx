import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  UserCheck, 
  Bell, 
  Clock, 
  LogOut, 
  ChevronDown,
  Sparkles,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { Employee, Language, isPrivilegedRole } from '../types';

interface HeaderProps {
  currentLang: Language;
  onToggleLang: () => void;
  currentUser: Employee;
  allEmployees: Employee[];
  onSelectUser: (user: Employee) => void;
  pendingLeavesCount: number;
  onNavigateToLeaves: () => void;
  onOpenClockIn: () => void;
  todayClockedIn: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onToggleLang,
  currentUser,
  allEmployees,
  onSelectUser,
  pendingLeavesCount,
  onNavigateToLeaves,
  onOpenClockIn,
  todayClockedIn,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isHR = isPrivilegedRole(currentUser);

  const formattedDate = currentTime.toLocaleDateString(
    currentLang === 'ms' ? 'ms-MY' : 'en-US',
    { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
  );
  const formattedTime = currentTime.toLocaleTimeString(
    currentLang === 'ms' ? 'ms-MY' : 'en-US',
    { hour: '2-digit', minute: '2-digit', second: '2-digit' }
  );

  return (
    <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-indigo-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-2 ring-indigo-400/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
                HR<span className="text-cyan-400">Pro</span> Enterprise
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                isHR 
                  ? 'bg-purple-500/30 text-purple-200 border-purple-400/30' 
                  : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
              }`}>
                {isHR ? (currentLang === 'ms' ? 'Akses Penuh: HR & Pengurusan' : 'Full Access: HR & Admin') : (currentLang === 'ms' ? 'Akses Karyawan (Data Sendiri)' : 'Employee Self-Service')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Solusi Serumpun Senusantara SDN. BHD. & Pustaka Union
            </p>
          </div>
        </div>

        {/* Center: Live Clock & Quick Punch Status */}
        <div className="hidden lg:flex items-center space-x-4 bg-slate-800/60 backdrop-blur px-4 py-1.5 rounded-xl border border-slate-700/60 text-xs">
          <div className="flex items-center space-x-1.5 text-indigo-300">
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-mono font-medium text-slate-200">{formattedDate}</span>
            <span className="font-mono font-bold text-white bg-slate-900/70 px-2 py-0.5 rounded border border-slate-700">
              {formattedTime}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700"></div>

          <button
            onClick={onOpenClockIn}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer ${
              todayClockedIn 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 ring-2 ring-indigo-400/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${todayClockedIn ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
            <span>{todayClockedIn ? (currentLang === 'ms' ? 'Telah Masuk Hari Ini' : 'Clocked In') : (currentLang === 'ms' ? 'Punch Masuk Sekarang' : 'Clock In Now')}</span>
          </button>
        </div>

        {/* Right Actions: Lang, Notifications, Switch User, Logout */}
        <div className="flex items-center space-x-3">
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            title={currentLang === 'ms' ? 'Tukar ke Bahasa Inggeris' : 'Switch to Bahasa Melayu'}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition text-slate-200 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentLang === 'ms' ? '🇲🇾 MS' : '🇬🇧 EN'}</span>
          </button>

          {/* Pending Leave Alerts Notification for HR/Manager */}
          {isHR && (
            <button
              onClick={onNavigateToLeaves}
              title={currentLang === 'ms' ? `${pendingLeavesCount} Cuti Memerlukan Kelulusan` : `${pendingLeavesCount} Pending Leave Approvals`}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {pendingLeavesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-lg animate-pulse">
                  {pendingLeavesCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500"
              />
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold leading-tight text-white max-w-[130px] truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-cyan-300 leading-tight">
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2.5 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Tahap Akses:</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      isHR ? 'bg-purple-900/60 text-purple-200' : 'bg-emerald-900/60 text-emerald-200'
                    }`}>
                      {isHR ? 'Akses Penuh (HR & Direktur)' : 'Akses Karyawan (Data Sendiri)'}
                    </span>
                  </div>
                </div>

                {/* If HR/Director, can switch test personas */}
                {isHR ? (
                  <>
                    <div className="px-3 py-1.5 pt-2">
                      <p className="text-[11px] font-medium text-slate-400">
                        {currentLang === 'ms' ? 'Tukar Pengguna (Uji Peranan)' : 'Switch User (Test Roles)'}:
                      </p>
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {allEmployees.map((emp) => {
                        const isSelected = emp.id === currentUser.id;
                        return (
                          <button
                            key={emp.id}
                            onClick={() => {
                              onSelectUser(emp);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left text-xs transition cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white font-medium'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{emp.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{emp.role}</p>
                            </div>
                            {isSelected && <UserCheck className="w-4 h-4 text-cyan-300" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="p-3 text-[11px] text-slate-400">
                    <p>
                      {currentLang === 'ms'
                        ? '🛡️ Akaun anda disahkan sebagai Karyawan Biasa. Mengikut dasar syarikat, anda hanya boleh melihat rekod biodata, absensi, cuti dan slip gaji milik anda sendiri.'
                        : '🛡️ Your account is authenticated as Staff. You can only view your own biodata, attendance, leaves, and payslips.'}
                    </p>
                  </div>
                )}

                {/* Sign Out Action */}
                <div className="pt-2 mt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{currentLang === 'ms' ? 'Log Keluar dari Sistem' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prominent Quick Logout Button */}
          <button
            onClick={onLogout}
            title={currentLang === 'ms' ? 'Log Keluar' : 'Sign Out'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 border border-slate-700 text-slate-400 hover:text-rose-300 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>
      </div>
    </header>
  );
};
