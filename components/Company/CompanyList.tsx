
import React, { useState, useMemo } from 'react';
import { Company } from '../../types';
import { 
  Building, Phone, MapPin, Calendar, Hash, 
  FileCheck, ShieldCheck, Eye, Edit3, Activity, X, CheckCircle2, 
  AlertCircle, Ban, Briefcase, Info, User, Coins, Target, List, LayoutGrid
} from 'lucide-react';

interface CompanyListProps {
  companies: Company[];
  view: 'list' | 'grid';
  onEdit: (company: Company) => void;
  searchQuery?: string;
}

type CompanyStatus = 'Active' | 'Suspended' | 'Terminated';

const CompanyList: React.FC<CompanyListProps> = ({ companies, view: initialView, onEdit, searchQuery = '' }) => {
  const [selectedCompanyForAction, setSelectedCompanyForAction] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [companyStatuses, setCompanyStatuses] = useState<Record<string, CompanyStatus>>({});
  const [currentView, setCurrentView] = useState<'list' | 'grid'>(initialView);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const query = searchQuery.toLowerCase().trim();
    return companies.filter(company => 
      company.name.toLowerCase().includes(query) ||
      company.nationalNumber.toLowerCase().includes(query) ||
      company.registrationNumber.toLowerCase().includes(query) ||
      company.signatory.name.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  const handleStatusChange = (status: CompanyStatus) => {
    if (selectedCompanyForAction) {
      setCompanyStatuses({
        ...companyStatuses,
        [selectedCompanyForAction.id]: status
      });
      setSelectedCompanyForAction(null);
    }
  };

  const getStatusBadge = (companyId: string) => {
    const status = companyStatuses[companyId] || 'Active';
    switch (status) {
      case 'Active':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-black"><CheckCircle2 size={10} /> نشط</span>;
      case 'Suspended':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] font-black"><AlertCircle size={10} /> موقوف</span>;
      case 'Terminated':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-black"><Ban size={10} /> ملغى</span>;
      default:
        return null;
    }
  };

  const ActionButtons = ({ company }: { company: Company }) => (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => setViewingCompany(company)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
        title="عرض الملف"
      >
        <Eye size={18} />
      </button>
      <button 
        onClick={() => onEdit(company)}
        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all" 
        title="تعديل البيانات"
      >
        <Edit3 size={18} />
      </button>
      <button 
        onClick={() => setSelectedCompanyForAction(company)}
        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all" 
        title="تغيير الحالة"
      >
        <Activity size={18} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex gap-1">
          <button 
            onClick={() => setCurrentView('list')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <List size={16} /> عرض القائمة
          </button>
          <button 
            onClick={() => setCurrentView('grid')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <LayoutGrid size={16} /> عرض الشبكة
          </button>
        </div>
      </div>

      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.01] transition-all relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                  <Building size={24} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-black px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg uppercase tracking-wider">
                    {company.type}
                  </span>
                  {getStatusBadge(company.id)}
                </div>
              </div>
              <h4 className="text-lg font-black text-gray-800 mb-1 line-clamp-1">{company.name}</h4>
              <div className="flex items-center text-xs text-gray-400 mb-4 font-bold">
                <Calendar size={14} className="ml-1.5" />
                تأسيس: {company.foundingDate}
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm font-bold text-gray-600">
                  <Phone size={14} className="ml-2 text-blue-500/50" />
                  <span dir="ltr">{company.signatory.mobile}</span>
                  <span className="mx-2 text-gray-200">|</span>
                  <span className="text-xs text-gray-400 truncate">{company.signatory.name}</span>
                </div>
                <div className="flex items-start text-sm font-bold text-gray-600">
                  <MapPin size={14} className="ml-2 text-red-500/50 mt-1 flex-shrink-0" />
                  <span className="line-clamp-2">
                    {company.address.city}، {company.address.street}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <ActionButtons company={company} />
                <button 
                  onClick={() => setViewingCompany(company)}
                  className="text-[10px] font-black text-blue-600 hover:underline"
                >
                  المزيد..
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-5 font-black text-gray-500 text-xs">اسم الشركة</th>
                  <th className="p-5 font-black text-gray-500 text-xs">الحالة</th>
                  <th className="p-5 font-black text-gray-500 text-xs">الرقم الوطني</th>
                  <th className="p-5 font-black text-gray-500 text-xs">الضريبة / الضمان</th>
                  <th className="p-5 font-black text-gray-500 text-xs">المفوض</th>
                  <th className="p-5 font-black text-gray-500 text-xs text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Building size={18} />
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm">{company.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{company.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">{getStatusBadge(company.id)}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                        <Hash size={14} className="text-gray-300" />
                        <span>{company.nationalNumber}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex gap-2">
                        {company.isSubjectToSalesTax && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-black" title="خاضعة للمبيعات">
                            <FileCheck size={12} />
                          </div>
                        )}
                        {!company.isNotRegisteredInSS && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black" title="مسجلة بالضمان">
                            <ShieldCheck size={12} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-xs">
                        <p className="font-bold text-gray-700">{company.signatory.name}</p>
                        <p className="text-gray-400 text-[10px]" dir="ltr">{company.signatory.mobile}</p>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center">
                        <ActionButtons company={company} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Company Details Modal */}
      {viewingCompany && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[95vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/80 backdrop-blur sticky top-0 z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-200">
                  <Building size={20} />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-gray-900 leading-tight line-clamp-1">{viewingCompany.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400">{viewingCompany.type}</span>
                    <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-[10px] sm:text-xs font-bold text-blue-600">السنة المالية: {viewingCompany.financialYear}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingCompany(null)} 
                className="p-2 sm:p-2.5 hover:bg-gray-200 rounded-xl sm:rounded-2xl transition-all text-gray-500 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar space-y-6 sm:space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200/60 pb-3">
                    <Info size={18} className="text-blue-600" />
                    <h5 className="font-black text-sm">بيانات المنشأة</h5>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider">الرقم الوطني</p>
                      <p className="text-sm font-black text-slate-700">{viewingCompany.nationalNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider">رقم التسجيل</p>
                      <p className="text-sm font-black text-slate-700">{viewingCompany.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider">الرقم الضريبي</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black text-slate-700">{viewingCompany.taxNumber}</p>
                        {viewingCompany.isSubjectToSalesTax && (
                          <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black whitespace-nowrap">خاضع للمبيعات</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider">الضمان الاجتماعي</p>
                      <p className="text-sm font-black text-slate-700">
                        {viewingCompany.isNotRegisteredInSS ? 'غير مسجلة' : viewingCompany.socialSecurityNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-3xl bg-blue-50/40 border border-blue-100/50 space-y-4">
                  <div className="flex items-center gap-2 text-blue-800 border-b border-blue-200/40 pb-3">
                    <Coins size={18} className="text-blue-600" />
                    <h5 className="font-black text-sm">البيانات المالية والاتصال</h5>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider">رأس المال</p>
                      <p className="text-sm font-black text-blue-700">{viewingCompany.capital || 'غير محدد'} {viewingCompany.currency}</p>
                    </div>
                    <div className="pt-2 border-t border-blue-100/30">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={14} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">المفوض بالتوقيع</span>
                      </div>
                      <p className="text-sm font-black text-slate-700">{viewingCompany.signatory.name}</p>
                      <p className="text-xs text-slate-500 font-bold mt-0.5" dir="ltr">{viewingCompany.signatory.mobile}</p>
                      {viewingCompany.signatory.isEmployee && (
                        <span className="inline-block mt-2 text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black">موظف في الشركة</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200/60 pb-3">
                    <MapPin size={18} className="text-red-500" />
                    <h5 className="font-black text-sm">العنوان والتواجد</h5>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider">المدينة والشارع</p>
                      <p className="text-sm font-black text-slate-700">{viewingCompany.address.city} - {viewingCompany.address.street}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider">المبنى والمكتب</p>
                      <p className="text-sm font-black text-slate-700 leading-relaxed">
                        مجمع {viewingCompany.address.buildingNumber} - طابق {viewingCompany.address.floor} - مكتب {viewingCompany.address.officeNumber}
                      </p>
                      {viewingCompany.address.buildingName && (
                        <p className="text-xs text-slate-400 mt-1 font-bold">{viewingCompany.address.buildingName}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <Briefcase size={20} className="text-blue-600" />
                    <h5 className="font-black text-gray-800">القطاعات المسجلة</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {viewingCompany.sectors.map(sector => (
                      <span key={sector} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[11px] sm:text-xs font-black border border-blue-100/50">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <Target size={20} className="text-blue-600" />
                    <h5 className="font-black text-gray-800">غايات الشركة</h5>
                  </div>
                  <div className="space-y-2">
                    {viewingCompany.goals.map((goal, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-blue-600 border border-gray-100 flex-shrink-0">{idx + 1}</span>
                        <p className="text-sm font-bold text-gray-700 leading-tight">{goal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sticky bottom-0 z-10">
              <button 
                onClick={() => { setViewingCompany(null); onEdit(viewingCompany); }}
                className="flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 active:scale-95"
              >
                <Edit3 size={18} /> تعديل البيانات
              </button>
              <button onClick={() => setViewingCompany(null)} className="px-8 py-2.5 text-sm font-black text-gray-500 hover:text-gray-900 transition-colors">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {selectedCompanyForAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Activity size={20} /></div>
                <h4 className="text-lg font-black text-gray-800">تغيير حالة الشركة</h4>
              </div>
              <button onClick={() => setSelectedCompanyForAction(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
              <p className="text-sm font-medium text-gray-500 mb-4 sm:mb-6 text-center">اختيار الحالة الجديدة لشركة: <br/><span className="font-black text-gray-800 text-base">{selectedCompanyForAction.name}</span></p>
              <button onClick={() => handleStatusChange('Active')} className="w-full flex items-center gap-4 p-3 sm:p-4 rounded-2xl border-2 border-transparent hover:border-green-200 bg-green-50 text-green-700 transition-all hover:scale-[1.02] text-right">
                <div className="bg-green-600 text-white p-2 rounded-lg flex-shrink-0"><CheckCircle2 size={20}/></div>
                <div><p className="font-black text-sm">تنشيط الشركة (Active)</p><p className="text-[10px] opacity-70">الشركة مفعلة وتعمل بشكل طبيعي على النظام</p></div>
              </button>
              <button onClick={() => handleStatusChange('Suspended')} className="w-full flex items-center gap-4 p-3 sm:p-4 rounded-2xl border-2 border-transparent hover:border-orange-200 bg-orange-50 text-orange-700 transition-all hover:scale-[1.02] text-right">
                <div className="bg-orange-600 text-white p-2 rounded-lg flex-shrink-0"><AlertCircle size={20}/></div>
                <div><p className="font-black text-sm">إيقاف مؤقت (Suspended)</p><p className="text-[10px] opacity-70">تعليق العمليات المرتبطة بالشركة مؤقتاً</p></div>
              </button>
              <button onClick={() => handleStatusChange('Terminated')} className="w-full flex items-center gap-4 p-3 sm:p-4 rounded-2xl border-2 border-transparent hover:border-red-200 bg-red-50 text-red-700 transition-all hover:scale-[1.02] text-right">
                <div className="bg-red-600 text-white p-2 rounded-lg flex-shrink-0"><Ban size={20}/></div>
                <div><p className="font-black text-sm">إنهاء / إغلاق (Terminated)</p><p className="text-[10px] opacity-70">إغلاق ملف الشركة نهائياً من النظام</p></div>
              </button>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end"><button onClick={() => setSelectedCompanyForAction(null)} className="px-6 py-2 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors">إغلاق</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
