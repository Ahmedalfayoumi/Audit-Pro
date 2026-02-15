
import React, { useState, useMemo } from 'react';
import { Workflow, Plus, ChevronDown, ChevronRight, Folder, FileText, MoreVertical, Edit2, Trash2, X, Save, AlertTriangle, ShieldCheck, Layers, FileBarChart, Scale, PieChart } from 'lucide-react';
import { Account, AccountType } from '../../types';

interface ChartOfAccountsProps {
  accounts: Account[];
  onUpdate: (accounts: Account[]) => void;
  userRole?: 'مدير نظام' | 'مدقق' | 'مشاهد';
}

const PILLAR_COLORS: Record<AccountType, string> = {
  Assets: 'blue',
  Liabilities: 'red',
  Equity: 'emerald',
  Revenue: 'amber',
  Expenses: 'purple',
  COGS: 'cyan',
};

const ChartOfAccounts: React.FC<ChartOfAccountsProps> = ({ accounts, onUpdate, userRole }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(accounts.filter(a => a.level === 0).map(a => a.id)));
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const isAdmin = userRole === 'مدير نظام';
  const isAuditor = userRole === 'مدقق';

  const canAddUnder = (parentId: string | null) => {
    if (!parentId) return isAdmin;
    const parent = accounts.find(a => a.id === parentId);
    if (!parent) return false;
    return parent.level < 4; // السماح بالإضافة حتى المستوى الخامس (0-indexed 4)
  };

  const canModify = (account: Account) => {
    if (account.level === 0) return false; // المستوى الجذري (الأصول، الخصوم...) محمي
    return isAdmin || isAuditor;
  };

  const [formData, setFormData] = useState({
    name: '',
    type: 'Assets' as AccountType,
    isCategory: false,
  });

  const toggleNode = (id: string) => {
    const next = new Set(expandedNodes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedNodes(next);
  };

  const expandToLevel = (humanLevel: number) => {
    const newExpanded = new Set<string>();
    // لعرض المستوى 1: لا نفتح أي مجلدات (المستوى 0)
    // لعرض المستوى 2: نفتح مجلدات المستوى 0
    // لعرض المستوى n: نفتح المجلدات التي مستواها أقل من (n-1)
    accounts.forEach(acc => {
      if (acc.isCategory && acc.level < (humanLevel - 1)) {
        newExpanded.add(acc.id);
      }
    });
    setExpandedNodes(newExpanded);
  };

  const getChildren = (parentId: string | null) => accounts.filter(a => a.parentId === parentId);

  const calculateNextCode = (parentId: string | null): string => {
    if (!parentId) {
      const roots = getChildren(null);
      return (roots.length + 1).toString();
    }
    
    const parent = accounts.find(a => a.id === parentId)!;
    const existingChildren = getChildren(parentId);
    
    const nextNum = (existingChildren.length + 1).toString().padStart(2, '0');
    return `${parent.code}.${nextNum}`;
  };

  const handleOpenAdd = (parentId: string | null = null) => {
    if (!canAddUnder(parentId)) return;
    setSelectedParentId(parentId);
    setEditingAccount(null);
    const parent = parentId ? accounts.find(a => a.id === parentId) : null;
    setFormData({
      name: '',
      type: parent ? parent.type : 'Assets',
      isCategory: parent ? false : true, 
    });
    setShowModal(true);
  };

  const handleOpenEdit = (account: Account) => {
    if (!canModify(account)) return;
    setEditingAccount(account);
    setSelectedParentId(account.parentId);
    setFormData({
      name: account.name,
      type: account.type,
      isCategory: account.isCategory,
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    if (editingAccount) {
      const updated = accounts.map(a => 
        a.id === editingAccount.id ? { ...a, name: formData.name, isCategory: formData.isCategory } : a
      );
      onUpdate(updated);
    } else {
      const parent = selectedParentId ? accounts.find(a => a.id === selectedParentId) : null;
      const newAccount: Account = {
        id: Math.random().toString(36).substr(2, 9),
        code: calculateNextCode(selectedParentId),
        name: formData.name,
        type: parent ? parent.type : formData.type,
        parentId: selectedParentId,
        level: parent ? parent.level + 1 : 0,
        isLocked: false,
        isCategory: formData.isCategory,
      };
      onUpdate([...accounts, newAccount]);
      if (selectedParentId) {
        const next = new Set(expandedNodes);
        next.add(selectedParentId);
        setExpandedNodes(next);
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (!account || !canModify(account)) return;
    if (confirm(`هل أنت متأكد من حذف حساب "${account.name}"؟`)) {
      onUpdate(accounts.filter(a => a.id !== id));
    }
  };

  const renderTree = (parentId: string | null = null, filter?: (a: Account) => boolean) => {
    let items = getChildren(parentId);
    if (filter) items = items.filter(filter);
    
    items = items.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    
    return items.map(account => {
      const isExpanded = expandedNodes.has(account.id);
      const color = PILLAR_COLORS[account.type] || 'slate';
      const isRoot = account.level === 0;
      const isProtected = account.level === 0;

      return (
        <div key={account.id} className="select-none">
          <div 
            className={`flex items-center group py-2 px-4 hover:bg-white hover:shadow-sm rounded-xl transition-all mb-1 border border-transparent hover:border-gray-100 ${
              isRoot ? 'bg-white shadow-sm mb-3 py-3 border-slate-100 font-black' : ''
            }`}
            style={{ paddingRight: `${Math.min(account.level * 28 + 16, 200)}px` }} 
          >
            <button 
              onClick={() => toggleNode(account.id)}
              className={`w-6 h-6 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-0' : ''}`}
            >
              {account.isCategory && (isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />)}
            </button>

            <div className={`mr-2 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isRoot ? `text-${color}-600 bg-${color}-50` : `text-slate-400 bg-slate-50`
            }`}>
              {account.isCategory ? <Folder size={16} /> : <FileText size={16} />}
            </div>

            <div className="flex-1 mr-3 flex items-center overflow-hidden">
              <span className={`text-[10px] sm:text-xs font-black text-gray-400 min-w-[70px] inline-block font-mono`} dir="ltr">
                {account.code}
              </span>
              <span className={`text-xs sm:text-sm font-bold truncate ${isRoot ? 'text-slate-900 sm:text-base' : 'text-gray-700'}`}>
                {account.name}
              </span>
              {isProtected && (
                <span title="نظام محمي" className="mr-2 flex-shrink-0">
                  <ShieldCheck size={14} className="text-blue-500 opacity-60" />
                </span>
              )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0">
              {account.isCategory && canAddUnder(account.id) && (
                <button onClick={() => handleOpenAdd(account.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="إضافة">
                  <Plus size={16} />
                </button>
              )}
              {!isProtected && canModify(account) && (
                <>
                  <button onClick={() => handleOpenEdit(account)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="تعديل">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(account.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {account.isCategory && isExpanded && (
            <div className="mr-1">
              {renderTree(account.id)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-gray-800">شجرة الحسابات (COA)</h3>
          <p className="text-gray-500 text-sm mt-1 font-medium">الهيكلية المالية المنظمة لملفات التدقيق</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-l border-gray-100 ml-2">
            <Layers size={16} className="text-blue-600" />
            <span className="text-[10px] font-black text-gray-400 uppercase">عرض المستويات</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button key={lvl} onClick={() => expandToLevel(lvl)} className="w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all hover:bg-blue-50 text-gray-500 hover:text-blue-600 border border-transparent hover:border-blue-100">
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* قسم الميزانية العمومية */}
        <section className="space-y-4">
          <div className="bg-blue-600 text-white p-4 sm:p-6 rounded-[2rem] shadow-lg flex items-center justify-between border-4 border-white">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><Scale size={28} /></div>
                <div>
                  <h4 className="text-xl font-black">حسابات الميزانية العمومية (Balance Sheet)</h4>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-0.5">Assets | Liabilities | Equity</p>
                </div>
             </div>
          </div>
          <div className="bg-white/40 p-4 sm:p-8 rounded-[2.5rem] border border-gray-100 min-h-[200px]">
            {renderTree(null, (a) => ['Assets', 'Liabilities', 'Equity'].includes(a.type))}
          </div>
        </section>

        {/* قسم الأرباح والخسائر */}
        <section className="space-y-4">
          <div className="bg-purple-600 text-white p-4 sm:p-6 rounded-[2rem] shadow-lg flex items-center justify-between border-4 border-white">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><PieChart size={28} /></div>
                <div>
                  <h4 className="text-xl font-black">حسابات الأرباح والخسائر (Profit & Loss)</h4>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-0.5">Revenue | Expenses | COGS</p>
                </div>
             </div>
          </div>
          <div className="bg-white/40 p-4 sm:p-8 rounded-[2.5rem] border border-gray-100 min-h-[200px]">
            {renderTree(null, (a) => ['Revenue', 'Expenses', 'COGS'].includes(a.type))}
          </div>
        </section>
      </div>

      {showModal && (isAdmin || isAuditor) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 sm:p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><Workflow size={24} /></div>
                <h4 className="text-xl font-black text-gray-900">{editingAccount ? 'تعديل الحساب' : 'إضافة حساب جديد'}</h4>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-2xl transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {selectedParentId && (
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center"><Folder size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase">الحساب الأب</p>
                    <p className="text-sm font-black text-blue-800">{accounts.find(a => a.id === selectedParentId)?.code} - {accounts.find(a => a.id === selectedParentId)?.name}</p>
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500">اسم الحساب *</label>
                <input required autoFocus value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="مثال: الصندوق، ذمم مدينة..." />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-white hover:border-blue-200 transition-all">
                  <input type="checkbox" checked={formData.isCategory} onChange={e => setFormData({...formData, isCategory: e.target.checked})} className="w-5 h-5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500" />
                  <div>
                    <p className="text-sm font-black text-gray-800">حساب رئيسي (فئة)</p>
                    <p className="text-[10px] text-gray-400 font-bold">يسمح هذا بإنشاء حسابات فرعية تحته</p>
                  </div>
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"><Save size={20} /> {editingAccount ? 'تحديث' : 'حفظ'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-10 bg-gray-100 text-gray-700 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccounts;
