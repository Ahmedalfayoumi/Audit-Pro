
import React, { useMemo } from 'react';
import { 
  FileText, ShieldAlert, TrendingDown, Percent, 
  Calculator, Info, Save, ArrowRight, Building2, 
  User, Calendar, Hash, AlertTriangle, FileDown 
} from 'lucide-react';
import { AuditFile, MaterialityData } from '../../types';

interface MaterialityViewProps {
  file: AuditFile;
  onUpdateFile: (file: AuditFile) => void;
  onBack: () => void;
}

const RISK_TABLE: Record<number, { revenue: number; assets: number; label: string }> = {
  1: { revenue: 0.005, assets: 0.02, label: 'مرتفعة' },
  2: { revenue: 0.01, assets: 0.03, label: 'متوسطة' },
  3: { revenue: 0.015, assets: 0.04, label: 'مقبولة' },
  4: { revenue: 0.02, assets: 0.05, label: 'متدنية' },
};

const MaterialityView: React.FC<MaterialityViewProps> = ({ file, onUpdateFile, onBack }) => {
  const currentMateriality = file.materialityData || { riskLevel: 2 };

  // Helper for dd/mm/yyyy date with Western digits
  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const displayDate = useMemo(() => formatDate(new Date()), []);

  const { totalRevenue, totalAssets } = useMemo(() => {
    let rev = 0;
    let ass = 0;
    file.tbAccounts.forEach(tbAcc => {
      const mappedId = file.tbMappings[tbAcc.name];
      if (mappedId) {
        const coaAcc = file.accounts.find(a => a.id === mappedId);
        if (coaAcc) {
          const finalBal = (tbAcc.openingDebit + tbAcc.periodDebit) - (tbAcc.openingCredit + tbAcc.periodCredit);
          if (coaAcc.type === 'Revenue') rev += Math.abs(finalBal);
          if (coaAcc.type === 'Assets') ass += Math.abs(finalBal);
        }
      }
    });
    return { totalRevenue: rev, totalAssets: ass };
  }, [file.tbAccounts, file.tbMappings, file.accounts]);

  const otherBasis = currentMateriality.otherBasis || 0;
  
  const materialityBaseValue = useMemo(() => {
    const values = [totalRevenue, totalAssets];
    if (otherBasis > 0) values.push(otherBasis);
    return Math.min(...values.filter(v => v > 0));
  }, [totalRevenue, totalAssets, otherBasis]);

  const baseLabel = useMemo(() => {
    if (materialityBaseValue === otherBasis && otherBasis > 0) return 'أساس آخر';
    if (materialityBaseValue === totalRevenue) return 'الإيرادات';
    return 'الموجودات';
  }, [materialityBaseValue, totalRevenue, otherBasis]);

  const baseTypeForPercentage: 'revenue' | 'assets' = materialityBaseValue === totalRevenue ? 'revenue' : 'assets';
  const riskLevelData = RISK_TABLE[currentMateriality.riskLevel];
  const percentageBasis = baseTypeForPercentage === 'revenue' ? riskLevelData.revenue : riskLevelData.assets;
  const basicMateriality = materialityBaseValue * percentageBasis;
  const unexpectedErrorRate = 0.05;
  const calculatedMateriality = basicMateriality * (1 - unexpectedErrorRate);

  const formatNum = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const handleUpdate = (updates: Partial<MaterialityData>) => {
    onUpdateFile({
      ...file,
      materialityData: { ...currentMateriality, ...updates }
    });
  };

  const handleDownloadPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Briefly change title for file naming
    const originalTitle = document.title;
    document.title = `Materiality_${file.companyName}_${file.financialYear}`;
    
    window.print();
    
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden font-sans text-right" dir="rtl">
      {/* 
          CRITICAL FIX FOR PRINTING: 
          Resetting height and overflow of all containers during print 
          to ensure full page capture.
      */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }

          html, body, #root, [class*="h-screen"], [class*="flex-col"] {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            position: static !important;
            background: white !important;
          }

          .no-print, header, nav, aside, button {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-only {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            position: relative !important;
            background: white !important;
          }

          .print-container {
            width: 100%;
            direction: rtl;
            color: black !important;
          }

          .print-title {
            text-align: center;
            font-size: 22pt;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 25pt;
          }

          .print-header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20pt;
          }

          .print-header-table td {
            border: 1pt solid #000;
            padding: 10pt;
            font-size: 11pt;
          }

          .print-header-table td:nth-child(odd) {
            background-color: #f1f5f9 !important;
            font-weight: bold;
            width: 130pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-row {
            display: flex;
            align-items: center;
            margin-bottom: 12pt;
            border-bottom: 1pt solid #e2e8f0;
            padding-bottom: 8pt;
            page-break-inside: avoid;
          }

          .print-label {
            flex: 1;
            font-size: 12pt;
            font-weight: bold;
            text-align: right;
          }

          .print-value {
            width: 150pt;
            text-align: center;
            border: 2pt solid #000;
            padding: 10pt;
            font-weight: bold;
            font-size: 14pt;
          }

          .print-highlight {
            border: 2pt solid #000 !important;
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-notes {
            margin-top: 30pt;
            border: 1.5pt solid #000;
            padding: 15pt;
            min-height: 120pt;
            font-size: 11pt;
            line-height: 1.8;
            page-break-inside: avoid;
          }

          .print-footer {
            margin-top: 50pt;
            border-top: 1pt solid #000;
            padding-top: 10pt;
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
            color: #64748b !important;
          }
        }

        .print-only {
          display: none;
        }
      `}</style>

      {/* Screen Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm shrink-0 no-print z-[90]">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onBack} 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            aria-label="Back"
          >
            <ArrowRight size={24} />
          </button>
          <div>
            <h2 className="text-lg font-black text-gray-800">الأهمية النسبية (Materiality)</h2>
            <p className="text-[10px] font-bold text-blue-600">{file.companyName} - {file.financialYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-black transition-all active:scale-95"
          >
            <FileDown size={16} /> تنزيل PDF
          </button>
          <button 
            type="button" 
            onClick={onBack} 
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            <Save size={16} /> حفظ وإغلاق
          </button>
        </div>
      </header>

      {/* Screen Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar no-print bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Info Section - Updated Date Format */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 flex items-center gap-1"><User size={12}/> اسم العميل :</p>
              <p className="font-bold text-gray-800 text-sm border-b pb-1">{file.companyName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 flex items-center gap-1"><Calendar size={12}/> السنة المالية :</p>
              <p className="font-bold text-gray-800 text-sm border-b pb-1">{file.financialYear}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 flex items-center gap-1"><Building2 size={12}/> الكيان القانوني :</p>
              <p className="font-bold text-gray-800 text-sm border-b pb-1">شركة مساهمة/تضامن</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 flex items-center gap-1"><Hash size={12}/> رقم الملف الدائم :</p>
              <p className="font-bold text-gray-800 text-sm border-b pb-1">AU-{file.companyId.slice(0, 4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400">أنجزها :</p>
              <p className="font-bold text-gray-800 text-sm border-b pb-1">زيد الدباغ</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400">التاريخ :</p>
              <p className="font-bold text-gray-800 text-sm border-b pb-1" dir="ltr" style={{ textAlign: 'right' }}>{displayDate}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
                <h3 className="font-black text-slate-700 flex items-center gap-2"><Calculator className="text-blue-600" /> احتساب أساس المادية</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نموذج P.4</span>
             </div>
             
             <div className="p-8 space-y-8">
                <p className="text-xs font-bold text-slate-500 italic">يتم اختيار أساس احتساب المادية بين قيمة:</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-xs sm:text-sm font-black text-gray-700 flex-1">1- قيمة الايرادات المتوقعة (ويتم تعديلها قبل إنهاء أعمال التدقيق):</p>
                    <div className="w-40 p-3 bg-white border border-gray-200 rounded-xl text-center font-black text-blue-600 shadow-sm">{formatNum(totalRevenue)}</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-xs sm:text-sm font-black text-gray-700 flex-1">2- قيمة الموجودات المتوقعة (ويتم تعديلها قبل إنهاء أعمال التدقيق):</p>
                    <div className="w-40 p-3 bg-white border border-gray-200 rounded-xl text-center font-black text-blue-600 shadow-sm">{formatNum(totalAssets)}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex-1 space-y-2">
                       <p className="text-xs sm:text-sm font-black text-gray-700">3- أي أساس احتساب آخر (مع ذكر السبب في الاسفل):</p>
                       <input 
                         type="text" 
                         placeholder="اذكر السبب هنا..." 
                         value={currentMateriality.otherBasisReason || ''}
                         onChange={(e) => handleUpdate({ otherBasisReason: e.target.value })}
                         className="w-full bg-transparent border-b border-gray-200 text-[10px] font-bold outline-none focus:border-blue-400 transition-colors"
                       />
                    </div>
                    <input 
                      type="number" 
                      value={otherBasis || ''}
                      onChange={(e) => handleUpdate({ otherBasis: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-40 p-3 bg-white border border-gray-200 rounded-xl text-center font-black text-amber-600 shadow-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div className="py-2 flex items-center gap-4"><div className="flex-1 h-px bg-slate-100"></div><span className="text-[10px] font-black text-slate-300">النتيجة والقرار</span><div className="flex-1 h-px bg-slate-100"></div></div>

                  <div className="flex items-center justify-between gap-4 p-5 rounded-[1.5rem] bg-blue-50 border border-blue-100">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-black text-blue-900">4- أساس المادية (1 أو 2 أو 3 أيهما أقل )</p>
                      <p className="text-[9px] font-bold text-blue-400 mt-1 uppercase tracking-tighter">الأساس المختار تلقائياً بناءً على القيمة الأقل</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black">{baseLabel}</span>
                       <div className="w-40 p-3 bg-white border border-blue-200 rounded-xl text-center font-black text-blue-700 shadow-md text-lg">{formatNum(materialityBaseValue)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-black text-gray-700 flex items-center gap-2">5- درجة المخاطر <ShieldAlert size={16} className="text-amber-500" /></p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                         currentMateriality.riskLevel === 1 ? 'bg-red-100 text-red-600' : 
                         currentMateriality.riskLevel === 2 ? 'bg-amber-100 text-amber-600' :
                         currentMateriality.riskLevel === 3 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                       }`}>{riskLevelData.label}</span>
                       <select 
                         value={currentMateriality.riskLevel}
                         onChange={(e) => handleUpdate({ riskLevel: parseInt(e.target.value) })}
                         className="w-40 p-3 bg-white border border-gray-200 rounded-xl text-center font-black text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                       >
                         {[1, 2, 3, 4].map(l => <option key={l} value={l}>{l}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100">
                    <p className="text-xs sm:text-sm font-black text-gray-700 flex-1">6- أساس احتساب المادية (من جدول المخاطر):</p>
                    <div className="w-40 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-black text-slate-600">{(percentageBasis * 100).toFixed(2)}%</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-5 rounded-[1.5rem] bg-indigo-50 border border-indigo-100">
                    <p className="text-xs sm:text-sm font-black text-indigo-900 flex-1">7 - المادية الأساسية (الأساس × نسبة الاحتساب):</p>
                    <div className="w-40 p-3 bg-white border border-indigo-200 rounded-xl text-center font-black text-indigo-700 shadow-md text-lg">{formatNum(basicMateriality)}</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100">
                    <p className="text-xs sm:text-sm font-black text-gray-700 flex-1">8 - الخطأ غير المتوقع (نسبة ثابتة):</p>
                    <div className="w-40 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-black text-slate-600">5%</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-6 rounded-[2rem] bg-green-50 border border-green-200 ring-4 ring-green-50">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-black text-green-900 flex items-center gap-2">9 - المادية المستخدمة (المادية المحتسبة): <Percent size={18}/></p>
                    </div>
                    <div className="w-48 p-4 bg-white border-2 border-green-500 rounded-[1.5rem] text-center font-black text-green-700 shadow-xl text-2xl">{formatNum(calculatedMateriality)}</div>
                  </div>
                </div>

                <div className="mt-12 space-y-4">
                  <h4 className="font-black text-gray-800 flex items-center gap-2 border-b pb-2"><Info size={18} className="text-blue-600" /> ملاحظات إضافية</h4>
                  <textarea 
                    value={currentMateriality.notes || ''}
                    onChange={(e) => handleUpdate({ notes: e.target.value })}
                    placeholder="اكتب أي ملاحظات تتعلق بتحديد المادية هنا..."
                    className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-xs resize-none text-right"
                  />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY PDF LAYOUT */}
      <div className="print-only print-container">
        <div className="print-title">تقرير الأهمية النسبية (Materiality Report)</div>
        
        <table className="print-header-table">
          <tbody>
            <tr>
              <td>اسم العميل :</td>
              <td>{file.companyName}</td>
              <td>السنة المالية :</td>
              <td>{file.financialYear}</td>
            </tr>
            <tr>
              <td>الكيان القانوني :</td>
              <td>شركة مساهمة/تضامن</td>
              <td>رقم الملف الدائم :</td>
              <td>AU-{file.companyId.slice(0, 4)}</td>
            </tr>
            <tr>
              <td>أنجزها :</td>
              <td>زيد الدباغ</td>
              <td>التاريخ :</td>
              <td dir="ltr">{displayDate}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginBottom: '15pt', fontWeight: 'bold', fontSize: '13pt' }}>يتم اختيار أساس احتساب المادية بين قيمة :</div>

        <div className="print-row">
          <div className="print-label">1- قيمة الايرادات المتوقعة :</div>
          <div className="print-value">{formatNum(totalRevenue)}</div>
        </div>

        <div className="print-row">
          <div className="print-label">2- قيمة الموجودات المتوقعة :</div>
          <div className="print-value">{formatNum(totalAssets)}</div>
        </div>

        <div className="print-row" style={{ minHeight: '50pt' }}>
          <div className="print-label">
            3- أي أساس احتساب آخر :
            <div style={{ fontSize: '10pt', marginTop: '4pt', fontWeight: 'normal' }}>
               السبب: {currentMateriality.otherBasisReason || '....................................................................................'}
            </div>
          </div>
          <div className="print-value">{formatNum(otherBasis)}</div>
        </div>

        <div className="print-row print-highlight" style={{ marginTop: '20pt', padding: '12pt' }}>
          <div className="print-label">4- أساس المادية المختار (أيهما أقل): <strong>({baseLabel})</strong></div>
          <div className="print-value" style={{ border: '2pt solid #000' }}>{formatNum(materialityBaseValue)}</div>
        </div>

        <div className="print-row">
          <div className="print-label">5- درجة المخاطر : ({riskLevelData.label})</div>
          <div className="print-value">{currentMateriality.riskLevel}</div>
        </div>

        <div className="print-row">
          <div className="print-label">6- أساس احتساب المادية (%) :</div>
          <div className="print-value">{(percentageBasis * 100).toFixed(2)}%</div>
        </div>

        <div className="print-row">
          <div className="print-label">7- المادية الأساسية (الأساس × النسبة) :</div>
          <div className="print-value">{formatNum(basicMateriality)}</div>
        </div>

        <div className="print-row">
          <div className="print-label">8- الخطأ غير المتوقع (5% ثابت) :</div>
          <div className="print-value">5%</div>
        </div>

        <div className="print-row print-highlight" style={{ marginTop: '20pt', padding: '15pt' }}>
          <div className="print-label" style={{ fontSize: '16pt' }}>9- المادية المستخدمة (المادية المحتسبة) :</div>
          <div className="print-value" style={{ fontSize: '18pt', height: '40pt', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {formatNum(calculatedMateriality)}
          </div>
        </div>

        <div className="print-notes">
          <div style={{ fontWeight: 'bold', borderBottom: '1pt solid black', marginBottom: '8pt', display: 'inline-block' }}>ملاحظات المخطط :</div>
          <div>{currentMateriality.notes || 'لا يوجد ملاحظات إضافية تم تدوينها.'}</div>
        </div>

        <div className="print-footer">
          <div>Audit Pro System - P.4 Materiality Form</div>
          <div>تاريخ الطباعة: {displayDate}</div>
        </div>
      </div>
    </div>
  );
};

export default MaterialityView;
