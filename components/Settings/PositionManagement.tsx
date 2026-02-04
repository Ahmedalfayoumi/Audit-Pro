
import React, { useState } from 'react';
import { Briefcase, Plus, Trash2, Edit2, Search, X, Save, List, LayoutGrid } from 'lucide-react';
import { Position, Department } from '../../types';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  position: string;
  role: 'مدير نظام' | 'مدقق' | 'مشاهد';
  status: 'نشط' | 'موقوف' | 'انهاء خدمات';
  joinDate: string;
  password?: string;
}

interface PositionManagementProps {
  positions: Position[];
  onUpdate: (positions: Position[]) => void;
  departments: Department[];
  users: User[];
}

const PositionManagement: React.FC<PositionManagementProps> = ({ positions, onUpdate, departments, users }) => {
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    department: departments[0]?.name || '' 
  });

  // التحقق من الارتباط بمستخدمين
  const isPosLinked = (posName: string) => users.some(u => u.position === posName);

  const handleOpenModal = (pos?: Position) => {
    if (pos) { 
      if (isPosLinked(pos.name)) {
        alert(`لا يمكن تعديل المسمى الوظيفي "${pos.name}" لأنه مسند حالياً لمستخدمين في النظام.`);
        return;
      }
      setEditingPosition(pos); 
      setFormData({ name: pos.name, department: pos.department }); 
    } 
    else { 
      setEditingPosition(null); 
      setFormData({ name: '', department: departments[0]?.name || '' }); 
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); if (!formData.name) return;
    if (editingPosition) { 
      onUpdate(positions.map(p => p.id === editingPosition.id ? { ...p, ...formData } : p)); 
    } 
    else { 
      const newPos: Position = { id: Math.random().toString(36).substr(2, 9), ...formData }; 
      onUpdate([...positions, newPos]); 
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, posName: string) => { 
    if (isPosLinked(posName)) {
      alert(`فشل الحذف: المسمى الوظيفي "${posName}" مسند حالياً لمستخدمين نشطين.`);
      return;
    }

    if (confirm(`هل أنت متأكد من حذف المسمى الوظيفي "${posName}"؟`)) { 
      onUpdate(positions.filter(p => p.id !== id)); 
    } 
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-800">المسميات الوظيفية</h3>
          <p className="text-gray-500 text-sm mt-1 font-medium">إدارة قائمة المسميات الوظيفية المستخدمة في ملفات الموظفين</p>
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
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 theme-bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={20} /> إضافة
          </button>
        </div>
      </div>

      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {positions.map((pos) => {
            const isLinked = isPosLinked(pos.name);
            return (
              <div key={pos.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.01] transition-all group relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Briefcase size={24} />
                </div>
                <h4 className="text-lg font-black text-gray-800 mb-1">{pos.name}</h4>
                <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider font-medium">القسم: {pos.department}</p>
                <div className="pt-4 border-t border-gray-50 flex justify-end gap-2">
                  <button 
                    disabled={isLinked}
                    onClick={() => handleOpenModal(pos)} 
                    className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    disabled={isLinked}
                    onClick={() => handleDelete(pos.id, pos.name)} 
                    className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="بحث عن مسمى وظيفي..." className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none font-bold" />
            </div>
          </div>
          <div className="divide-y divide-gray-50 overflow-x-auto">
            {positions.map((pos) => {
              const isLinked = isPosLinked(pos.name);
              return (
                <div key={pos.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-all group min-w-[300px]">
                  <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Briefcase size={20} /></div><div><p className="font-black text-gray-800 text-sm sm:text-base">{pos.name}</p><p className="text-[10px] sm:text-xs text-gray-400 font-bold">القسم: {pos.department}</p></div></div>
                  <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      disabled={isLinked}
                      onClick={() => handleOpenModal(pos)} 
                      className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      disabled={isLinked}
                      onClick={() => handleDelete(pos.id, pos.name)} 
                      className={`p-2 rounded-xl transition-all ${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-100'}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50"><h4 className="text-lg font-black text-gray-800">المسمى الوظيفي</h4><button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-all"><X size={20} /></button></div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500">اسم المسمى الوظيفي</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full p-3.5 border border-gray-200 rounded-2xl outline-none font-bold focus:ring-2 theme-focus-ring" 
                  placeholder="مثال: مدقق أول" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500">القسم / الإدارة</label>
                <select 
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value})} 
                  className="w-full p-3.5 border border-gray-200 rounded-2xl outline-none bg-white font-bold focus:ring-2 theme-focus-ring"
                >
                  {departments.length > 0 ? (
                    departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))
                  ) : (
                    <option disabled>يرجى تعريف أقسام أولاً</option>
                  )}
                </select>
                {departments.length === 0 && (
                  <p className="text-[10px] text-red-500 mt-1 font-bold">يجب إضافة أقسام من قائمة الثوابت أولاً</p>
                )}
              </div>
              <button 
                type="submit" 
                disabled={departments.length === 0}
                className="w-full theme-bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 active:scale-95 shadow-lg disabled:opacity-50 hover:opacity-90"
              >
                <Save size={18} /> {editingPosition ? 'تحديث' : 'حفظ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionManagement;
