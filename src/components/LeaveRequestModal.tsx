import React, { useState, useRef } from 'react';
import { 
  X, 
  Calendar, 
  Send, 
  AlertCircle, 
  Paperclip, 
  UploadCloud, 
  FileCheck, 
  Trash2, 
  FileText, 
  Image as ImageIcon 
} from 'lucide-react';
import { Employee, LeaveRequest, LeaveType, Language } from '../types';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: LeaveRequest) => void;
  currentUser: Employee;
  allEmployees: Employee[];
  lang: Language;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  allEmployees,
  lang,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(currentUser.id);
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual Leave');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');

  // File Attachment State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: 'image' | 'pdf' | 'document';
    dataUrl?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const targetEmp = allEmployees.find((e) => e.id === selectedEmpId) || currentUser;

  // Calculate days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const daysCount = isHalfDay ? 0.5 : diffDays;

  // Check remaining quota
  const getRemainingQuota = (type: LeaveType) => {
    const bal = targetEmp.leaveBalance;
    if (type === 'Annual Leave') return bal.annual - bal.annualTaken;
    if (type === 'Medical Leave') return bal.medical - bal.medicalTaken;
    if (type === 'Emergency Leave') return bal.emergency - bal.emergencyTaken;
    if (type === 'Maternity/Paternity Leave') return bal.maternity - bal.maternityTaken;
    return 99; // Unpaid leave has no fixed quota
  };

  const remaining = getRemainingQuota(leaveType);
  const isOverQuota = leaveType !== 'Unpaid Leave' && daysCount > remaining;

  // File Upload Handlers
  const handleProcessFile = (file: File) => {
    if (!file) return;

    // Format size
    const sizeInKb = file.size / 1024;
    const formattedSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${Math.round(sizeInKb)} KB`;
    
    let docType: 'image' | 'pdf' | 'document' = 'document';
    if (file.type.startsWith('image/')) docType = 'image';
    else if (file.type === 'application/pdf') docType = 'pdf';

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        size: formattedSize,
        type: docType,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert(lang === 'ms' ? 'Sila masukkan sebab permohonan cuti.' : 'Please enter the reason for leave.');
      return;
    }

    if (start > end) {
      alert(lang === 'ms' ? 'Tarikh tamat tidak boleh sebelum tarikh mula.' : 'End date cannot be earlier than start date.');
      return;
    }

    const newRequest: LeaveRequest = {
      id: `LV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      empId: targetEmp.id,
      type: leaveType,
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      daysCount,
      isHalfDay,
      reason,
      attachmentName: attachedFile?.name,
      attachmentUrl: attachedFile?.dataUrl,
      attachmentSize: attachedFile?.size,
      attachmentType: attachedFile?.type,
      status: 'Pending',
      appliedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    onSubmit(newRequest);
    onClose();
  };

  const isHR = currentUser.department === 'Human Resources' || currentUser.role.toLowerCase().includes('manager');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-base">
                {lang === 'ms' ? 'Borang Permohonan Cuti Karyawan' : 'Employee Leave Application'}
              </h2>
              <p className="text-xs text-indigo-200">
                {lang === 'ms' ? 'Kelulusan terus secara masa-nyata oleh Pengurus / HRD' : 'Real-time approval workflow by Manager / HR'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-indigo-700 text-indigo-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Employee Selector (If HR, can apply on behalf of any staff) */}
          {isHR ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ms' ? 'Pilih Pekerja (Kakitangan)' : 'Select Employee'}
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {allEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.id} - {e.department})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-slate-500">{currentUser.role} • {currentUser.department}</p>
              </div>
            </div>
          )}

          {/* Leave Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ms' ? 'Jenis Cuti (Leave Type) *' : 'Leave Type *'}
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
            >
              <option value="Annual Leave">{lang === 'ms' ? 'Cuti Tahunan (Annual Leave)' : 'Annual Leave'}</option>
              <option value="Medical Leave">{lang === 'ms' ? 'Cuti Sakit / Sijil MC (Medical Leave)' : 'Medical Leave'}</option>
              <option value="Emergency Leave">{lang === 'ms' ? 'Cuti Kecemasan (Emergency Leave)' : 'Emergency Leave'}</option>
              <option value="Unpaid Leave">{lang === 'ms' ? 'Cuti Tanpa Gaji (Unpaid Leave - Potong Gaji Pokok)' : 'Unpaid Leave'}</option>
              <option value="Maternity/Paternity Leave">{lang === 'ms' ? 'Cuti Bersalin / Paterniti' : 'Maternity / Paternity Leave'}</option>
            </select>
          </div>

          {/* Live Remaining Quota Banner */}
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            isOverQuota 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
          }`}>
            <div>
              <span className="font-semibold block">
                {lang === 'ms' ? 'Baki Kuota Semasa:' : 'Current Remaining Quota:'}
              </span>
              <span className="text-[11px] text-slate-500">
                {leaveType === 'Unpaid Leave' 
                  ? (lang === 'ms' ? 'Tiada had kuota (Akan ditolak dalam penggajian bulanan)' : 'No quota limit (will deduct from monthly salary)') 
                  : `${remaining} ${lang === 'ms' ? 'hari lagi boleh dipohon' : 'days available'}`}
              </span>
            </div>
            <span className="font-mono font-black text-lg">
              {leaveType === 'Unpaid Leave' ? '∞' : `${remaining} Hari`}
            </span>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ms' ? 'Tarikh Mula (Start Date)' : 'Start Date'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value > endDate) setEndDate(e.target.value);
                }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ms' ? 'Tarikh Tamat (End Date)' : 'End Date'}
              </label>
              <input
                type="date"
                value={endDate}
                disabled={isHalfDay}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 ${
                  isHalfDay ? 'bg-slate-100 text-slate-400' : ''
                }`}
                required
              />
            </div>
          </div>

          {/* Half day toggle & Total Days Calculation */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isHalfDay}
                onChange={(e) => setIsHalfDay(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="font-medium text-slate-700">
                {lang === 'ms' ? 'Cuti Separuh Hari (0.5 Hari)' : 'Half Day Leave (0.5 Day)'}
              </span>
            </label>

            <div className="text-right">
              <span className="text-slate-500 text-[11px] block">{lang === 'ms' ? 'Jumlah Hari Cuti:' : 'Total Days:'}</span>
              <span className="font-mono font-bold text-indigo-700 text-sm">{daysCount} Hari</span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ms' ? 'Sebab & Alasan Permohonan Cuti *' : 'Reason for Leave Application *'}
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder={lang === 'ms' ? 'Sila nyatakan sebab lengkap (cth: Urusan keluarga, MC Klinik, dsb)...' : 'State detailed reason...'}
              required
            />
          </div>

          {/* ========================================================
              NEW: FILE ATTACHMENT FIELD (SIJIL SAKIT / MEDICAL CERT / DOKUMEN SOKONGAN)
             ======================================================== */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {lang === 'ms' ? 'Lampiran Dokumen Sokongan / Sijil Sakit (MC)' : 'Supporting Document / Medical Certificate (MC)'}
                </span>
              </label>
              <span className="text-[10px] text-slate-400">
                {leaveType === 'Medical Leave' 
                  ? (lang === 'ms' ? 'Disyorkan untuk Cuti Sakit' : 'Recommended for Medical Leave') 
                  : (lang === 'ms' ? 'Pilihan (Optional)' : 'Optional')}
              </span>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Display when file attached */}
            {attachedFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    {attachedFile.type === 'image' ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[240px]">
                      {attachedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {attachedFile.size} • <span className="uppercase">{attachedFile.type}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {attachedFile.type === 'image' && attachedFile.dataUrl && (
                    <img
                      src={attachedFile.dataUrl}
                      alt="Thumbnail preview"
                      className="w-8 h-8 rounded object-cover border border-indigo-300"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                    title={lang === 'ms' ? 'Padam Lampiran' : 'Remove Attachment'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Drag and Drop Upload Area */
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/70 scale-[0.99]'
                    : leaveType === 'Medical Leave'
                    ? 'border-indigo-300 bg-indigo-50/30 hover:border-indigo-500 hover:bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                <UploadCloud className="w-6 h-6 text-indigo-600 mx-auto mb-1 animate-pulse" />
                <p className="text-xs font-semibold text-slate-700">
                  {lang === 'ms'
                    ? 'Klik untuk muat naik atau seret & lepas fail di sini'
                    : 'Click to upload or drag & drop file here'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  PDF, PNG, JPG atau Dokumen (Maks. 5MB) • Cth: Sijil Cuti Sakit (MC) Klinik
                </p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {lang === 'ms' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === 'ms' ? 'Hantar Permohonan' : 'Submit Leave Request'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
