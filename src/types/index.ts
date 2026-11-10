export type Language = 'ms' | 'en';

export type EmploymentType = 'Full-time' | 'Contract' | 'Probation' | 'Part-time';

export type AttendanceStatus = 'Present' | 'Late' | 'Half Day' | 'On Leave' | 'Absent';

export type LeaveType = 
  | 'Annual Leave' 
  | 'Medical Leave' 
  | 'Emergency Leave' 
  | 'Unpaid Leave' 
  | 'Maternity/Paternity Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveBalance {
  annual: number;
  annualTaken: number;
  medical: number;
  medicalTaken: number;
  emergency: number;
  emergencyTaken: number;
  maternity: number;
  maternityTaken: number;
}

export type CompanyType = 'Solusi Serumpun Senusantara SDN. BHD.' | 'Pustaka Union';

export type CurrencyType = 'MYR' | 'USD' | 'IDR' | 'SGD' | 'EUR' | 'GBP' | 'AUD' | 'JPY';

export interface Employee {
  id: string; // e.g., EMP001
  name: string;
  role: string;
  department: string;
  email: string;
  password?: string;
  roleLevel?: 'admin' | 'staff';
  company?: CompanyType;
  phone: string;
  nric: string; // IC / KTP / Passport
  gender: 'Male' | 'Female';
  joinDate: string; // YYYY-MM-DD
  employmentType: EmploymentType;
  
  // Salary & Multi-Currency
  basicSalary: number; // in MYR / RM (adjusted / converted)
  salaryCurrency?: CurrencyType; // e.g. 'MYR', 'USD', 'IDR', 'SGD'
  originalSalaryAmount?: number; // amount in salaryCurrency
  exchangeRateToMYR?: number; // exchange rate to 1 MYR
  
  // Remote Overseas Exemption
  isRemoteOverseas?: boolean; // If true, remote worker outside Malaysia (EXEMPT from EPF, SOCSO, EIS)
  workLocationCountry?: string; // e.g. 'Malaysia', 'Indonesia', 'Singapore'

  fixedAllowance: number;
  epfNumber: string; // KWSP No
  socsoNumber: string; // PERKESO No
  taxNumber: string; // LHDN No / NPWP / Tax ID
  bankName: string;
  customBankName?: string; // When bankName is 'Lainnya'
  bankAccount: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  address: string;
  avatar: string;
  leaveBalance: LeaveBalance;
  epfEmployeeRate?: number; // default 11%
  isEpffExempt?: boolean;
}

export function isPrivilegedRole(emp?: Employee | null): boolean {
  if (!emp) return false;
  if (emp.roleLevel === 'admin') return true;
  const roleLower = (emp.role || '').toLowerCase();
  const deptLower = (emp.department || '').toLowerCase();
  return (
    deptLower.includes('human resources') ||
    deptLower.includes('hr') ||
    roleLower.includes('manager') ||
    roleLower.includes('pengurus') ||
    roleLower.includes('direktur') ||
    roleLower.includes('director') ||
    roleLower.includes('lead')
  );
}

export interface AttendanceRecord {
  id: string;
  empId: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM or '--:--'
  clockOut: string; // HH:MM or '--:--'
  status: AttendanceStatus;
  workHours: number;
  otHours: number;
  notes: string;
  location?: string;
  verificationMethod?: 'GPS & Photo' | 'Manual HR' | 'Web Punch';
}

export interface LeaveRequest {
  id: string;
  empId: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  isHalfDay?: boolean;
  reason: string;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentSize?: string;
  attachmentType?: string;
  status: LeaveStatus;
  appliedAt: string; // YYYY-MM-DD HH:MM
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface PayrollRecord {
  id: string;
  empId: string;
  month: string; // YYYY-MM
  basicSalary: number;
  allowance: number;
  otHours: number;
  hourlyRate: number;
  otPay: number;
  bonus: number;
  grossSalary: number;
  
  // Statutory Deductions (Employee)
  epfEmployee: number; // 11% KWSP
  socsoEmployee: number; // PERKESO
  eisEmployee: number; // SIP 0.2%
  pcbTax: number; // Income tax deduction
  unpaidLeaveDeduction: number;
  otherDeductions: number;
  totalEmployeeDeductions: number;
  
  // Net Pay to Employee
  netSalary: number;
  
  // Statutory Contributions (Employer)
  epfEmployer: number; // 12% or 13% KWSP
  socsoEmployer: number; // PERKESO Employer
  eisEmployer: number; // SIP 0.2%
  totalEmployerStatutory: number;
  
  // Company Total Cost
  totalCompanyCost: number;
  
  paymentStatus: 'Paid' | 'Processing' | 'Pending';
  paymentDate?: string;
  notes?: string;

  // Multi-Currency and Remote Exemption
  salaryCurrency?: CurrencyType;
  originalSalaryAmount?: number;
  exchangeRateToMYR?: number;
  isRemoteOverseas?: boolean;
  workLocationCountry?: string;
  bankName?: string;
  customBankName?: string;
}
