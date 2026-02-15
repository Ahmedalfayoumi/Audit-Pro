
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowRight, Search, Plus, Save, ChevronDown, CheckCircle2, 
  AlertCircle, FileSpreadsheet, Workflow, X, Layers,
  CheckCircle, ShieldCheck, Folder, FileText, ChevronUp, Lock, Download, Compass, Menu,
  Info, AlertTriangle, Loader2, Target, LockKeyhole
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
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [coaSearchQuery, setCoaSearchQuery] = useState('');
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);
  const [showPlanningMenu, setShowPlanningMenu] = useState(false);
  const [isSavingAndApproving, setIsSavingAndApproving] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const planningMenuRef = useRef<HTMLDivElement>(null);

  // الحالة المعتمدة (المقفلة) - تعتمد على حالة الملف في قاعدة البيانات
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

  const mappingStats = useMemo(() => {
    const total = file.tbAccounts.length;
    const mapped = file.tbAccounts.filter(acc => {
      const originalName = acc.name;
      const trimmedName = acc.name.trim();
      return !!file.tbMappings[originalName] || !!file.tbMappings[trimmedName];
    }).length;
    const percentage = total > 0 ? Math.round((mapped / total) * 100) : 0;
    return { total, mapped, remaining: total - mapped, percentage };
  }, [file.tbAccounts, file.tbMappings]);

  const isAllMapped = mappingStats.percentage === 100 && mappingStats.total > 0;

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
    const baseList = file.accounts.filter(acc => !acc.isCategory); 
    if (!coaSearchQuery.trim()) return baseList;
    const q = coaSearchQuery.toLowerCase().trim();
    return baseList.filter(acc => 
      acc.name.toLowerCase().includes(q) || 
      acc.code.includes(q)
    );
  }, [file.accounts, coaSearchQuery]);

  const saveMapping = (tbAccName: string, coaId: string) => {
    if (isApproved) return; // منع التعديل إذا كان معتمداً
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

  const handleSaveAndApprove = () => {
    if (isSavingAndApproving || isApproved) return;
    
    if (!isAllMapped) {
      alert(`يرجى إكمال التربيط بنسبة 100% (متبقي ${mappingStats.remaining} حساباً) لتتمكن من الاعتماد وقفل الميزان.`);
      return;
    }

    setShowApproveConfirm(true);
  };

  const executeApprove = () => {
    setShowApproveConfirm(false);
    setIsSavingAndApproving(true);
    // محاكاة عملية القفل والحفظ
    setTimeout(() => {
      onUpdateFile({ ...file, status: 'Completed' });
      setIsSavingAndApproving(false);
      setIsActionsExpanded(false);
      // التوجيه التلقائي للقائمة أو إظهار رسالة نجاح
      setShowPlanningMenu(true);
    }, 800);
  };

  const handleUnlockMapping = () => {
    if (confirm("هل تريد إلغاء الاعتماد وفتح ميزان المراجعة للتعديل؟\n(قد يؤثر هذا على أوراق العمل المرتبطة في مرحلة التخطيط)")) {
      onUpdateFile({ ...file, status: 'Review' });
      setShowPlanningMenu(false);
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
        "اسم الحساب": tbAcc.name,
        "صافي الافتتاحي": openingBal,
        "صافي الحركة": periodBal,
        "صافي الختامي": finalBal,
        "تصنيف الدليل المربوط": crumbs.join(' > ') || "غير مربوط"
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ميزان معتمد");
    XLSX.writeFile(wb, `ميزان_${file.companyName}_${file.financialYear}.xlsx`);
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
              <h2 className="text-sm sm:text-lg font-black text-gray-800 truncate">
                {isApproved ? 'ميزان المراجعة (مقفل)' : 'تربيط ميزان المراجعة'}
              </h2>
              {isApproved ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded-full text-[10px] font-black whitespace-nowrap shadow-md border border-green-500 animate-in zoom-in">
                  <ShieldCheck size={12} /> معتمد ومقفل
                </span>
              ) : (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black whitespace-nowrap shadow-sm border ${isAllMapped ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                   {isAllMapped ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>}
                   إنجاز: {mappingStats.percentage}%
                </div>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 truncate">{file.companyName} - {file.financialYear}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <div className={`flex items-center gap-1 sm:gap-3`}>
            
            {/* زر قائمة التخطيط - يتفعل فقط بعد الاعتماد */}
            <div className="relative" ref={planningMenuRef}>
              <button 
                disabled={!isApproved}
                onClick={() => setShowPlanningMenu(!showPlanningMenu)}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 ${
                  isApproved 
                    ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] ring-4 ring-indigo-50' 
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-200 grayscale'
                }`}
              >
                <Compass size={16} /> 
                <span>قائمة التخطيط</span> 
                {isApproved && <span className="mr-1 w-2 h-2 rounded-full bg-red-400 animate-ping"></span>}
                <ChevronDown size={14} className={showPlanningMenu ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              
              {showPlanningMenu && isApproved && (
                <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-indigo-50 border-b border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">مرحلة التخطيط الميداني</p>
                  </div>
                  <div className="p-1">
                    <button onClick={() => { setActiveView('materiality'); setShowPlanningMenu(false); }} className="w-full text-right p-4 text-xs font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all flex items-center gap-3">
                      <Target size={18} className="text-indigo-500" /> نموذج الأهمية النسبية (P.4)
                    </button>
                    <button className="w-full text-right p-4 text-xs font-black text-slate-400 cursor-not-allowed flex items-center gap-3 opacity-50">
                      <ShieldCheck size={18} /> تقييم مخاطر التدقيق
                    </button>
                    <button className="w-full text-right p-4 text-xs font-black text-slate-400 cursor-not-allowed flex items-center gap-3 opacity-50">
                      <Workflow size={18} /> استراتيجية التدقيق العامة
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isApproved ? (
              <button 
                onClick={handleSaveAndApprove} 
                disabled={isSavingAndApproving || !isAllMapped}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 ${
                  isAllMapped 
                  ? 'bg-green-600 text-white shadow-green-200 hover:bg-green-700 hover:scale-[1.02]' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                {isSavingAndApproving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>{isSavingAndApproving ? 'جاري القفل...' : 'اعتماد وقفل الميزان'}</span>
              </button>
            ) : (
               <button onClick={handleUnlockMapping} className="flex items-center justify-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all active:scale-95">
                  <LockKeyhole size={14} /> <span>إلغاء الاعتماد للتعديل</span>
                </button>
            )}

            <button onClick={onBack} className="hidden sm:flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-gray-50 transition-all active:scale-95">
              إغلاق
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-2 sm:p-4 custom-scrollbar relative">
        {/* طبقة شفافة لمنع التفاعل مع الجدول إذا كان مقفلاً، باستثناء التمرير */}
        <div className="inline-block min-w-full align-middle space-y-4">
          
          <div className={`bg-white p-6 rounded-[2rem] shadow-sm border ${isApproved ? 'border-green-100 bg-green-50/10' : 'border-gray-100'} flex flex-col md:flex-row items-center gap-6 transition-all`}>
             <div className="flex-1 w-full space-y-2">
                <div className="flex justify-between items-center px-1">
                   <p className="text-xs font-black text-gray-700">حالة إنجاز الميزان</p>
                   <span className={`text-xs font-black ${isApproved ? 'text-green-600' : 'text-blue-600'}`}>
                     {isApproved ? 'مكتمل ومعتمد (100%)' : `${mappingStats.percentage}% المنجز`}
                   </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                   <div className={`h-full transition-all duration-1000 ease-out rounded-full ${isApproved ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-blue-600'}`} style={{ width: `${isApproved ? 100 : mappingStats.percentage}%` }}></div>
                </div>
             </div>
             <div className="flex gap-4">
                {isApproved && (
                  <button onClick={handleExportExcel} className="flex items-center gap-2 bg-white border-2 border-green-200 text-green-700 px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-green-50 transition-all">
                    <FileSpreadsheet size={16} /> تصدير الميزان المربوط
                  </button>
                )}
             </div>
          </div>

          <div className={`bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative transition-all ${isApproved ? 'ring-4 ring-green-500/5' : ''}`}>
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-center border-separate border-spacing-0">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-white text-[10px] sm:text-[11px] font-black text-slate-800">
                    <th rowSpan={2} className="border-b border-l p-3 sm:p-4 text-right bg-white sticky right-0 z-30 min-w-[200px]">الحساب (ميزان المراجعة)</th>
                    <th colSpan={3} className="border-b border-l p-2 bg-blue-50/50 text-blue-600">الرصيد الافتتاحي</th>
                    <th colSpan={3} className="border-b border-l p-2 bg-purple-50/50 text-purple-600">الحركات خلال الفترة</th>
                    <th colSpan={3} className="border-b border-l p-2 bg-green-50/50 text-green-600">الرصيد النهائي</th>
                    <th rowSpan={2} className={`border-b p-3 sm:p-4 bg-white min-w-[220px] ${isApproved ? 'text-green-600 font-black' : ''}`}>
                      {isApproved ? (
                        <div className="flex items-center justify-center gap-2"><Lock size={14}/> التصنيف المعتمد</div>
                      ) : 'تربيط الحساب (Mapping)'}
                    </th>
                  </tr>
                  <tr className="bg-white text-[9px] sm:text-[10px] font-bold text-slate-400">
                    <th className="border-b border-l p-1.5 w-24">مدين</th>
                    <th className="border-b border-l p-1.5 w-24">دائن</th>
                    <th className="border-b border-l p-1.5 w-24 bg-blue-50/20 text-blue-600">الرصيد</th>
                    <th className="border-b border-l p-1.5 w-24">مدين</th>
                    <th className="border-b border-l p-1.5 w-24">دائن</th>
                    <th className="border-b border-l p-1.5 w-24 bg-purple-50/20 text-purple-600">الرصيد</th>
                    <th className="border-b border-l p-1.5 w-24">مدين</th>
                    <th className="border-b border-l p-1.5 w-24">دائن</th>
                    <th className="border-b border-l p-1.5 w-24 bg-green-50/20 text-green-600">الرصيد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTbAccounts.map((tbAcc, idx) => {
                    const openingBal = tbAcc.openingDebit - tbAcc.openingCredit;
                    const periodBal = tbAcc.periodDebit - tbAcc.periodCredit;
                    const finalDebit = tbAcc.openingDebit + tbAcc.periodDebit;
                    const finalCredit = tbAcc.openingCredit + tbAcc.periodCredit;
                    const finalBal = finalDebit - finalCredit;
                    const mappedId = file.tbMappings[tbAcc.name] || file.tbMappings[tbAcc.name.trim()];
                    const mappedAcc = file.accounts.find(a => a.id === mappedId);
                    const isMapped = !!mappedId;

                    return (
                      <tr key={idx} className={`transition-all group/row hover:bg-[#BFBFBF] ${isApproved ? 'cursor-default' : ''}`}>
                        <td className="p-3 sm:p-4 text-right font-bold text-slate-700 text-[11px] sm:text-xs border-l sticky right-0 bg-inherit z-10 border-slate-100 flex items-center gap-3">
                           {isApproved ? (
                              <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 shadow-sm"><ShieldCheck size={12} /></div>
                           ) : isMapped ? (
                              <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                           ) : (
                              <AlertCircle size={12} className="text-amber-400 shrink-0" />
                           )}
                           <span className="truncate">{tbAcc.name}</span>
                        </td>
                        <td className="p-1.5 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(tbAcc.openingDebit)}</td>
                        <td className="p-1.5 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(tbAcc.openingCredit)}</td>
                        <td className={`p-1.5 text-[10px] sm:text-[11px] font-black border-l border-slate-100 bg-blue-50/10 group-hover/row:bg-inherit ${openingBal < 0 ? 'text-red-500' : 'text-blue-600'}`}>{formatNum(openingBal)}</td>
                        <td className="p-1.5 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(tbAcc.periodDebit)}</td>
                        <td className="p-1.5 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(tbAcc.periodCredit)}</td>
                        <td className={`p-1.5 text-[10px] sm:text-[11px] font-black border-l border-slate-100 bg-purple-50/10 group-hover/row:bg-inherit ${periodBal < 0 ? 'text-red-500' : 'text-purple-600'}`}>{formatNum(periodBal)}</td>
                        <td className="p-1.5 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(finalDebit)}</td>
                        <td className="p-1.5 text-[10px] sm:text-[11px] font-medium border-l border-slate-50">{formatNum(finalCredit)}</td>
                        <td className={`p-1.5 text-[10px] sm:text-[11px] font-black border-l border-slate-100 bg-green-50/10 group-hover/row:bg-inherit ${finalBal < 0 ? 'text-red-500' : 'text-green-600'}`}>{formatNum(finalBal)}</td>
                        <td className="p-2 sm:p-3">
                          <div className="relative">
                            <button 
                              disabled={isApproved} 
                              onClick={() => setActiveDropdown(activeDropdown === tbAcc.name ? null : tbAcc.name)} 
                              className={`w-full p-2 rounded-xl text-[9px] sm:text-[10px] font-black border-2 transition-all flex items-center justify-between gap-1 sm:gap-2 text-right ${
                                isMapped ? 'border-green-100 bg-green-50/30 text-green-700' : 'border-amber-100 bg-amber-50/50 text-amber-600'
                              } ${isApproved ? 'border-green-500/20 bg-green-50/10 grayscale-0 opacity-100 pointer-events-none' : 'group-hover/row:bg-white/60'}`}
                            >
                              <span className="truncate flex items-center gap-1.5">
                                {isApproved && <ShieldCheck size={12} className="text-green-600 shrink-0" />}
                                {isMapped ? `[${mappedAcc?.code}] ${mappedAcc?.name}` : '-- حساب مفقود --'}
                              </span>
                              {!isApproved && <ChevronDown size={12} className={isMapped ? 'text-green-400' : 'text-amber-400'} />}
                            </button>
                            {activeDropdown === tbAcc.name && !isApproved && (
                              <div ref={dropdownRef} className="absolute top-full mt-1 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden flex flex-col max-h-[400px]">
                                <div className="p-3 border-b bg-gray-50/50">
                                  <div className="relative"><Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input type="text" autoFocus placeholder="بحث في الدليل..." value={coaSearchQuery} onChange={(e) => setCoaSearchQuery(e.target.value)} className="w-full pr-8 pl-3 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 max-h-[250px]">
                                  {availableCoaAccounts.length > 0 ? availableCoaAccounts.map(coa => (
                                    <button key={coa.id} onClick={() => saveMapping(tbAcc.name, coa.id)} className={`w-full text-right p-2.5 sm:p-3 rounded-xl flex items-center justify-between transition-all hover:bg-blue-50 group ${mappedId === coa.id ? 'bg-blue-50/50 text-blue-700' : 'text-slate-600'}`}>
                                      <div className="flex items-center gap-2 truncate">
                                        <span className="text-[8px] sm:text-[9px] font-black text-blue-400 min-w-[55px] font-mono">[{coa.code}]</span>
                                        <span className={`text-[10px] sm:text-[11px] font-bold truncate text-slate-700`}>{coa.name}</span>
                                      </div>
                                      {mappedId === coa.id && <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />}
                                    </button>
                                  )) : <div className="p-10 text-center text-[10px] font-bold text-gray-400 italic">لا توجد نتائج</div>}
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
                  <tr className={`font-black text-slate-800 text-[10px] sm:text-[11px] ${isApproved ? 'bg-green-50' : 'bg-slate-100'}`}>
                    <td className="p-3 sm:p-4 text-right border-l sticky right-0 bg-inherit z-10 border-slate-200">إجمالي الميزان {isApproved && '(معتمد)'}</td>
                    <td className="p-1.5 border-l border-slate-200">{formatNum(totals.openingDebit)}</td>
                    <td className="p-1.5 border-l border-slate-200">{formatNum(totals.openingCredit)}</td>
                    <td className={`p-1.5 border-l border-slate-200 bg-blue-100/30 ${totals.openingBalance < 0 ? 'text-red-500' : 'text-blue-700'}`}>{formatNum(totals.openingBalance)}</td>
                    <td className="p-1.5 border-l border-slate-200">{formatNum(totals.periodDebit)}</td>
                    <td className="p-1.5 border-l border-slate-200">{formatNum(totals.periodCredit)}</td>
                    <td className={`p-1.5 border-l border-slate-200 bg-purple-100/30 ${totals.periodBalance < 0 ? 'text-red-500' : 'text-purple-700'}`}>{formatNum(totals.periodBalance)}</td>
                    <td className="p-1.5 border-l border-slate-200">{formatNum(totals.finalDebit)}</td>
                    <td className="p-1.5 border-l border-slate-200">{formatNum(totals.finalCredit)}</td>
                    <td className={`p-1.5 border-l border-slate-200 bg-green-100/30 ${totals.finalBalance < 0 ? 'text-red-500' : 'text-green-700'}`}>{formatNum(totals.finalBalance)}</td>
                    <td className="p-2 sm:p-3 bg-inherit"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* نافذة تأكيد الاعتماد المخصصة */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner ring-4 ring-green-50/50">
                 <ShieldCheck size={40} />
              </div>
              <div className="space-y-3">
                 <h4 className="text-xl font-black text-gray-900">تأكيد اعتماد وقفل الميزان</h4>
                 <p className="text-sm text-gray-500 font-bold leading-relaxed px-4">
                    أنت على وشك قفل عمليات التربيط بشكل نهائي. 
                    <br/>
                    <span className="text-green-600">سيتم تفعيل قائمة التخطيط (الأهمية النسبية والمخاطر) فوراً.</span>
                 </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3 text-right">
                 <AlertTriangle size={24} className="text-amber-500 shrink-0" />
                 <p className="text-[10px] font-black text-amber-800 leading-normal">تنبيه: لا يمكن تعديل التربيط بعد هذه الخطوة إلا من خلال "إلغاء الاعتماد" مما قد يؤثر على أوراق العمل المرتبطة.</p>
              </div>
              <div className="flex gap-4 pt-2">
                 <button 
                    onClick={executeApprove}
                    className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-green-200 hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                 >
                    <CheckCircle2 size={18} /> نعم، اعتماد وقفل
                 </button>
                 <button 
                    onClick={() => setShowApproveConfirm(false)}
                    className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95"
                 >
                    تراجع
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AccountMappingView;
