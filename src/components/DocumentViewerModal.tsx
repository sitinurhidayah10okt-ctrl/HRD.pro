import React from 'react';
import { X, FileText, Download, FileCheck, Image as ImageIcon, ExternalLink, ShieldCheck, Stethoscope } from 'lucide-react';
import { LeaveRequest, Employee, Language } from '../types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequest | null;
  employee: Employee | null;
  lang: Language;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  leaveRequest,
  employee,
  lang,
}) => {
  if (!isOpen || !leaveRequest) return null;

  const isMedical = leaveRequest.type === 'Medical Leave';
  const hasAttachment = Boolean(leaveRequest.attachmentName);
  const isImage = leaveRequest.attachmentType === 'image' || Boolean(leaveRequest.attachmentUrl?.startsWith('data:image'));

  const handleDownloadAttachment = () => {
    if (leaveRequest.attachmentUrl) {
      const link = document.createElement('a');
      link.href = leaveRequest.attachmentUrl;
      link.download = leaveRequest.attachmentName || 'Dokumen_Sokongan_Cuti';
      link.click();
    } else {
      // Mock download for demo initial data
      const sampleText = `
======================================================
     KLINIK MEDIVIRON & SURGERI PANEL SYARIKAT
  SIJIL CUTI SAKIT RASMI / MEDICAL CERTIFICATE (MC)
======================================================
No. Rujukan MC    : MC-2026-MED-99482
Nama Pesakit      : ${employee?.name || 'Karyawan'}
No. Kad Pengenalan: ${employee?.nric || '-'}
Tarikh Rawatan    : ${leaveRequest.startDate}
Diagnosis Ringkas : Demam Panas (Fever) & Jangkitan Saluran Pernafasan
Tempoh Cuti Sakit : 1 Hari (${leaveRequest.startDate})
Doktor Bertugas   : Dr. Tan Wei Meng (MBBS Malaya, MMC 48291)
Status Pengesahan : SAH & DILULUSKAN PANEL
======================================================
      `;
      const blob = new Blob([sampleText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = leaveRequest.attachmentName || 'Sijil_Cuti_Sakit_MC.txt';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-cyan-400 border border-indigo-400/30">
              {isMedical ? <Stethoscope className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {isMedical 
                  ? (lang === 'ms' ? 'Pemeriksa Sijil Cuti Sakit (MC)' : 'Medical Certificate (MC) Viewer')
                  : (lang === 'ms' ? 'Lampiran Dokumen Sokongan Cuti' : 'Supporting Leave Document')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {employee?.name} ({employee?.id}) • {leaveRequest.type}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* File Card Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow">
                {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate max-w-[280px]">
                  {leaveRequest.attachmentName || (lang === 'ms' ? 'Sijil_MC_Klinik.pdf' : 'Medical_Cert.pdf')}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {leaveRequest.attachmentSize || '340 KB'} • Status Dokumen: <span className="text-emerald-600 font-bold">Sah (Verified)</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadAttachment}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ms' ? 'Muat Turun' : 'Download'}</span>
            </button>
          </div>

          {/* Visual Preview Container */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900/5 p-4 flex flex-col items-center justify-center min-h-[220px]">
            {isImage && leaveRequest.attachmentUrl ? (
              <img
                src={leaveRequest.attachmentUrl}
                alt="Uploaded Supporting Document"
                className="max-h-80 w-auto rounded-xl object-contain shadow-sm border border-slate-200 bg-white"
              />
            ) : isMedical ? (
              /* Simulated Official Clinic MC Certificate Card */
              <div className="w-full bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm text-xs font-sans text-slate-800 space-y-2.5">
                <div className="border-b-2 border-indigo-900 pb-2 flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-indigo-950 text-sm tracking-tight">KLINIK MEDIVIRON (PANEL SYARIKAT)</h4>
                    <p className="text-[10px] text-slate-500">24 Jam • Cawangan Cyberjaya Central</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    ✓ DISAHKAN PANEL
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block">Nama Pesakit:</span>
                    <strong className="text-slate-900">{employee?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">No. IC Pesakit:</span>
                    <strong className="font-mono text-slate-900">{employee?.nric}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tarikh Rawatan:</span>
                    <strong className="font-mono text-slate-900">{leaveRequest.startDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tempoh Rehat:</span>
                    <strong className="text-indigo-900">{leaveRequest.daysCount} Hari ({leaveRequest.startDate})</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Alasan Klinikal / Catatan:</span>
                  <p className="italic text-slate-700 mt-0.5">"{leaveRequest.reason}"</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Ditandatangani oleh Dr. Tan Wei Meng (MMC 48291)</span>
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
            ) : (
              /* Non-medical supporting document preview card */
              <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 w-full">
                <FileText className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-bold text-xs text-slate-800">{leaveRequest.attachmentName}</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  {lang === 'ms' 
                    ? 'Dokumen lampiran sokongan rasmi telah dimuat naik bersama permohonan cuti.' 
                    : 'Supporting document uploaded with the leave application.'}
                </p>
                <button
                  onClick={handleDownloadAttachment}
                  className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'ms' ? 'Buka / Muat Turun Fail' : 'Open / Download File'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
            <span>Ref ID: {leaveRequest.id}</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
            >
              {lang === 'ms' ? 'Tutup' : 'Close'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
