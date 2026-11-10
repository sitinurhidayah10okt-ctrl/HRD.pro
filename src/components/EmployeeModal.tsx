import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, CreditCard, Shield, Phone, Save, Building, Globe, DollarSign, Camera, Upload, ImageIcon, Trash2 } from 'lucide-react';
import { Employee, EmploymentType, Language, CurrencyType } from '../types';
import { DEFAULT_EXCHANGE_RATES, CURRENCY_SYMBOLS } from '../utils/statutoryCalculations';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employeeToEdit?: Employee | null;
  lang: Language;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'statutory' | 'bank'>('personal');

  const [formData, setFormData] = useState<Employee>({
    id: `EMP00${Math.floor(Math.random() * 900 + 100)}`,
    name: '',
    role: '',
    department: 'Administration',
    email: '',
    phone: '',
    nric: '',
    gender: 'Male',
    joinDate: new Date().toISOString().slice(0, 10),
    employmentType: 'Full-time',
    basicSalary: 3500,
    salaryCurrency: 'MYR',
    originalSalaryAmount: 3500,
    exchangeRateToMYR: 1.0,
    isRemoteOverseas: false,
    workLocationCountry: 'Malaysia',
    fixedAllowance: 300,
    epfNumber: 'EPF-' + Math.floor(1000000 + Math.random() * 9000000),
    socsoNumber: 'SOC-' + Math.floor(1000000 + Math.random() * 9000000),
    taxNumber: 'SG-' + Math.floor(10000000 + Math.random() * 90000000) + '-0',
    bankName: 'Maybank',
    customBankName: '',
    bankAccount: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Spouse',
    address: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    leaveBalance: {
      annual: 14,
      annualTaken: 0,
      medical: 14,
      medicalTaken: 0,
      emergency: 5,
      emergencyTaken: 0,
      maternity: 98,
      maternityTaken: 0,
    },
    epfEmployeeRate: 0.11,
  });

  useEffect(() => {
    if (employeeToEdit) {
      setFormData(employeeToEdit);
    } else {
      setFormData({
        id: `EMP00${Math.floor(Math.random() * 900 + 100)}`,
        name: '',
        role: '',
        department: 'Administration',
        email: '',
        phone: '',
        nric: '',
        gender: 'Male',
        joinDate: new Date().toISOString().slice(0, 10),
        employmentType: 'Full-time',
        basicSalary: 3500,
        salaryCurrency: 'MYR',
        originalSalaryAmount: 3500,
        exchangeRateToMYR: 1.0,
        isRemoteOverseas: false,
        workLocationCountry: 'Malaysia',
        fixedAllowance: 300,
        epfNumber: 'EPF-' + Math.floor(1000000 + Math.random() * 9000000),
        socsoNumber: 'SOC-' + Math.floor(1000000 + Math.random() * 9000000),
        taxNumber: 'SG-' + Math.floor(10000000 + Math.random() * 90000000) + '-0',
        bankName: 'Maybank',
        customBankName: '',
        bankAccount: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: 'Spouse',
        address: '',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        leaveBalance: {
          annual: 14,
          annualTaken: 0,
          medical: 14,
          medicalTaken: 0,
          emergency: 5,
          emergencyTaken: 0,
          maternity: 98,
          maternityTaken: 0,
        },
        epfEmployeeRate: 0.11,
      });
    }
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      alert(lang === 'ms' ? 'Sila lengkapkan nama dan jawatan karyawan.' : 'Please enter employee name and position.');
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(lang === 'ms' ? 'Saiz fail gambar terlalu besar (maksimum 5MB).' : 'Image file is too large (max 5MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const departments = [
    'Human Resources',
    'Administration',
    'Finance & Accounts',
    'Information Technology',
    'Marketing',
    'Operations',
    'Sales & Business Dev',
    'Customer Support',
  ];

  const banks = [
    'Maybank',
    'CIMB Bank',
    'Public Bank',
    'RHB Bank',
    'Hong Leong Bank',
    'AmBank',
    'Bank Islam',
    'HSBC Bank Malaysia',
    'OCBC Bank',
    'Standard Chartered',
    'Lainnya',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-base">
                {employeeToEdit
                  ? (lang === 'ms' ? 'Kemaskini Biodata Karyawan' : 'Edit Employee Profile')
                  : (lang === 'ms' ? 'Tambah Profil Karyawan Baru' : 'Add New Employee')}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ms' ? 'Maklumat peribadi, perjawatan, gaji dan nombor statutori rasmi' : 'Personal info, job details, salary and official statutory numbers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium text-xs transition ${
              activeTab === 'personal'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{lang === 'ms' ? 'Biodata Asas' : 'Personal Info'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('job')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium text-xs transition ${
              activeTab === 'job'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{lang === 'ms' ? 'Perjawatan & Cuti' : 'Job & Leaves'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('statutory')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium text-xs transition ${
              activeTab === 'statutory'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{lang === 'ms' ? 'Gaji & Statutori (EPF/SOCSO/EIS)' : 'Salary & Statutory'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium text-xs transition ${
              activeTab === 'bank'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{lang === 'ms' ? 'Bank & Waris' : 'Bank & Emergency'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* TAB 1: PERSONAL */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              {/* Profile Photo with Gallery Upload */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  <img
                    src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={formData.name || 'Avatar'}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-md"
                  />
                  <label
                    htmlFor="gallery-avatar-input"
                    className="absolute inset-0 bg-slate-900/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-[10px] font-bold"
                  >
                    <Camera className="w-5 h-5 mb-0.5 text-cyan-300" />
                    <span>Tukar</span>
                  </label>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div>
                    <label className="block text-xs font-bold text-slate-900">
                      {lang === 'ms' ? 'Foto Profil Karyawan (Dari Galeri)' : 'Employee Profile Picture'}
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'ms' ? 'Pilih dan muat naik foto dari galeri peranti anda (PNG, JPG, JPEG) atau masukkan pautan.' : 'Pick and upload a photo from your device gallery or enter a URL.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      id="gallery-avatar-input"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="gallery-avatar-input"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{lang === 'ms' ? 'Muat Naik dari Galeri' : 'Upload from Gallery'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
                      }))}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition cursor-pointer"
                    >
                      <span>Reset</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <input
                      type="text"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      className="w-full text-[11px] px-2.5 py-1 rounded-lg border border-slate-300 text-slate-600 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Atau masukkan pautan URL imej: https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ID Pekerja *
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 font-mono font-bold text-indigo-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'ms' ? 'Nama Penuh (Mengikut IC) *' : 'Full Name (As per NRIC) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                    placeholder="Contoh: Siti Nurhidayah"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Kad Pengenalan (NRIC / Passport) *
                  </label>
                  <input
                    type="text"
                    value={formData.nric}
                    onChange={(e) => setFormData({ ...formData, nric: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    placeholder="921010-10-5432"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'ms' ? 'Jantina' : 'Gender'}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Male">{lang === 'ms' ? 'Lelaki (Male)' : 'Male'}</option>
                    <option value="Female">{lang === 'ms' ? 'Perempuan (Female)' : 'Female'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emel Rasmi / Syarikat * (Untuk Log Masuk)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="nama@serumpun.com.my"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Laluan Log Masuk (Password) *
                  </label>
                  <input
                    type="text"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    placeholder="Contoh: pass123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Syarikat / Majikan (Entity) *
                  </label>
                  <select
                    value={formData.company || 'Solusi Serumpun Senusantara SDN. BHD.'}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-indigo-900"
                  >
                    <option value="Solusi Serumpun Senusantara SDN. BHD.">Solusi Serumpun Senusantara SDN. BHD.</option>
                    <option value="Pustaka Union">Pustaka Union</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahap Akses Portal (Role Level) *
                  </label>
                  <select
                    value={formData.roleLevel || 'staff'}
                    onChange={(e) => setFormData({ ...formData, roleLevel: e.target.value as 'admin' | 'staff' })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="staff">Karyawan (Hanya Data Sendiri)</option>
                    <option value="admin">Pengurusan / HR / Direktur (Akses Penuh)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Telefon Bimbit
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="+60 12-345 6789"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'ms' ? 'Alamat Kediaman Semasa' : 'Residential Address'}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Alamat lengkap..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB & LEAVES */}
          {activeTab === 'job' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'ms' ? 'Jawatan (Role / Position) *' : 'Role / Position *'}
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Contoh: HR Manager"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'ms' ? 'Jabatan (Department)' : 'Department'}
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {departments.map((dep) => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'ms' ? 'Status Perjawatan' : 'Employment Type'}
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Full-time">Tetap (Full-time)</option>
                    <option value="Contract">Kontrak (Contract)</option>
                    <option value="Probation">Percubaan (Probation)</option>
                    <option value="Part-time">Sambilan (Part-time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'ms' ? 'Tarikh Mula Berkhidmat' : 'Join Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Leave Quota Allocation */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-800 mb-2">
                  {lang === 'ms' ? 'Peruntukan Kuota Cuti Tahunan (Hari)' : 'Annual Leave Quota Allocation (Days)'}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Cuti Tahunan (Annual):</label>
                    <input
                      type="number"
                      value={formData.leaveBalance.annual}
                      onChange={(e) => setFormData({
                        ...formData,
                        leaveBalance: { ...formData.leaveBalance, annual: Number(e.target.value) }
                      })}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Cuti Sakit (Medical/MC):</label>
                    <input
                      type="number"
                      value={formData.leaveBalance.medical}
                      onChange={(e) => setFormData({
                        ...formData,
                        leaveBalance: { ...formData.leaveBalance, medical: Number(e.target.value) }
                      })}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Cuti Kecemasan (Emergency):</label>
                    <input
                      type="number"
                      value={formData.leaveBalance.emergency}
                      onChange={(e) => setFormData({
                        ...formData,
                        leaveBalance: { ...formData.leaveBalance, emergency: Number(e.target.value) }
                      })}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SALARY & STATUTORY */}
          {activeTab === 'statutory' && (
            <div className="space-y-4">
              
              {/* REMOTE OVERSEAS EXEMPTION BANNER & TOGGLE */}
              <div className={`p-4 rounded-2xl border transition ${
                formData.isRemoteOverseas 
                  ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    <Globe className={`w-5 h-5 shrink-0 mt-0.5 ${formData.isRemoteOverseas ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Status Karyawan Remote Luar Malaysia (Overseas Remote)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Karyawan yang berkhidmat secara remote di luar Malaysia <strong className="text-slate-800">TIDAK DIKENAKAN caruman KWSP, SOCSO dan EIS</strong> (0% potongan statutori Malaysia mengikut undang-undang statutori).
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isRemoteOverseas)}
                      onChange={(e) => {
                        const isRem = e.target.checked;
                        setFormData({
                          ...formData,
                          isRemoteOverseas: isRem,
                          workLocationCountry: isRem ? (formData.workLocationCountry === 'Malaysia' ? 'Indonesia' : formData.workLocationCountry) : 'Malaysia',
                          epfNumber: isRem ? 'DIKECUALIKAN' : formData.epfNumber,
                          socsoNumber: isRem ? 'DIKECUALIKAN' : formData.socsoNumber,
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {formData.isRemoteOverseas && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 grid grid-cols-2 gap-3 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                        Negara Lokasi Bekerja Remote *
                      </label>
                      <input
                        type="text"
                        value={formData.workLocationCountry || ''}
                        onChange={(e) => setFormData({ ...formData, workLocationCountry: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-emerald-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="Contoh: Indonesia, Singapore, Philippines..."
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <div className="text-[11px] text-emerald-800 bg-emerald-100/70 border border-emerald-300/80 p-2.5 rounded-xl font-bold">
                        🛡️ Pengecualian Aktif: EPF (0%), SOCSO (0%), EIS (0%). Gaji kasar dibayar penuh tanpa potongan statutori Malaysia.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* MULTI-CURRENCY SALARY SETTINGS */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-950">
                  <DollarSign className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">
                      Mata Wang Gaji & Penyesuaian ke Nilai Ringgit Malaysia (MYR)
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Gaji dalam mata wang asing akan disesuaikan secara automatik mengikut kadar pertukaran mata wang ke MYR untuk penggajian bulanan.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Mata Wang Gaji (Currency) *
                    </label>
                    <select
                      value={formData.salaryCurrency || 'MYR'}
                      onChange={(e) => {
                        const curr = e.target.value as CurrencyType;
                        const defaultRate = DEFAULT_EXCHANGE_RATES[curr] || 1.0;
                        const originalAmt = formData.originalSalaryAmount || formData.basicSalary;
                        const converted = curr === 'MYR' ? originalAmt : Number((originalAmt * defaultRate).toFixed(2));
                        setFormData({
                          ...formData,
                          salaryCurrency: curr,
                          exchangeRateToMYR: defaultRate,
                          originalSalaryAmount: originalAmt,
                          basicSalary: converted,
                        });
                      }}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 font-bold text-indigo-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="MYR">MYR - Ringgit Malaysia (RM)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="IDR">IDR - Rupiah Indonesia (Rp)</option>
                      <option value="SGD">SGD - Singapore Dollar (S$)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="AUD">AUD - Australian Dollar (A$)</option>
                      <option value="JPY">JPY - Japanese Yen (¥)</option>
                    </select>
                  </div>

                  {formData.salaryCurrency && formData.salaryCurrency !== 'MYR' ? (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Gaji Pokok Asal ({CURRENCY_SYMBOLS[formData.salaryCurrency]}) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.originalSalaryAmount || ''}
                          onChange={(e) => {
                            const amt = Number(e.target.value);
                            const rate = formData.exchangeRateToMYR || DEFAULT_EXCHANGE_RATES[formData.salaryCurrency || 'MYR'];
                            const converted = Number((amt * rate).toFixed(2));
                            setFormData({
                              ...formData,
                              originalSalaryAmount: amt,
                              basicSalary: converted,
                            });
                          }}
                          className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 font-mono font-bold bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder={formData.salaryCurrency === 'IDR' ? 'Contoh: 15000000' : 'Contoh: 3000'}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Kadar Tukaran ke 1 MYR
                        </label>
                        <input
                          type="number"
                          step="0.00001"
                          value={formData.exchangeRateToMYR || ''}
                          onChange={(e) => {
                            const rate = Number(e.target.value);
                            const amt = formData.originalSalaryAmount || 0;
                            const converted = Number((amt * rate).toFixed(2));
                            setFormData({
                              ...formData,
                              exchangeRateToMYR: rate,
                              basicSalary: converted,
                            });
                          }}
                          className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 font-mono text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-2 flex items-center">
                      <span className="text-xs text-slate-500 italic">
                        Mata wang standard tempatan (Ringgit Malaysia - MYR). Tiada penukaran mata wang diperlukan.
                      </span>
                    </div>
                  )}
                </div>

                {/* Conversion Preview Callout */}
                <div className="p-3 bg-white border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">
                      Gaji Asas Yang Diselaraskan ke Ringgit Malaysia (Untuk Slip & Penggajian):
                    </span>
                    {formData.salaryCurrency && formData.salaryCurrency !== 'MYR' && formData.originalSalaryAmount ? (
                      <span className="text-[11px] text-slate-600 font-medium">
                        {CURRENCY_SYMBOLS[formData.salaryCurrency]} {formData.originalSalaryAmount.toLocaleString()} @ kadar {formData.exchangeRateToMYR}
                      </span>
                    ) : null}
                  </div>
                  <span className="font-mono font-black text-indigo-950 text-base">
                    RM {formData.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* STANDARD ALLOWANCE & STATUTORY NUMBERS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gaji Asas Penggajian (MYR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">RM</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                      className="w-full text-xs pl-10 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Elaun Tetap Bulanan (Allowance - RM)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">RM</span>
                    <input
                      type="number"
                      min="0"
                      step="25"
                      value={formData.fixedAllowance}
                      onChange={(e) => setFormData({ ...formData, fixedAllowance: Number(e.target.value) })}
                      className="w-full text-xs pl-10 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* STATUTORY INPUTS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. KWSP (EPF Account No) {formData.isRemoteOverseas && '(Dikecualikan)'}
                  </label>
                  <input
                    type="text"
                    value={formData.epfNumber}
                    disabled={formData.isRemoteOverseas}
                    onChange={(e) => setFormData({ ...formData, epfNumber: e.target.value })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border font-mono ${
                      formData.isRemoteOverseas ? 'bg-slate-100 text-slate-400 border-slate-200' : 'border-slate-300 text-slate-800'
                    }`}
                    placeholder="EPF-XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kadar Caruman KWSP Pekerja
                  </label>
                  <select
                    value={formData.isRemoteOverseas ? 0 : (formData.epfEmployeeRate || 0.11)}
                    disabled={formData.isRemoteOverseas}
                    onChange={(e) => setFormData({ ...formData, epfEmployeeRate: Number(e.target.value) })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border font-medium ${
                      formData.isRemoteOverseas ? 'bg-slate-100 text-slate-400 border-slate-200' : 'border-slate-300'
                    }`}
                  >
                    <option value="0.11">11% (Kadar Standard Mandatori)</option>
                    <option value="0.09">9% (Pilihan Khas)</option>
                    <option value="0.00">0% (Pengecualian Remote / Warga Emas)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. PERKESO (SOCSO Account No) {formData.isRemoteOverseas && '(Dikecualikan)'}
                  </label>
                  <input
                    type="text"
                    value={formData.socsoNumber}
                    disabled={formData.isRemoteOverseas}
                    onChange={(e) => setFormData({ ...formData, socsoNumber: e.target.value })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border font-mono ${
                      formData.isRemoteOverseas ? 'bg-slate-100 text-slate-400 border-slate-200' : 'border-slate-300 text-slate-800'
                    }`}
                    placeholder="SOC-XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Cukai Pendapatan / Tax File (LHDN / NPWP / IRAS)
                  </label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-800"
                    placeholder="SG-XXXXXXXX-X / NPWP-XX.XXX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BANK & EMERGENCY */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Bank Penggajian *
                  </label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    {banks.map((b) => (
                      <option key={b} value={b}>{b === 'Lainnya' ? 'Lainnya (Bank Antarabangsa / Luar Negara)' : b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Akaun Bank *
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="514012893847"
                    required
                  />
                </div>
              </div>

              {/* CUSTOM BANK NAME INPUT WHEN "Lainnya" IS SELECTED */}
              {formData.bankName === 'Lainnya' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 animate-in fade-in">
                  <label className="block text-xs font-bold text-amber-900">
                    Nama Bank Khusus / Luar Malaysia (Lainnya) *
                  </label>
                  <p className="text-[11px] text-amber-700 mb-1">
                    Digunakan untuk pembayaran kepada pekerja remote luar negara.
                  </p>
                  <input
                    type="text"
                    value={formData.customBankName || ''}
                    onChange={(e) => setFormData({ ...formData, customBankName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Contoh: Bank Central Asia (BCA), Bank Mandiri, DBS Singapore, Revolut, Wise..."
                    required
                  />
                </div>
              )}

              <div className="border-t border-slate-200 pt-4 mt-2">
                <p className="text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-500" />
                  <span>{lang === 'ms' ? 'Kontak Kecemasan / Waris Terdekat' : 'Emergency Contact Person'}</span>
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      {lang === 'ms' ? 'Nama Waris' : 'Contact Name'}
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300"
                      placeholder="Nama waris"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      {lang === 'ms' ? 'Hubungan' : 'Relationship'}
                    </label>
                    <select
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300"
                    >
                      <option value="Spouse">Suami/Isteri (Spouse)</option>
                      <option value="Parent">Ibu/Bapa (Parent)</option>
                      <option value="Sibling">Adik-beradik (Sibling)</option>
                      <option value="Child">Anak (Child)</option>
                      <option value="Guardian">Penjaga / Rakan (Other)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      {lang === 'ms' ? 'No Telefon Waris' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300"
                      placeholder="+60 1X-XXXXXXX"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
            <span className="text-[11px] text-slate-400">
              * {lang === 'ms' ? 'Ruangan bertanda wajib diisi' : 'Mandatory fields'}
            </span>
            <div className="flex space-x-2">
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
                <Save className="w-3.5 h-3.5" />
                <span>{lang === 'ms' ? 'Simpan Biodata' : 'Save Profile'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
