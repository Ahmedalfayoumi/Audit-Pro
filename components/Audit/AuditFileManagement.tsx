
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, FileText, Building2, CalendarDays, Upload, 
  X, Save, FileCheck, Table, FileArchive, Search,
  Eye, Download, Trash2, CheckCircle2, AlertCircle, FileSpreadsheet,
  FileSignature, ChevronDown, List, LayoutGrid, Hash, History
} from 'lucide-react';
import { Company } from '../../types';
import * as XLSX from 'xlsx';

interface AuditFile {
  id: string;
  companyId: string;
  companyName: string;
  financialYear: string;
  appointmentLetterFile?: string;
  registrationFile?: string;
  licenseFile?: string;
  trialBalanceFile?: string;
  lastYearFinancialsFile?: string;
  uploadDate: string;
  status: 'Pending' | 'Completed' | 'Review';
}

interface AuditFileManagementProps {
  companies: Company[];
  financialYears: string[];
  auditFiles: AuditFile[];
  onUpdateFiles: (files: AuditFile[]) => void;
  searchQuery?: string;
  onSearchInComponent?: (query: string) => void;
  externalShowModal?: boolean;
  setExternalShowModal?: (show: boolean) => void;
}

const AuditFileManagement: React.FC<AuditFileManagementProps> = ({ 
  companies, 
  financialYears, 
  auditFiles, 
  onUpdateFiles, 
  searchQuery = '', 
  onSearchInComponent,
  externalShowModal,
  setExternalShowModal
}) => {
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const [formData, setFormData] = useState({
    companyId: '',
    financialYear: '',
    appointmentLetter: null as File | null,
    registration: null as File | null,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const downloadTrialBalanceTemplate = () => {
    const ws_data = [
      ["اسم الحساب", "الرصيد الافتتاحي", "", "", "الحركات", "", "", "رصيد آخر المدة", "", "", "التربيط"],
      ["", "مدين", "دائن", "الرصيد", "مدين", "دائن", "الرصيد", "مدين", "دائن", "الرصيد", ""],
      ["مثال: الصندوق", 1000, 0, 1000, 500, 200, 300, 1300, 0, 1300, "أصول متداولة"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } }, { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } }, { s: { r: 0, c: 7 }, e: { r: 0, c: 9 } }, { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } }];
    ws['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ميزان المراجعة");
    XLSX.writeFile(wb, "نموذج_ميزان_المراجعة.xlsx");
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      onUpdateFiles(auditFiles.filter(f => f.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.companyId || 
      !formData.financialYear || 
      !formData.appointmentLetter || 
      !formData.registration || 
      !formData.license ||
      !formData.lastYearFinancials ||
      !formData.trialBalance
    ) {
      alert('يرجى اختيار الشركة والسنة ورفع جميع الملفات الإجبارية المطلوبة');
      return;
    }
    const company = companies.find(c => c.id === formData.companyId);
    const newFile: AuditFile = {
      id: Math.random().toString(36).substr(2, 9),
      companyId: formData.companyId,
      companyName: company?.name || 'Unknown',
      financialYear: formData.financialYear,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    onUpdateFiles([newFile, ...auditFiles]);
    setExternalShowModal?.(false);
    setFormData({ 
      companyId: '', 
      financialYear: '', 
      appointmentLetter: null, 
      registration: null, 
      license: null, 
      trialBalance: null,
      lastYearFinancials: null
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-black text-gray-800">إدارة ملفات التدقيق</h3>
          <p className="text-gray-500 text-sm mt-1 font-medium">رفع وتنظيم المستندات القانونية والموازين السنوية للعملاء</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setExternalShowModal?.(true)} 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} /> إضافة ملف تدقيق جديد
          </button>
          
          <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex gap-1">
            <button 
              onClick={() => setCurrentView('list')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <List size={16} /> قائمة
            </button>
            <button 
              onClick={() => setCurrentView('grid')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={16} /> شبكة
            </button>
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 rounded-xl text-[11px] font-black px-5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 pr-10 shadow-sm min-w-[140px]">
              <option>جميع السنوات</option>
              {financialYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
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
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                  file.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  file.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {file.status === 'Completed' ? 'مكتمل' : 'قيد المراجعة'}
                </span>
              </div>
              <h4 className="font-black text-gray-800 mb-1 line-clamp-1">{file.companyName}</h4>
              <p className="text-xs font-bold text-blue-600 mb-4">السنة المالية: {file.financialYear}</p>
              <div className="space-y-2 mb-6 text-[11px] font-bold text-gray-400">
                <p className="flex items-center gap-2"><CalendarDays size={14} /> تم الرفع: {file.uploadDate}</p>
                <p className="flex items-center gap-2"><Hash size={14} /> كود الملف: {file.id.toUpperCase()}</p>
              </div>
              <div className="pt-4 border-t border-gray-50 flex justify-between gap-2">
                <button className="flex-1 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black"><Eye size={14}/> عرض</button>
                <button className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all" onClick={() => handleDelete(file.id)}><Trash2 size={16}/></button>
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
                  <th className="p-5 text-xs font-black text-gray-500 uppercase">اسم الشركة</th>
                  <th className="p-5 text-xs font-black text-gray-500 uppercase text-center">السنة المالية</th>
                  <th className="p-5 text-xs font-black text-gray-500 uppercase text-center">تاريخ الرفع</th>
                  <th className="p-5 text-xs font-black text-gray-500 uppercase text-center">الحالة</th>
                  <th className="p-5 text-xs font-black text-gray-500 uppercase text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFiles.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">لا توجد ملفات تدقيق تطابق البحث</td></tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center"><FileArchive size={20} /></div>
                          <div><p className="font-bold text-gray-800 text-sm">{file.companyName}</p><p className="text-[10px] text-gray-400 font-bold">ID: {file.id}</p></div>
                        </div>
                      </td>
                      <td className="p-5 text-center"><span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black">{file.financialYear}</span></td>
                      <td className="p-5 text-center"><span className="text-xs font-bold text-gray-500">{file.uploadDate}</span></td>
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                          file.status === 'Completed' ? 'bg-green-100 text-green-700' : file.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>{file.status === 'Completed' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}{file.status === 'Completed' ? 'مكتمل' : 'قيد المراجعة'}</span>
                      </td>
                      <td className="p-5"><div className="flex justify-center gap-2"><button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="فتح"><Eye size={18} /></button><button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Download size={18} /></button><button onClick={() => handleDelete(file.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button></div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {externalShowModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-6 sm:p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3 sm:gap-4"><div className="p-2 sm:p-3 bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-200"><Plus size={20} className="sm:w-6 sm:h-6" /></div><h4 className="text-lg sm:text-xl font-black text-gray-900">إضافة ملف تدقيق جديد</h4></div>
              <button onClick={() => setExternalShowModal?.(false)} className="p-2 sm:p-2.5 hover:bg-gray-200 rounded-xl sm:rounded-2xl transition-all text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2"><label className="text-xs sm:text-sm font-black text-gray-600 flex items-center gap-2"><Building2 size={16} className="text-blue-500" /> اختيار الشركة *</label><select required value={formData.companyId} onChange={e => setFormData({ ...formData, companyId: e.target.value })} className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 text-sm font-bold"><option value="">اختر الشركة...</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="space-y-2"><label className="text-xs sm:text-sm font-black text-gray-600 flex items-center gap-2"><CalendarDays size={16} className="text-blue-500" /> السنة المالية *</label><select required value={formData.financialYear} onChange={e => setFormData({ ...formData, financialYear: e.target.value })} className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 text-sm font-bold"><option value="">اختر السنة...</option>{financialYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <h5 className="font-black text-gray-800 border-b pb-3 text-xs sm:text-sm flex items-center gap-2"><Upload size={18} className="text-blue-600" /> المستندات والملفات المطلوبة</h5>
                <div className="grid grid-cols-1 gap-4">
                  {/* كتاب التعيين */}
                  <div className="p-4 sm:p-6 border-2 border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-3xl hover:border-blue-300 transition-all bg-gray-50/30 group">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                          <FileSignature size={20} />
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm">كتاب التعيين *</p>
                          <p className="text-[10px] text-gray-400 font-bold">PDF فقط</p>
                        </div>
                      </div>
                      <label className="cursor-pointer bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm text-xs font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all w-full sm:w-auto">
                        {formData.appointmentLetter ? 'تغيير الملف' : 'تحميل الملف'}
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileChange(e, 'appointmentLetter')} />
                      </label>
                    </div>
                  </div>

                  {/* السجل التجاري */}
                  <div className="p-4 sm:p-6 border-2 border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-3xl hover:border-blue-300 transition-all bg-gray-50/30 group">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center text-red-500">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm">السجل التجاري *</p>
                          <p className="text-[10px] text-gray-400 font-bold">pdf, jpg, png</p>
                        </div>
                      </div>
                      <label className="cursor-pointer bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm text-xs font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all w-full sm:w-auto">
                        {formData.registration ? 'تغيير الملف' : 'تحميل الملف'}
                        <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, 'registration')} />
                      </label>
                    </div>
                  </div>

                  {/* رخصة المهن */}
                  <div className="p-4 sm:p-6 border-2 border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-3xl hover:border-blue-300 transition-all bg-gray-50/30 group">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500">
                          <FileCheck size={20} />
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm">رخصة المهن *</p>
                          <p className="text-[10px] text-gray-400 font-bold">pdf, jpg, png</p>
                        </div>
                      </div>
                      <label className="cursor-pointer bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm text-xs font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all w-full sm:w-auto">
                        {formData.license ? 'تغيير الملف' : 'تحميل الملف'}
                        <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, 'license')} />
                      </label>
                    </div>
                  </div>

                  {/* ميزانية العام السابق */}
                  <div className="p-4 sm:p-6 border-2 border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-3xl hover:border-blue-300 transition-all bg-gray-50/30 group">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                          <History size={20} />
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm">ميزانية العام السابق *</p>
                          {formData.financialYear && (
                            <p className="text-[10px] text-blue-600 font-black">
                              يرجى رفع ميزانية عام {parseInt(formData.financialYear) - 1}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400 font-bold">PDF فقط</p>
                        </div>
                      </div>
                      <label className="cursor-pointer bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm text-xs font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all w-full sm:w-auto">
                        {formData.lastYearFinancials ? 'تغيير الملف' : 'تحميل الملف'}
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileChange(e, 'lastYearFinancials')} />
                      </label>
                    </div>
                  </div>

                  {/* ميزان المراجعة بالارصدة */}
                  <div className="p-4 sm:p-6 border-2 border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-3xl hover:border-blue-300 transition-all bg-gray-50/30 group">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center text-green-600">
                          <FileSpreadsheet size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-black text-gray-800 text-sm">ميزان المراجعة بالأرصدة *</p>
                            <button 
                              type="button"
                              onClick={downloadTrialBalanceTemplate}
                              className="text-[9px] font-black bg-green-50 text-green-700 px-2 py-1 rounded-lg border border-green-100 hover:bg-green-100 transition-all whitespace-nowrap"
                            >
                              تنزيل النموذج (Template)
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold">.xlsx حصراً</p>
                        </div>
                      </div>
                      <label className="cursor-pointer bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm text-xs font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all w-full sm:w-auto">
                        {formData.trialBalance ? 'تغيير الملف' : 'تحميل الملف'}
                        <input type="file" className="hidden" accept=".xlsx" onChange={(e) => handleFileChange(e, 'trialBalance')} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 pb-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl sm:rounded-2xl font-black shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"><Save size={20} /> إرسال</button>
                <button type="button" onClick={() => setExternalShowModal?.(false)} className="px-10 bg-gray-100 text-gray-700 py-4 rounded-xl sm:rounded-2xl font-black hover:bg-gray-200 transition-all order-first sm:order-last">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditFileManagement;
