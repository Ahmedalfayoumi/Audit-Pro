
import React, { useState } from 'react';
import { Coins, Plus, Trash2, Edit2, Check, X, Save, List, LayoutGrid, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { Company, Currency } from '../../types';

interface CurrencyManagementProps {
  companies: Company[];
  currencies: Currency[];
  onUpdate: (currencies: Currency[]) => void;
  defaultCurrencyId: string;
}

const CurrencyManagement: React.FC<CurrencyManagementProps> = ({ companies, currencies, onUpdate, defaultCurrencyId }) => {
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', symbol: '', exchangeRate: '1' });

  const defaultCurrency = currencies.find(c => c.id === defaultCurrencyId);

  const isCurrencyLinked = (currName: string, currCode: string) => 
    companies.some(c => c.currency === currName || (c.currency?.includes(currCode)));

  const handleOpenAdd = () => {
    setEditingCurrency(null);
    setFormData({ name: '', code: '', symbol: '', exchangeRate: '1' });
    setShowAddModal(true);
  };

  const handleOpenEdit = (curr: Currency) => {
    if (curr.id === defaultCurrencyId) {
      alert('يتم تعديل العملة الافتراضية من إعدادات المكتب فقط.');
      return;
    }
    if (isCurrencyLinked(curr.name, curr.code)) {
      alert(`لا يمكن تعديل العملة "${curr.code}" لوجود شركات مرتبطة بها حالياً.`);
      return;
    }
    setEditingCurrency(curr);
    setFormData({ name: curr.name, code: curr.code, symbol: curr.symbol, exchangeRate: curr.exchangeRate.toString() });
    setShowAddModal(true);
  };

  const handleSaveCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const rateValue = parseFloat(formData.exchangeRate) || 1;

    if (editingCurrency) {
      onUpdate(currencies.map(c => c.id === editingCurrency.id ? { ...c, ...formData, exchangeRate: rateValue, code: formData.code.toUpperCase() } : c));
    } else {
      const currency: Currency = { 
        id: Math.random().toString(36).substr(2, 9), 
        name: formData.name, 
        code: formData.code.toUpperCase(), 
        symbol: formData.symbol || formData.code.toUpperCase(), 
        exchangeRate: rateValue,
      };
      onUpdate([...currencies, currency]);
    }
    setFormData({ name: '', code: '', symbol: '', exchangeRate: '1' });
    setShowAddModal(false);
  };

  const deleteCurrency = (id: string, code: string, name: string) => {
    if (id === defaultCurrencyId) { 
      alert('لا يمكن حذف العملة الافتراضية للنظام'); 
      return; 
    }

    if (isCurrencyLinked(name, code)) {
      alert(`فشل الحذف: العملة "${code}" مستخدمة في ملفات الشركات المسجلة حالياً.`);
      return;
    }

    if (confirm(`هل أنت متأكد من حذف العملة "${code}"؟`)) { 
      onUpdate(currencies.filter(c => c.id !== id)); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-800">إدارة العملات</h3>
          <p className="text-gray-500 text-sm mt-1 font-medium">إدارة العملات وتحديد أسعار الصرف بالنسبة للعملة الافتراضية</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase">العملة الأساسية (الافتراضية):</span>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{defaultCurrency?.name} ({defaultCurrency?.code})</span>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex gap-1">
            <button 
              onClick={() => setCurrentView('list')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'list' ? 'theme-bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <List size={16} /> قائمة
            </button>
            <button 
              onClick={() => setCurrentView('grid')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'grid' ? 'theme-bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={16} /> شبكة
            </button>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 theme-bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:opacity-90 transition-all active:scale-95"
          >
            <Plus size={20} /> إضافة عملة
          </button>
        </div>
      </div>

      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
        <p className="text-xs font-bold text-blue-800 leading-relaxed">
          جميع أسعار الصرف يتم تعريفها بالنسبة لعملة النظام الأساسية (<b>{defaultCurrency?.code}</b>). 
          سعر الصرف هو القيمة التي تعادل 1 وحدة من العملة الأجنبية مقدرة بالعملة الأساسية. 
          <br/>مثال: إذا كان JOD هو الأساس و USD هي العملة الجديدة، فإن سعر الصرف هو 0.71 (أي 1 USD = 0.71 JOD).
        </p>
      </div>

      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {currencies.map((currency) => {
            const isDefault = currency.id === defaultCurrencyId;
            const isLinked = isCurrencyLinked(currency.name, currency.code);
            return (
              <div key={currency.id} className={`bg-white p-6 rounded-3xl shadow-sm border ${isDefault ? 'border-blue-200 ring-2 ring-blue-600/5' : 'border-gray-100'} hover:shadow-md transition-all group relative overflow-hidden`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${isDefault ? 'theme-bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>{currency.symbol}</div>
                  <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isDefault && (
                      <button 
                        disabled={isLinked}
                        onClick={() => handleOpenEdit(currency)} 
                        className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                    {!isDefault && ( 
                      <button 
                        disabled={isLinked}
                        onClick={() => deleteCurrency(currency.id, currency.code, currency.name)} 
                        className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                      >
                        <Trash2 size={18} />
                      </button> 
                    )}
                  </div>
                </div>
                <h4 className="text-lg font-black text-gray-800">{currency.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{currency.code}</span>
                  {isDefault ? (
                     <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase"><CheckCircle2 size={12} /> عملة النظام</span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-400">
                       <TrendingUp size={14} className="text-blue-400" />
                       1 {currency.code} = {currency.exchangeRate} {defaultCurrency?.code}
                    </div>
                  )}
                </div>
                {isDefault && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold text-center">تغيير العملة الافتراضية يتم من خلال "إعدادات المكتب"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 text-xs font-black text-gray-500 uppercase">العملة</th>
                <th className="p-5 text-xs font-black text-gray-500 uppercase">الكود / الرمز</th>
                <th className="p-5 text-xs font-black text-gray-500 uppercase">سعر الصرف (نسبة لـ {defaultCurrency?.code})</th>
                <th className="p-5 text-xs font-black text-gray-500 uppercase text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currencies.map((currency) => {
                const isDefault = currency.id === defaultCurrencyId;
                const isLinked = isCurrencyLinked(currency.name, currency.code);
                return (
                  <tr key={currency.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{currency.name}</span>
                        {isDefault && <CheckCircle2 size={14} className="text-green-500" />}
                      </div>
                    </td>
                    <td className="p-5"><div className="flex items-center gap-2 font-black text-blue-600"><span className="bg-blue-50 px-2 py-1 rounded-lg text-[10px]">{currency.code}</span><span className="text-gray-400">{currency.symbol}</span></div></td>
                    <td className="p-5">
                      {isDefault ? (
                        <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg">1.000 (الأساس)</span>
                      ) : (
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-black text-gray-700">{currency.exchangeRate}</span>
                           <span className="text-[10px] text-gray-400 font-bold">{defaultCurrency?.code}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        {!isDefault && (
                          <button 
                            disabled={isLinked}
                            onClick={() => handleOpenEdit(currency)} 
                            className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {!isDefault && (
                          <button 
                            disabled={isLinked}
                            onClick={() => deleteCurrency(currency.id, currency.code, currency.name)} 
                            className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-red-400 hover:bg-red-50'}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {isDefault && (
                          <span className="text-[9px] font-black text-gray-300">محمي (افتراضي)</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50"><h4 className="text-lg font-black text-gray-800">{editingCurrency ? 'تعديل العملة' : 'إضافة عملة جديدة'}</h4><button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-200 rounded-xl"><X size={20} /></button></div>
            <form onSubmit={handleSaveCurrency} className="p-6 space-y-4">
              <div className="space-y-1"><label className="text-sm font-bold text-gray-600">اسم العملة</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none font-bold" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-bold text-gray-600">كود العملة</label><input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-left font-bold" maxLength={3} /></div>
                <div className="space-y-1"><label className="text-sm font-bold text-gray-600">الرمز</label><input value={formData.symbol} onChange={e => setFormData({...formData, symbol: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-left font-bold" /></div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600 flex items-center gap-2">سعر الصرف (نسبة لـ {defaultCurrency?.code})</label>
                <div className="relative">
                   <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                   <input 
                    required 
                    type="number" 
                    step="0.0001"
                    value={formData.exchangeRate} 
                    onChange={e => setFormData({...formData, exchangeRate: e.target.value})} 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none font-bold pl-10" 
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold mt-1">القيمة التي تعادل 1 وحدة من {formData.code || 'العملة الجديدة'} بـ {defaultCurrency?.code}</p>
              </div>
              <button type="submit" className="w-full theme-bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-600/20"><Save size={18} /> {editingCurrency ? 'تحديث' : 'حفظ'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyManagement;
