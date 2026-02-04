
import React, { useState } from 'react';
import { Coins, Plus, Trash2, Edit2, Check, X, Save, List, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { Company } from '../../types';

interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  isDefault: boolean;
}

interface CurrencyManagementProps {
  companies: Company[];
}

const CurrencyManagement: React.FC<CurrencyManagementProps> = ({ companies }) => {
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const [currencies, setCurrencies] = useState<Currency[]>([
    { id: '1', name: 'دينار أردني', code: 'JOD', symbol: 'د.أ', isDefault: true },
    { id: '2', name: 'دولار أمريكي', code: 'USD', symbol: '$', isDefault: false },
    { id: '3', name: 'يورو', code: 'EUR', symbol: '€', isDefault: false },
    { id: '4', name: 'ريال سعودي', code: 'SAR', symbol: 'ر.س', isDefault: false },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', symbol: '' });

  // التحقق من الارتباط
  const isCurrencyLinked = (currName: string, currCode: string) => 
    companies.some(c => c.currency === currName || (c.currency?.includes(currCode)));

  const handleOpenAdd = () => {
    setEditingCurrency(null);
    setFormData({ name: '', code: '', symbol: '' });
    setShowAddModal(true);
  };

  const handleOpenEdit = (curr: Currency) => {
    if (isCurrencyLinked(curr.name, curr.code)) {
      alert(`لا يمكن تعديل العملة "${curr.code}" لوجود شركات مرتبطة بها حالياً.`);
      return;
    }
    setEditingCurrency(curr);
    setFormData({ name: curr.name, code: curr.code, symbol: curr.symbol });
    setShowAddModal(true);
  };

  const handleSaveCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (editingCurrency) {
      setCurrencies(currencies.map(c => c.id === editingCurrency.id ? { ...c, ...formData, code: formData.code.toUpperCase() } : c));
    } else {
      const currency: Currency = { 
        id: Math.random().toString(36).substr(2, 9), 
        name: formData.name, 
        code: formData.code.toUpperCase(), 
        symbol: formData.symbol || formData.code.toUpperCase(), 
        isDefault: currencies.length === 0, 
      };
      setCurrencies([...currencies, currency]);
    }
    setFormData({ name: '', code: '', symbol: '' });
    setShowAddModal(false);
  };

  const setDefault = (id: string) => { setCurrencies(currencies.map(c => ({ ...c, isDefault: c.id === id }))); };

  const deleteCurrency = (id: string, code: string, name: string) => {
    const currency = currencies.find(c => c.id === id);
    if (currency?.isDefault) { 
      alert('لا يمكن حذف العملة الافتراضية'); 
      return; 
    }

    if (isCurrencyLinked(name, code)) {
      alert(`فشل الحذف: العملة "${code}" مستخدمة في ملفات الشركات المسجلة حالياً.`);
      return;
    }

    if (confirm(`هل أنت متأكد من حذف العملة "${code}"؟`)) { 
      setCurrencies(currencies.filter(c => c.id !== id)); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-800">إدارة العملات</h3>
          <p className="text-gray-500 text-sm mt-1 font-medium">تحديد العملات المستخدمة في رأس المال والتقارير المالية</p>
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
            <Plus size={20} /> إضافة
          </button>
        </div>
      </div>

      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {currencies.map((currency) => {
            const isLinked = isCurrencyLinked(currency.name, currency.code);
            return (
              <div key={currency.id} className={`bg-white p-6 rounded-3xl shadow-sm border ${currency.isDefault ? 'border-blue-200 ring-2 ring-blue-600/5' : 'border-gray-100'} hover:shadow-md transition-all group relative`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${currency.isDefault ? 'theme-bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>{currency.symbol}</div>
                  <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      disabled={isLinked}
                      onClick={() => handleOpenEdit(currency)} 
                      className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                    >
                      <Edit2 size={18} />
                    </button>
                    {!currency.isDefault && ( 
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
                  {currency.isDefault && ( <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase"><CheckCircle2 size={12} /> الافتراضية</span> )}
                </div>
                {!currency.isDefault && ( <button onClick={() => setDefault(currency.id)} className="w-full mt-6 py-2.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors border border-dashed border-gray-200 rounded-xl hover:border-blue-200">تعيين كافتراضية</button> )}
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
                <th className="p-5 text-xs font-black text-gray-500 uppercase text-center">الوضع</th>
                <th className="p-5 text-xs font-black text-gray-500 uppercase text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currencies.map((currency) => {
                const isLinked = isCurrencyLinked(currency.name, currency.code);
                return (
                  <tr key={currency.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="p-5 font-bold text-gray-800">{currency.name}</td>
                    <td className="p-5"><div className="flex items-center gap-2 font-black text-blue-600"><span className="bg-blue-50 px-2 py-1 rounded-lg text-[10px]">{currency.code}</span><span className="text-gray-400">{currency.symbol}</span></div></td>
                    <td className="p-5 text-center">{currency.isDefault ? <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black"><CheckCircle2 size={12}/> افتراضية</span> : <button onClick={() => setDefault(currency.id)} className="text-[10px] font-black text-gray-400 hover:text-blue-600">تعيين افتراضية</button>}</td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          disabled={isLinked}
                          onClick={() => handleOpenEdit(currency)} 
                          className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        {!currency.isDefault && (
                          <button 
                            disabled={isLinked}
                            onClick={() => deleteCurrency(currency.id, currency.code, currency.name)} 
                            className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-red-400 hover:bg-red-50'}`}
                          >
                            <Trash2 size={16} />
                          </button>
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
              <button type="submit" className="w-full theme-bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-600/20"><Save size={18} /> {editingCurrency ? 'تحديث' : 'حفظ'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyManagement;
