import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Camera, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Employee, AttendanceRecord, Language } from '../types';

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Employee;
  todayRecord: AttendanceRecord | undefined;
  onPunchIn: (record: AttendanceRecord) => void;
  onPunchOut: (recordId: string, clockOutTime: string, notes: string) => void;
  lang: Language;
}

export const ClockInModal: React.FC<ClockInModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  todayRecord,
  onPunchIn,
  onPunchOut,
  lang,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationName, setLocationName] = useState('HQ Cyberjaya Tower A - Level 8 (Radius: 15m)');
  const [notes, setNotes] = useState('');
  const [simulatedSelfie, setSimulatedSelfie] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  const currentTimeStr = `${hours}:${minutes}`;

  const isClockedIn = todayRecord && todayRecord.clockIn !== '--:--';
  const isClockedOut = todayRecord && todayRecord.clockOut !== '--:--';

  const handlePunchIn = () => {
    // Check if late (after 08:30)
    const isLate = currentTime.getHours() > 8 || (currentTime.getHours() === 8 && currentTime.getMinutes() > 30);
    const status = isLate ? 'Late' : 'Present';

    const newRecord: AttendanceRecord = {
      id: `ATT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${currentUser.id}`,
      empId: currentUser.id,
      date: new Date().toISOString().slice(0, 10),
      clockIn: currentTimeStr,
      clockOut: '--:--',
      status,
      workHours: 0,
      otHours: 0,
      notes: notes || (isLate ? 'Masuk lewat sedikit' : 'Masuk kerja tepat waktu'),
      location: locationName,
      verificationMethod: 'GPS & Photo',
    };

    onPunchIn(newRecord);
    onClose();
  };

  const handlePunchOut = () => {
    if (!todayRecord) return;
    onPunchOut(todayRecord.id, currentTimeStr, notes || todayRecord.notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-400 shadow-md"
            />
            <div>
              <h2 className="font-bold text-base text-white">{currentUser.name}</h2>
              <p className="text-xs text-indigo-300">{currentUser.role} • {currentUser.id}</p>
            </div>
          </div>

          {/* Big Live Digital Clock */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              {currentTime.toLocaleDateString(lang === 'ms' ? 'ms-MY' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <div className="font-mono font-extrabold text-4xl text-cyan-300 tracking-wider">
              {hours}:{minutes}:<span className="text-2xl text-slate-400">{seconds}</span>
            </div>
          </div>
        </div>

        {/* Punch Status & Details */}
        <div className="p-6 space-y-4">
          
          {/* Current Punch State Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-slate-500 font-medium">Status Hari Ini:</span>
              {isClockedOut ? (
                <span className="bg-slate-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">
                  {lang === 'ms' ? 'Selesai Bertugas (Clocked Out)' : 'Shift Completed'}
                </span>
              ) : isClockedIn ? (
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {lang === 'ms' ? 'Sedang Bertugas' : 'Currently On Duty'}
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                  {lang === 'ms' ? 'Belum Punch Masuk' : 'Not Clocked In'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">{lang === 'ms' ? 'Waktu Masuk' : 'Clock In'}</span>
                <span className="font-mono font-bold text-sm text-slate-800">
                  {todayRecord?.clockIn || '--:--'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">{lang === 'ms' ? 'Waktu Keluar' : 'Clock Out'}</span>
                <span className="font-mono font-bold text-sm text-slate-800">
                  {todayRecord?.clockOut || '--:--'}
                </span>
              </div>
            </div>
          </div>

          {/* GPS Location & Geofence Indicator */}
          <div className="flex items-start space-x-2 text-xs text-slate-600 bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-emerald-950 block">
                {lang === 'ms' ? 'Geolokasi Sah Pejabat (Dalam Radius)' : 'GPS Geolocation Verified (Within Radius)'}
              </span>
              <span className="text-[11px] text-emerald-800">{locationName}</span>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          {/* Selfie Snapshot Simulation */}
          <div className="flex items-center justify-between text-xs px-2">
            <div className="flex items-center space-x-2 text-slate-600">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>{lang === 'ms' ? 'Pengecaman Wajah / Swafoto' : 'Facial Recognition Selfie'}</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ✓ {lang === 'ms' ? 'Disahkan' : 'Verified'}
            </span>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ms' ? 'Catatan / Tugasan Hari Ini (Pilihan)' : 'Work Notes / Tasks (Optional)'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === 'ms' ? 'Contoh: Masuk awal untuk deployment...' : 'e.g., Working on client presentation...'}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            {!isClockedIn ? (
              <button
                type="button"
                onClick={handlePunchIn}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>{lang === 'ms' ? 'SAHKAN MASUK KERJA (CLOCK IN)' : 'CONFIRM CLOCK IN'}</span>
              </button>
            ) : !isClockedOut ? (
              <button
                type="button"
                onClick={handlePunchOut}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>{lang === 'ms' ? 'SAHKAN KELUAR KERJA (CLOCK OUT)' : 'CONFIRM CLOCK OUT'}</span>
              </button>
            ) : (
              <div className="text-center py-2 text-xs text-slate-500 font-medium">
                {lang === 'ms' ? 'Anda telah merekodkan kehadiran lengkap hari ini.' : 'You have completed attendance for today.'}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
