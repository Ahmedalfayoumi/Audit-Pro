
import React, { useState, useMemo } from 'react';
import { Workflow, Plus, ChevronDown, ChevronRight, Folder, FileText, MoreVertical, Edit2, Trash2, X, Save, AlertTriangle, ShieldCheck, Layers } from 'lucide-react';
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

  // التحقق من صلاحية الأدوار والقواعد الجديدة
  const isAdmin = userRole === 'مدير نظام';
  const isAuditor = userRole === 'مدقق';

  // دالة للتحقق هل يمكن للمستخدم الحالي الإضافة تحت هذا الأب
  // القاعدة الجديدة: الشجرة بحد أقصى 4 مستويات (0, 1, 2, 3)
  // يسمح بالإضافة فقط تحت المستوى الثالث (level 2) لإنتاج المستوى الرابع (level 3)
  const canAddUnder = (parentId: string | null) => {
    if (!parentId) return isAdmin; // فقط المدير يضيف Pillars جديدة (مستوى 1)
    const parent = accounts.find(a => a.id === parentId);
    if (!parent) return false;
    
    // الحد الأقصى للمستوى هو 4 (يعني level 3 في الكود)
    // لذا يمكن الإضافة فقط إذا كان الأب في مستوى أقل من 3
    // وحسب طلب المستخدم السابق: الإضافة مسموحة فقط تحت المستويين الثالث والرابع
    // ولكن مع الحد من المستويات لـ 4، فإن الإضافة تحت المستوى 4 غير ممكنة.
    // إذن نسمح بالإضافة تحت المستوى 3 (level 2) فقط للوصول للمستوى 4.
    return parent.level === 2;
  };

  // دالة للتحقق هل يمكن للمستخدم التعديل أو الحذف لهذا الحساب
  // القاعدة السابقة: لا يستطيع اي مستخدم ان يحذف او يعدل على المستويات من 1 الى 4
  const canModify = (account: Account) => {
    // المستويات 0، 1، 2، 3 محمية بالكامل (تمثل كافة المستويات الأربعة المسموحة حالياً)
    // إذا كان الحساب من حسابات النظام (isLocked) أو ضمن المستويات الأربعة الأولى
    if (account.level <= 3) return false;
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

  // Helper to expand nodes up to a specific level
  const expandToLevel = (level: number) => {
    const newExpanded = new Set<string>();
    if (level > 1) {
      accounts.forEach(acc => {
        if (acc.isCategory && acc.level < level - 1) {
          newExpanded.add(acc.id);
        }
      });
    }
    setExpandedNodes(newExpanded);
  };

  // Helper to get children count
  const getChildren = (parentId: string | null) => accounts.filter(a => a.parentId === parentId);

  const calculateNextCode = (parentId: string | null): string => {
    if (!parentId) {
      const roots = getChildren(null);
      return (roots.length + 1).toString();
    }
    
    const parent = accounts.find(a => a.id === parentId)!;
    const existingChildren = getChildren(parentId);
    
    let padSize = 1;
    if (parent.level === 0) padSize = 1; 
    else if (parent.level === 1) padSize = 1; 
    else if (parent.level === 2) padSize = 2; 
    else if (parent.level === 3) padSize = 3; 
    else padSize = 3; 
    
    const nextNum = (existingChildren.length + 1).toString().padStart(padSize, '0');
    return `${parent.code}${nextNum}`;
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
      if (!canModify(editingAccount)) return;
      const updated = accounts.map(a => 
        a.id === editingAccount.id ? { ...a, name: formData.name, isCategory: formData.isCategory } : a
      );
      onUpdate(updated);
    } else {
      if (!canAddUnder(selectedParentId)) return;
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

    const hasChildren = accounts.some(a => a.parentId === id);
    const message = hasChildren 
      ? `تحذير: هذا الحساب يحتوي على حسابات فرعية. سيؤدي حذفه إلى حذف جميع الحسابات التابعة له. هل أنت متأكد؟`
      : `هل أنت متأكد من حذف حساب "${account.name}"؟`;

    if (confirm(message)) {
      const idsToDelete = new Set([id]);
      let size;
      do {
        size = idsToDelete.size;
        accounts.forEach(a => {
          if (a.parentId && idsToDelete.has(a.parentId)) {
            idsToDelete.add(a.id);
          }
        });
      } while (idsToDelete.size !== size);

      onUpdate(accounts.filter(a => !idsToDelete.has(a.id)));
    }
  };

  const renderTree = (parentId: string | null = null) => {
    const items = getChildren(parentId).sort((a, b) => a.code.localeCompare(b.code));
    
    return items.map(account => {
      const isExpanded = expandedNodes.has(account.id);
      const color = PILLAR_COLORS[account.type];
      const canAddHere = canAddUnder(account.id);
      const canModifyHere = canModify(account);
      const isProtected = account.level <= 3;

      return (
        <div key={account.id} className="select-none">
          <div 
            className={`flex items-center group py-2.5 px-4 hover:bg-white hover:shadow-sm rounded-xl transition-all mb-1 border border-transparent hover:border-gray-100 ${
              account.level === 0 ? 'bg-gray-50/80 mb-3' : ''
            }`}
            style={{ paddingRight: `${Math.min(account.level * 24 + 16, 200)}px` }} 
          >
            {/* Toggle Button */}
            <button 
              onClick={() => toggleNode(account.id)}
              className={`w-6 h-6 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-0' : ''}`}
            >
              {account.isCategory && (isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />)}
            </button>

            {/* Icon */}
            <div className={`mr-2 w-8 h-8 rounded-lg flex items-center justify-center text-${color}-600 bg-${color}-50 flex-shrink-0`}>
              {account.isCategory ? <Folder size={16} /> : <FileText size={16} />}
            </div>

            {/* Account Info */}
            <div className="flex-1 mr-3 flex items-center overflow-hidden">
              <span className={`text-[10px] sm:text-xs font-black text-gray-400 min-w-[80px] inline-block font-mono`} dir="ltr">
                {account.code}
              </span>
              <span className={`text-xs sm:text-sm font-bold truncate ${account.level === 0 ? 'text-gray-900 sm:text-base' : 'text-gray-700'}`}>
                {account.name}
              </span>
              {isProtected && (
                <span title="حساب نظام محمي" className="mr-2 flex-shrink-0">
                  <ShieldCheck size={14} className="text-blue-500 opacity-60" />
                </span>
              )}
              <span className="mr-2 text-[8px] bg-gray-100 text-gray-400 px-1 rounded uppercase font-black">L{account.level + 1}</span>
            </div>

            {/* Actions */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0">
              {account.isCategory && canAddHere && (
                <button 
                  onClick={() => handleOpenAdd(account.id)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="إضافة حساب فرعي"
                >
                  <Plus size={16} />
                </button>
              )}
              {canModifyHere && (
                <>
                  <button 
                    onClick={() => handleOpenEdit(account)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(account.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
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
          <p className="text-gray-500 text-sm mt-1 font-medium">الهيكل المالي لجميع الحسابات والبنود المحاسبية</p>
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-wider">قواعد النظام:</p>
            <ul className="text-[10px] font-bold space-y-0.5 list-disc list-inside">
              <li className="text-slate-500">الشجرة مقتصرة على 4 مستويات فقط.</li>
              <li className="text-slate-500">المستويات من 1 إلى 4 محمية من التعديل والحذف لأي مستخدم.</li>
              <li className="text-blue-600">يسمح بالإضافة فقط تحت المستوى الثالث (1.1.1) لإنشاء المستوى الرابع (1.1.1.01).</li>
            </ul>
          </div>
        </div>
        
        {/* Level Selection Control */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-l border-gray-100 ml-2">
            <Layers size={16} className="text-blue-600" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">عرض المستويات</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((lvl) => (
              <button
                key={lvl}
                onClick={() => expandToLevel(lvl)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:scale-90 border border-transparent hover:border-blue-100"
                title={`عرض حتى المستوى ${lvl}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={() => handleOpenAdd(null)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus size={20} />
              إضافة حساب رئيسي
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-gray-100 min-h-[600px] overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl mb-6 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
            <span className="flex-1 mr-[100px] sm:mr-[110px]">اسم الحساب</span>
            <span className="w-32 text-center">الإجراءات</span>
          </div>
          {renderTree(null)}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (isAdmin || isAuditor) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 sm:p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
                  <Workflow size={24} />
                </div>
                <h4 className="text-xl font-black text-gray-900">
                  {editingAccount ? 'تعديل الحساب' : 'إضافة حساب جديد'}
                </h4>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-2xl transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {/* Parent Info Display */}
              {selectedParentId && (
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Folder size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase">الحساب الأب</p>
                    <p className="text-sm font-black text-blue-800">
                      {accounts.find(a => a.id === selectedParentId)?.code} - {accounts.find(a => a.id === selectedParentId)?.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500">اسم الحساب *</label>
                <input 
                  required
                  autoFocus
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  placeholder="مثال: الصندوق، ذمم مدينة..."
                />
              </div>

              {!selectedParentId && isAdmin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500">نوع الحساب</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(PILLAR_COLORS).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type: type as AccountType})}
                        className={`p-3 rounded-xl text-xs font-black border-2 transition-all ${
                          formData.type === type 
                          ? `bg-${PILLAR_COLORS[type as AccountType]}-600 border-${PILLAR_COLORS[type as AccountType]}-600 text-white shadow-lg` 
                          : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'
                        }`}
                      >
                        {type === 'Assets' ? 'أصول' : type === 'Liabilities' ? 'التزامات' : type === 'Equity' ? 'حقوق ملكية' : type === 'Revenue' ? 'إيرادات' : type === 'Expenses' ? 'مصاريف' : 'تكلفة بضاعة'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-white hover:border-blue-200 transition-all">
                  <input 
                    type="checkbox"
                    checked={formData.isCategory}
                    onChange={e => setFormData({...formData, isCategory: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-black text-gray-800">حساب رئيسي (فئة)</p>
                    <p className="text-[10px] text-gray-400 font-bold">يسمح هذا بإنشاء حسابات فرعية تحته</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                  <Save size={20} />
                  {editingAccount ? 'تحديث الحساب' : 'حفظ الحساب'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-10 bg-gray-100 text-gray-700 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccounts;
