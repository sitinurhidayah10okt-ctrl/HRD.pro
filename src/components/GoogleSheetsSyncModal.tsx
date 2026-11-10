import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Upload,
  ArrowRight,
  ShieldCheck,
  Building2,
  Globe,
} from 'lucide-react';
import { Employee, Language } from '../types';
import {
  googleSignIn,
  getGoogleAccessToken,
  initGoogleAuth,
  googleSignOut,
} from '../services/googleAuth';
import {
  fetchSpreadsheetInfo,
  fetchSheetValues,
  parseSheetRowsToEmployees,
  SheetMetadata,
} from '../services/googleSheets';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportEmployees: (newEmployees: Employee[], mode: 'merge' | 'replace') => void;
  currentEmployees: Employee[];
  lang: Language;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  onImportEmployees,
  currentEmployees,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'csv' | 'paste'>('google');
  
  // Google Sheets state
  const [spreadsheetId, setSpreadsheetId] = useState<string>('12egnbPL1Tjt0MQdokXoOjl9Uj2vsM4a8');
  const [sheetTabs, setSheetTabs] = useState<SheetMetadata[]>([]);
  const [selectedSheetTitle, setSelectedSheetTitle] = useState<string>('');
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>('');
  
  // Auth state
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Parsed Preview
  const [parsedEmployees, setParsedEmployees] = useState<Employee[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  // CSV & Paste state
  const [pasteText, setPasteText] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    initGoogleAuth(
      (user, token) => {
        setGoogleUserEmail(user.email || 'Pengguna Google');
        setHasToken(Boolean(token));
      },
      () => {
        setGoogleUserEmail(null);
        setHasToken(false);
      }
    );
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Google Sign In
  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUserEmail(res.user.email || 'Pengguna Google');
        setHasToken(true);
        // Automatically fetch spreadsheet info
        await handleFetchSpreadsheet(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Log masuk Google gagal. Sila pastikan pop-up dibenarkan dalam pelayar.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Fetch spreadsheet structure
  const handleFetchSpreadsheet = async (tokenOverride?: string) => {
    setIsLoadingData(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const token = tokenOverride || (await getGoogleAccessToken());
      if (!token) {
        throw new Error('Sila log masuk dengan akaun Google terlebih dahulu.');
      }

      // Clean spreadsheet ID if user pasted full URL
      let cleanId = spreadsheetId.trim();
      const match = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        cleanId = match[1];
        setSpreadsheetId(cleanId);
      }

      const info = await fetchSpreadsheetInfo(cleanId, token);
      setSpreadsheetTitle(info.title);
      setSheetTabs(info.sheets);

      // Select target sheet (matching gid 1341307337 or first sheet)
      const targetSheet =
        info.sheets.find((s) => s.id === 1341307337) || info.sheets[0];
      const sheetTitle = targetSheet?.title || 'Sheet1';
      setSelectedSheetTitle(sheetTitle);

      // Fetch values from selected sheet
      const rows = await fetchSheetValues(cleanId, sheetTitle, token);
      const parsed = parseSheetRowsToEmployees(rows, currentEmployees);

      setParsedEmployees(parsed.employees);
      setDetectedHeaders(parsed.headers);
      setSuccessMessage(
        lang === 'ms'
          ? `Berjaya membaca ${parsed.recognizedCount} rekod karyawan dari Google Sheet "${info.title}"!`
          : `Successfully fetched ${parsed.recognizedCount} employee records from "${info.title}"!`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Gagal membaca fail Google Sheet. Pastikan anda mempunyai akses melihat fail ini.'
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle Tab Switch inside Sheet
  const handleSheetTabChange = async (sheetTitle: string) => {
    setSelectedSheetTitle(sheetTitle);
    setIsLoadingData(true);
    setErrorMessage(null);

    try {
      const token = await getGoogleAccessToken();
      if (!token) throw new Error('Akses Google tidak ditemui.');
      const rows = await fetchSheetValues(spreadsheetId, sheetTitle, token);
      const parsed = parseSheetRowsToEmployees(rows, currentEmployees);
      setParsedEmployees(parsed.employees);
      setDetectedHeaders(parsed.headers);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle Text Paste parsing (Tabular TSV or CSV)
  const handleParsePastedText = () => {
    if (!pasteText.trim()) return;
    try {
      const lines = pasteText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      
      const rows = lines.map((line) => {
        if (line.includes('\t')) return line.split('\t');
        if (line.includes(';')) return line.split(';');
        return line.split(',');
      });

      const parsed = parseSheetRowsToEmployees(rows, currentEmployees);
      setParsedEmployees(parsed.employees);
      setDetectedHeaders(parsed.headers);
      setSuccessMessage(`Berjaya membaca ${parsed.employees.length} rekod dari teks tampalan!`);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Handle CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPasteText(content);
      const lines = content.split(/\r?\n/).filter(Boolean);
      const rows = lines.map((line) => {
        if (line.includes('\t')) return line.split('\t');
        if (line.includes(';')) return line.split(';');
        return line.split(',');
      });
      const parsed = parseSheetRowsToEmployees(rows, currentEmployees);
      setParsedEmployees(parsed.employees);
      setDetectedHeaders(parsed.headers);
      setSuccessMessage(`Berjaya memuat naik ${parsed.employees.length} rekod dari fail CSV!`);
    };
    reader.readAsText(file);
  };

  // Final Commit Import
  const handleCommitImport = () => {
    if (parsedEmployees.length === 0) return;
    onImportEmployees(parsedEmployees, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                {lang === 'ms' ? 'Penyelarasan Data Karyawan dari Google Sheets' : 'Sync Employees from Google Sheets'}
              </h2>
              <p className="text-xs text-slate-300">
                {lang === 'ms'
                  ? 'Import biodata, gaji mengikut mata wang, maklumat bank & status remote secara langsung.'
                  : 'Import biodata, multi-currency salary, bank accounts & remote status directly.'}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('google')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'google'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Google Sheets API (Langsung)</span>
            </button>

            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'paste'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{lang === 'ms' ? 'Tampal Data / Muat Naik CSV' : 'Paste Data / Upload CSV'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Ralat Penyelarasan:</p>
                <p className="text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Berjaya!</p>
                <p className="text-xs mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* TAB 1: GOOGLE SHEETS LIVE SYNC */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              
              {/* Google Auth Status Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {googleUserEmail ? `Disambungkan: ${googleUserEmail}` : 'Akaun Google Workspace'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {hasToken
                        ? 'Token akses aktif untuk membaca helaian Google Sheets secara selamat.'
                        : 'Sila log masuk untuk membenarkan aplikasi membaca data helaian anda.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-2">
                  {!hasToken ? (
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isAuthenticating}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {isAuthenticating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                      <span>Log Masuk Google</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFetchSpreadsheet()}
                      disabled={isLoadingData}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingData ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>Tarik Data Terkini</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Spreadsheet URL & Tab Picker */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-slate-800">
                    Pautan / ID Google Sheet:
                  </label>
                  <a
                    href="https://docs.google.com/spreadsheets/d/12egnbPL1Tjt0MQdokXoOjl9Uj2vsM4a8/edit?gid=1341307337#gid=1341307337"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <span>Buka Helaian di Google Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="Contoh: 12egnbPL1Tjt0MQdokXoOjl9Uj2vsM4a8"
                    className="flex-1 border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleFetchSpreadsheet()}
                    disabled={isLoadingData || !hasToken}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isLoadingData ? 'Memuat...' : 'Imbas Helaian'}
                  </button>
                </div>

                {/* Available Sheet Tabs */}
                {sheetTabs.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Pilih Tab Helaian:</span>
                    {sheetTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleSheetTabChange(tab.title)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          selectedSheetTitle === tab.title
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tab.title} ({tab.rowCount} baris)
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PASTE DATA OR CSV UPLOAD */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950">
                <p className="font-bold">Kaedah Pantas: Salin & Tampal dari Excel / Google Sheet</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Salin lajur data karyawan anda dari Google Sheet (Ctrl+A / Ctrl+C) lalu tampal di bawah, atau muat naik fail CSV.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Pilih Fail CSV</span>
                  <input
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-400">atau tampal terus baris teks di bawah:</span>
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={6}
                placeholder="Nama	Jawatan	Jabatan	Gaji Pokok	Mata Wang	Bank	No Akaun	IC	Remote&#10;Ahmad	Pengurus	HR	5000	MYR	Maybank	123456	900101-10-1234	Tidak&#10;Budi	Lead Dev	IT	22000000	IDR	BCA	888123	-	Indonesia (Remote)"
                className="w-full border border-slate-300 rounded-2xl p-3 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <button
                onClick={handleParsePastedText}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Analisis & Pratonton Data Karyawan
              </button>
            </div>
          )}

          {/* PARSED PREVIEW TABLE */}
          {parsedEmployees.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm text-slate-900">
                    Pratonton Data Karyawan ({parsedEmployees.length} orang dikenalpasti)
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Sedia Diimport
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-500 font-medium">Mod Import:</span>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-indigo-600"
                    />
                    <span>Gabung & Kemaskini</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-rose-600"
                    />
                    <span className="text-rose-700 font-semibold">Gantikan Semua</span>
                  </label>
                </div>
              </div>

              {/* Table */}
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-3">Nama & ID</th>
                      <th className="p-3">Jawatan & Jabatan</th>
                      <th className="p-3">Gaji Asal</th>
                      <th className="p-3">Gaji Disesuaikan (MYR)</th>
                      <th className="p-3">Bank & Akaun</th>
                      <th className="p-3">Status Lokasi</th>
                      <th className="p-3">Syarikat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <span className="font-mono text-[10px] text-slate-500">{emp.id}</span>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-800">{emp.role}</p>
                          <span className="text-[10px] text-slate-500">{emp.department}</span>
                        </td>
                        <td className="p-3 font-mono">
                          {emp.salaryCurrency !== 'MYR' ? (
                            <span className="text-indigo-700 font-bold">
                              {emp.salaryCurrency} {emp.originalSalaryAmount?.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-700">RM {emp.basicSalary.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-700">
                          RM {emp.basicSalary.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-800">
                            {emp.bankName === 'Lainnya' ? emp.customBankName : emp.bankName}
                          </p>
                          <span className="font-mono text-[10px] text-slate-500">{emp.bankAccount}</span>
                        </td>
                        <td className="p-3">
                          {emp.isRemoteOverseas ? (
                            <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                              🌐 Remote ({emp.workLocationCountry || 'Luar Malaysia'}) - 0% Statutori
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                              🇲🇾 Tempatan Malaysia
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-[11px] font-medium text-slate-700">
                          {emp.company || 'Solusi Serumpun Senusantara SDN. BHD.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCommitImport}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sahkan & Import {parsedEmployees.length} Karyawan ke Sistem</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            * Data yang diimport akan disimpan secara automatik dalam simpanan selamat aplikasi.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
