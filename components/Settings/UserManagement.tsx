
import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Mail, Shield, UserPlus, Trash2, Edit2, CheckCircle2, XCircle, X, Save, Eye, Activity, AlertCircle, Ban, Lock, UserCircle, Briefcase, Info, Calendar, User as UserIcon, List, LayoutGrid, Clock, AlertTriangle, Search } from 'lucide-react';
import { Position } from '../../types';

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

interface UserManagementProps {
  positions: Position[];
  externalSearchQuery?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ positions, externalSearchQuery = '' }) => {
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  // نظام تخزين دائم للمستخدمين
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('audit_pro_users_list');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'أحمد محمود', username: 'ahmed.admin', email: 'ahmed@auditpro.jo', position: 'مدير مالي', role: 'مدير نظام', status: 'نشط', joinDate: '2023-01-15' },
      { id: '2', name: 'سارة خالد', username: 'sara.auditor', email: 'sara@auditpro.jo', position: 'مدقق حسابات', role: 'مدقق', status: 'نشط', joinDate: '2023-05-20' },
      { id: '3', name: 'ياسين علي', username: 'yassin.v', email: 'yassin@auditpro.jo', position: 'مساعد مدقق', role: 'مشاهد', status: 'موقوف', joinDate: '2024-02-10' },
      { id: '4', name: 'ليلى منصور', username: 'laila.m', email: 'laila@auditpro.jo', position: 'مدقق أول', role: 'مدقق', status: 'نشط', joinDate: '2023-08-12' },
      { id: '5', name: 'عمر الخطيب', username: 'omar.k', email: 'omar@auditpro.jo', position: 'محاسب قانوني', role: 'مدير نظام', status: 'نشط', joinDate: '2023-11-01' },
      { id: '6', name: 'هبة الزعبي', username: 'heba.z', email: 'heba@auditpro.jo', position: 'مراقب مالي', role: 'مدقق', status: 'نشط', joinDate: '2024-01-05' },
      { id: '7', name: 'فيصل القاسم', username: 'faisal.q', email: 'faisal@auditpro.jo', position: 'مساعد مدقق', role: 'مشاهد', status: 'نشط', joinDate: '2024-03-20' },
      { id: '8', name: 'رنا العبادي', username: 'rana.a', email: 'rana@auditpro.jo', position: 'مديرة مكاتب', role: 'مشاهد', status: 'انهاء خدمات', joinDate: '2022-12-15' },
    ];
  });

  // حفظ التغييرات في localStorage تلقائياً
  useEffect(() => {
    localStorage.setItem('audit_pro_users_list', JSON.stringify(users));
  }, [users]);

  // دمج البحث المحلي والعالمي
  const activeSearchQuery = localSearchQuery || externalSearchQuery;

  const filteredUsers = useMemo(() => {
    if (!activeSearchQuery.trim()) return users;
    const query = activeSearchQuery.toLowerCase().trim();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.position.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
  }, [users, activeSearchQuery]);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [selectedUserForAction, setSelectedUserForAction] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    position: positions[0]?.name || '', 
    email: '', 
    username: '', 
    password: '', 
    role: 'مدقق' as any 
  });

  const resetForm = () => { 
    setFormData({ 
      name: '', 
      position: positions[0]?.name || '', 
      email: '', 
      username: '', 
      password: '', 
      role: 'مدقق' 
    }); 
    setEditingUser(null); 
  };

  const handleOpenForm = (user?: User) => {
    if (user) { 
      setEditingUser(user); 
      setFormData({ 
        name: user.name, 
        position: user.position, 
        email: user.email, 
        username: user.username, 
        password: '••••••••', 
        role: user.role 
      }); 
    } else { 
      resetForm(); 
    }
    setShowFormModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!formData.name || !formData.email || !formData.username) return;
    
    if (editingUser) { 
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData, password: u.password } : u)); 
    } else { 
      const newUser: User = { 
        id: Math.random().toString(36).substr(2, 9), 
        name: formData.name, 
        username: formData.username, 
        email: formData.email, 
        position: formData.position, 
        role: formData.role, 
        status: 'نشط', 
        joinDate: new Date().toISOString().split('T')[0], 
        password: formData.password 
      }; 
      setUsers(prev => [newUser, ...prev]); 
    }
    setShowFormModal(false); 
    resetForm();
  };

  const handleStatusChange = (status: User['status']) => { 
    if (selectedUserForAction) { 
      setUsers(prev => prev.map(u => u.id === selectedUserForAction.id ? { ...u, status } : u)); 
      setSelectedUserForAction(null); 
    } 
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    }
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'نشط': return <span className="flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><CheckCircle2 size={14} /> نشط</span>;
      case 'موقوف': return <span className="flex items-center gap-1.5 text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full"><AlertCircle size={14} /> موقوف</span>;
      case 'انهاء خدمات': return <span className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full"><Ban size={14} /> انهاء خدمات</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-800">إدارة المستخدمين</h3>
          <p className="text-gray-500 text-sm mt-1 font-medium">إدارة أعضاء الفريق وصلاحياتهم الوظيفية والتقنية</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* خانة البحث السريع المضافة */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="بحث في المستخدمين..." 
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-full sm:w-auto justify-center">
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
            onClick={() => handleOpenForm()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            <UserPlus size={20} /> إضافة
          </button>
        </div>
      </div>

      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.01] transition-all text-center group">
              <h4 className="font-black text-gray-800 truncate mb-2">{user.name}</h4>
              <p className="text-[10px] font-bold text-gray-400 mb-4">{user.position}</p>
              <div className="pt-4 border-t border-gray-50 flex justify-center gap-2">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewingUser(user); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90" title="عرض"><Eye size={18} /></button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenForm(user); }} className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-90" title="تعديل"><Edit2 size={18} /></button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedUserForAction(user); }} className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all active:scale-90" title="تغيير الحالة"><Activity size={18} /></button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUserToDelete(user); }} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all active:scale-90" title="حذف"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold italic">لا توجد نتائج بحث تطابق استعلامك</div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-5 font-black text-gray-600 text-xs uppercase tracking-wider">المستخدم</th>
                  <th className="p-5 font-black text-gray-600 text-xs uppercase tracking-wider">البريد الإلكتروني</th>
                  <th className="p-5 font-black text-gray-600 text-xs uppercase tracking-wider">المسمى الوظيفي</th>
                  <th className="p-5 font-black text-gray-600 text-xs uppercase tracking-wider text-center">الحالة</th>
                  <th className="p-5 font-black text-gray-600 text-xs uppercase tracking-wider text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5">
                      <p className="font-bold text-gray-800">{user.name}</p>
                    </td>
                    <td className="p-5">
                      <p className="text-xs text-gray-600 font-bold" dir="ltr">{user.email}</p>
                    </td>
                    <td className="p-5">
                      <p className="text-xs font-black text-gray-700">{user.position}</p>
                    </td>
                    <td className="p-5 text-center">{getStatusBadge(user.status)}</td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewingUser(user); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90" title="عرض"><Eye size={18} /></button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenForm(user); }} className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-90" title="تعديل"><Edit2 size={18} /></button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedUserForAction(user); }} className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all active:scale-90" title="تغيير الحالة"><Activity size={18} /></button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUserToDelete(user); }} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all active:scale-90" title="حذف"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">لا توجد نتائج بحث تطابق استعلامك</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف المخصصة */}
      {userToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-gray-900">تأكيد الحذف النهائي</h4>
              <p className="text-sm text-gray-500 font-medium">هل أنت متأكد من حذف المستخدم <span className="text-red-600 font-black">{userToDelete.name}</span>؟<br/>هذا الإجراء لا يمكن التراجع عنه.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
              >
                نعم، احذف الآن
              </button>
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
               <div className="flex items-center gap-4">
                 <div>
                   <h4 className="text-xl font-black text-gray-900">{viewingUser.name}</h4>
                   <p className="text-xs font-bold text-blue-600">{viewingUser.position}</p>
                 </div>
               </div>
               <button onClick={() => setViewingUser(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-all"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">اسم المستخدم</p>
                    <p className="text-sm font-black text-gray-800" dir="ltr">{viewingUser.username}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">الدور الوظيفي</p>
                    <p className="text-sm font-black text-gray-800">{viewingUser.role}</p>
                  </div>
               </div>
               <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                  <Mail className="text-blue-500" size={20}/>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">البريد الإلكتروني</p>
                    <p className="text-sm font-black text-gray-800" dir="ltr">{viewingUser.email}</p>
                  </div>
               </div>
               <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                  <Clock className="text-amber-500" size={20}/>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">تاريخ الانضمام</p>
                    <p className="text-sm font-black text-gray-800">{viewingUser.joinDate}</p>
                  </div>
               </div>
               <div className="flex justify-center pt-4">
                  {getStatusBadge(viewingUser.status)}
               </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-center">
              <button onClick={() => setViewingUser(null)} className="px-10 py-3 bg-white border border-gray-200 rounded-xl font-black text-sm hover:bg-gray-100 transition-all active:scale-95">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {selectedUserForAction && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Activity size={20} /></div>
                <h4 className="text-lg font-black text-gray-800">تحديث حالة المستخدم</h4>
              </div>
              <button onClick={() => setSelectedUserForAction(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-gray-500 text-center mb-4">اختيار الحالة الجديدة للموظف: <br/><span className="font-black text-gray-800 text-base">{selectedUserForAction.name}</span></p>
              
              <button onClick={() => handleStatusChange('نشط')} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent hover:border-green-200 bg-green-50 text-green-700 transition-all hover:scale-[1.02] text-right active:scale-95">
                <div className="bg-green-600 text-white p-2 rounded-lg"><CheckCircle2 size={20}/></div>
                <div>
                  <p className="font-black text-sm">تنشيط (نشط)</p>
                  <p className="text-[10px] opacity-70">المستخدم يملك صلاحية دخول كاملة</p>
                </div>
              </button>

              <button onClick={() => handleStatusChange('موقوف')} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent hover:border-orange-200 bg-orange-50 text-orange-700 transition-all hover:scale-[1.02] text-right active:scale-95">
                <div className="bg-orange-600 text-white p-2 rounded-lg"><AlertCircle size={20}/></div>
                <div>
                  <p className="font-black text-sm">تعليق (موقوف)</p>
                  <p className="text-[10px] opacity-70">إيقاف صلاحية الدخول مؤقتاً</p>
                </div>
              </button>

              <button onClick={() => handleStatusChange('انهاء خدمات')} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent hover:border-red-200 bg-red-50 text-red-700 transition-all hover:scale-[1.02] text-right active:scale-95">
                <div className="bg-red-600 text-white p-2 rounded-lg"><Ban size={20}/></div>
                <div>
                  <p className="font-black text-sm">إنهاء الخدمات</p>
                  <p className="text-[10px] opacity-70">إلغاء الحساب بشكل دائم من النظام</p>
                </div>
              </button>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setSelectedUserForAction(null)} className="px-6 py-2 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-6 sm:p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3 sm:gap-4"><div className="p-2 sm:p-3 bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-200"><UserPlus size={20} /></div><h4 className="text-lg sm:text-xl font-black text-gray-900">{editingUser ? 'تعديل' : 'إضافة'} عضو جديد</h4></div>
              <button onClick={() => setShowFormModal(false)} className="p-2 sm:p-2.5 hover:bg-gray-200 rounded-xl sm:rounded-2xl transition-all text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 sm:space-y-5 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5"><label className="text-xs font-black text-gray-500 flex items-center gap-2"><UserIcon size={14} /> الاسم الكامل</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 font-bold" /></div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 flex items-center gap-2"><Briefcase size={14} /> المسمى الوظيفي</label>
                  <select 
                    value={formData.position} 
                    onChange={e => setFormData({...formData, position: e.target.value})} 
                    className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 font-bold"
                  >
                    {positions.length > 0 ? (
                      positions.map(pos => (
                        <option key={pos.id} value={pos.name}>{pos.name}</option>
                      ))
                    ) : (
                      <option disabled>يرجى تعريف مسميات وظيفية أولاً</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5"><label className="text-xs font-black text-gray-500 flex items-center gap-2"><Mail size={14} /> البريد</label><input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left bg-gray-50/50 font-bold" dir="ltr" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5"><label className="text-xs font-black text-gray-500 flex items-center gap-2"><UserCircle size={14} /> اسم المستخدم</label><input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left bg-gray-50/50 font-bold" dir="ltr" /></div>
                <div className="space-y-1.5"><label className="text-xs font-black text-gray-500 flex items-center gap-2"><Lock size={14} /> كلمة المرور</label><input required={!editingUser} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left bg-gray-50/50 font-bold" dir="ltr" /></div>
              </div>
              <div className="space-y-1.5"><label className="text-xs font-black text-gray-500 flex items-center gap-2"><Shield size={14} /> صلاحية النظام</label><div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">{['مدقق', 'مدير نظام', 'مشاهد'].map((r) => (<button key={r} type="button" onClick={() => setFormData({...formData, role: r as any})} className={`py-2.5 sm:py-3 rounded-xl text-xs font-black border-2 transition-all ${formData.role === r ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'}`}>{r}</button>))}</div></div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 pb-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"><Save size={20} /> حفظ</button>
                <button type="button" onClick={() => setShowFormModal(false)} className="px-8 bg-gray-100 text-gray-700 py-4 rounded-xl font-black hover:bg-gray-200 transition-all order-first sm:order-last active:scale-95">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
