import { Employee, CurrencyType, CompanyType, RoleLevel } from '../types';
import { DEFAULT_EXCHANGE_RATES } from '../utils/statutoryCalculations';

export interface SheetMetadata {
  id: number;
  title: string;
  rowCount: number;
  columnCount: number;
}

export interface GoogleSpreadsheetInfo {
  spreadsheetId: string;
  title: string;
  sheets: SheetMetadata[];
}

/**
 * Fetch spreadsheet metadata to discover sheet titles and gids
 */
export async function fetchSpreadsheetInfo(
  spreadsheetId: string,
  accessToken: string
): Promise<GoogleSpreadsheetInfo> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gagal membaca maklumat Google Sheet (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  const sheets: SheetMetadata[] = (data.sheets || []).map((s: any) => ({
    id: s.properties?.sheetId,
    title: s.properties?.title || 'Sheet1',
    rowCount: s.properties?.gridProperties?.rowCount || 0,
    columnCount: s.properties?.gridProperties?.columnCount || 0,
  }));

  return {
    spreadsheetId,
    title: data.properties?.title || 'Google Sheet Karyawan',
    sheets,
  };
}

/**
 * Fetch rows from a specific sheet / tab
 */
export async function fetchSheetValues(
  spreadsheetId: string,
  sheetTitle: string,
  accessToken: string
): Promise<string[][]> {
  const range = `${encodeURIComponent(sheetTitle)}!A1:ZZ1000`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gagal membaca data sel (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return (data.values as string[][]) || [];
}

/**
 * Normalize and map tabular rows into Employee objects
 */
export function parseSheetRowsToEmployees(
  rows: string[][],
  existingEmployees: Employee[] = []
): { employees: Employee[]; recognizedCount: number; headers: string[] } {
  if (!rows || rows.length === 0) {
    return { employees: [], recognizedCount: 0, headers: [] };
  }

  // Find header row (first non-empty row)
  let headerRowIndex = 0;
  while (headerRowIndex < rows.length && (!rows[headerRowIndex] || rows[headerRowIndex].length === 0)) {
    headerRowIndex++;
  }

  if (headerRowIndex >= rows.length) {
    return { employees: [], recognizedCount: 0, headers: [] };
  }

  const rawHeaders = rows[headerRowIndex].map((h) => (h || '').toString().trim());
  const normalizedHeaders = rawHeaders.map((h) => h.toLowerCase());

  // Helper column index finder
  const findCol = (...keywords: string[]): number => {
    return normalizedHeaders.findIndex((h) =>
      keywords.some((kw) => h === kw || h.includes(kw))
    );
  };

  const idIdx = findCol('id', 'emp id', 'empid', 'no pekerja', 'nik', 'kod pekerja');
  const nameIdx = findCol('nama', 'name', 'employee name', 'nama karyawan', 'nama pekerja');
  const roleIdx = findCol('jawatan', 'role', 'position', 'designation', 'jabatan pekerjaan', 'posisi');
  const deptIdx = findCol('jabatan', 'department', 'bahagian', 'unit', 'divisi');
  const salaryIdx = findCol('gaji', 'salary', 'basic', 'gaji pokok', 'gaji asas', 'upah', 'basic salary');
  const currencyIdx = findCol('mata wang', 'currency', 'valuta', 'curr', 'mata uang');
  const rateIdx = findCol('kadar', 'rate', 'exchange', 'kurs', 'kadar pertukaran');
  const bankIdx = findCol('bank', 'nama bank', 'bank name');
  const acctIdx = findCol('akaun', 'account', 'no akaun', 'no rekening', 'acc no', 'bank account');
  const nricIdx = findCol('ic', 'nric', 'no kp', 'no kad pengenalan', 'ktp', 'passport');
  const emailIdx = findCol('emel', 'email', 'e-mel', 'mail');
  const phoneIdx = findCol('telefon', 'phone', 'tel', 'no hp', 'handphone', 'contact');
  const remoteIdx = findCol('remote', 'luar negara', 'lokasi', 'overseas', 'country', 'negara');
  const companyIdx = findCol('syarikat', 'company', 'entiti', 'badan usaha');
  const accessIdx = findCol('role level', 'akses', 'peranan', 'level', 'user role');
  const epfIdx = findCol('epf', 'kwsp', 'no epf', 'no kwsp');
  const socsoIdx = findCol('socso', 'perkeso', 'no perkeso', 'no socso');
  const taxIdx = findCol('cukai', 'tax', 'lhdn', 'npwp');
  const genderIdx = findCol('jantina', 'gender', 'jenis kelamin');

  const parsedEmployees: Employee[] = [];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    // Must have at least a name
    const rawName = nameIdx !== -1 ? row[nameIdx]?.trim() : (row[0] || '').trim();
    if (!rawName) continue;

    // ID
    const rawId = idIdx !== -1 && row[idIdx]?.trim()
      ? row[idIdx].trim()
      : `EMP${String(parsedEmployees.length + existingEmployees.length + 1).padStart(3, '0')}`;

    // Existing check
    const existing = existingEmployees.find(
      (e) => e.id.toLowerCase() === rawId.toLowerCase() || e.name.toLowerCase() === rawName.toLowerCase()
    );

    // Role & Department
    const role = (roleIdx !== -1 && row[roleIdx]?.trim()) || existing?.role || 'Executive';
    const department = (deptIdx !== -1 && row[deptIdx]?.trim()) || existing?.department || 'Administration';

    // Currency
    let currency: CurrencyType = 'MYR';
    if (currencyIdx !== -1 && row[currencyIdx]?.trim()) {
      const cStr = row[currencyIdx].trim().toUpperCase();
      if (['MYR', 'IDR', 'USD', 'SGD', 'EUR', 'GBP', 'AUD', 'JPY'].includes(cStr)) {
        currency = cStr as CurrencyType;
      }
    } else if (existing?.salaryCurrency) {
      currency = existing.salaryCurrency;
    }

    // Salary Parsing
    let rawSalaryVal = salaryIdx !== -1 && row[salaryIdx] ? row[salaryIdx].toString().replace(/[^0-9.]/g, '') : '';
    let parsedAmount = rawSalaryVal ? parseFloat(rawSalaryVal) : (existing?.basicSalary || 3500);
    if (isNaN(parsedAmount) || parsedAmount <= 0) parsedAmount = 3500;

    // Exchange Rate
    let rate = currency === 'MYR' ? 1.0 : (DEFAULT_EXCHANGE_RATES[currency] || 1.0);
    if (rateIdx !== -1 && row[rateIdx]) {
      const customRate = parseFloat(row[rateIdx].toString().replace(/[^0-9.]/g, ''));
      if (!isNaN(customRate) && customRate > 0) {
        rate = customRate;
      }
    }

    let originalAmount = parsedAmount;
    let basicSalaryInMYR = parsedAmount;

    if (currency !== 'MYR') {
      basicSalaryInMYR = Math.round(originalAmount * rate * 100) / 100;
    }

    // Bank
    const bankVal = (bankIdx !== -1 && row[bankIdx]?.trim()) || existing?.bankName || 'Maybank';
    let bankName = bankVal;
    let customBankName: string | undefined = undefined;

    const malaysianBanks = [
      'Maybank',
      'CIMB Bank',
      'Public Bank',
      'RHB Bank',
      'Hong Leong Bank',
      'AmBank',
      'Bank Islam',
      'Bank Muamalat',
      'Alliance Bank',
      'Affin Bank',
      'HSBC Bank Malaysia',
      'Standard Chartered',
      'OCBC Bank Malaysia',
      'UOB Malaysia',
    ];

    if (!malaysianBanks.includes(bankName)) {
      customBankName = bankName;
      bankName = 'Lainnya';
    }

    // Remote Luar Malaysia check
    const remoteVal = (remoteIdx !== -1 && row[remoteIdx]?.trim()) || '';
    const isRemote =
      existing?.isRemoteOverseas ??
      (remoteVal.toLowerCase().includes('remote') ||
        remoteVal.toLowerCase().includes('luar') ||
        remoteVal.toLowerCase().includes('indonesia') ||
        remoteVal.toLowerCase().includes('singapore') ||
        currency !== 'MYR');

    const country =
      (remoteIdx !== -1 && row[remoteIdx]?.trim()) ||
      existing?.workLocationCountry ||
      (currency === 'IDR' ? 'Indonesia' : currency === 'SGD' ? 'Singapore' : currency === 'USD' ? 'United States' : 'Malaysia');

    // Company assignment
    const compVal = (companyIdx !== -1 && row[companyIdx]?.trim()) || existing?.company || '';
    const company: CompanyType = compVal.toLowerCase().includes('pustaka')
      ? 'Pustaka Union'
      : 'Solusi Serumpun Senusantara SDN. BHD.';

    // Role Access Level
    const accessVal = (accessIdx !== -1 && row[accessIdx]?.trim().toLowerCase()) || '';
    const roleLevel: RoleLevel =
      existing?.roleLevel ||
      (accessVal.includes('admin') ||
      accessVal.includes('hr') ||
      accessVal.includes('direktur') ||
      accessVal.includes('manager') ||
      role.toLowerCase().includes('direktur') ||
      role.toLowerCase().includes('hr manager') ||
      role.toLowerCase().includes('ceo')
        ? 'admin'
        : 'staff');

    // Email & Password
    const email =
      (emailIdx !== -1 && row[emailIdx]?.trim()) ||
      existing?.email ||
      `${rawName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@company.com`;

    const password =
      existing?.password ||
      `${rawName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}123`;

    // NRIC / Passport
    const nric =
      (nricIdx !== -1 && row[nricIdx]?.trim()) ||
      existing?.nric ||
      `9${Math.floor(100000 + Math.random() * 900000)}-10-${Math.floor(1000 + Math.random() * 9000)}`;

    const phone =
      (phoneIdx !== -1 && row[phoneIdx]?.trim()) || existing?.phone || '+60 12-345 6789';

    const empObj: Employee = {
      id: rawId,
      name: rawName,
      role,
      department,
      email,
      password,
      roleLevel,
      company,
      phone,
      nric,
      gender: (genderIdx !== -1 && row[genderIdx]?.trim() as any) || existing?.gender || 'Male',
      joinDate: existing?.joinDate || '2023-01-01',
      employmentType: existing?.employmentType || 'Full-time',
      salaryCurrency: currency,
      originalSalaryAmount: originalAmount,
      exchangeRateToMYR: rate,
      basicSalary: basicSalaryInMYR,
      fixedAllowance: existing?.fixedAllowance || 0,
      isRemoteOverseas: isRemote,
      workLocationCountry: country,
      epfNumber: isRemote ? 'DIKECUALIKAN' : (epfIdx !== -1 && row[epfIdx]?.trim()) || existing?.epfNumber || `EPF-${Math.floor(1000000 + Math.random() * 9000000)}`,
      socsoNumber: isRemote ? 'DIKECUALIKAN' : (socsoIdx !== -1 && row[socsoIdx]?.trim()) || existing?.socsoNumber || `SOC-${Math.floor(1000000 + Math.random() * 9000000)}`,
      taxNumber: (taxIdx !== -1 && row[taxIdx]?.trim()) || existing?.taxNumber || `SG-${Math.floor(10000000 + Math.random() * 90000000)}-0`,
      bankName,
      customBankName,
      bankAccount: (acctIdx !== -1 && row[acctIdx]?.trim()) || existing?.bankAccount || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      emergencyContactName: existing?.emergencyContactName || 'Keluarga Terdekat',
      emergencyContactPhone: existing?.emergencyContactPhone || phone,
      emergencyContactRelation: existing?.emergencyContactRelation || 'Spouse',
      address: existing?.address || (isRemote ? `Alamat Tempat Kerja (${country})` : 'Kuala Lumpur, Malaysia'),
      avatar: existing?.avatar || `https://images.unsplash.com/photo-${1500000000000 + (parsedEmployees.length * 777777 % 50000000)}?w=150`,
      leaveBalance: existing?.leaveBalance || {
        annual: 14,
        annualTaken: 0,
        medical: 14,
        medicalTaken: 0,
        emergency: 5,
        emergencyTaken: 0,
        maternity: 98,
        maternityTaken: 0,
      },
    };

    parsedEmployees.push(empObj);
  }

  return {
    employees: parsedEmployees,
    recognizedCount: parsedEmployees.length,
    headers: rawHeaders,
  };
}
