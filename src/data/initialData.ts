import { Employee, AttendanceRecord, LeaveRequest } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP000',
    name: 'Datuk Ir. Dr. Roslan bin Hashim',
    role: 'Direktur Urusan & CEO (Managing Director)',
    department: 'Pengurusan Eksekutif',
    email: 'direktur@company.com',
    password: 'direktur123',
    roleLevel: 'admin',
    company: 'Solusi Serumpun Senusantara SDN. BHD.',
    phone: '+60 19-221 8899',
    nric: '750314-10-5129',
    gender: 'Male',
    joinDate: '2019-01-01',
    employmentType: 'Full-time',
    basicSalary: 14500,
    fixedAllowance: 1500,
    epfNumber: 'EPF-1100293',
    socsoNumber: 'SOC-9900124',
    taxNumber: 'SG-10029381-0',
    bankName: 'Maybank',
    bankAccount: '514088992314',
    emergencyContactName: 'Datin Salmah binti Yusof (Isteri)',
    emergencyContactPhone: '+60 19-332 1100',
    emergencyContactRelation: 'Spouse',
    address: 'No 1, Persiaran Golf, Saujana Impian, Kajang, Selangor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    leaveBalance: {
      annual: 25,
      annualTaken: 3,
      medical: 14,
      medicalTaken: 0,
      emergency: 5,
      emergencyTaken: 0,
      maternity: 7,
      maternityTaken: 0,
    },
  },
  {
    id: 'EMP001',
    name: 'Siti Nurhidayah',
    role: 'HR Manager & People Lead',
    department: 'Human Resources',
    email: 'sitinurhidayah10okt@gmail.com',
    password: 'siti123',
    roleLevel: 'admin',
    company: 'Solusi Serumpun Senusantara SDN. BHD.',
    phone: '+60 12-345 6789',
    nric: '921010-10-5432',
    gender: 'Female',
    joinDate: '2021-03-15',
    employmentType: 'Full-time',
    basicSalary: 6500,
    fixedAllowance: 600,
    epfNumber: 'EPF-8829104',
    socsoNumber: 'SOC-5521943',
    taxNumber: 'SG-99382104-0',
    bankName: 'Maybank',
    bankAccount: '514012893847',
    emergencyContactName: 'Haji Ahmad (Bapa)',
    emergencyContactPhone: '+60 19-876 5432',
    emergencyContactRelation: 'Parent',
    address: 'No 45, Jalan Setia Tropika 1/8, Johor Bahru',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    leaveBalance: {
      annual: 16,
      annualTaken: 4,
      medical: 14,
      medicalTaken: 2,
      emergency: 5,
      emergencyTaken: 1,
      maternity: 98,
      maternityTaken: 0,
    },
  },
  {
    id: 'EMP002',
    name: 'Ahmad bin Zulkifli',
    role: 'Senior Administrative Executive',
    department: 'Administration',
    email: 'ahmad.zulkifli@company.com',
    password: 'ahmad123',
    roleLevel: 'staff',
    company: 'Solusi Serumpun Senusantara SDN. BHD.',
    phone: '+60 17-882 1234',
    nric: '950412-14-6123',
    gender: 'Male',
    joinDate: '2022-07-01',
    employmentType: 'Full-time',
    basicSalary: 4500,
    fixedAllowance: 350,
    epfNumber: 'EPF-7749102',
    socsoNumber: 'SOC-3319024',
    taxNumber: 'SG-44102941-1',
    bankName: 'CIMB Bank',
    bankAccount: '702819401239',
    emergencyContactName: 'Fatimah Az-Zahra (Isteri)',
    emergencyContactPhone: '+60 13-445 6789',
    emergencyContactRelation: 'Spouse',
    address: 'Block B-12-04, Residensi Impian, Petaling Jaya, Selangor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    leaveBalance: {
      annual: 14,
      annualTaken: 3,
      medical: 14,
      medicalTaken: 1,
      emergency: 5,
      emergencyTaken: 0,
      maternity: 7,
      maternityTaken: 0,
    },
  },
  {
    id: 'EMP003',
    name: 'Nurul Huda binti Mansor',
    role: 'Senior Finance Officer',
    department: 'Finance & Accounts',
    email: 'nurul.huda@company.com',
    password: 'nurul123',
    roleLevel: 'staff',
    company: 'Pustaka Union',
    phone: '+60 18-994 3321',
    nric: '930822-08-5940',
    gender: 'Female',
    joinDate: '2021-11-01',
    employmentType: 'Full-time',
    basicSalary: 5200,
    fixedAllowance: 450,
    epfNumber: 'EPF-6629011',
    socsoNumber: 'SOC-4412948',
    taxNumber: 'SG-77192840-2',
    bankName: 'Public Bank',
    bankAccount: '319204918231',
    emergencyContactName: 'Mansor Daud (Bapa)',
    emergencyContactPhone: '+60 16-778 9901',
    emergencyContactRelation: 'Parent',
    address: 'Lot 204, Taman Pelangi, Kuala Lumpur',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    leaveBalance: {
      annual: 14,
      annualTaken: 5,
      medical: 14,
      medicalTaken: 3,
      emergency: 5,
      emergencyTaken: 1,
      maternity: 98,
      maternityTaken: 0,
    },
  },
  {
    id: 'EMP004',
    name: 'Tan Wei Hong',
    role: 'Lead Full-Stack Developer',
    department: 'Information Technology',
    email: 'weihong.tan@company.com',
    password: 'tan123',
    roleLevel: 'staff',
    company: 'Solusi Serumpun Senusantara SDN. BHD.',
    phone: '+60 11-2345 8890',
    nric: '900215-10-5511',
    gender: 'Male',
    joinDate: '2020-05-18',
    employmentType: 'Full-time',
    basicSalary: 7800,
    fixedAllowance: 800,
    epfNumber: 'EPF-9912048',
    socsoNumber: 'SOC-7710923',
    taxNumber: 'SG-66291048-5',
    bankName: 'Hong Leong Bank',
    bankAccount: '098172635412',
    emergencyContactName: 'Tan Ah Boon (Bapa)',
    emergencyContactPhone: '+60 12-771 2234',
    emergencyContactRelation: 'Parent',
    address: '15, Jalan Kiara 3, Mont Kiara, Kuala Lumpur',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    leaveBalance: {
      annual: 18,
      annualTaken: 6,
      medical: 14,
      medicalTaken: 0,
      emergency: 5,
      emergencyTaken: 1,
      maternity: 7,
      maternityTaken: 0,
    },
  },
  {
    id: 'EMP005',
    name: 'Farah Nadia binti Rosli',
    role: 'Digital Marketing & Growth Lead',
    department: 'Marketing',
    email: 'farah.nadia@company.com',
    password: 'farah123',
    roleLevel: 'staff',
    company: 'Pustaka Union',
    phone: '+60 14-556 7712',
    nric: '960930-14-7782',
    gender: 'Female',
    joinDate: '2023-02-01',
    employmentType: 'Full-time',
    basicSalary: 4200,
    fixedAllowance: 400,
    epfNumber: 'EPF-4419203',
    socsoNumber: 'SOC-2291049',
    taxNumber: 'SG-33190284-9',
    bankName: 'RHB Bank',
    bankAccount: '214019284756',
    emergencyContactName: 'Rosli Hashim (Bapa)',
    emergencyContactPhone: '+60 13-908 1234',
    emergencyContactRelation: 'Parent',
    address: 'C-08-11, Bangsar South Suites, Kuala Lumpur',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    leaveBalance: {
      annual: 14,
      annualTaken: 2,
      medical: 14,
      medicalTaken: 1,
      emergency: 5,
      emergencyTaken: 0,
      maternity: 98,
      maternityTaken: 0,
    },
  },
  {
    id: 'EMP006',
    name: 'Kavitha a/p Subramaniam',
    role: 'Operations & QA Specialist',
    department: 'Operations',
    email: 'kavitha.subra@company.com',
    password: 'kavitha123',
    roleLevel: 'staff',
    company: 'Pustaka Union',
    phone: '+60 19-332 4455',
    nric: '940618-05-6674',
    gender: 'Female',
    joinDate: '2022-10-10',
    employmentType: 'Full-time',
    basicSalary: 4000,
    fixedAllowance: 300,
    epfNumber: 'EPF-3381920',
    socsoNumber: 'SOC-1182940',
    taxNumber: 'SG-22819034-7',
    bankName: 'Maybank',
    bankAccount: '114092837461',
    emergencyContactName: 'Subramaniam Pillay (Bapa)',
    emergencyContactPhone: '+60 12-443 5566',
    emergencyContactRelation: 'Parent',
    address: '28, Jalan Universiti, Seksyen 11, Petaling Jaya',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    leaveBalance: {
      annual: 14,
      annualTaken: 4,
      medical: 14,
      medicalTaken: 2,
      emergency: 5,
      emergencyTaken: 0,
      maternity: 98,
      maternityTaken: 0,
    },
  },
  {
    id: 'EMP007',
    name: 'Budi Prasetyo, S.Kom.',
    role: 'Senior Remote Software Engineer',
    department: 'Information Technology',
    email: 'budi.remote@company.com',
    password: 'budi123',
    roleLevel: 'staff',
    company: 'Solusi Serumpun Senusantara SDN. BHD.',
    phone: '+62 812-9988-7766',
    nric: '3171012304920003', // NIK KTP Indonesia
    gender: 'Male',
    joinDate: '2022-04-01',
    employmentType: 'Full-time',
    
    // Remote Overseas & Currency
    isRemoteOverseas: true,
    workLocationCountry: 'Indonesia (Remote)',
    salaryCurrency: 'IDR',
    originalSalaryAmount: 22000000, // 22 Million Rupiah
    exchangeRateToMYR: 0.00028, // 22,000,000 * 0.00028 = RM 6,160.00
    basicSalary: 6160,
    fixedAllowance: 0,

    // Statutory Exempt for Remote Overseas
    epfNumber: 'DIKECUALIKAN',
    socsoNumber: 'DIKECUALIKAN',
    taxNumber: 'NPWP-88.192.839.2-012.000',
    
    // Custom Bank (Lainnya)
    bankName: 'Lainnya',
    customBankName: 'Bank Central Asia (BCA)',
    bankAccount: '8830192837',
    emergencyContactName: 'Dewi Lestari (Istri)',
    emergencyContactPhone: '+62 813-2211-9988',
    emergencyContactRelation: 'Spouse',
    address: 'Jl. Tebet Barat Dalam VII No. 12, Jakarta Selatan, Indonesia',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    leaveBalance: {
      annual: 15,
      annualTaken: 2,
      medical: 14,
      medicalTaken: 0,
      emergency: 5,
      emergencyTaken: 0,
      maternity: 7,
      maternityTaken: 0,
    },
  },
  {
    id: 'EMP008',
    name: 'Jonathan Michael Tan',
    role: 'Regional Marketing Consultant (Remote)',
    department: 'Marketing',
    email: 'jonathan.remote@company.com',
    password: 'jonathan123',
    roleLevel: 'staff',
    company: 'Pustaka Union',
    phone: '+65 9123 4567',
    nric: 'S9123847B', // Singapore NRIC
    gender: 'Male',
    joinDate: '2023-01-15',
    employmentType: 'Contract',

    // Remote Overseas & Currency
    isRemoteOverseas: true,
    workLocationCountry: 'Singapore (Remote)',
    salaryCurrency: 'SGD',
    originalSalaryAmount: 3500, // 3,500 SGD
    exchangeRateToMYR: 3.32, // 3,500 * 3.32 = RM 11,620.00
    basicSalary: 11620,
    fixedAllowance: 300,

    // Statutory Exempt for Remote Overseas
    epfNumber: 'DIKECUALIKAN',
    socsoNumber: 'DIKECUALIKAN',
    taxNumber: 'IRAS-S9123847B',

    // Custom Bank (Lainnya)
    bankName: 'Lainnya',
    customBankName: 'DBS Bank Singapore',
    bankAccount: '023-889104-2',
    emergencyContactName: 'Rachel Tan (Sister)',
    emergencyContactPhone: '+65 9876 5432',
    emergencyContactRelation: 'Sibling',
    address: 'Blk 128 Toa Payoh Lorong 1, #08-212, Singapore 310128',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    leaveBalance: {
      annual: 14,
      annualTaken: 1,
      medical: 14,
      medicalTaken: 1,
      emergency: 5,
      emergencyTaken: 0,
      maternity: 7,
      maternityTaken: 0,
    },
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Today's attendance (2026-11-10)
  {
    id: 'ATT-20261110-001',
    empId: 'EMP001',
    date: '2026-11-10',
    clockIn: '08:00',
    clockOut: '17:00',
    status: 'Present',
    workHours: 9,
    otHours: 1.0,
    notes: 'Waktu kerja normal + 1 jam review mesyuarat pengurusan HR',
    location: 'HQ Office - Level 8 (Cyberjaya)',
    verificationMethod: 'GPS & Photo',
  },
  {
    id: 'ATT-20261110-002',
    empId: 'EMP002',
    date: '2026-11-10',
    clockIn: '08:45',
    clockOut: '17:15',
    status: 'Late',
    workHours: 8.5,
    otHours: 0.25,
    notes: 'Kesesakan lebuhraya LDP hujan lebat',
    location: 'HQ Office - Level 8 (Cyberjaya)',
    verificationMethod: 'Web Punch',
  },
  {
    id: 'ATT-20261110-003',
    empId: 'EMP003',
    date: '2026-11-10',
    clockIn: '--:--',
    clockOut: '--:--',
    status: 'On Leave',
    workHours: 0,
    otHours: 0,
    notes: 'Cuti Sakit (Medical Leave) - Demam / Klinik Kesihatan',
    location: '-',
    verificationMethod: 'Manual HR',
  },
  {
    id: 'ATT-20261110-004',
    empId: 'EMP004',
    date: '2026-11-10',
    clockIn: '08:15',
    clockOut: '18:15',
    status: 'Present',
    workHours: 10,
    otHours: 2.0,
    notes: 'Deployment release sprint Q4 & server maintenance',
    location: 'HQ Tech Lab - Level 9',
    verificationMethod: 'GPS & Photo',
  },
  {
    id: 'ATT-20261110-005',
    empId: 'EMP005',
    date: '2026-11-10',
    clockIn: '08:05',
    clockOut: '17:05',
    status: 'Present',
    workHours: 9,
    otHours: 0.5,
    notes: 'Social media live launch & influencer briefing',
    location: 'HQ Studio - Level 6',
    verificationMethod: 'GPS & Photo',
  },
  {
    id: 'ATT-20261110-006',
    empId: 'EMP006',
    date: '2026-11-10',
    clockIn: '07:55',
    clockOut: '17:00',
    status: 'Present',
    workHours: 9,
    otHours: 0,
    notes: 'Pemeriksaan audit inventori dan SOP kualiti',
    location: 'HQ Warehouse Hub',
    verificationMethod: 'GPS & Photo',
  },

  // Yesterday (2026-11-09)
  {
    id: 'ATT-20261109-001',
    empId: 'EMP001',
    date: '2026-11-09',
    clockIn: '08:00',
    clockOut: '17:30',
    status: 'Present',
    workHours: 9.5,
    otHours: 1.5,
    notes: 'Pemprosesan penggajian awal bulan',
    location: 'HQ Office - Level 8',
    verificationMethod: 'GPS & Photo',
  },
  {
    id: 'ATT-20261109-002',
    empId: 'EMP002',
    date: '2026-11-09',
    clockIn: '08:10',
    clockOut: '17:00',
    status: 'Present',
    workHours: 8.8,
    otHours: 0,
    notes: 'Pengurusan fail vendor & sebut harga',
    location: 'HQ Office - Level 8',
    verificationMethod: 'GPS & Photo',
  },
  {
    id: 'ATT-20261109-003',
    empId: 'EMP003',
    date: '2026-11-09',
    clockIn: '08:00',
    clockOut: '17:00',
    status: 'Present',
    workHours: 9,
    otHours: 0,
    notes: 'Penyelarasan lejar akaun bulanan',
    location: 'HQ Office - Level 8',
    verificationMethod: 'GPS & Photo',
  },
  {
    id: 'ATT-20261109-004',
    empId: 'EMP004',
    date: '2026-11-09',
    clockIn: '08:30',
    clockOut: '19:00',
    status: 'Present',
    workHours: 10.5,
    otHours: 2.5,
    notes: 'Sprint development & bugfixes',
    location: 'HQ Tech Lab - Level 9',
    verificationMethod: 'GPS & Photo',
  },
  {
    id: 'ATT-20261109-005',
    empId: 'EMP005',
    date: '2026-11-09',
    clockIn: '08:20',
    clockOut: '17:20',
    status: 'Present',
    workHours: 9,
    otHours: 0,
    notes: 'Content calendar marketing',
    location: 'HQ Studio - Level 6',
    verificationMethod: 'GPS & Photo',
  },
  {
    id: 'ATT-20261109-006',
    empId: 'EMP006',
    date: '2026-11-09',
    clockIn: '08:00',
    clockOut: '17:00',
    status: 'Present',
    workHours: 9,
    otHours: 0,
    notes: 'Operasi logistik',
    location: 'HQ Warehouse Hub',
    verificationMethod: 'GPS & Photo',
  },
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'LV-2026-001',
    empId: 'EMP002',
    type: 'Annual Leave',
    startDate: '2026-11-15',
    endDate: '2026-11-16',
    daysCount: 2,
    reason: 'Urusan kenduri kahwin keluarga di kampung Batu Pahat, Johor',
    attachmentName: 'Surat_Jemputan_Kenduri_Kahwin.pdf',
    attachmentSize: '1.1 MB',
    attachmentType: 'pdf',
    status: 'Pending',
    appliedAt: '2026-11-08 14:30',
  },
  {
    id: 'LV-2026-002',
    empId: 'EMP003',
    type: 'Medical Leave',
    startDate: '2026-11-10',
    endDate: '2026-11-10',
    daysCount: 1,
    reason: 'Demam panas & sakit tekak, sijil cuti sakit Dr Klinik Mediviron',
    attachmentName: 'MC_Klinik_Mediviron_DrTan.pdf',
    attachmentSize: '340 KB',
    attachmentType: 'pdf',
    status: 'Approved',
    appliedAt: '2026-11-10 07:15',
    reviewedBy: 'Siti Nurhidayah (HR Manager)',
    reviewedAt: '2026-11-10 07:45',
    reviewNotes: 'MC telah dilampirkan & diluluskan. Semoga cepat sembuh.',
  },
  {
    id: 'LV-2026-003',
    empId: 'EMP004',
    type: 'Emergency Leave',
    startDate: '2026-11-20',
    endDate: '2026-11-20',
    daysCount: 1,
    reason: 'Pemeriksaan kesihatan tahunan ibu bapa di hospital pakar',
    attachmentName: 'Surat_Temujanji_Hospital.png',
    attachmentSize: '620 KB',
    attachmentType: 'image',
    status: 'Pending',
    appliedAt: '2026-11-09 11:00',
  },
  {
    id: 'LV-2026-004',
    empId: 'EMP005',
    type: 'Annual Leave',
    startDate: '2026-11-03',
    endDate: '2026-11-04',
    daysCount: 2,
    reason: 'Bercuti bersama keluarga di Pulau Pinang',
    status: 'Approved',
    appliedAt: '2026-10-25 09:20',
    reviewedBy: 'Siti Nurhidayah (HR Manager)',
    reviewedAt: '2026-10-25 15:00',
    reviewNotes: 'Diluluskan. Handover kerja kepada rakan sepasukan telah lengkap.',
  },
];

