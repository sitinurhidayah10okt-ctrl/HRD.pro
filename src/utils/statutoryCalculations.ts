import { Employee, AttendanceRecord, LeaveRequest, PayrollRecord, CurrencyType } from '../types';

/**
 * Standard live exchange rates to Malaysian Ringgit (MYR).
 * 1 Foreign Currency Unit = X MYR.
 */
export const DEFAULT_EXCHANGE_RATES: Record<CurrencyType, number> = {
  MYR: 1.0,
  USD: 4.45,     // 1 USD = 4.45 MYR
  IDR: 0.00028,  // 10,000,000 IDR = 2,800 MYR
  SGD: 3.32,     // 1 SGD = 3.32 MYR
  EUR: 4.85,     // 1 EUR = 4.85 MYR
  GBP: 5.65,     // 1 GBP = 5.65 MYR
  AUD: 2.95,     // 1 AUD = 2.95 MYR
  JPY: 0.029,    // 100 JPY = 2.90 MYR
};

export const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  MYR: 'RM',
  USD: '$',
  IDR: 'Rp',
  SGD: 'S$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  JPY: '¥',
};

/**
 * Convert foreign currency amount to MYR
 */
export function convertToMYR(amount: number, currency: CurrencyType = 'MYR', customRate?: number): number {
  if (currency === 'MYR') return amount;
  const rate = customRate && customRate > 0 ? customRate : (DEFAULT_EXCHANGE_RATES[currency] || 1.0);
  return Number((amount * rate).toFixed(2));
}

/**
 * EPF (KWSP) Calculation:
 * - Employee rate: Standard 11% (or customized)
 * - Employer rate: 13% for basic <= RM 5,000; 12% for basic > RM 5,000
 * - Remote employees outside Malaysia: EXEMPT (0%)
 */
export function calculateEPF(wage: number, employeeRate: number = 0.11, isExempt: boolean = false): { employee: number; employer: number } {
  if (isExempt || wage <= 0) return { employee: 0, employer: 0 };
  
  const employeeContrib = Math.round(wage * employeeRate);
  const employerRate = wage <= 5000 ? 0.13 : 0.12;
  const employerContrib = Math.round(wage * employerRate);
  
  return {
    employee: employeeContrib,
    employer: employerContrib,
  };
}

/**
 * SOCSO (PERKESO) Category 1 (Employment Injury & Invalidity Scheme)
 * Based on official Malaysian SOCSO Schedule of Contributions.
 * Ceiling is RM 5,000 (or RM 6,000 under recent amendment).
 * - Remote employees outside Malaysia: EXEMPT (RM 0)
 */
export function calculateSOCSO(wage: number, isExempt: boolean = false): { employee: number; employer: number } {
  if (isExempt || wage <= 0) return { employee: 0, employer: 0 };

  const cappedWage = Math.min(wage, 5000);

  // SOCSO Schedule approximate lookup: ~0.5% employee, ~1.75% employer
  if (cappedWage <= 1000) {
    const factor = Math.ceil(cappedWage / 100);
    return {
      employee: Number((factor * 0.50).toFixed(2)),
      employer: Number((factor * 1.75).toFixed(2)),
    };
  } else if (cappedWage <= 2000) {
    return { employee: 9.75, employer: 34.15 };
  } else if (cappedWage <= 3000) {
    return { employee: 14.75, employer: 51.65 };
  } else if (cappedWage <= 4000) {
    return { employee: 19.75, employer: 69.15 };
  } else {
    // 4000 - 5000 (Ceiling)
    return { employee: 24.75, employer: 86.65 };
  }
}

/**
 * EIS (Employment Insurance System / Sistem Insurans Pekerjaan)
 * 0.2% Employee and 0.2% Employer, capped at wage ceiling RM 5,000 (max RM 9.90 / RM 9.90).
 * - Remote employees outside Malaysia: EXEMPT (RM 0)
 */
export function calculateEIS(wage: number, isExempt: boolean = false): { employee: number; employer: number } {
  if (isExempt || wage <= 0) return { employee: 0, employer: 0 };
  
  const cappedWage = Math.min(wage, 5000);
  
  let contrib = 9.90;
  if (cappedWage <= 1000) contrib = 1.90;
  else if (cappedWage <= 2000) contrib = 3.90;
  else if (cappedWage <= 3000) contrib = 5.90;
  else if (cappedWage <= 4000) contrib = 7.90;
  else contrib = 9.90;

  return {
    employee: contrib,
    employer: contrib,
  };
}

