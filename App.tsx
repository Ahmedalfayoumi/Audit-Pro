
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Building2, Users, FileText, Settings, Plus, Search, ChevronDown, ChevronUp, ChevronRight, Database, Globe, Coins, List, Briefcase, CalendarDays, Workflow, ShieldCheck, Palette, Layers, Menu, X as CloseIcon } from 'lucide-react';
import CompanyForm from './components/Company/CompanyForm';
import CompanyList from './components/Company/CompanyList';
import UserManagement from './components/Settings/UserManagement';
import CountryManagement from './components/Settings/CountryManagement';
import CurrencyManagement from './components/Settings/CurrencyManagement';
import PositionManagement from './components/Settings/PositionManagement';
import DepartmentManagement from './components/Settings/DepartmentManagement';
import FinancialYearManagement from './components/Settings/FinancialYearManagement';
import AuditFileManagement from './components/Audit/AuditFileManagement';
import FirmSettingsComponent from './components/Settings/FirmSettings';
import ChartOfAccounts from './components/Settings/ChartOfAccounts';
import { Company, CompanyType, Country, Account, Position, Department, Currency } from './types';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  subItems?: NavItem[];
}

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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('company');
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [viewType, setViewType] = useState<'list' | 'grid'>('list'); 
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set<string>());
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  
  const [userRole] = useState<'مدير نظام' | 'مدقق' | 'مشاهد'>('مدير نظام');

  // --- Persistent State Management ---
  const [financialYears, setFinancialYears] = useState<string[]>(() => {
    const saved = localStorage.getItem('audit_pro_fyears');
    return saved ? JSON.parse(saved) : ['2023', '2024', '2025'];
  });

  const [countries, setCountries] = useState<Country[]>(() => {
    const saved = localStorage.getItem('audit_pro_countries_list');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'الأردن', code: 'JO', cities: [{ id: '101', name: 'عمان' }, { id: '102', name: 'إربد' }] },
      { id: '2', name: 'السعودية', code: 'SA', cities: [{ id: '201', name: 'الرياض' }] },
    ];
  });

  const [currencies, setCurrencies] = useState<Currency[]>(() => {
    const saved = localStorage.getItem('audit_pro_currencies');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'دينار أردني', code: 'JOD', symbol: 'د.أ', exchangeRate: 1 },
      { id: '2', name: 'دولار أمريكي', code: 'USD', symbol: '$', exchangeRate: 0.71 },
      { id: '3', name: 'يورو', code: 'EUR', symbol: '€', exchangeRate: 0.77 },
    ];
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('audit_pro_departments');
    if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);
    return [
      { id: 'd1', name: 'التدقيق' }, { id: 'd2', name: 'المالية' }, { id: 'd3', name: 'المحاسبة' }, { id: 'd4', name: 'الإدارة' },
    ];
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    const saved = localStorage.getItem('audit_pro_positions');
    if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);
    return [
      { id: '1', name: 'مدير مالي', department: 'المالية' },
      { id: '2', name: 'مدقق حسابات', department: 'التدقيق' },
      { id: '3', name: 'مساعد مدقق', department: 'التدقيق' },
      { id: '4', name: 'محاسب رئيسي', department: 'المحاسبة' },
      { id: '5', name: 'إداري', department: 'الإدارة' },
    ];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('audit_pro_users_list');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'أحمد محمود', username: 'ahmed.admin', email: 'ahmed@auditpro.jo', position: 'مدير مالي', role: 'مدير نظام', status: 'نشط', joinDate: '2023-01-15' },
      { id: '2', name: 'سارة خالد', username: 'sara.auditor', email: 'sara@auditpro.jo', position: 'مدقق حسابات', role: 'مدقق', status: 'نشط', joinDate: '2023-05-20' },
      { id: '3', name: 'ياسين علي', username: 'yassin.v', email: 'yassin@auditpro.jo', position: 'مساعد مدقق', role: 'مشاهد', status: 'موقوف', joinDate: '2024-02-10' },
    ];
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('audit_pro_companies');
    if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);
    
    // Default test companies
    const testCompanies: Company[] = [
      {
        id: 'c1', name: 'مجموعة التقنية الحديثة', type: CompanyType.LLC, foundingDate: '2015-05-10',
        sectors: ['تكنولوجيا المعلومات', 'اتصالات'], nationalNumber: '200155667', registrationNumber: '55443',
        taxNumber: '11002233', isSubjectToSalesTax: true, isNotRegisteredInSS: false, socialSecurityNumber: '998877',
        address: { country: 'الأردن', city: 'عمان', street: 'شارع الملك حسين', buildingNumber: '40', floor: '3', officeNumber: '302' },
        signatory: { isEmployee: true, name: 'خالد العلي', mobile: '0799988776' },
        goals: ['تطوير البرمجيات', 'بيع أجهزة الحاسوب'], financialYear: '2024', capital: '100000', currency: 'دينار أردني'
      },
      {
        id: 'c2', name: 'شركة الرواد للصناعات الغذائية', type: CompanyType.PRIVATE_SHAREHOLDING, foundingDate: '2010-01-20',
        sectors: ['الصناعات الغذائية', 'زراعة'], nationalNumber: '200101010', registrationNumber: '12121',
        taxNumber: '22334455', isSubjectToSalesTax: true, isNotRegisteredInSS: false, socialSecurityNumber: '112233',
        address: { country: 'الأردن', city: 'إربد', street: 'طريق الحصن', buildingNumber: '15', floor: '1', officeNumber: '10' },
        signatory: { isEmployee: false, name: 'منى سالم', mobile: '0788877665' },
        goals: ['تعليب الأغذية', 'استيراد الحبوب'], financialYear: '2024', capital: '500000', currency: 'دينار أردني'
      }
    ];
    return testCompanies;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('audit_pro_accounts');
    if (saved && JSON.parse(saved).length > 10) return JSON.parse(saved);
    return [
      { id: 'a1', code: '1', name: 'الموجودات', type: 'Assets', parentId: null, level: 0, isLocked: true, isCategory: true },
        { id: 'a11', code: '11', name: 'الموجودات المتداولة', type: 'Assets', parentId: 'a1', level: 1, isLocked: true, isCategory: true },
          { id: 'a111', code: '111', name: 'النقد في الصندوق ولدى البنوك', type: 'Assets', parentId: 'a11', level: 2, isLocked: true, isCategory: true },
            { id: 'a1111', code: '11101', name: 'النقد وما يعادله', type: 'Assets', parentId: 'a111', level: 3, isLocked: true, isCategory: true },
            { id: 'a1112', code: '11102', name: 'البنوك', type: 'Assets', parentId: 'a111', level: 3, isLocked: true, isCategory: true },
          { id: 'a112', code: '112', name: 'الذمم المدينة', type: 'Assets', parentId: 'a11', level: 2, isLocked: true, isCategory: true },
            { id: 'a1121', code: '11201', name: 'ذمم العملاء', type: 'Assets', parentId: 'a112', level: 3, isLocked: true, isCategory: true },
          { id: 'a114', code: '114', name: 'المستودعات', type: 'Assets', parentId: 'a11', level: 2, isLocked: true, isCategory: true },
            { id: 'a1141', code: '11401', name: 'بضاعة في المستودعات', type: 'Assets', parentId: 'a114', level: 3, isLocked: true, isCategory: true },
      { id: 'a2', code: '2', name: 'المطلوبات', type: 'Liabilities', parentId: null, level: 0, isLocked: true, isCategory: true },
        { id: 'a21', code: '21', name: 'المطلوبات المتداولة', type: 'Liabilities', parentId: 'a2', level: 1, isLocked: true, isCategory: true },
          { id: 'a211', code: '211', name: 'الذمم الدائنة', type: 'Liabilities', parentId: 'a21', level: 2, isLocked: true, isCategory: true },
            { id: 'a2111', code: '21101', name: 'ذمم الموردين', type: 'Liabilities', parentId: 'a211', level: 3, isLocked: true, isCategory: true },
      { id: 'a3', code: '3', name: 'حقوق الملكية', type: 'Equity', parentId: null, level: 0, isLocked: true, isCategory: true },
        { id: 'a31', code: '31', name: 'رأس المال', type: 'Equity', parentId: 'a3', level: 1, isLocked: true, isCategory: true },
          { id: 'a311', code: '311', name: 'رأس المال', type: 'Equity', parentId: 'a311', level: 2, isLocked: true, isCategory: true },
            { id: 'a3111', code: '31101', name: 'رأس المال', type: 'Equity', parentId: 'a311', level: 3, isLocked: true, isCategory: true },
      { id: 'a4', code: '4', name: 'المصاريف', type: 'Expenses', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'a5', code: '5', name: 'الإيرادات', type: 'Revenue', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'a6', code: '6', name: 'تكلفة البضاعة المباعة', type: 'COGS', parentId: null, level: 0, isLocked: true, isCategory: true },
    ];
  });

  const [auditFiles, setAuditFiles] = useState<any[]>(() => {
    const saved = localStorage.getItem('audit_pro_files');
    if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);
    return [
      { id: 'af1', companyId: 'c1', companyName: 'مجموعة التقنية الحديثة', financialYear: '2024', uploadDate: '2024-03-15', status: 'Pending' },
      { id: 'af2', companyId: 'c2', companyName: 'شركة الرواد للصناعات الغذائية', financialYear: '2023', uploadDate: '2024-02-10', status: 'Completed' }
    ];
  });

  const [firmSettings, setFirmSettings] = useState(() => {
    const saved = localStorage.getItem('audit_pro_firm_settings');
    return saved ? JSON.parse(saved) : {
      name: 'أوديت برو للاستشارات المالية',
      auditorName: 'زيد الدباغ',
      licenseNumber: 'AU-2024-9988',
      address: {
        country: 'الأردن', city: 'عمان', street: 'شارع وصفي التل', buildingName: 'مجمع قعوار',
        buildingNumber: '150', floor: '4', officeNumber: '401',
      },
      logo: null,
      stamp: null,
      primaryColor: '#2563eb',
      secondaryColor: '#0b1424',
      defaultCurrencyId: '1'
    };
  });

  // Effect to ensure default currency has rate of 1
  useEffect(() => {
    setCurrencies(prev => prev.map(c => 
      c.id === firmSettings.defaultCurrencyId ? { ...c, exchangeRate: 1 } : c
    ));
  }, [firmSettings.defaultCurrencyId]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', firmSettings.primaryColor || '#2563eb');
    root.style.setProperty('--secondary-color', firmSettings.secondaryColor || '#0b1424');
    
    const styleId = 'audit-pro-theme-styles';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      .theme-bg-primary { background-color: var(--primary-color) !important; }
      .theme-text-primary { color: var(--primary-color) !important; }
      .theme-border-primary { border-color: var(--primary-color) !important; }
      .theme-shadow-primary { shadow-color: var(--primary-color) !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px var(--primary-color)33 !important; }
      .theme-bg-secondary { background-color: var(--secondary-color) !important; }
      .theme-focus-ring:focus { --tw-ring-color: var(--primary-color) !important; border-color: var(--primary-color) !important; }
    `;
  }, [firmSettings.primaryColor, firmSettings.secondaryColor]);

  useEffect(() => localStorage.setItem('audit_pro_fyears', JSON.stringify(financialYears)), [financialYears]);
  useEffect(() => localStorage.setItem('audit_pro_companies', JSON.stringify(companies)), [companies]);
  useEffect(() => localStorage.setItem('audit_pro_files', JSON.stringify(auditFiles)), [auditFiles]);
  useEffect(() => localStorage.setItem('audit_pro_firm_settings', JSON.stringify(firmSettings)), [firmSettings]);
  useEffect(() => localStorage.setItem('audit_pro_countries_list', JSON.stringify(countries)), [countries]);
  useEffect(() => localStorage.setItem('audit_pro_currencies', JSON.stringify(currencies)), [currencies]);
  useEffect(() => localStorage.setItem('audit_pro_accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('audit_pro_positions', JSON.stringify(positions)), [positions]);
  useEffect(() => localStorage.setItem('audit_pro_departments', JSON.stringify(departments)), [departments]);
  useEffect(() => localStorage.setItem('audit_pro_users_list', JSON.stringify(users)), [users]);

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) newExpanded.delete(menuId);
    else newExpanded.add(menuId);
    setExpandedMenus(newExpanded);
  };

  const handleSaveCompany = (companyData: Company) => {
    if (editingCompany) setCompanies(companies.map(c => c.id === companyData.id ? companyData : c));
    else setCompanies([...companies, companyData]);
    setShowForm(false);
    setEditingCompany(null);
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutGrid },
    { id: 'company', label: 'الشركات', icon: Building2 },
    { id: 'reports', label: 'ملفات التدقيق', icon: FileText },
    { 
      id: 'settings', 
      label: 'الإعدادات', 
      icon: Settings,
      subItems: [
        { id: 'firm', label: 'إعدادات الشركة', icon: ShieldCheck },
        { id: 'users', label: 'المستخدمين', icon: Users },
        { id: 'coa', label: 'شجرة الحسابات', icon: Workflow },
        { 
          id: 'constants', 
          label: 'الثوابت', 
          icon: Database,
          subItems: [
            { id: 'countries', label: 'الدول والمدن', icon: Globe },
            { id: 'currencies', label: 'العملات', icon: Coins },
            { id: 'departments', label: 'الأقسام', icon: Layers },
            { id: 'positions', label: 'المسميات الوظيفية', icon: Briefcase },
            { id: 'fyears', label: 'السنوات المالية', icon: CalendarDays },
          ]
        },
      ]
    },
  ];

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item) => {
      const hasSubItems = !!item.subItems;
      const isExpanded = expandedMenus.has(item.id);
      const isActive = activeTab === item.id || activeSubTab === item.id;

      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => {
              if (hasSubItems) {
                toggleMenu(item.id);
              } else {
                setActiveTab(item.id);
                setActiveSubTab(null);
                setSearchQuery('');
                if (level > 0) setActiveSubTab(item.id);
              }
            }}
            className={`w-full flex items-center rounded-xl transition-all duration-200 ${
              level === 0 ? 'p-3.5' : 'p-2.5'
            } ${
              isActive && !hasSubItems
                ? 'theme-bg-primary text-white shadow-lg shadow-black/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={level === 0 ? 22 : 18} className="ml-3" />
            <span className={`flex-1 text-right font-bold ${level === 0 ? 'text-base' : 'text-sm'}`}>
              {item.label}
            </span>
            {hasSubItems && (
              <span className="mr-2">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
          </button>

          {hasSubItems && isExpanded && (
            <div className={`mr-5 border-r border-white/10 pr-2 mt-1 space-y-1`}>
              {renderNavItems(item.subItems!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-right" dir="rtl">
      <aside 
        style={{ backgroundColor: 'var(--secondary-color)' }}
        className={`h-full flex flex-col border-l border-white/5 transition-all duration-300 relative z-[70] ${
          isSidebarOpen ? 'w-64 min-w-[256px] opacity-100' : 'w-0 min-w-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5 min-w-[256px]">
          <div className="flex items-center gap-3">
            {firmSettings.logo ? (
              <img src={firmSettings.logo} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white/5 p-1" />
            ) : (
              <div className="w-10 h-10 rounded-xl theme-bg-primary flex items-center justify-center font-black text-white">AP</div>
            )}
            <h1 className="text-xl font-black tracking-tighter truncate theme-text-primary">AUDIT PRO</h1>
          </div>
          <button className="lg:hidden p-2 text-white/50" onClick={() => setIsSidebarOpen(false)}>
            <CloseIcon size={24} />
          </button>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto custom-scrollbar min-w-[256px]">
          {renderNavItems(navItems)}
        </nav>
        <div className="p-4 border-t border-white/5 bg-white/2 min-w-[256px]">
          <div className="flex items-center bg-white/5 p-2 rounded-xl">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black theme-bg-primary text-white">JD</div>
            <div className="mr-3 overflow-hidden">
              <p className="text-xs font-black text-gray-100 truncate">مستخدم رئيسي</p>
              <p className="text-[10px] text-slate-400 truncate">admin@auditpro.jo</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative transition-all duration-300">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 shadow-sm z-50">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-transform active:scale-95"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
            >
              {isSidebarOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-lg lg:text-xl font-black text-gray-800 truncate max-w-[150px] sm:max-w-none">
              {activeTab === 'company' ? 'إدارة الشركات' : 
               activeTab === 'reports' ? 'ملفات التدقيق' :
               activeSubTab === 'firm' ? 'إعدادات المكتب' : 
               activeSubTab === 'users' ? 'إدارة المستخدمين' :
               activeSubTab === 'coa' ? 'شجرة الحسابات' :
               activeSubTab === 'countries' ? 'الدول والمدن' :
               activeSubTab === 'currencies' ? 'إدارة العملات' :
               activeSubTab === 'departments' ? 'الأقسام' :
               activeSubTab === 'positions' ? 'المسميات الوظيفية' :
               activeSubTab === 'fyears' ? 'السنوات المالية' : 'Audit Pro'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative group hidden sm:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث سريع..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-4 py-2 border border-gray-100 rounded-xl text-xs theme-focus-ring w-40 md:w-64 bg-gray-50 font-medium outline-none" 
              />
            </div>
            {activeTab === 'company' && !showForm && (
              <button 
                onClick={() => { setShowForm(true); setEditingCompany(null); }} 
                className="flex items-center theme-bg-primary text-white px-4 lg:px-5 py-2 rounded-xl text-xs font-black shadow-lg transition-all theme-shadow-primary active:scale-95"
              >
                <Plus size={16} className="lg:ml-2" /> 
                <span className="hidden lg:inline">تعريف شركة جديدة</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#f8fafc] custom-scrollbar">
          {activeTab === 'company' ? (
            showForm ? (
              <CompanyForm 
                onSave={handleSaveCompany} 
                onCancel={() => setShowForm(false)} 
                initialData={editingCompany} 
                countries={countries} 
                currencies={currencies}
              />
            ) : (
              <CompanyList companies={companies} view={viewType} onEdit={(c) => { setEditingCompany(c); setShowForm(true); }} searchQuery={searchQuery} />
            )
          ) : activeSubTab === 'firm' ? (
            <FirmSettingsComponent settings={firmSettings} onSave={setFirmSettings} countries={countries} currencies={currencies} />
          ) : activeSubTab === 'users' ? (
            <UserManagement positions={positions} externalSearchQuery={searchQuery} users={users} setUsers={setUsers} />
          ) : activeSubTab === 'coa' || activeTab === 'coa' ? (
             <ChartOfAccounts accounts={accounts} onUpdate={setAccounts} userRole={userRole} />
          ) : activeSubTab === 'countries' ? (
            <CountryManagement countries={countries} onUpdate={setCountries} companies={companies} />
          ) : activeSubTab === 'currencies' ? (
            <CurrencyManagement companies={companies} currencies={currencies} onUpdate={setCurrencies} defaultCurrencyId={firmSettings.defaultCurrencyId} />
          ) : activeSubTab === 'departments' ? (
            <DepartmentManagement departments={departments} onUpdate={setDepartments} positions={positions} />
          ) : activeSubTab === 'positions' ? (
            <PositionManagement positions={positions} onUpdate={setPositions} departments={departments} users={users} />
          ) : activeSubTab === 'fyears' ? (
            <FinancialYearManagement years={financialYears} onUpdate={setFinancialYears} />
          ) : activeTab === 'reports' ? (
             <AuditFileManagement companies={companies} financialYears={financialYears} auditFiles={auditFiles} onUpdateFiles={setAuditFiles} searchQuery={searchQuery} externalShowModal={showAuditModal} setExternalShowModal={setShowAuditModal} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 flex-col space-y-4">
              <div className="p-8 bg-white rounded-full shadow-xl border border-gray-50">
                <LayoutGrid size={64} strokeWidth={1} className="theme-text-primary opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-gray-800">مرحباً بك في Audit Pro</p>
                <p className="text-gray-400 text-sm font-medium mt-1">ابدأ بإدارة ملفات عملائك</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
