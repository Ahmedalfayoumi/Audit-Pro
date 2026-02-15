
import React, { useMemo, useState } from 'react';
import { 
  FileText, ShieldAlert, TrendingDown, Percent, 
  Calculator, Info, Save, ArrowRight, Building2, 
  User, Calendar, Hash, AlertTriangle, FileDown, Loader2, Printer
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
  const [isPrinting, setIsPrinting] = useState(false);
  const currentMateriality = file.materialityData || { riskLevel: 2 };

  // تنسيق التاريخ بالأرقام الغربية المتعارف عليها في الأنظمة المالية
  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const displayDate = useMemo(() => formatDate(new Date()), []);

  // احتساب القيم المالية بناءً على التربيط الحالي في ميزان المراجعة
  const { totalRevenue, totalAssets } = useMemo(() => {
    let rev = 0;
    let ass = 0;
    file.tbAccounts.forEach(tbAcc => {
      const mappedId = file.tbMappings[tbAcc.name] || file.tbMappings[tbAcc.name.trim()];
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
    const validValues = values.filter(v => v > 0);
    return validValues.length > 0 ? Math.min(...validValues) : 0;
  }, [totalRevenue, totalAssets, otherBasis]);

  const baseLabel = useMemo(() => {
    if (materialityBaseValue === 0) return 'بانتظار البيانات';
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

  const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const handleUpdate = (updates: Partial<MaterialityData>) => {
    onUpdateFile({
      ...file,
      materialityData: { ...currentMateriality, ...updates }
    });
  };

  const handleDownloadPDF = () => {
    setIsPrinting(true);
    // إعطاء مهلة بسيطة للمتصفح للتأكد من رندرة كافة العناصر قبل فتح نافذة الطباعة
    setTimeout(() => {
      const originalTitle = document.title;
      // تغيير عنوان الصفحة مؤقتاً ليكون هو اسم ملف الـ PDF عند الحفظ
      document.title = `نموذج_الأهمية_النسبية_${file.companyName}_${file.financialYear}`;
      
      window.print();
      
      // استعادة العنوان الأصلي
      document.title = originalTitle;
      setIsPrinting(false);
    }, 300);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden font-sans text-right" dir="rtl">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }

          /* إعدادات المتصفح لإجبار طباعة الخلفيات */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body, #root {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }

          /* إخفاء واجهة التطبيق أثناء الطباعة */
          .no-print, header, nav, aside, button, .custom-scrollbar::-webkit-scrollbar {
            display: none !important;
            visibility: hidden !important;
          }

          .print-only {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            color: black !important;
          }

          .print-container {
            font-family: 'Noto Sans Arabic', sans-serif;
            padding: 0;
            margin: 0;
          }

          .print-header {
            border-bottom: 2pt solid #2563eb;
            padding-bottom: 15pt;
            margin-bottom: 20pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .print-title {
            text-align: center;
            font-size: 18pt;
            font-weight: 900;
            color: #1e293b;
          }

          .print-data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15pt;
            margin-bottom: 20pt;
          }

          .print-label {
            font-weight: 900;
            color: #64748b;
            font-size: 10pt;
          }

          .print-value {
            font-weight: 700;
            color: #1e293b;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 2pt;
          }

          .print-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 15pt;
          }

          .print-table td {
            border: 0.5pt solid #cbd5e1;
            padding: 10pt;
            font-size: 11pt;
          }

          .print-table-head {
            background-color: #f1f5f9 !important;
            font-weight: 900;
            width: 60%;
          }

          .print-table-val {
            text-align: center;
            font-weight: 900;
            width: 40%;
            font-family: 'Courier New', monospace;
          }

          .highlight-row {
            background-color: #eff6ff !important;
            border: 2pt solid #2563eb !important;
          }

          .final-materiality-box {
            margin-top: 30pt;
            background-color: #f0fdf4 !important;
            border: 2pt solid #16a34a !important;
            padding: 20pt;
            border-radius: 15pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }

        .print-only {
          display: none;
        }
      `}</style>

      {/* الرأس المرئي في التطبيق */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm shrink-0 no-print z-[90]">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onBack} 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
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
            disabled={isPrinting}
            onClick={handleDownloadPDF}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 ${
              isPrinting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-black'
            }`}
          >
            {isPrinting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            <span>تنزيل التقرير (Print)</span>
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

      {/* المحتوى التفاعلي في التطبيق */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar no-print bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto space-y-6">
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
              <p className="font-bold text-gray-800 text-sm border-b pb-1">شركة مسجلة</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 flex items-center gap-1"><Hash size={12}/> رقم الملف :</p>
              <p className="font-bold text-gray-800 text-sm border-b pb-1" dir="ltr" style={{textAlign: 'right'}}>AU-{file.companyId.slice(0, 5)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400">إعداد :</p>
              <p className="font-bold text-gray-800 text-sm border-b pb-1">المسؤول عن الملف</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400">التاريخ :</p>
              <p className="font-bold text-gray-800 text-sm border-b pb-1" dir="ltr" style={{ textAlign: 'right' }}>{displayDate}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
                <h3 className="font-black text-slate-700 flex items-center gap-2"><Calculator className="text-blue-600" size={20} /> جدول احتساب الأهمية النسبية</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border">WP P.4</span>
             </div>
             
             <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-xs sm:text-sm font-black text-gray-700 flex-1">1- إجمالي الإيرادات السنوية (المحققة/المتوقعة):</p>
                    <div className="w-44 p-3 bg-white border border-gray-200 rounded-xl text-center font-black text-blue-600 shadow-sm" dir="ltr">{formatNum(totalRevenue)}</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-xs sm:text-sm font-black text-gray-700 flex-1">2- إجمالي الموجودات (الأصول):</p>
                    <div className="w-44 p-3 bg-white border border-gray-200 rounded-xl text-center font-black text-blue-600 shadow-sm" dir="ltr">{formatNum(totalAssets)}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex-1 space-y-2">
                       <p className="text-xs sm:text-sm font-black text-gray-700">3- أساس احتساب آخر (عند الضرورة المهنية):</p>
                       <input 
                         type="text" 
                         placeholder="يرجى ذكر مبررات اختيار أساس آخر..." 
                         value={currentMateriality.otherBasisReason || ''}
                         onChange={(e) => handleUpdate({ otherBasisReason: e.target.value })}
                         className="w-full bg-transparent border-b border-gray-200 text-[10px] font-bold outline-none focus:border-blue-400 transition-colors"
                       />
                    </div>
                    <input 
                      type="number" 
                      value={otherBasis || ''}
                      onChange={(e) => handleUpdate({ otherBasis: parseFloat(e.target.value) || 0 })}
                      placeholder="0.000"
                      className="w-44 p-3 bg-white border border-gray-200 rounded-xl text-center font-black text-amber-600 shadow-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                      dir="ltr"
                    />
                  </div>

                  <div className="py-2 flex items-center gap-4"><div className="flex-1 h-px bg-slate-100"></div><span className="text-[10px] font-black text-slate-300">النتائج المحتسبة</span><div className="flex-1 h-px bg-slate-100"></div></div>

                  <div className="flex items-center justify-between gap-4 p-5 rounded-[1.5rem] bg-blue-50 border border-blue-100 shadow-inner">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-black text-blue-900">4- أساس المادية المختار (الأقل من أعلاه):</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black">{baseLabel}</span>
                       <div className="w-44 p-3 bg-white border border-blue-200 rounded-xl text-center font-black text-blue-700 shadow-md text-lg" dir="ltr">{formatNum(materialityBaseValue)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-black text-gray-700 flex items-center gap-2">5- درجة المخاطر المحددة للمنشأة <ShieldAlert size={16} className="text-amber-500" /></p>
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
                         className="w-44 p-3 bg-white border border-gray-200 rounded-xl text-center font-black text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                       >
                         <option value={1}>1 - مرتفعة</option>
                         <option value={2}>2 - متوسطة</option>
                         <option value={3}>3 - مقبولة</option>
                         <option value={4}>4 - متدنية</option>
                       </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100">
                    <p className="text-xs sm:text-sm font-black text-gray-700 flex-1">6- نسبة الاحتساب المطبقة (درجة {currentMateriality.riskLevel}):</p>
                    <div className="w-44 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-black text-slate-600" dir="ltr">{(percentageBasis * 100).toFixed(2)}%</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-5 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 shadow-inner">
                    <p className="text-xs sm:text-sm font-black text-indigo-900 flex-1">7 - المادية الأساسية (4 × 6):</p>
                    <div className="w-44 p-3 bg-white border border-indigo-200 rounded-xl text-center font-black text-indigo-700 shadow-md text-lg" dir="ltr">{formatNum(basicMateriality)}</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-6 rounded-[2rem] bg-green-50 border border-green-200 ring-4 ring-green-50 shadow-xl mt-4">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-black text-green-900 flex items-center gap-2">9 - الأهمية النسبية النهائية (Materiality Used): <Percent size={18}/></p>
                      <p className="text-[10px] text-green-600 font-bold mt-1">القيمة المحتسبة بعد خصم هامش الخطأ غير المتوقع (5%)</p>
                    </div>
                    <div className="w-52 p-4 bg-white border-2 border-green-500 rounded-[1.5rem] text-center font-black text-green-700 shadow-2xl text-2xl" dir="ltr">{formatNum(calculatedMateriality)}</div>
                  </div>
                </div>

                <div className="mt-12 space-y-4">
                  <h4 className="font-black text-gray-800 flex items-center gap-2 border-b pb-2"><Info size={18} className="text-blue-600" /> مبررات المدقق وملاحظات إضافية</h4>
                  <textarea 
                    value={currentMateriality.notes || ''}
                    onChange={(e) => handleUpdate({ notes: e.target.value })}
                    placeholder="سجل هنا أي تفاصيل إضافية أو مبررات مهنية حول تحديد مستوى الأهمية النسبية..."
                    className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-xs resize-none text-right shadow-inner"
                  />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* قالب الطباعة (مخفي في التطبيق) */}
      <div className="print-only print-container" dir="rtl">
        <div className="print-header">
           <div className="text-xl font-black text-blue-600">AUDIT PRO SYSTEM</div>
           <div className="print-title">احتساب الأهمية النسبية - ورقة عمل (P.4)</div>
           <div className="text-sm font-bold text-gray-400">سري وللاستخدام المهني</div>
        </div>
        
        <div className="print-data-grid">
           <div><span className="print-label">اسم العميل: </span><span className="print-value">{file.companyName}</span></div>
           <div><span className="print-label">السنة المالية: </span><span className="print-value" dir="ltr">{file.financialYear}</span></div>
           <div><span className="print-label">الرقم المرجعي: </span><span className="print-value" dir="ltr">AU-{file.companyId.slice(0, 5)}</span></div>
           <div><span className="print-label">تاريخ الإصدار: </span><span className="print-value" dir="ltr">{displayDate}</span></div>
           <div style={{ gridColumn: 'span 2' }}><span className="print-label">أعدت من قبل: </span><span className="print-value">زيد الدباغ - مدقق حسابات رئيسي</span></div>
        </div>

        <table className="print-table">
          <tbody>
            <tr>
              <td className="print-table-head">1- إجمالي الإيرادات السنوية (المحققة/المتوقعة):</td>
              <td className="print-table-val" dir="ltr">{formatNum(totalRevenue)}</td>
            </tr>
            <tr>
              <td className="print-table-head">2- إجمالي الموجودات (الأصول):</td>
              <td className="print-table-val" dir="ltr">{formatNum(totalAssets)}</td>
            </tr>
            <tr>
              <td className="print-table-head">3- أساس المادية المعتمد (الأقل من أعلاه):</td>
              <td className="print-table-val" dir="ltr">{formatNum(materialityBaseValue)}</td>
            </tr>
            <tr>
              <td className="print-table-head">4- درجة المخاطر المقررة:</td>
              <td className="print-table-val">{currentMateriality.riskLevel} ({riskLevelData.label})</td>
            </tr>
            <tr>
              <td className="print-table-head">5- نسبة الاحتساب المطبقة (بناءً على جدول المخاطر):</td>
              <td className="print-table-val" dir="ltr">{(percentageBasis * 100).toFixed(2)}%</td>
            </tr>
            <tr>
              <td className="print-table-head">6- المادية الأساسية المحتسبة (3 × 5):</td>
              <td className="print-table-val" dir="ltr">{formatNum(basicMateriality)}</td>
            </tr>
          </tbody>
        </table>

        <div className="final-materiality-box">
           <div style={{ fontSize: '14pt', fontWeight: '900', color: '#166534' }}>الأهمية النسبية النهائية المعتمدة للتدقيق:</div>
           <div style={{ fontSize: '22pt', fontWeight: '900', color: '#166534' }} dir="ltr">{formatNum(calculatedMateriality)}</div>
        </div>

        <div style={{ marginTop: '40pt', borderTop: '1pt solid #cbd5e1', paddingTop: '10pt' }}>
           <div style={{ fontWeight: '900', marginBottom: '5pt' }}>ملاحظات ومبررات إضافية:</div>
           <div style={{ fontSize: '10pt', color: '#475569', minHeight: '80pt' }}>
             {currentMateriality.notes || 'لا توجد ملاحظات إضافية مسجلة.'}
           </div>
        </div>

        <div style={{ marginTop: '50pt', display: 'flex', justifyContent: 'space-between' }}>
           <div style={{ textAlign: 'center', width: '150pt' }}>
              <div style={{ borderTop: '1pt solid black', paddingTop: '5pt', fontSize: '9pt', fontWeight: '900' }}>توقيع المدقق المسؤول</div>
           </div>
           <div style={{ textAlign: 'center', width: '150pt' }}>
              <div style={{ borderTop: '1pt solid black', paddingTop: '5pt', fontSize: '9pt', fontWeight: '900' }}>توقيع الشريك المسؤول</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialityView;
