
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, FileText, Building2, CalendarDays, Upload, 
  X, Save, FileCheck, Table, FileArchive, Search,
  Eye, Download, Trash2, CheckCircle2, AlertCircle, FileSpreadsheet,
  FileSignature, ChevronDown, ChevronRight, List, LayoutGrid, Hash, History, Workflow,
  Link as LinkIcon, ExternalLink, FileBadge, ShieldCheck, Edit3, AlertTriangle
} from 'lucide-react';
import { Company, AuditFile, Account, TbAccountData } from '../../types';
import * as XLSX from 'xlsx';

interface AuditFileManagementProps {
  companies: Company[];
  financialYears: string[];
  auditFiles: AuditFile[];
  onUpdateFiles: (files: AuditFile[]) => void;
  searchQuery?: string;
  onSearchInComponent?: (query: string) => void;
  externalShowModal?: boolean;
  setExternalShowModal?: (show: boolean) => void;
  onOpenMapping?: (fileId: string) => void;
  accounts: Account[];
}

const AuditFileManagement: React.FC<AuditFileManagementProps> = ({ 
  companies, 
  financialYears, 
  auditFiles, 
  onUpdateFiles, 
  searchQuery = '', 
  externalShowModal,
  setExternalShowModal,
  onOpenMapping,
  accounts
}) => {
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const [editingFile, setEditingFile] = useState<AuditFile | null>(null);
  const [viewingFile, setViewingFile] = useState<AuditFile | null>(null);
  
  const [formData, setFormData] = useState({
    companyId: '',
    financialYear: '',
    registration: null as File | null,
    appointmentLetter: null as File | null,
    license: null as File | null,
    trialBalance: null as File | null,
    lastYearFinancials: null as File | null
  });

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return auditFiles;
    const query = searchQuery.toLowerCase().trim();
    return auditFiles.filter(file => 
      file.companyName.toLowerCase().includes(query) ||
      file.financialYear.includes(query) ||
      file.status.toLowerCase().includes(query)
    );
  }, [auditFiles, searchQuery]);

  // Helper for dd/mm/yyyy date with Western digits
  const getFormattedDate = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const parseXLSX = (file: File): Promise<TbAccountData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          
          const tbData: TbAccountData[] = [];
          jsonData.forEach((row, index) => {
            if (index < 2) return; 
            if (row[0] && typeof row[0] === 'string' && row[0].trim() !== '') {
              tbData.push({
                name: row[0].trim(),
                openingDebit: parseFloat(row[1]) || 0,
                openingCredit: parseFloat(row[2]) || 0,
                periodDebit: parseFloat(row[4]) || 0,
                periodCredit: parseFloat(row[5]) || 0
              });
            }
          });
          resolve(tbData);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const downloadTrialBalanceTemplate = () => {
    const ws_data = [
      ["اسم الحساب", "الرصيد الافتتاحي", "", "", "الحركات", "", "", "رصيد آخر المدة", "", "", "التربيط"],
      ["", "مدين", "دائن", "الرصيد", "مدين", "دائن", "الرصيد", "مدين", "دائن", "الرصيد", ""],
      ["الصندوق", 1000, 0, 1000, 500, 200, 300, 1300, 0, 1300, "أصول متداولة"],
      ["البنك العربي", 0, 1000, -1000, 200, 500, -300, 0, 1300, -1300, "أصول متداولة"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } }, 
      { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } }, 
      { s: { r: 0, c: 7 }, e: { r: 0, c: 9 } }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ميزان المراجعة");
    XLSX.writeFile(wb, "نموذج_ميزان_المراجعة.xlsx");
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      onUpdateFiles(auditFiles.filter(f => f.id !== id));
    }
  };

  const handleOpenEdit = (file: AuditFile) => {
    setFormData({
      companyId: file.companyId,
      financialYear: file.financialYear,
      registration: null,
      appointmentLetter: null,
      license: null,
      trialBalance: null,
      lastYearFinancials: null
    });
    setEditingFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Core requirements: Company and Year
    if (!formData.companyId || !formData.financialYear) {
      alert('يرجى اختيار الشركة والسنة المالية أولاً');
      return;
    }

    const company = companies.find(c => c.id === formData.companyId);
    let tbAccounts: TbAccountData[] = editingFile?.tbAccounts || [];
    
    try {
      if (formData.trialBalance) {
        const parsed = await parseXLSX(formData.trialBalance);
        
        // Balance Check
        let totalOpeningDebit = 0, totalOpeningCredit = 0, totalPeriodDebit = 0, totalPeriodCredit = 0, totalNetBalance = 0;
        parsed.forEach(acc => {
          totalOpeningDebit += acc.openingDebit;
          totalOpeningCredit += acc.openingCredit;
          totalPeriodDebit += acc.periodDebit;
          totalPeriodCredit += acc.periodCredit;
          totalNetBalance += (acc.openingDebit - acc.openingCredit + acc.periodDebit - acc.periodCredit);
        });

        const EPSILON = 0.001;
        const isBalanced = Math.abs(totalOpeningDebit - totalOpeningCredit) < EPSILON && 
                           Math.abs(totalPeriodDebit - totalPeriodCredit) < EPSILON &&
                           Math.abs(totalNetBalance) < EPSILON;

        if (!isBalanced) {
          alert("خطأ: ميزان المراجعة غير متوازن. يرجى التأكد من تساوي المدين والدائن.");
          return;
        }
        tbAccounts = parsed;
      }

      if (editingFile) {
        const updatedFiles = auditFiles.map(f => f.id === editingFile.id ? {
          ...f,
          companyId: formData.companyId,
          companyName: company?.name || f.companyName,
          financialYear: formData.financialYear,
          tbAccounts: tbAccounts,
          status: tbAccounts.length > 0 && f.status === 'Pending' ? 'Review' : f.status
        } : f);
        onUpdateFiles(updatedFiles);
        setEditingFile(null);
        setExternalShowModal?.(false);
      } else {
        const accountsSnapshot = JSON.parse(JSON.stringify(accounts));
        const newFile: AuditFile = {
          id: Math.random().toString(36).substr(2, 9),
          companyId: formData.companyId,
          companyName: company?.name || 'Unknown',
          financialYear: formData.financialYear,
          uploadDate: getFormattedDate(),
          status: 'Pending',
          accounts: accountsSnapshot, 
          tbMappings: {},
          tbAccounts: tbAccounts
        };
        onUpdateFiles([newFile, ...auditFiles]);
        setExternalShowModal?.(false);
      }

      // Reset Form
      setFormData({ 
        companyId: '', financialYear: '', registration: null,
        appointmentLetter: null, license: null, trialBalance: null,
        lastYearFinancials: null
      });

    } catch (err) {
      console.error("Error submitting audit file:", err);
      alert("حدث خطأ أثناء معالجة الطلب. يرجى التأكد من صحة الملفات المرفوعة.");
    }
  };

  const ActionButtons = ({ file }: { file: AuditFile }) => (
    <div className="flex justify-center gap-2">
      <button 
        onClick={() => setViewingFile(file)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
        title="عرض البيانات"
      >
        <Eye size={18} />
      </button>
      <button 
        onClick={() => handleOpenEdit(file)}
        className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all" 
        title="تعديل / رفع ميزان"
      >
        <Edit3 size={18} />
      </button>
      <button 
        onClick={() => onOpenMapping?.(file.id)} 
        disabled={file.tbAccounts.length === 0}
        className={`p-2 rounded-xl transition-all ${file.tbAccounts.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'}`} 
        title="ربط الحسابات"
      >
        <LinkIcon size={18} />
      </button>
      <button 
        onClick={() => handleDelete(file.id)} 
        className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all" 
        title="حذف"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-black text-gray-800">إدارة ملفات التدقيق</h3>
          <p className="text-gray-500 text-sm mt-1 font-medium">رفع وتنظيم المستندات القانونية والموازين السنوية للعملاء</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => {
              setEditingFile(null);
              setFormData({ companyId: '', financialYear: '', registration: null, appointmentLetter: null, license: null, trialBalance: null, lastYearFinancials: null });
              setExternalShowModal?.(true);
            }} 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} /> إضافة ملف تدقيق جديد
          </button>
          
          <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex gap-1">
            <button onClick={() => setCurrentView('list')} className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}><List size={16} /> قائمة</button>
            <button onClick={() => setCurrentView('grid')} className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}><LayoutGrid size={16} /> شبكة</button>
          </div>
        </div>
      </div>

      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredFiles.map((file) => (
            <div key={file.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.01] transition-all relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <FileArchive size={24} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                    file.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {file.status === 'Completed' ? 'مكتمل' : 'قيد المراجعة'}
                  </span>
                  {file.tbAccounts.length === 0 && (
                    <span className="flex items-center gap-1 text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                      <AlertTriangle size={10} /> ميزان مفقود
                    </span>
                  )}
                </div>
              </div>
              <h4 className="font-black text-gray-800 mb-1 line-clamp-1">{file.companyName}</h4>
              <p className="text-xs font-bold text-blue-600 mb-4">السنة المالية: {file.financialYear}</p>
              <div className="space-y-2 mb-6 text-[11px] font-bold text-gray-400">
                <p className="flex items-center gap-2"><CalendarDays size={14} /> تم الرفع: {file.uploadDate}</p>
                <p className="flex items-center gap-2"><LinkIcon size={14} /> الربط: {Object.keys(file.tbMappings || {}).length} / {file.tbAccounts?.length || 0}</p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <ActionButtons file={file} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-5 text-xs font-black text-gray-600 uppercase">اسم الشركة</th>
                  <th className="p-5 text-xs font-black text-gray-600 uppercase text-center">السنة</th>
                  <th className="p-5 text-xs font-black text-gray-600 uppercase text-center">الربط المنجز</th>
                  <th className="p-5 text-xs font-black text-gray-600 uppercase text-center">الحالة</th>
                  <th className="p-5 text-xs font-black text-gray-600 uppercase text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center"><FileArchive size={20} /></div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{file.companyName}</p>
                          {file.tbAccounts.length === 0 && (
                            <p className="text-[9px] text-red-500 font-black flex items-center gap-1 mt-0.5"><AlertTriangle size={10} /> بانتظار رفع ميزان المراجعة</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center"><span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black">{file.financialYear}</span></td>
                    <td className="p-5 text-center">
                      <span className={`text-xs font-black ${file.tbAccounts.length === 0 ? 'text-gray-300' : 'text-gray-600'}`}>
                        {Object.keys(file.tbMappings || {}).length} / {file.tbAccounts?.length || 0}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${file.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{file.status === 'Completed' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}{file.status === 'Completed' ? 'مكتمل' : 'قيد المراجعة'}</span>
                    </td>
                    <td className="p-5 text-center">
                      <ActionButtons file={file} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900">{viewingFile.companyName}</h4>
                  <p className="text-xs font-bold text-blue-600">ملف تدقيق السنة المالية: {viewingFile.financialYear}</p>
                </div>
              </div>
              <button onClick={() => setViewingFile(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-all"><X size={24}/></button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">تاريخ الإنشاء</p>
                  <p className="font-black text-gray-800">{viewingFile.uploadDate}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">حالة الملف</p>
                  <p className="font-black text-gray-800">{viewingFile.status === 'Completed' ? 'مكتمل ومغلق' : 'تحت التدقيق'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-black text-gray-800 flex items-center gap-2 border-b pb-2"><ShieldCheck size={18} className="text-blue-600" /> المستندات المرفوعة</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3"><FileBadge size={16} className="text-blue-500" /><span className="text-xs font-bold text-gray-700">السجل التجاري</span></div>
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3"><FileSignature size={16} className="text-blue-500" /><span className="text-xs font-bold text-gray-700">كتاب التعيين</span></div>
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-blue-500" /><span className="text-xs font-bold text-gray-700">رخصة المهن</span></div>
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                  <div className={`flex items-center justify-between p-3 border rounded-xl shadow-sm ${viewingFile.tbAccounts.length > 0 ? 'bg-white border-gray-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-3"><FileSpreadsheet size={16} className={viewingFile.tbAccounts.length > 0 ? "text-green-500" : "text-red-500"} /><span className={`text-xs font-bold ${viewingFile.tbAccounts.length > 0 ? 'text-gray-700' : 'text-red-700'}`}>ميزان المراجعة</span></div>
                    {viewingFile.tbAccounts.length > 0 ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                  </div>
                </div>
              </div>

              {viewingFile.tbAccounts.length > 0 && (
                <div className="space-y-4">
                  <h5 className="font-black text-gray-800 flex items-center gap-2 border-b pb-2"><Workflow size={18} className="text-blue-600" /> ملخص ميزان المراجعة</h5>
                  <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">عدد الحسابات</p>
                      <p className="text-lg font-black text-blue-700">{viewingFile.tbAccounts.length} حساب</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-right">إجمالي الميزان المربوط</p>
                      <p className="text-lg font-black text-blue-700">{Object.keys(viewingFile.tbMappings).length} / {viewingFile.tbAccounts.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button onClick={() => { setViewingFile(null); handleOpenEdit(viewingFile); }} className="flex-1 bg-amber-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all flex items-center justify-center gap-2"><Edit3 size={18}/> تعديل الملف</button>
              <button onClick={() => setViewingFile(null)} className="px-10 py-3.5 bg-white border border-gray-200 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {(externalShowModal || editingFile) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-6 sm:p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-200">
                  {editingFile ? <Edit3 size={20} className="sm:w-6 sm:h-6" /> : <Plus size={20} className="sm:w-6 sm:h-6" />}
                </div>
                <h4 className="text-lg sm:text-xl font-black text-gray-900">{editingFile ? 'تعديل ملف التدقيق' : 'إنشاء ملف التدقيق'}</h4>
              </div>
              <button onClick={() => { setExternalShowModal?.(false); setEditingFile(null); }} className="p-2 sm:p-2.5 hover:bg-gray-200 rounded-xl sm:rounded-2xl transition-all text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-gray-600 flex items-center gap-2"><Building2 size={16} className="text-blue-500" /> اختيار الشركة *</label>
                  <select 
                    disabled={!!editingFile} 
                    required={!editingFile} 
                    value={formData.companyId} 
                    onChange={e => setFormData({ ...formData, companyId: e.target.value })} 
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 text-sm font-bold disabled:opacity-60"
                  >
                    <option value="">اختر الشركة...</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-gray-600 flex items-center gap-2"><CalendarDays size={16} className="text-blue-500" /> السنة المالية *</label>
                  <select 
                    disabled={!!editingFile} 
                    required={!editingFile} 
                    value={formData.financialYear} 
                    onChange={e => setFormData({ ...formData, financialYear: e.target.value })} 
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 text-sm font-bold disabled:opacity-60"
                  >
                    <option value="">اختر السنة...</option>
                    {financialYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h5 className="font-black text-gray-800 border-b pb-3 text-xs sm:text-sm flex items-center gap-2"><Upload size={18} className="text-blue-600" /> المستندات (اختياري عند الإنشاء)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-dashed border-blue-100 rounded-3xl bg-blue-50/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600"><FileBadge size={20} /></div>
                      <div>
                        <p className="font-black text-gray-800 text-xs">السجل التجاري</p>
                        <p className="text-[9px] text-gray-400 font-bold">PDF فقط</p>
                      </div>
                    </div>
                    <label className="cursor-pointer block w-full bg-white px-4 py-2.5 rounded-xl border border-blue-100 shadow-sm text-[10px] font-black text-blue-600 text-center hover:bg-blue-600 hover:text-white transition-all truncate">
                      {formData.registration ? formData.registration.name : (editingFile ? 'تحديث السجل التجاري' : 'رفع السجل التجاري')}
                      <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileChange(e, 'registration')} />
                    </label>
                  </div>

                  <div className="p-4 border-2 border-dashed border-blue-100 rounded-3xl bg-blue-50/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600"><FileSignature size={20} /></div>
                      <div>
                        <p className="font-black text-gray-800 text-xs">كتاب التعيين</p>
                        <p className="text-[9px] text-gray-400 font-bold">PDF, JPG, PNG</p>
                      </div>
                    </div>
                    <label className="cursor-pointer block w-full bg-white px-4 py-2.5 rounded-xl border border-blue-100 shadow-sm text-[10px] font-black text-blue-600 text-center hover:bg-blue-600 hover:text-white transition-all truncate">
                      {formData.appointmentLetter ? formData.appointmentLetter.name : (editingFile ? 'تحديث كتاب التعيين' : 'رفع كتاب التعيين')}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'appointmentLetter')} />
                    </label>
                  </div>

                  <div className="p-4 border-2 border-dashed border-blue-100 rounded-3xl bg-blue-50/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-600"><ShieldCheck size={20} /></div>
                      <div>
                        <p className="font-black text-gray-800 text-xs">رخصة المهن</p>
                        <p className="text-[9px] text-gray-400 font-bold">PDF, JPG, PNG</p>
                      </div>
                    </div>
                    <label className="cursor-pointer block w-full bg-white px-4 py-2.5 rounded-xl border border-blue-100 shadow-sm text-[10px] font-black text-blue-600 text-center hover:bg-blue-600 hover:text-white transition-all truncate">
                      {formData.license ? formData.license.name : (editingFile ? 'تحديث رخصة المهن' : 'رفع رخصة المهن')}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'license')} />
                    </label>
                  </div>

                  <div className={`p-4 border-2 border-dashed rounded-3xl border-blue-100 bg-blue-50/20`}>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-green-600`}>
                          <FileSpreadsheet size={20} />
                        </div>
                        <div>
                          <p className={`font-black text-xs text-gray-800`}>ميزان المراجعة</p>
                          <p className="text-[9px] text-gray-400 font-bold">إكسل (.xlsx)</p>
                        </div>
                      </div>
                      <button type="button" onClick={downloadTrialBalanceTemplate} className="text-[8px] bg-green-50 text-green-700 px-2 py-1 rounded-lg border border-green-100 font-black">تحميل النموذج</button>
                    </div>
                    <label className={`cursor-pointer block w-full bg-white px-4 py-2.5 rounded-xl border border-blue-100 shadow-sm text-[10px] font-black text-blue-600 text-center hover:bg-blue-600 hover:text-white transition-all truncate`}>
                      {formData.trialBalance ? formData.trialBalance.name : (editingFile?.tbAccounts.length === 0 ? 'رفع ميزان المراجعة' : 'تحديث ميزان المراجعة')}
                      <input type="file" className="hidden" accept=".xlsx" onChange={(e) => handleFileChange(e, 'trialBalance')} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Save size={20} /> {editingFile ? 'تحديث ملف التدقيق' : 'إنشاء ملف التدقيق'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setExternalShowModal?.(false); setEditingFile(null); }} 
                  className="px-10 bg-gray-100 text-gray-700 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditFileManagement;
