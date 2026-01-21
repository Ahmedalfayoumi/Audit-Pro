
import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Search, X, Save, List, LayoutGrid } from 'lucide-react';
import { Department } from '../../types';

interface DepartmentManagementProps {
  departments: Department[];
  onUpdate: (departments: Department[]) => void;
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ departments, onUpdate }) => {
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name });
    } else {
      setEditingDept(null);
      setFormData({ name: '' });
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingDept) {
      onUpdate(departments.map(d => d.id === editingDept.id ? { ...d, name: formData.name } : d));
    } else {
      const newDept: Department = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
      };
      onUpdate([...departments, newDept]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟ قد يؤثر ذلك على المسميات الوظيفية المرتبطة به.')) {
      onUpdate(departments.filter(d => d.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-800">إدارة الأقسام</h3>
          <p className="text-gray-500 text-sm mt-1">تعريف الأقسام والإدارات داخل المنشأة</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
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
          <button 
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={20} /> إضافة قسم
          </button>
        </div>
      </div>

      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.01] transition-all group relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Layers size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-800 mb-6">{dept.name}</h4>
              <div className="pt-4 border-t border-gray-50 flex justify-end gap-2">
                <button onClick={() => handleOpenModal(dept)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(dept.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="بحث عن قسم..." className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {departments.map((dept) => (
              <div key={dept.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Layers size={20} />
                  </div>
                  <p className="font-black text-gray-800 text-sm sm:text-base">{dept.name}</p>
                </div>
                <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(dept)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(dept.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {departments.length === 0 && (
              <div className="p-20 text-center text-gray-400 italic font-bold">لا توجد أقسام معرفة حالياً</div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h4 className="text-lg font-black text-gray-800">{editingDept ? 'تعديل القسم' : 'إضافة قسم جديد'}</h4>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500">اسم القسم / الإدارة</label>
                <input 
                  required 
                  autoFocus
                  value={formData.name} 
                  onChange={e => setFormData({ name: e.target.value })} 
                  className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" 
                  placeholder="مثال: قسم التدقيق الخارجي" 
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-600/20">
                <Save size={18} /> حفظ البيانات
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
