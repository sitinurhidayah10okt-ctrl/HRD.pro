import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  Building2, 
  BookOpen, 
  FileDown, 
  Loader2 
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Employee, PayrollRecord, Language, CompanyType } from '../types';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: PayrollRecord | null;
  employee: Employee | null;
  lang: Language;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  payroll,
  employee,
  lang,
}) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyType>(
    employee?.company || 'Solusi Serumpun Senusantara SDN. BHD.'
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !payroll || !employee) return null;

  const companyDetails = {
    'Solusi Serumpun Senusantara SDN. BHD.': {
      name: 'SOLUSI SERUMPUN SENUSANTARA',
      suffix: 'SDN. BHD.',
      regNo: '202001029412 (1385732-K)',
      address: 'Aras 12, Menara Serumpun, Jalan Tun Razak, 50400 Kuala Lumpur, Malaysia',
      email: 'hr@solusiserumpun.com.my',
      phone: '+60 3-2181 9000',
      tagline: 'Penyedia Perkhidmatan Teknologi Maklumat & Pengurusan Modal Insan Serantau',
      themeColor: 'indigo',
    },
    'Pustaka Union': {
      name: 'PUSTAKA UNION',
      suffix: 'ENTERPRISE',
      regNo: '201803102981 (002819402-M)',
      address: 'No. 18 & 20, Jalan Union 2, Kawasan Perindustrian Union, 40150 Shah Alam, Selangor, Malaysia',
      email: 'kewangan@pustakaunion.com.my',
      phone: '+60 3-5519 4400',
      tagline: 'Penerbitan Pendidikan, Percetakan Komersial & Pengedaran Buku Berkanun',
      themeColor: 'emerald',
    },
  }[selectedCompany];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const payslipEl = document.getElementById('printable-payslip');
    if (!payslipEl) return;

    try {
      setIsGeneratingPdf(true);

      const canvas = await html2canvas(payslipEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const companySlug = selectedCompany.includes('Pustaka') ? 'Pustaka_Union' : 'Solusi_Serumpun_Senusantara';
      const safeEmpName = employee.name.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Slip_Gaji_${companySlug}_${safeEmpName}_${payroll.month}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal menjana fail PDF secara automatik. Sila gunakan butang Cetak (Print to PDF).');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-base text-white">
                {lang === 'ms' ? 'Penyata Slip Gaji Rasmi' : 'Official Payslip Advice'}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'ms' ? 'Pilih entiti syarikat dan muat turun terus fail PDF' : 'Select company entity and download PDF directly'}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Direct Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menjana PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{lang === 'ms' ? 'Muat Turun PDF' : 'Download PDF'}</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'ms' ? 'Cetak' : 'Print'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Company Letterhead Switcher (Hidden in Print) */}
        <div className="no-print bg-slate-100 p-3 px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-700">
            {lang === 'ms' ? 'Pilihan Entiti Syarikat (Company Letterhead):' : 'Select Company Entity:'}
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSelectedCompany('Solusi Serumpun Senusantara SDN. BHD.')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCompany === 'Solusi Serumpun Senusantara SDN. BHD.'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Solusi Serumpun Senusantara SDN. BHD.</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCompany('Pustaka Union')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCompany === 'Pustaka Union'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pustaka Union</span>
            </button>
          </div>
        </div>

        {/* Printable & Exportable Payslip Body */}
        <div id="printable-payslip" className="p-8 bg-white text-slate-800">
          
          {/* Dynamic Company Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {companyDetails.name}
                </span>
                <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-300">
                  {companyDetails.suffix}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                No. Pendaftaran Syarikat (SSM): <strong>{companyDetails.regNo}</strong>
              </p>
              <p className="text-xs text-slate-500 max-w-md">
                {companyDetails.address}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Emel: {companyDetails.email} • Tel: {companyDetails.phone}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {lang === 'ms' ? 'SLIP GAJI BULANAN' : 'MONTHLY PAYSLIP'}
              </span>
              <span className="text-xl font-extrabold text-indigo-900 font-mono">
                {payroll.month}
              </span>
              <div className="mt-1 flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  {payroll.paymentStatus === 'Paid' ? (lang === 'ms' ? 'TELAH DIKREDITKAN' : 'PAID') : (lang === 'ms' ? 'DALAM PROSES' : 'PROCESSING')}
                </span>
                {(employee.isRemoteOverseas || payroll.isRemoteOverseas) && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-300">
                    REMOTE LUAR NEGARA (EXEMPT)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Remote Overseas Statutory Exemption Notice Banner */}
          {(employee.isRemoteOverseas || payroll.isRemoteOverseas) && (
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">🌐</span>
                <div>
                  <span className="font-bold block">Status: Karyawan Remote Luar Malaysia ({employee.workLocationCountry || 'Overseas'})</span>
                  <span className="text-[11px] text-teal-700">Dikecualikan sepenuhnya mengikut perundangan daripada caruman berkanun Malaysia (KWSP 0%, PERKESO 0%, EIS 0%).</span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white text-teal-800 border border-teal-300 px-2 py-1 rounded-md">
                Pengecualian Statutori Sah
              </span>
            </div>
          )}

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-6">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">{lang === 'ms' ? 'Nama Karyawan' : 'Employee Name'}:</span>
                <span className="font-bold text-slate-900">{employee.name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">ID Karyawan:</span>
                <span className="font-mono font-bold text-indigo-700">{employee.id}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">No. IC / Passport:</span>
                <span className="font-mono text-slate-800">{employee.nric}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">{lang === 'ms' ? 'Jawatan' : 'Designation'}:</span>
                <span className="text-slate-800 font-semibold">{employee.role}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">{lang === 'ms' ? 'Jabatan' : 'Department'}:</span>
                <span className="text-slate-800">{employee.department}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-l border-slate-200 pl-4">
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">No. KWSP / EPF:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {employee.isRemoteOverseas ? 'Dikecualikan (Remote)' : employee.epfNumber}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">No. PERKESO / SOCSO:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {employee.isRemoteOverseas ? 'Dikecualikan (Remote)' : employee.socsoNumber}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">No. Cukai (Tax):</span>
                <span className="font-mono font-semibold text-slate-800">{employee.taxNumber}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Akaun Bank:</span>
                <span className="text-slate-800 font-bold">
                  {employee.bankName === 'Lainnya' ? (employee.customBankName || 'Bank Lainnya') : employee.bankName} - {employee.bankAccount}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">{lang === 'ms' ? 'Majikan Berdaftar' : 'Employer'}:</span>
                <span className="text-slate-800 font-medium">{selectedCompany}</span>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Comparison Columns */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 font-bold text-xs text-indigo-900 flex justify-between">
                <span>{lang === 'ms' ? 'PENDAPATAN (EARNINGS)' : 'EARNINGS'}</span>
                <span>RM</span>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <div>
                    <span className="text-slate-600 block">{lang === 'ms' ? 'Gaji Asas / Pokok' : 'Basic Salary'}</span>
                    {employee.salaryCurrency && employee.salaryCurrency !== 'MYR' && employee.originalSalaryAmount && (
                      <span className="text-[10px] text-indigo-600 font-medium block">
                        Asal: {employee.salaryCurrency} {employee.originalSalaryAmount.toLocaleString()} @ RM {employee.exchangeRateToMYR}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-semibold">{payroll.basicSalary.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">{lang === 'ms' ? 'Elaun Tetap' : 'Fixed Allowance'}</span>
                  <span className="font-mono font-semibold">{payroll.allowance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <div>
                    <span className="text-slate-600 block">{lang === 'ms' ? 'Kerja Lebih Masa (OT)' : 'Overtime Pay'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {payroll.otHours} jam @ RM {payroll.hourlyRate.toFixed(2)}/j x 1.5
                    </span>
                  </div>
                  <span className="font-mono font-semibold">{payroll.otPay.toFixed(2)}</span>
                </div>
                {payroll.bonus > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">{lang === 'ms' ? 'Bonus / Insentif' : 'Bonus'}</span>
                    <span className="font-mono font-semibold">{payroll.bonus.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 font-bold text-slate-900 border-t border-slate-200">
                  <span>{lang === 'ms' ? 'JUMLAH PENDAPATAN KASAR' : 'TOTAL GROSS'}</span>
                  <span className="font-mono text-indigo-900">RM {payroll.grossSalary.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50 px-4 py-2 border-b border-rose-100 font-bold text-xs text-rose-900 flex justify-between">
                <span>{lang === 'ms' ? 'POTONGAN (DEDUCTIONS)' : 'DEDUCTIONS'}</span>
                <span>RM</span>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <div>
                    <span className="text-slate-600 block">KWSP / EPF Pekerja</span>
                    {(employee.isRemoteOverseas || payroll.isRemoteOverseas) && (
                      <span className="text-[10px] text-teal-600 font-semibold block">Dikecualikan (Remote Luar Negara)</span>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-rose-600">
                    {payroll.epfEmployee > 0 ? `-${payroll.epfEmployee.toFixed(2)}` : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <div>
                    <span className="text-slate-600 block">PERKESO / SOCSO Pekerja</span>
                    {(employee.isRemoteOverseas || payroll.isRemoteOverseas) && (
                      <span className="text-[10px] text-teal-600 font-semibold block">Dikecualikan (Remote Luar Negara)</span>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-rose-600">
                    {payroll.socsoEmployee > 0 ? `-${payroll.socsoEmployee.toFixed(2)}` : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <div>
                    <span className="text-slate-600 block">SIP / EIS Pekerja</span>
                    {(employee.isRemoteOverseas || payroll.isRemoteOverseas) && (
                      <span className="text-[10px] text-teal-600 font-semibold block">Dikecualikan (Remote Luar Negara)</span>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-rose-600">
                    {payroll.eisEmployee > 0 ? `-${payroll.eisEmployee.toFixed(2)}` : '0.00'}
                  </span>
                </div>
                {payroll.pcbTax > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Cukai Pendapatan (PCB)</span>
                    <span className="font-mono font-semibold text-rose-600">-{payroll.pcbTax.toFixed(2)}</span>
                  </div>
                )}
                {payroll.unpaidLeaveDeduction > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Potongan Cuti Tanpa Gaji</span>
                    <span className="font-mono font-semibold text-rose-600">-{payroll.unpaidLeaveDeduction.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 font-bold text-slate-900 border-t border-slate-200">
                  <span>{lang === 'ms' ? 'JUMLAH POTONGAN PEKERJA' : 'TOTAL DEDUCTIONS'}</span>
                  <span className="font-mono text-rose-700">-RM {payroll.totalEmployeeDeductions.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* NET PAY HIGHLIGHT CARD */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-700/20 mb-6">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-100">
                {lang === 'ms' ? 'GAJI BERSIH DIBAYAR (NET PAYABLE SALARY)' : 'NET PAYABLE SALARY'}
              </p>
              <p className="text-xs text-emerald-200 mt-0.5">
                {lang === 'ms' 
                  ? `Dikreditkan melalui akaun ${employee.bankName === 'Lainnya' ? (employee.customBankName || 'Bank Lainnya') : employee.bankName}`
                  : `Credited via ${employee.bankName === 'Lainnya' ? (employee.customBankName || 'Other Bank') : employee.bankName}`}
              </p>
              {employee.salaryCurrency && employee.salaryCurrency !== 'MYR' && employee.exchangeRateToMYR && (
                <p className="text-[11px] text-cyan-200 font-mono font-bold mt-1">
                  ≈ {employee.salaryCurrency} {(payroll.netSalary / employee.exchangeRateToMYR).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Mata Wang Asal)
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-3xl font-black font-mono tracking-tight">
                RM {payroll.netSalary.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Employer Statutory Contributions Reference Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-700 font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>
                {lang === 'ms' ? `Caruman Berkanun Majikan (${selectedCompany})` : `Employer Statutory Remittance (${selectedCompany})`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-slate-600">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">
                  KWSP Majikan {employee.isRemoteOverseas ? '(0% Dikecualikan)' : `(${employee.basicSalary <= 5000 ? '13%' : '12%'})`}:
                </span>
                <span className="font-mono font-bold text-slate-900">
                  RM {payroll.epfEmployer.toFixed(2)} {employee.isRemoteOverseas ? '(Exempt)' : ''}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">PERKESO Majikan:</span>
                <span className="font-mono font-bold text-slate-900">
                  RM {payroll.socsoEmployer.toFixed(2)} {employee.isRemoteOverseas ? '(Exempt)' : ''}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">SIP / EIS Majikan:</span>
                <span className="font-mono font-bold text-slate-900">
                  RM {payroll.eisEmployer.toFixed(2)} {employee.isRemoteOverseas ? '(Exempt)' : ''}
                </span>
              </div>
              <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200">
                <span className="text-[10px] text-indigo-700 block font-semibold">{lang === 'ms' ? 'Jumlah Kos Majikan:' : 'Total Company Cost:'}</span>
                <span className="font-mono font-extrabold text-indigo-950">RM {payroll.totalCompanyCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer note & Stamp */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
            <div>
              <p>
                * Penyata slip gaji ini dijana secara berkomputer dan sah tanpa tandatangan fizikal.
              </p>
              <p className="font-mono text-[10px] text-slate-400">
                No. Rujukan: {payroll.id} | Dijana: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="border border-slate-300 rounded-lg p-2 text-center bg-slate-50 px-3">
              <span className="text-[9px] uppercase font-bold text-slate-600 block">Pengesahan Rasmi</span>
              <span className="text-[10px] font-extrabold text-indigo-900 block">{companyDetails.name}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
