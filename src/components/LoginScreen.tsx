import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  LogIn, 
  AlertCircle,
  Briefcase,
  BookOpen
} from 'lucide-react';
import { Employee, Language } from '../types';

interface LoginScreenProps {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
  lang: Language;
  onToggleLang: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  employees,
  onLogin,
  lang,
  onToggleLang,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      const user = employees.find(
        (emp) => emp.email.toLowerCase() === trimmedEmail
      );

      if (!user) {
        setErrorMsg(
          lang === 'ms'
            ? 'Emel tidak dijumpai dalam pangkalan data biodata.'
            : 'Email address not found in employee records.'
        );
        setIsLoading(false);
        return;
      }

      // Check password (fallback to 'password123' if undefined)
      const expectedPassword = user.password || 'password123';
      if (password !== expectedPassword) {
        setErrorMsg(
          lang === 'ms'
            ? 'Kata laluan tidak sah. Sila semak semula.'
            : 'Invalid password. Please try again.'
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLogin(user);
    }, 400);
  };

  const handleQuickLogin = (empId: string) => {
    const user = employees.find((e) => e.id === empId);
    if (user) {
      setEmail(user.email);
      setPassword(user.password || 'password123');
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Brand Badges */}
      <div className="text-center mb-6 max-w-md w-full">
        <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-cyan-300 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Sistem Portal Keselamatan HR & Penggajian</span>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            HR<span className="text-cyan-400">Pro</span> Enterprise
          </span>
        </div>

        {/* Dual Company Branding Sub-banner */}
        <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-300">
          <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            Solusi Serumpun Senusantara SDN. BHD.
          </span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            Pustaka Union
          </span>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Card Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 text-center">
          <h2 className="text-lg font-extrabold text-slate-900">
            {lang === 'ms' ? 'Log Masuk Pengguna' : 'Employee Login'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ms'
              ? 'Sila masukkan emel & kata laluan yang didaftarkan dalam biodata.'
              : 'Enter registered employee email and password.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'ms' ? 'Alamat Emel Rasmi' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@company.com"
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'ms' ? 'Kata Laluan' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Mengesahkan...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{lang === 'ms' ? 'MASUK KE PORTAL' : 'LOG IN TO PORTAL'}</span>
              </>
            )}
          </button>

          {/* Access Control Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">
              🔒 {lang === 'ms' ? 'Kawalan Keselamatan Akses Peranan:' : 'Role-Based Access Notice:'}
            </p>
            <p>
              • <strong>HRD & Direktur / Manager</strong>: Akses penuh semua modul (biodata semua staf, kelulusan cuti, penggajian, statutori EPF/SOCSO/EIS).
            </p>
            <p>
              • <strong>Karyawan Biasa</strong>: Hanya boleh melihat & mengurus data diri sendiri (absensi sendiri, kuota cuti sendiri, dan slip gaji sendiri).
            </p>
          </div>

          {/* Quick Login / Demo Accounts */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              {lang === 'ms' ? '⚡ Log Masuk Pantas (Demo Test)' : '⚡ Quick Demo Login'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('EMP001')}
                className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left transition cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <strong className="text-[11px] text-indigo-950 block truncate">Siti Nurhidayah</strong>
                </div>
                <span className="text-[10px] text-indigo-700 block">HR Manager (Akses Penuh)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('EMP000')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <strong className="text-[11px] text-purple-950 block truncate">Datuk Roslan</strong>
                </div>
                <span className="text-[10px] text-purple-700 block">Direktur (Akses Penuh)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('EMP002')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left transition cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <strong className="text-[11px] text-slate-900 block truncate">Ahmad Zulkifli</strong>
                </div>
                <span className="text-[10px] text-slate-600 block">Staf (Akses Sendiri Sahaja)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('EMP003')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left transition cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <strong className="text-[11px] text-slate-900 block truncate">Nurul Huda</strong>
                </div>
                <span className="text-[10px] text-slate-600 block">Staf (Pustaka Union)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('EMP007')}
                className="col-span-2 p-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-left transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <strong className="text-[11px] text-teal-950 block truncate">Budi Prasetyo (Remote Luar Malaysia)</strong>
                  </div>
                  <span className="text-[10px] bg-teal-600 text-white font-bold px-1.5 py-0.2 rounded">
                    IDR / Bank BCA / 0% Statutori
                  </span>
                </div>
                <span className="text-[10px] text-teal-700 block mt-0.5">
                  Gaji Rp 22 Juta → Diselaraskan ke RM 6,160.00 (Dikecualikan EPF/SOCSO/EIS)
                </span>
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Language Switch Footer */}
      <div className="mt-4 flex items-center space-x-3 text-xs text-slate-400">
        <button
          onClick={onToggleLang}
          className="hover:text-slate-200 underline cursor-pointer"
        >
          {lang === 'ms' ? 'Tukar ke Bahasa Inggeris (English)' : 'Tukar ke Bahasa Melayu'}
        </button>
        <span>•</span>
        <span>© 2026 Enterprise HR Management System</span>
      </div>

    </div>
  );
};