/**
 * Calculate Monthly Overtime Pay based on Malaysia Employment Act
 * Hourly Ordinary Rate of Pay (ORP) = (Monthly Basic / 26 days) / 8 hours
 * Normal overtime multiplier = 1.5x
 */
export function calculateOTPay(basicSalary: number, otHours: number): { hourlyRate: number; otPay: number } {
  if (basicSalary <= 0 || otHours <= 0) {
    const hourly = basicSalary > 0 ? Number(((basicSalary / 26) / 8).toFixed(2)) : 0;
    return { hourlyRate: hourly, otPay: 0 };
  }
  const hourlyRate = Number(((basicSalary / 26) / 8).toFixed(2));
  const otPay = Number((hourlyRate * 1.5 * otHours).toFixed(2));
  return { hourlyRate, otPay };
}

/**
 * Auto-generate payroll records for a month by combining employee basic,
 * foreign currency conversion to MYR, attendance overtime records,
 * and statutory deductions (EPF, SOCSO, EIS).
 * NOTE: Remote workers outside Malaysia are EXEMPT from SOCSO, EIS, and EPF.
 */
export function generateMonthlyPayroll(
  employees: Employee[],
  attendanceList: AttendanceRecord[],
  leaveRequests: LeaveRequest[],
  month: string // e.g. "2026-11"
): PayrollRecord[] {
  return employees.map((emp) => {
    // 1. Multi-Currency Adjustment to MYR:
    const currency = emp.salaryCurrency || 'MYR';
    const exchangeRate = emp.exchangeRateToMYR || DEFAULT_EXCHANGE_RATES[currency] || 1.0;
    
    let adjustedBasicMYR = emp.basicSalary;
    if (currency !== 'MYR' && emp.originalSalaryAmount && emp.originalSalaryAmount > 0) {
      adjustedBasicMYR = Number((emp.originalSalaryAmount * exchangeRate).toFixed(2));
    }

    // 2. Calculate overtime hours from attendance for this month
    const empAttendance = attendanceList.filter(
      (a) => a.empId === emp.id && a.date.startsWith(month)
    );
    const totalOtHours = empAttendance.reduce((sum, att) => sum + (att.otHours || 0), 0);
    const { hourlyRate, otPay } = calculateOTPay(adjustedBasicMYR, totalOtHours);

    // 3. Calculate Unpaid Leave deductions
    const unpaidLeaves = leaveRequests.filter(
      (l) => l.empId === emp.id && 
             l.status === 'Approved' && 
             l.type === 'Unpaid Leave' && 
             l.startDate.startsWith(month)
    );
    const unpaidDays = unpaidLeaves.reduce((sum, l) => sum + l.daysCount, 0);
    const dailyRate = Number((adjustedBasicMYR / 26).toFixed(2));
    const unpaidLeaveDeduction = Number((dailyRate * unpaidDays).toFixed(2));

    // 4. Gross Salary (in MYR)
    const allowance = emp.fixedAllowance || 0;
    const bonus = 0; // custom bonus can be edited later
    const grossSalary = Number((adjustedBasicMYR + allowance + otPay + bonus).toFixed(2));

    // 5. Statutory Deductions (EPF, SOCSO, EIS):
    // CRITICAL: Remote employees outside Malaysia are NOT subject to EPF, SOCSO, EIS
    const isStatutoryExempt = Boolean(emp.isRemoteOverseas || emp.isEpffExempt);
    
    // EPF is calculated on Basic + Allowance
    const epfWageBase = adjustedBasicMYR + allowance;
    const epf = calculateEPF(epfWageBase, emp.epfEmployeeRate || 0.11, isStatutoryExempt);
    
    // SOCSO and EIS on monthly gross or capped wage
    const socso = calculateSOCSO(grossSalary, isStatutoryExempt);
    const eis = calculateEIS(grossSalary, isStatutoryExempt);

    // 6. Estimated Income Tax (PCB) for local tax
    let pcbTax = 0;
    if (!isStatutoryExempt) {
      if (grossSalary > 8000) {
        pcbTax = Number(((grossSalary - 7000) * 0.14).toFixed(2));
      } else if (grossSalary > 5000) {
        pcbTax = Number(((grossSalary - 4500) * 0.08).toFixed(2));
      }
    }

    const totalEmployeeDeductions = Number(
      (epf.employee + socso.employee + eis.employee + pcbTax + unpaidLeaveDeduction).toFixed(2)
    );

    const netSalary = Number((grossSalary - totalEmployeeDeductions).toFixed(2));

    const totalEmployerStatutory = Number(
      (epf.employer + socso.employer + eis.employer).toFixed(2)
    );

    const totalCompanyCost = Number((grossSalary + totalEmployerStatutory).toFixed(2));

    return {
      id: `PAY-${month}-${emp.id}`,
      empId: emp.id,
      month,
      basicSalary: adjustedBasicMYR,
      allowance,
      otHours: totalOtHours,
      hourlyRate,
      otPay,
      bonus,
      grossSalary,
      epfEmployee: epf.employee,
      epfEmployer: epf.employer,
      socsoEmployee: socso.employee,
      socsoEmployer: socso.employer,
      eisEmployee: eis.employee,
      eisEmployer: eis.employer,
      pcbTax,
      unpaidLeaveDeduction,
      otherDeductions: 0,
      totalEmployeeDeductions,
      netSalary,
      totalEmployerStatutory,
      totalCompanyCost,
      paymentStatus: 'Pending',

      // Multi-Currency & Remote tracking
      salaryCurrency: currency,
      originalSalaryAmount: emp.originalSalaryAmount || emp.basicSalary,
      exchangeRateToMYR: exchangeRate,
      isRemoteOverseas: emp.isRemoteOverseas,
      workLocationCountry: emp.workLocationCountry || (emp.isRemoteOverseas ? 'Remote Luar Negara' : 'Malaysia'),
      bankName: emp.bankName,
      customBankName: emp.customBankName,
    };
  });
}

