
import React, { useState } from 'react';
import { CalendarDays, Plus, Trash2, Search, X, Save } from 'lucide-react';

interface FinancialYearManagementProps {
  years: string[];
  onUpdate: (years: string[]) => void;
}

const FinancialYearManagement: React.FC<FinancialYearManagementProps> = ({ years, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [newYear, setNewYear] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear || years.includes(newYear)) return;

    onUpdate([...years, newYear].sort((a, b) => parseInt(b) - parseInt(a)));
    setNewYear('');
    setShowModal(false);
  };

  const handleDelete = (year: string) => {
    if (confirm(`هل أنت متأكد من حذف السنة المالية ${year}؟`)) {
      onUpdate(years.filter(y => y !== year));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-800">السنوات المالية</h3>
          <p className="text-gray-500 text-sm mt-1">إدارة السنوات المالية المتاحة للاختيار في ملفات التدقيق</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          إضافة سنة مالية
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50 overflow-x-auto">
          {years.map((year) => (
            <div key={year} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all group min-w-[300px]">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                  <CalendarDays size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="font-black text-lg sm:text-xl text-gray-800">{year}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-bold leading-tight">سنة مالية مفعلة</p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(year)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {years.length === 0 && (
            <div className="p-20 text-center text-gray-400 italic font-bold">
              لا توجد سنوات مالية مضافة حالياً
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h4 className="text-lg font-black text-gray-800">إضافة سنة مالية</h4>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500">السنة (4 أرقام)</label>
                <input 
                  required
                  type="number"
                  min="2000"
                  max="2100"
                  value={newYear}
                  onChange={e => setNewYear(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-xl text-center"
                  placeholder="2025"
                  autoFocus
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                <Save size={18} />
                حفظ السنة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialYearManagement;