// LocalStorage Persistence Keys
const EMP_KEY = 'hr_enterprise_employees_v1';
const ATT_KEY = 'hr_enterprise_attendance_v1';
const LV_KEY = 'hr_enterprise_leaves_v1';

export function loadStoredEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(EMP_KEY);
    if (raw) {
      const parsed: Employee[] = JSON.parse(raw);
      const merged = parsed.map((p) => {
        const init = INITIAL_EMPLOYEES.find((i) => i.id === p.id);
        return {
          ...p,
          password: p.password || init?.password || 'password123',
          company: p.company || init?.company || 'Solusi Serumpun Senusantara SDN. BHD.',
          roleLevel: p.roleLevel || init?.roleLevel || (p.department === 'Human Resources' || p.role.toLowerCase().includes('director') || p.role.toLowerCase().includes('direktur') ? 'admin' : 'staff'),
          salaryCurrency: p.salaryCurrency || init?.salaryCurrency || 'MYR',
          originalSalaryAmount: p.originalSalaryAmount !== undefined ? p.originalSalaryAmount : (init?.originalSalaryAmount || p.basicSalary),
          exchangeRateToMYR: p.exchangeRateToMYR || init?.exchangeRateToMYR || 1.0,
          isRemoteOverseas: p.isRemoteOverseas !== undefined ? p.isRemoteOverseas : Boolean(init?.isRemoteOverseas),
          workLocationCountry: p.workLocationCountry || init?.workLocationCountry || 'Malaysia',
          customBankName: p.customBankName || init?.customBankName || '',
        };
      });

      // Ensure all INITIAL_EMPLOYEES exist in stored list
      INITIAL_EMPLOYEES.forEach((initEmp) => {
        if (!merged.some((m) => m.id === initEmp.id)) {
          merged.push(initEmp);
        }
      });

      return merged;
    }
  } catch (e) {
    console.error('Failed to load employees from localStorage', e);
  }
  return INITIAL_EMPLOYEES;
}

export function saveStoredEmployees(data: Employee[]) {
  try {
    localStorage.setItem(EMP_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save employees', e);
  }
}

export function loadStoredAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(ATT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load attendance from localStorage', e);
  }
  return INITIAL_ATTENDANCE;
}

export function saveStoredAttendance(data: AttendanceRecord[]) {
  try {
    localStorage.setItem(ATT_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save attendance', e);
  }
}

export function loadStoredLeaves(): LeaveRequest[] {
  try {
    const raw = localStorage.getItem(LV_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load leaves from localStorage', e);
  }
  return INITIAL_LEAVES;
}

export function saveStoredLeaves(data: LeaveRequest[]) {
  try {
    localStorage.setItem(LV_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save leaves', e);
  }
}
