
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowRight, Search, Plus, Save, ChevronDown, CheckCircle2, 
  AlertCircle, FileSpreadsheet, Workflow, X, Layers,
  CheckCircle, ShieldCheck, Folder, FileText, ChevronUp, Lock, Download, Compass, Menu,
  Info, AlertTriangle
} from 'lucide-react';
import { AuditFile, Account, AccountType, TbAccountData } from '../../types';
import * as XLSX from 'xlsx';
import MaterialityView from './MaterialityView';

interface AccountMappingViewProps {
  file: AuditFile;
  onBack: () => void;
  onUpdateFile: (file: AuditFile) => void;
}

const AccountMappingView: React.FC<AccountMappingViewProps> = ({ file, onBack, onUpdateFile }) => {
  const [activeView, setActiveView] = useState<'mapping' | 'materiality'>('mapping');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [coaSearchQuery, setCoaSearchQuery] = useState('');
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);
  const [showPlanningMenu, setShowPlanningMenu] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const planningMenuRef = useRef<HTMLDivElement>(null);

  const isApproved = file.status === 'Completed';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setCoaSearchQuery('');
      }
      if (planningMenuRef.current && !planningMenuRef.current.contains(event.target as Node)) {
        setShowPlanningMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [addAccountData, setAddAccountData] = useState({
    level: 4,
    l1ParentId: '',
    l2ParentId: '',
    l3ParentId: '',
    l4ParentId: '',
    name: ''
  });

  const filteredTbAccounts = useMemo(() => {
    if (!searchQuery.trim()) return file.tbAccounts;
    const query = searchQuery.toLowerCase().trim();
    return file.tbAccounts.filter(acc => acc.name.toLowerCase().includes(query));
  }, [file.tbAccounts, searchQuery]);

  // حساب عدد الحسابات المربوطة بشكل أكثر مرونة مع مراعاة المسافات الزائدة
  const mappingStats = useMemo(() => {
    const total = file.tbAccounts.length;
    const mapped = file.tbAccounts.filter(acc => {
      const originalName = acc.name;
      const trimmedName = acc.name.trim();
      // تحقق مما إذا كان الاسم الأصلي أو الاسم بعد التقليم مربوطاً في tbMappings
      return !!file.tbMappings[originalName] || !!file.tbMappings[trimmedName];
    }).length;
    return { total, mapped, remaining: total - mapped };
  }, [file.tbAccounts, file.tbMappings]);

  const isAllMapped = mappingStats.remaining === 0 && mappingStats.total > 0;

  const totals = useMemo(() => {
    return file.tbAccounts.reduce((acc, curr) => {
      const openingBal = curr.openingDebit - curr.openingCredit;
      const periodBal = curr.periodDebit - curr.periodCredit;
      const finalDebit = curr.openingDebit + curr.periodDebit;
      const finalCredit = curr.openingCredit + curr.periodCredit;
      const finalBal = finalDebit - finalCredit;

      return {
        openingDebit: acc.openingDebit + curr.openingDebit,
        openingCredit: acc.openingCredit + curr.openingCredit,
        openingBalance: acc.openingBalance + openingBal,
        periodDebit: acc.periodDebit + curr.periodDebit,
        periodCredit: acc.periodCredit + curr.periodCredit,
        periodBalance: acc.periodBalance + periodBal,
        finalDebit: acc.finalDebit + finalDebit,
        finalCredit: acc.finalCredit + finalCredit,
        finalBalance: acc.finalBalance + finalBal,
      };
    }, {
      openingDebit: 0, openingCredit: 0, openingBalance: 0,
      periodDebit: 0, periodCredit: 0, periodBalance: 0,
      finalDebit: 0, finalCredit: 0, finalBalance: 0
    });
  }, [file.tbAccounts]);

  const availableCoaAccounts = useMemo(() => {
    const baseList = file.accounts.filter(acc => acc.level === 3); 
    if (!coaSearchQuery.trim()) return baseList;
    const q = coaSearchQuery.toLowerCase().trim();
    return baseList.filter(acc => 
      acc.name.toLowerCase().includes(q) || 
      acc.code.includes(q)
    );
  }, [file.accounts, coaSearchQuery]);

  const saveMapping = (tbAccName: string, coaId: string) => {
    if (isApproved) return;
    // تخزين الربط باستخدام الاسم الأصلي والاسم المقلم لضمان المطابقة
    const updatedMappings = { 
      ...file.tbMappings, 
      [tbAccName]: coaId,
      [tbAccName.trim()]: coaId 
    };
    const updated = { ...file, tbMappings: updatedMappings };
    onUpdateFile(updated);
    setActiveDropdown(null);
    setCoaSearchQuery('');
  };

  const handleApproveMapping = () => {
    if (!isAllMapped) {
      alert(`عذراً، لا يمكن الاعتماد حالياً. يوجد ${mappingStats.remaining.toLocaleString('en-US')} حساباً لم يتم تربيطها بعد. يرجى إكمال التربيط لكافة البنود للتأكد من دقة البيانات.`);
      return;
    }
    if (confirm("هل أنت متأكد من اعتماد التربيط؟ سيتم قفل الحسابات ولن تتمكن من تعديل الربط لاحقاً.")) {
      onUpdateFile({ ...file, status: 'Completed' });
      alert("تم اعتماد التربيط بنجاح. تم قفل الملف الآن.");
    }
  };

  const handleUnlockMapping = () => {
    if (confirm("هل تريد إلغاء الاعتماد لفتح التعديل على التربيط؟")) {
      onUpdateFile({ ...file, status: 'Pending' });
    }
  };

  const getAccountBreadcrumbs = (accountId: string) => {
    const crumbs: string[] = [];
    let current = file.accounts.find(a => a.id === accountId);
    while (current) {
      crumbs.unshift(current.name);
      current = file.accounts.find(a => a.id === current?.parentId);
    }
    return crumbs;
  };

  const handleExportExcel = () => {
    const exportData = file.tbAccounts.map(tbAcc => {
      const mappedId = file.tbMappings[tbAcc.name] || file.tbMappings[tbAcc.name.trim()];
      const crumbs = mappedId ? getAccountBreadcrumbs(mappedId) : [];
      
      const openingBal = tbAcc.openingDebit - tbAcc.openingCredit;
      const periodBal = tbAcc.periodDebit - tbAcc.periodCredit;
      const finalDebit = tbAcc.openingDebit + tbAcc.periodDebit;
      const finalCredit = tbAcc.openingCredit + tbAcc.periodCredit;
      const finalBal = finalDebit - finalCredit;

      return {
        "اسم الحساب (الميزان)": tbAcc.name,
        "افتتاحي مدين": tbAcc.openingDebit,
        "افتتاحي دائن": tbAcc.openingCredit,
        "صافي الافتتاحي": openingBal,
        "حركة مدين": tbAcc.periodDebit,
        "حركة دائن": tbAcc.periodCredit,
        "صافي الحركة": periodBal,
        "ختامي مدين": finalDebit,
        "ختامي دائن": finalCredit,
        "صافي الختامي": finalBal,
        "المستوى 1 (رئيسي)": crumbs[0] || "",
        "المستوى 2 (فرعي)": crumbs[1] || "",
        "المستوى 3 (تصنيف)": crumbs[2] || "",
        "المستوى 4 (حساب التربيط)": crumbs[3] || ""
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الميزان المربوط");
    XLSX.writeFile(wb, `ميزان_${file.companyName}_${file.financialYear}_مربوط.xlsx`);
  };

  const calculateNextCode = (parentId: string | null): string => {
    if (!parentId) return (file.accounts.filter(a => !a.parentId).length + 1).toString();
    const parent = file.accounts.find(a => a.id === parentId)!;
    const existing = file.accounts.filter(a => a.parentId === parentId);
    let padSize = parent.level === 2 ? 2 : 1; 
    return `${parent.code}${(existing.length + 1).toString().padStart(padSize, '0')}`;
  };

  const handleAddAccountToTree = () => {
    if (isApproved) return;
    if (!addAccountData.name) { alert("يرجى إدخال اسم الحساب"); return; }

    let parentId: string | null = null;
    if (addAccountData.level === 2) parentId = addAccountData.l1ParentId;
    else if (addAccountData.level === 3) parentId = addAccountData.l2ParentId;
    else if (addAccountData.level === 4) parentId = addAccountData.l3ParentId;

    if (addAccountData.level > 1 && !parentId) { alert("يرجى اختيار الحساب الأب"); return; }

    const parent = parentId ? file.accounts.find(a => a.id === parentId) : null;
    const newAcc: Account = {
      id: Math.random().toString(36).substr(2, 9),
      code: calculateNextCode(parentId),
      name: addAccountData.name,
      type: parent ? parent.type : 'Assets',
      parentId: parentId,
      level: addAccountData.level - 1,
      isLocked: false,
      isCategory: addAccountData.level < 4
    };

    onUpdateFile({ ...file, accounts: [...file.accounts, newAcc] });
    setShowAddModal(false);
    setAddAccountData({ ...addAccountData, name: '' });
  };

  const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  if (activeView === 'materiality') {
    return <MaterialityView file={file} onUpdateFile={onUpdateFile} onBack={() => setActiveView('mapping')} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden font-sans text-right" dir="rtl">
      <header className="shrink-0 bg-white border-b px-4 sm:px-8 py-3 sm:h-16 flex items-center justify-between shadow-sm z-[80]">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <button onClick={onBack} className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all flex-shrink-0">
            <ArrowRight size={20} className="sm:w-6 sm:h-6" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate">
              <h2 className="text-sm sm:text-lg font-black text-gray-800 truncate">تربيط ميزان المراجعة</h2>
              {isApproved && <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-lg text-[10px] font-black whitespace-nowrap"><Lock size={12} /> معتمد ومقفل</span>}
              {!isApproved && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap ${isAllMapped ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                   {isAllMapped ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>}
                   إنجاز التربيط: {mappingStats.mapped.toLocaleString('en-US')} / {mappingStats.total.toLocaleString('en-US')}
                </div>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 truncate">{file.companyName} - {file.financialYear}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <div className="lg:hidden flex items-center">
             <button 
               onClick={() => setIsActionsExpanded(!isActionsExpanded)}
               className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
             >
                <Menu size={20} />
             </button>
          </div>

          <div className={`
            lg:flex lg:relative lg:flex-row items-center gap-1 sm:gap-3
            ${isActionsExpanded ? 'fixed top-16 right-4 left-4 bg-white p-4 rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col z-[100] animate-in slide-in-from-top-4' : 'hidden lg:flex'}
          `}>
             <div className="relative group w-full lg:w-auto">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full lg:w-48 pr-10 pl-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
            </div>

            <button onClick={handleExportExcel} className="w-full lg:w-auto flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-200 transition-all active:scale-95">
              <Download size={16} /> <span className="lg:hidden xl:inline">تصدير إكسل</span>
            </button>

            {isApproved && (
              <div className="relative w-full lg:w-auto" ref={planningMenuRef}>
                <button 
                  onClick={() => { setShowPlanningMenu(!showPlanningMenu); }}
                  className="w-full lg:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Compass size={16} /> <span>التخطيط</span> <ChevronDown size={14} />
                </button>
                {showPlanningMenu && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2">
                    <button 
                      onClick={() => { setActiveView('materiality'); setShowPlanningMenu(false); }}
                      className="w-full text-right p-4 text-xs font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all flex items-center gap-3"
                    >
                      <Layers size={16} className="text-indigo-500" /> الأهمية النسبية
                    </button>
                    <button className="w-full text-right p-4 text-xs font-black text-slate-400 cursor-not-allowed flex items-center gap-3">
                      <Workflow size={16} /> تقييم المخاطر
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isApproved && (
              <button 
                onClick={handleApproveMapping} 
                className={`w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 ${
                  isAllMapped ? 'bg-green-600 text-white shadow-green-200 hover:bg-green-700' : 'bg-gray-400 text-white shadow-gray-200 hover:bg-gray-500'
                }`}
              >
                <CheckCircle2 size={16} /> <span>اعتماد التربيط</span>
              </button>
            )}

            {isApproved && (
               <button onClick={handleUnlockMapping} className="w-full lg:w-auto flex items-center justify-center gap-2 bg-amber-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all active:scale-95">
                  <Lock size={14} /> <span>إلغاء الاعتماد</span>
                </button>
            )}

            <button onClick={onBack} className="w-full lg:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
              <Save size={16} /> <span className="lg:hidden xl:inline">حفظ وإغلاق</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-2 sm:p-4 custom-scrollbar">
        <div className="inline-block min-w-full align-middle">
          {mappingStats.remaining > 0 && !isApproved && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 animate-pulse">
               <AlertCircle className="text-amber-500" size={18} />
               <p className="text-xs font-bold text-amber-800">تنبيه: متبقي {mappingStats.remaining.toLocaleString('en-US')} حساباً بدون تربيط. يجب إكمالها لتتمكن من الاعتماد.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-center border-separate border-spacing-0">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-[#fcfdff] text-[10px] sm:text-[11px] font-black text-slate-800">
                    <th rowSpan={2} className="border-b border-l p-3 sm:p-4 text-right bg-white sticky right-0 z-30 min-w-[150px] sm:min-w-[200px]">الحساب</th>
                    <th colSpan={3} className="border-b border-l p-2 bg-blue-50/50 text-blue-600">الرصيد الافتتاحي</th>
                    <th colSpan={3} className="border-b border-l p-2 bg-purple-50/50 text-purple-600">الحركات خلال الفترة</th>
                    <th colSpan={3} className="border-b border-l p-2 bg-green-50/50 text-green-600">الرصيد النهائي</th>
                    <th rowSpan={2} className="border-b p-3 sm:p-4 bg-white min-w-[200px] sm:min-w-[220px]">التربيط (Mapping)</th>
                  </tr>
                  <tr className="bg-white text-[9px] sm:text-[10px] font-bold text-slate-400">
                    <th className="border-b border-l p-1.5 sm:p-2 w-20 sm:w-24">مدين</th>
                    <th className="border-b border-l p-1.5 sm:p-2 w-20 sm:w-24">دائن</th>
                    <th className="border-b border-l p-1.5 sm:p-2 w-20 sm:w-24 bg-blue-50/20 text-blue-600">الرصيد</th>
                    <th className="border-b border-l p-1.5 sm:p-2 w-20 sm:w-24">مدين</th>
                    <th className="border-b border-l p-1.5 sm:p-2 w-20 sm:w-24">دائن</th>
                    <th className="border-b border-l p-1.5 sm:p-2 w-20 sm:w-24 bg-purple-50/20 text-purple-600">الرصيد</th>
                    <th className="border-b border-l p-1.5 sm:p-2 w-20 sm:w-24">مدين</th>
                    <th className="border-b border-l p-1.5 sm:p-2 w-20 sm:w-24">دائن</th>
                    <th className="border-b border-l p-1.5 sm:p-2 w-20 sm:w-24 bg-green-50/20 text-green-600">الرصيد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTbAccounts.map((tbAcc, idx) => {
                    const openingBal = tbAcc.openingDebit - tbAcc.openingCredit;
                    const periodBal = tbAcc.periodDebit - tbAcc.periodCredit;
                    const finalDebit = tbAcc.openingDebit + tbAcc.periodDebit;
                    const finalCredit = tbAcc.openingCredit + tbAcc.periodCredit;
                    const finalBal = finalDebit - finalCredit;
                    // البحث في الربط مع مراعاة التقليم
                    const mappedId = file.tbMappings[tbAcc.name] || file.tbMappings[tbAcc.name.trim()];
                    const mappedAcc = file.accounts.find(a => a.id === mappedId);
                    const isMapped = !!mappedId;

                    return (
                      <tr key={idx} className={`hover:bg-slate-50 transition-all ${!isMapped ? 'bg-amber-50/10' : ''}`}>
                        <td className="p-3 sm:p-4 text-right font-bold text-slate-700 text-[11px] sm:text-xs border-l sticky right-0 bg-inherit z-10 border-slate-100">{tbAcc.name}</td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(tbAcc.openingDebit)}</td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(tbAcc.openingCredit)}</td>
                        <td className={`p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-black border-l border-slate-100 bg-blue-50/10 ${openingBal < 0 ? 'text-red-500' : 'text-blue-600'}`}>{formatNum(openingBal)}</td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(tbAcc.periodDebit)}</td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(tbAcc.periodCredit)}</td>
                        <td className={`p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-black border-l border-slate-100 bg-purple-50/10 ${periodBal < 0 ? 'text-red-500' : 'text-purple-600'}`}>{formatNum(periodBal)}</td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(finalDebit)}</td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(finalCredit)}</td>
                        <td className={`p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-black border-l border-slate-100 bg-green-50/10 ${finalBal < 0 ? 'text-red-500' : 'text-green-600'}`}>{formatNum(finalBal)}</td>
                        <td className="p-2 sm:p-3">
                          <div className="relative">
                            <button disabled={isApproved} onClick={() => setActiveDropdown(activeDropdown === tbAcc.name ? null : tbAcc.name)} className={`w-full p-2 sm:p-2.5 rounded-xl text-[9px] sm:text-[10px] font-black border-2 transition-all flex items-center justify-between gap-1 sm:gap-2 text-right ${isMapped ? 'border-green-100 bg-green-50/30 text-green-700' : 'border-amber-100 bg-amber-50/50 text-amber-600'} ${isApproved ? 'opacity-70 cursor-not-allowed' : ''}`}>
                              <span className="truncate">{isMapped ? `[${mappedAcc?.code}] ${mappedAcc?.name}` : '-- اختر حساب التربيط --'}</span>
                              {isApproved ? <Lock size={10} className="text-gray-400" /> : <ChevronDown size={12} className={isMapped ? 'text-green-400' : 'text-amber-400'} />}
                            </button>
                            {activeDropdown === tbAcc.name && !isApproved && (
                              <div ref={dropdownRef} className="absolute top-full mt-1 right-0 w-64 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden flex flex-col" style={{ maxHeight: '400px' }}>
                                <div className="p-3 border-b bg-gray-50/50">
                                  <div className="relative"><Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" autoFocus placeholder="بحث..." value={coaSearchQuery} onChange={(e) => setCoaSearchQuery(e.target.value)} className="w-full pr-8 pl-3 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                                  <p className="text-[8px] sm:text-[9px] font-bold text-blue-500 mt-2 text-center uppercase tracking-wider">حسابات المستوى الرابع فقط</p>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 max-h-[250px]">
                                  {availableCoaAccounts.length > 0 ? availableCoaAccounts.map(coa => (
                                    <button key={coa.id} onClick={() => saveMapping(tbAcc.name, coa.id)} className={`w-full text-right p-2.5 sm:p-3 rounded-xl flex items-center justify-between transition-all hover:bg-blue-50 group ${mappedId === coa.id ? 'bg-blue-50/50 text-blue-700' : 'text-slate-600'}`}>
                                      <div className="flex items-center gap-2 truncate">
                                        <span className="text-[8px] sm:text-[9px] font-black text-blue-400 min-w-[45px] sm:min-w-[55px] font-mono">[{coa.code}]</span>
                                        <span className={`text-[10px] sm:text-[11px] font-bold truncate text-slate-700`}>{coa.name}</span>
                                      </div>
                                      {mappedId === coa.id && <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />}
                                    </button>
                                  )) : <div className="p-10 text-center text-[10px] font-bold text-gray-400 italic">لا توجد نتائج</div>}
                                </div>
                                <div className="p-2 border-t bg-gray-50/50">
                                    <button onClick={() => { setShowAddModal(true); setActiveDropdown(null); }} className="w-full flex items-center justify-center gap-2 py-2 text-blue-600 hover:bg-blue-100/50 rounded-xl text-[10px] sm:text-[11px] font-black transition-all"><Plus size={14} /> إضافة حساب جديد</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-black text-slate-800 text-[10px] sm:text-[11px]">
                    <td className="p-3 sm:p-4 text-right border-l sticky right-0 bg-slate-100/50 z-10 border-slate-200">المجموع الكلي</td>
                    <td className="p-1.5 sm:p-2 border-l border-slate-200">{formatNum(totals.openingDebit)}</td>
                    <td className="p-1.5 sm:p-2 border-l border-slate-200">{formatNum(totals.openingCredit)}</td>
                    <td className={`p-1.5 sm:p-2 border-l border-slate-200 bg-blue-100/30 ${totals.openingBalance < 0 ? 'text-red-500' : 'text-blue-700'}`}>{formatNum(totals.openingBalance)}</td>
                    <td className="p-1.5 sm:p-2 border-l border-slate-200">{formatNum(totals.periodDebit)}</td>
                    <td className="p-1.5 sm:p-2 border-l border-slate-200">{formatNum(totals.periodCredit)}</td>
                    <td className={`p-1.5 sm:p-2 border-l border-slate-200 bg-purple-100/30 ${totals.periodBalance < 0 ? 'text-red-500' : 'text-purple-700'}`}>{formatNum(totals.periodBalance)}</td>
                    <td className="p-1.5 sm:p-2 border-l border-slate-200">{formatNum(totals.finalDebit)}</td>
                    <td className="p-1.5 sm:p-2 border-l border-slate-200">{formatNum(totals.finalCredit)}</td>
                    <td className={`p-1.5 sm:p-2 border-l border-slate-200 bg-green-100/30 ${totals.finalBalance < 0 ? 'text-red-500' : 'text-green-700'}`}>{formatNum(totals.finalBalance)}</td>
                    <td className="p-2 sm:p-3 bg-slate-50"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {showAddModal && !isApproved && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 text-right">
            <div className="flex justify-end mb-4"><button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-all"><X size={24} /></button></div>
            <h4 className="text-center text-lg sm:text-xl font-black text-gray-900 mb-6 sm:mb-8">إضافة حساب جديد</h4>
            <div className="bg-gray-50/50 rounded-2xl p-4 sm:p-6 border border-gray-100 mb-6 sm:mb-8">
               <p className="text-center font-black text-gray-900 text-sm mb-4">اختيار المستوى</p>
               <div className="flex justify-center items-center gap-3 sm:gap-4">
                  {[1, 2, 3, 4].map(lvl => (
                    <label key={lvl} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                      <input type="radio" name="level" checked={addAccountData.level === lvl} onChange={() => setAddAccountData({ ...addAccountData, level: lvl })} className="w-4 h-4 text-blue-600 border-gray-300" />
                      <span className={`text-sm font-black ${addAccountData.level === lvl ? 'text-gray-900' : 'text-gray-400'}`}>{lvl.toLocaleString('en-US')}</span>
                    </label>
                  ))}
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
               {addAccountData.level >= 2 && (
                 <div className="space-y-1 text-center">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-900 mb-1">المستوى 1</p>
                    <select value={addAccountData.l1ParentId} onChange={(e) => setAddAccountData({ ...addAccountData, l1ParentId: e.target.value, l2ParentId: '', l3ParentId: '' })} className="w-full p-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-center outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none">
                      <option value="">...اختر</option>
                      {file.accounts.filter(a => a.level === 0).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                 </div>
               )}
               {addAccountData.level >= 3 && (
                 <div className="space-y-1 text-center">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-900 mb-1">المستوى 2</p>
                    <select value={addAccountData.l2ParentId} onChange={(e) => setAddAccountData({ ...addAccountData, l2ParentId: e.target.value, l3ParentId: '' })} className="w-full p-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-center outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none">
                      <option value="">...اختر</option>
                      {file.accounts.filter(a => a.parentId === addAccountData.l1ParentId).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                 </div>
               )}
               {addAccountData.level >= 4 && (
                 <div className="space-y-1 text-center">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-900 mb-1">المستوى 3</p>
                    <select value={addAccountData.l3ParentId} onChange={(e) => setAddAccountData({ ...addAccountData, l3ParentId: e.target.value })} className="w-full p-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-center outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none">
                      <option value="">...اختر</option>
                      {file.accounts.filter(a => a.parentId === addAccountData.l2ParentId).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                 </div>
               )}
            </div>
            <div className="bg-blue-50/30 rounded-[1.5rem] sm:rounded-3xl p-4 sm:p-6 border border-blue-100/50 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-10 bg-white border border-blue-100 rounded-xl flex items-center justify-center font-black text-blue-600 text-xs sm:text-sm shadow-sm">
                    {(() => {
                        let pId: string | null = null;
                        if (addAccountData.level === 1) pId = null;
                        else if (addAccountData.level === 2) pId = addAccountData.l1ParentId;
                        else if (addAccountData.level === 3) pId = addAccountData.l2ParentId;
                        else if (addAccountData.level === 4) pId = addAccountData.l3ParentId;
                        if (addAccountData.level > 1 && !pId) return "---";
                        return calculateNextCode(pId);
                    })()}
                  </div>
                  <p className="font-black text-blue-900 text-xs sm:text-sm">الكود التلقائي:</p>
               </div>
               <div className="space-y-2">
                  <p className="text-right font-black text-blue-900 text-xs sm:text-sm px-1">اسم الحساب الجديد</p>
                  <input type="text" value={addAccountData.name} onChange={(e) => setAddAccountData({ ...addAccountData, name: e.target.value })} placeholder="أدخل الاسم..." className="w-full p-3.5 sm:p-4 bg-white border border-blue-100 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black outline-none text-right focus:ring-2 focus:ring-blue-500/20" />
               </div>
            </div>
            <button onClick={handleAddAccountToTree} className="mt-6 sm:mt-8 w-full bg-blue-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98]">إضافة الحساب</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMappingView;