/**
 * Trigger browser file download for CSV content
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate comprehensive Payroll & Statutory CSV (EPF, SOCSO, EIS)
 */
export function exportPayrollStatutoryCSV(payrollList: PayrollRecord[], employees: Employee[], month: string) {
  const headers = [
    'Employee ID',
    'Employee Name',
    'NRIC / Passport',
    'Department',
    'Position',
    'Work Location / Remote Status',
    'Bank Name',
    'Bank Account',
    'Salary Currency',
    'Original Foreign Amount',
    'Exchange Rate to MYR',
    'Adjusted Basic Salary (RM)',
    'Allowance (RM)',
    'OT Hours',
    'OT Pay (RM)',
    'Gross Salary (RM)',
    'Statutory Status',
    'EPF Employee 11% (RM)',
    'SOCSO Employee (RM)',
    'EIS Employee 0.2% (RM)',
    'Tax PCB (RM)',
    'Unpaid Leave Ded (RM)',
    'Total Deductions (RM)',
    'NET SALARY (RM)',
    'EPF Employer (RM)',
    'SOCSO Employer (RM)',
    'EIS Employer 0.2% (RM)',
    'Total Employer Statutory (RM)',
    'Total Company Cost (RM)',
    'Payment Status',
  ];

  const rows = payrollList.map((pay) => {
    const emp = employees.find((e) => e.id === pay.empId);
    const bankDisplay = emp?.bankName === 'Lainnya' ? (emp?.customBankName || 'Bank Lainnya') : (emp?.bankName || '');
    const locationStatus = emp?.isRemoteOverseas ? `Remote Luar Malaysia (${emp?.workLocationCountry || 'Overseas'})` : 'Tempatan (Malaysia)';
    const statutoryStatus = emp?.isRemoteOverseas ? 'Dikecualikan (Exempt Remote)' : 'Wajib Caruman (Standard)';
    const currency = pay.salaryCurrency || emp?.salaryCurrency || 'MYR';
    const originalAmt = pay.originalSalaryAmount !== undefined ? pay.originalSalaryAmount : (emp?.originalSalaryAmount || pay.basicSalary);
    const exRate = pay.exchangeRateToMYR || emp?.exchangeRateToMYR || 1.0;

    return [
      `"${pay.empId}"`,
      `"${emp?.name || ''}"`,
      `"${emp?.nric || ''}"`,
      `"${emp?.department || ''}"`,
      `"${emp?.role || ''}"`,
      `"${locationStatus}"`,
      `"${bankDisplay}"`,
      `'${emp?.bankAccount || ''}`,
      `"${currency}"`,
      originalAmt.toFixed(2),
      exRate.toFixed(5),
      pay.basicSalary.toFixed(2),
      pay.allowance.toFixed(2),
      pay.otHours.toFixed(1),
      pay.otPay.toFixed(2),
      pay.grossSalary.toFixed(2),
      `"${statutoryStatus}"`,
      pay.epfEmployee.toFixed(2),
      pay.socsoEmployee.toFixed(2),
      pay.eisEmployee.toFixed(2),
      pay.pcbTax.toFixed(2),
      pay.unpaidLeaveDeduction.toFixed(2),
      pay.totalEmployeeDeductions.toFixed(2),
      pay.netSalary.toFixed(2),
      pay.epfEmployer.toFixed(2),
      pay.socsoEmployer.toFixed(2),
      pay.eisEmployer.toFixed(2),
      pay.totalEmployerStatutory.toFixed(2),
      pay.totalCompanyCost.toFixed(2),
      `"${pay.paymentStatus}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`Payroll_Statutori_EPF_SOCSO_EIS_${month}.csv`, csvContent);
}

/**
 * Generate dedicated Statutory Compliance CSV (KWSP EPF, PERKESO SOCSO, SIP EIS submission)
 */
/**
 * 1. Dedicated SALARY (Penggajian Bulanan) CSV
 */
export function exportSalarySummaryCSV(payrollList: PayrollRecord[], employees: Employee[], month: string) {
  const headers = [
    'Bil',
    'ID Pekerja',
    'Nama Karyawan',
    'Jawatan',
    'Jabatan',
    'Syarikat',
    'Status Lokasi',
    'Mata Wang Asal',
    'Gaji Asal',
    'Kadar Pertukaran',
    'Gaji Pokok (RM)',
    'Elaun Tetap (RM)',
    'Jam Kerja Lebih Masa (OT)',
    'Bayaran OT (RM)',
    'Bonus (RM)',
    'Gaji Kasar (RM)',
    'Potongan KWSP (RM)',
    'Potongan SOCSO (RM)',
    'Potongan EIS (RM)',
    'Potongan Cukai PCB (RM)',
    'Potongan Cuti Tanpa Gaji (RM)',
    'Jumlah Potongan Pekerja (RM)',
    'GAJI BERSIH (NET SALARY) (RM)',
    'Caruman Majikan (RM)',
    'Jumlah Kos Syarikat (RM)',
    'Nama Bank',
    'No Akaun Bank',
    'Status Bayaran',
  ];

  const rows = payrollList.map((pay, idx) => {
    const emp = employees.find((e) => e.id === pay.empId);
    const bankDisplay = emp?.bankName === 'Lainnya' ? (emp?.customBankName || 'Bank Lainnya') : (emp?.bankName || '');
    const locationStatus = emp?.isRemoteOverseas
      ? `Remote Luar Malaysia (${emp?.workLocationCountry || 'Luar Malaysia'})`
      : 'Tempatan (Malaysia)';
    const currency = pay.salaryCurrency || emp?.salaryCurrency || 'MYR';
    const originalAmt = pay.originalSalaryAmount !== undefined ? pay.originalSalaryAmount : (emp?.originalSalaryAmount || pay.basicSalary);
    const exRate = pay.exchangeRateToMYR || emp?.exchangeRateToMYR || 1.0;

    return [
      idx + 1,
      `"${pay.empId}"`,
      `"${emp?.name || ''}"`,
      `"${emp?.role || ''}"`,
      `"${emp?.department || ''}"`,
      `"${emp?.company || 'Solusi Serumpun Senusantara SDN. BHD.'}"`,
      `"${locationStatus}"`,
      `"${currency}"`,
      originalAmt.toFixed(2),
      exRate.toFixed(5),
      pay.basicSalary.toFixed(2),
      pay.allowance.toFixed(2),
      pay.otHours.toFixed(1),
      pay.otPay.toFixed(2),
      pay.bonus.toFixed(2),
      pay.grossSalary.toFixed(2),
      pay.epfEmployee.toFixed(2),
      pay.socsoEmployee.toFixed(2),
      pay.eisEmployee.toFixed(2),
      pay.pcbTax.toFixed(2),
      pay.unpaidLeaveDeduction.toFixed(2),
      pay.totalEmployeeDeductions.toFixed(2),
      pay.netSalary.toFixed(2),
      pay.totalEmployerStatutory.toFixed(2),
      pay.totalCompanyCost.toFixed(2),
      `"${bankDisplay}"`,
      `'${emp?.bankAccount || ''}`,
      `"${pay.paymentStatus}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`1_Salary_Gaji_Bulanan_${month}.csv`, csvContent);
}

/**
 * 2. Dedicated EPF / KWSP (Borang A) CSV
 */
export function exportEPFCSV(payrollList: PayrollRecord[], employees: Employee[], month: string) {
  const headers = [
    'Bil',
    'No Ahli KWSP',
    'No Kad Pengenalan / Passport',
    'Nama Penuh Pekerja',
    'ID Pekerja',
    'Syarikat Majikan',
    'Status Lokasi',
    'Status Caruman KWSP',
    'Gaji Pokok (RM)',
    'Gaji Layak Dicarum (RM)',
    'Syer Pekerja KWSP 11% (RM)',
    'Syer Majikan KWSP 12-13% (RM)',
    'Jumlah Caruman KWSP (RM)',
  ];

  const rows = payrollList.map((pay, idx) => {
    const emp = employees.find((e) => e.id === pay.empId);
    const locationStatus = emp?.isRemoteOverseas ? `Remote (${emp?.workLocationCountry || 'Luar Malaysia'})` : 'Tempatan Malaysia';
    const epfStatus = emp?.isRemoteOverseas ? 'Dikecualikan (0% Remote Luar Negara)' : 'Wajib Caruman';
    const totalKWSP = pay.epfEmployee + pay.epfEmployer;

    return [
      idx + 1,
      `"${emp?.isRemoteOverseas ? 'DIKECUALIKAN' : (emp?.epfNumber || '')}"`,
      `"${emp?.nric || ''}"`,
      `"${emp?.name || ''}"`,
      `"${pay.empId}"`,
      `"${emp?.company || 'Solusi Serumpun Senusantara SDN. BHD.'}"`,
      `"${locationStatus}"`,
      `"${epfStatus}"`,
      pay.basicSalary.toFixed(2),
      emp?.isRemoteOverseas ? '0.00' : pay.grossSalary.toFixed(2),
      pay.epfEmployee.toFixed(2),
      pay.epfEmployer.toFixed(2),
      totalKWSP.toFixed(2),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`2_KWSP_EPF_Borang_A_${month}.csv`, csvContent);
}

/**
 * 3. Dedicated SOCSO / PERKESO (Borang 8A) CSV
 */
export function exportSOCSOCSV(payrollList: PayrollRecord[], employees: Employee[], month: string) {
  const headers = [
    'Bil',
    'No PERKESO',
    'No Kad Pengenalan / Passport',
    'Nama Penuh Pekerja',
    'ID Pekerja',
    'Syarikat Majikan',
    'Status Lokasi',
    'Status Caruman PERKESO',
    'Gaji Bersih Dicarum (Maks RM 6000)',
    'Syer Pekerja SOCSO (RM)',
    'Syer Majikan SOCSO (RM)',
    'Jumlah Caruman SOCSO / PERKESO (RM)',
    'Kategori Skim PERKESO',
  ];

  const rows = payrollList.map((pay, idx) => {
    const emp = employees.find((e) => e.id === pay.empId);
    const locationStatus = emp?.isRemoteOverseas ? `Remote (${emp?.workLocationCountry || 'Luar Malaysia'})` : 'Tempatan Malaysia';
    const socsoStatus = emp?.isRemoteOverseas ? 'Dikecualikan (0% Remote Luar Negara)' : 'Wajib Caruman';
    const totalSOCSO = pay.socsoEmployee + pay.socsoEmployer;
    const cappedWages = Math.min(pay.grossSalary, 6000);

    return [
      idx + 1,
      `"${emp?.isRemoteOverseas ? 'DIKECUALIKAN' : (emp?.socsoNumber || '')}"`,
      `"${emp?.nric || ''}"`,
      `"${emp?.name || ''}"`,
      `"${pay.empId}"`,
      `"${emp?.company || 'Solusi Serumpun Senusantara SDN. BHD.'}"`,
      `"${locationStatus}"`,
      `"${socsoStatus}"`,
      emp?.isRemoteOverseas ? '0.00' : cappedWages.toFixed(2),
      pay.socsoEmployee.toFixed(2),
      pay.socsoEmployer.toFixed(2),
      totalSOCSO.toFixed(2),
      emp?.isRemoteOverseas ? '"-"' : '"Kategori 1 (Bencana Pekerjaan & Keilatan)"',
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`3_PERKESO_SOCSO_Borang_8A_${month}.csv`, csvContent);
}

/**
 * 4. Dedicated EIS / SIP (Borang 1A / 2A) CSV
 */
export function exportEISCSV(payrollList: PayrollRecord[], employees: Employee[], month: string) {
  const headers = [
    'Bil',
    'No Kad Pengenalan / Passport',
    'Nama Penuh Pekerja',
    'ID Pekerja',
    'Syarikat Majikan',
    'Status Lokasi',
    'Status Caruman EIS',
    'Gaji Diinsuranskan (Maks RM 6000)',
    'Syer Pekerja EIS 0.2% (RM)',
    'Syer Majikan EIS 0.2% (RM)',
    'Jumlah Caruman SIP EIS (RM)',
  ];

  const rows = payrollList.map((pay, idx) => {
    const emp = employees.find((e) => e.id === pay.empId);
    const locationStatus = emp?.isRemoteOverseas ? `Remote (${emp?.workLocationCountry || 'Luar Malaysia'})` : 'Tempatan Malaysia';
    const eisStatus = emp?.isRemoteOverseas ? 'Dikecualikan (0% Remote Luar Negara)' : 'Wajib Caruman';
    const totalEIS = pay.eisEmployee + pay.eisEmployer;
    const cappedWages = Math.min(pay.grossSalary, 6000);

    return [
      idx + 1,
      `"${emp?.nric || ''}"`,
      `"${emp?.name || ''}"`,
      `"${pay.empId}"`,
      `"${emp?.company || 'Solusi Serumpun Senusantara SDN. BHD.'}"`,
      `"${locationStatus}"`,
      `"${eisStatus}"`,
      emp?.isRemoteOverseas ? '0.00' : cappedWages.toFixed(2),
      pay.eisEmployee.toFixed(2),
      pay.eisEmployer.toFixed(2),
      totalEIS.toFixed(2),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`4_SIP_EIS_Borang_1A_${month}.csv`, csvContent);
}

/**
 * 5. Download All 4 Separate CSVs (Salary, EPF, SOCSO, EIS) Sequentially
 */
export function exportAllSeparateCSVs(payrollList: PayrollRecord[], employees: Employee[], month: string) {
  // 1. Salary
  exportSalarySummaryCSV(payrollList, employees, month);
  
  // 2. EPF after 300ms
  setTimeout(() => {
    exportEPFCSV(payrollList, employees, month);
  }, 350);

  // 3. SOCSO after 700ms
  setTimeout(() => {
    exportSOCSOCSV(payrollList, employees, month);
  }, 700);

  // 4. EIS after 1050ms
  setTimeout(() => {
    exportEISCSV(payrollList, employees, month);
  }, 1050);
}

/**
 * Generate combined Statutory Compliance CSV (for overview)
 */
export function exportStatutoryComplianceCSV(payrollList: PayrollRecord[], employees: Employee[], month: string) {
  const headers = [
    'Bil',
    'No Pekerja',
    'Nama Penuh',
    'No Kad Pengenalan',
    'Status Lokasi',
    'Status Caruman Statutori',
    'No KWSP (EPF)',
    'No PERKESO (SOCSO)',
    'Gaji Kasar Diselaraskan (RM)',
    'KWSP Syer Pekerja (RM)',
    'KWSP Syer Majikan (RM)',
    'KWSP Jumlah (RM)',
    'PERKESO Syer Pekerja (RM)',
    'PERKESO Syer Majikan (RM)',
    'PERKESO Jumlah (RM)',
    'EIS Syer Pekerja (RM)',
    'EIS Syer Majikan (RM)',
    'EIS Jumlah (RM)',
    'Jumlah Caruman Berkanun (RM)',
  ];

  const rows = payrollList.map((pay, idx) => {
    const emp = employees.find((e) => e.id === pay.empId);
    const locationStatus = emp?.isRemoteOverseas ? `Remote Luar Malaysia (${emp?.workLocationCountry || 'Overseas'})` : 'Tempatan (Malaysia)';
    const statutoryStatus = emp?.isRemoteOverseas ? 'Dikecualikan (Remote Luar Negara)' : 'Wajib Dicarum';
    const totalKWSP = pay.epfEmployee + pay.epfEmployer;
    const totalSOCSO = pay.socsoEmployee + pay.socsoEmployer;
    const totalEIS = pay.eisEmployee + pay.eisEmployer;
    const grandStatutory = totalKWSP + totalSOCSO + totalEIS;

    return [
      idx + 1,
      `"${pay.empId}"`,
      `"${emp?.name || ''}"`,
      `"${emp?.nric || ''}"`,
      `"${locationStatus}"`,
      `"${statutoryStatus}"`,
      `"${emp?.epfNumber || (emp?.isRemoteOverseas ? 'DIKECUALIKAN' : '')}"`,
      `"${emp?.socsoNumber || (emp?.isRemoteOverseas ? 'DIKECUALIKAN' : '')}"`,
      pay.grossSalary.toFixed(2),
      pay.epfEmployee.toFixed(2),
      pay.epfEmployer.toFixed(2),
      totalKWSP.toFixed(2),
      pay.socsoEmployee.toFixed(2),
      pay.socsoEmployer.toFixed(2),
      totalSOCSO.toFixed(2),
      pay.eisEmployee.toFixed(2),
      pay.eisEmployer.toFixed(2),
      totalEIS.toFixed(2),
      grandStatutory.toFixed(2),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`Laporan_Statutori_Berkanun_EPF_SOCSO_EIS_${month}.csv`, csvContent);
}

/**
 * Export Attendance CSV
 */
export function exportAttendanceCSV(attendanceList: AttendanceRecord[], employees: Employee[], dateOrMonth: string) {
  const headers = [
    'Log ID',
    'ID Karyawan',
    'Nama Karyawan',
    'Jabatan',
    'Tarikh (Date)',
    'Jam Masuk (Clock In)',
    'Jam Keluar (Clock Out)',
    'Status Kehadiran',
    'Jam Kerja (Hours)',
    'Jam Lebih Masa (OT)',
    'Lokasi',
    'Catatan / Notes',
  ];

  const rows = attendanceList.map((att) => {
    const emp = employees.find((e) => e.id === att.empId);
    return [
      `"${att.id}"`,
      `"${att.empId}"`,
      `"${emp?.name || ''}"`,
      `"${emp?.department || ''}"`,
      `"${att.date}"`,
      `"${att.clockIn}"`,
      `"${att.clockOut}"`,
      `"${att.status}"`,
      att.workHours.toFixed(1),
      att.otHours.toFixed(1),
      `"${att.location || 'HQ Office'}"`,
      `"${att.notes || ''}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`Rekod_Kehadiran_Absensi_${dateOrMonth}.csv`, csvContent);
}

/**
 * Export Leaves CSV
 */
export function exportLeavesCSV(leaveRequests: LeaveRequest[], employees: Employee[]) {
  const headers = [
    'ID Permohonan',
    'ID Pekerja',
    'Nama Pekerja',
    'Jenis Cuti',
    'Tarikh Mula',
    'Tarikh Tamat',
    'Bilangan Hari',
    'Sebab Cuti',
    'Dokumen Lampiran (Attachment)',
    'Status Kelulusan',
    'Tarikh Mohon',
    'Disemak Oleh',
    'Tarikh Disemak',
  ];

  const rows = leaveRequests.map((leave) => {
    const emp = employees.find((e) => e.id === leave.empId);
    return [
      `"${leave.id}"`,
      `"${leave.empId}"`,
      `"${emp?.name || ''}"`,
      `"${leave.type}"`,
      `"${leave.startDate}"`,
      `"${leave.endDate}"`,
      leave.daysCount,
      `"${leave.reason}"`,
      `"${leave.attachmentName || '-'}"`,
      `"${leave.status}"`,
      `"${leave.appliedAt}"`,
      `"${leave.reviewedBy || '-'}"`,
      `"${leave.reviewedAt || '-'}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`Rekod_Permohonan_Cuti_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}
