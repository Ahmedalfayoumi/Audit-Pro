
import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, Building2, Users, FileText, Settings, Plus, Search, ChevronDown, ChevronUp, ChevronRight, Database, Globe, Coins, List, Briefcase, CalendarDays, Workflow, ShieldCheck, Palette, Layers, Menu, X as CloseIcon, ArrowRight, PanelRightClose, PanelRightOpen, LayoutPanelLeft, DownloadCloud, UploadCloud, DatabaseZap, CheckCircle, AlertCircle, X } from 'lucide-react';
import CompanyForm from './components/Company/CompanyForm';
import CompanyList from './components/Company/CompanyList';
import UserManagement from './components/Settings/UserManagement';
import CountryManagement from './components/Settings/CountryManagement';
import CurrencyManagement from './components/Settings/CurrencyManagement';
import PositionManagement from './components/Settings/PositionManagement';
import DepartmentManagement from './components/Settings/DepartmentManagement';
import FinancialYearManagement from './components/Settings/FinancialYearManagement';
import AuditFileManagement from './components/Audit/AuditFileManagement';
import AccountMappingView from './components/Audit/AccountMappingView';
import FirmSettingsComponent from './components/Settings/FirmSettings';
import ChartOfAccounts from './components/Settings/ChartOfAccounts';
import ClientDatabase from './components/Client/ClientDatabase';
import { Company, CompanyType, Country, Account, Position, Department, Currency, AuditFile, TbAccountData, ClientContact, ClientLegalDocument } from './types';

type SidebarState = 'expanded' | 'collapsed' | 'hidden';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  subItems?: NavItem[];
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('reports');
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);
  
  const [isMobileOpen, setIsMobileOpen] = useState(false); 
  const [sidebarState, setSidebarState] = useState<SidebarState>(() => {
    const saved = localStorage.getItem('audit_pro_sidebar_state_v3');
    return (saved as SidebarState) || 'expanded';
  });

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [activeMappingFileId, setActiveMappingFileId] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  const [userRole] = useState<'مدير نظام' | 'مدقق' | 'مشاهد'>('مدير نظام');

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('audit_pro_companies');
    return (saved && JSON.parse(saved).length > 0) ? JSON.parse(saved) : [];
  });

  const [clientContacts, setClientContacts] = useState<ClientContact[]>(() => {
    const saved = localStorage.getItem('audit_pro_client_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  const [clientDocuments, setClientDocuments] = useState<ClientLegalDocument[]>(() => {
    const saved = localStorage.getItem('audit_pro_client_docs');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditFiles, setAuditFiles] = useState<AuditFile[]>(() => {
    const saved = localStorage.getItem('audit_pro_files');
    return saved ? JSON.parse(saved) : [];
  });

  const [countries, setCountries] = useState<Country[]>([
    { id: '1', name: 'الأردن', code: 'JO', cities: [{id: '101', name: 'عمان'}, {id: '102', name: 'إربد'}] },
    { id: '2', name: 'السعودية', code: 'SA', cities: [{id: '201', name: 'الرياض'}, {id: '202', name: 'جدة'}] }
  ]);

  const [currencies, setCurrencies] = useState<Currency[]>([
    { id: 'c1', name: 'دينار أردني', code: 'JOD', symbol: 'JD', exchangeRate: 1 },
    { id: 'c2', name: 'دولار أمريكي', code: 'USD', symbol: '$', exchangeRate: 0.71 }
  ]);

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('audit_pro_accounts');
    if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);
    
    return [
      { id: 'coa-1', code: '1', name: 'الموجودات', type: 'Assets', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-1-1', code: '1.1', name: 'الموجودات المتداولة', type: 'Assets', parentId: 'coa-1', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-1-1-1', code: '1.1.1', name: 'النقد في الصندوق ولدى البنوك', type: 'Assets', parentId: 'coa-1-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-1-1-1-1', code: '1.1.1.1', name: 'النقد وما يعادله', type: 'Assets', parentId: 'coa-1-1-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-1-1-1-2', code: '1.1.1.2', name: 'البنوك', type: 'Assets', parentId: 'coa-1-1-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-1-1-2', code: '1.1.2', name: 'الذمم المدينة', type: 'Assets', parentId: 'coa-1-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-1-1-2-1', code: '1.1.2.1', name: 'ذمم العملاء', type: 'Assets', parentId: 'coa-1-1-2', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-1-1-3', code: '1.1.3', name: 'الذمم المدينة الأخرى', type: 'Assets', parentId: 'coa-1-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-1-1-3-1', code: '1.1.3.1', name: 'مصاريف مدفوعة مقدماً', type: 'Assets', parentId: 'coa-1-1-3', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-1-1-4', code: '1.1.4', name: 'المستودعات', type: 'Assets', parentId: 'coa-1-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-1-1-4-1', code: '1.1.4.1', name: 'مستودع البضاعة الجاهزة', type: 'Assets', parentId: 'coa-1-1-4', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-1-1-5', code: '1.1.5', name: 'تأمينات وكفالات', type: 'Assets', parentId: 'coa-1-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-1-1-5-1', code: '1.1.5.1', name: 'تأمينات مستردة', type: 'Assets', parentId: 'coa-1-1-5', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-1-1-5-2', code: '1.1.5.2', name: 'اعتمادات', type: 'Assets', parentId: 'coa-1-1-5', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-1-2', code: '1.2', name: 'الموجودات الثابتة والاستهلاكات', type: 'Assets', parentId: 'coa-1', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-1-2-1', code: '1.2.1', name: 'الموجودات الثابتة ومجمع الاستهلاك', type: 'Assets', parentId: 'coa-1-2', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-1-2-1-1', code: '1.2.1.1', name: 'الموجودات الثابتة', type: 'Assets', parentId: 'coa-1-2-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-1-2-1-2', code: '1.2.1.2', name: 'مجمع استهلاك الموجودات الثابتة', type: 'Assets', parentId: 'coa-1-2-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-1-3', code: '1.3', name: 'موجودات أخرى', type: 'Assets', parentId: 'coa-1', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-1-3-1', code: '1.3.1', name: 'موجودات أخرى', type: 'Assets', parentId: 'coa-1-3', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-1-3-1-1', code: '1.3.1.1', name: 'موجودات أخرى', type: 'Assets', parentId: 'coa-1-3-1', level: 3, isLocked: false, isCategory: false },

      { id: 'coa-2', code: '2', name: 'المطلوبات', type: 'Liabilities', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-2-1', code: '2.1', name: 'المطلوبات المتداولة', type: 'Liabilities', parentId: 'coa-2', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-2-1-1', code: '2.1.1', name: 'الذمم الدائنة', type: 'Liabilities', parentId: 'coa-2-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-2-1-1-1', code: '2.1.1.1', name: 'ذمم الموردين', type: 'Liabilities', parentId: 'coa-2-1-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-2-1-2', code: '2.1.2', name: 'شيكات آجلة', type: 'Liabilities', parentId: 'coa-2-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-2-1-2-1', code: '2.1.2.1', name: 'شيكات مؤجلة الدفع', type: 'Liabilities', parentId: 'coa-2-1-2', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-2-1-3', code: '2.1.3', name: 'ذمم دائنة أخرى', type: 'Liabilities', parentId: 'coa-2-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-2-1-3-1', code: '2.1.3.1', name: 'بنوك دائنة', type: 'Liabilities', parentId: 'coa-2-1-3', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-2-1-3-2', code: '2.1.3.2', name: 'الكفالات', type: 'Liabilities', parentId: 'coa-2-1-3', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-2-1-3-3', code: '2.1.3.3', name: 'مصاريف مستحقة', type: 'Liabilities', parentId: 'coa-2-1-3', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-2-1-3-4', code: '2.1.3.4', name: 'الامانات', type: 'Liabilities', parentId: 'coa-2-1-3', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-2-2', code: '2.2', name: 'المطلوبات طويلة الاجل', type: 'Liabilities', parentId: 'coa-2', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-2-2-1', code: '2.2.1', name: 'مطلوبات طويلة الاجل', type: 'Liabilities', parentId: 'coa-2-2', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-2-2-1-1', code: '2.2.1.1', name: 'قروض', type: 'Liabilities', parentId: 'coa-2-2-1', level: 3, isLocked: false, isCategory: false },

      { id: 'coa-3', code: '3', name: 'حقوق الملكية', type: 'Equity', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-3-1', code: '3.1', name: 'رأس المال', type: 'Equity', parentId: 'coa-3', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-3-1-1', code: '3.1.1', name: 'رأس المال', type: 'Equity', parentId: 'coa-3-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-3-1-1-1', code: '3.1.1.1', name: 'رأس المال', type: 'Equity', parentId: 'coa-3-1-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-3-2', code: '3.2', name: 'جاري الشركاء', type: 'Equity', parentId: 'coa-3', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-3-2-1', code: '3.2.1', name: 'جاري الشركاء', type: 'Equity', parentId: 'coa-3-2', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-3-2-1-1', code: '3.2.1.1', name: 'جاري الشركاء', type: 'Equity', parentId: 'coa-3-2-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-3-3', code: '3.3', name: 'الاحتياطيات والمخصصات', type: 'Equity', parentId: 'coa-3', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-3-3-1', code: '3.3.1', name: 'الاحتياطيات', type: 'Equity', parentId: 'coa-3-3', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-3-3-1-1', code: '3.3.1.1', name: 'احتياطي اجباري', type: 'Equity', parentId: 'coa-3-3-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-3-3-1-2', code: '3.3.1.2', name: 'احتياطي اختياري', type: 'Equity', parentId: 'coa-3-3-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-3-3-2', code: '3.3.2', name: 'المخصصات', type: 'Equity', parentId: 'coa-3-3', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-3-3-2-1', code: '3.3.2.1', name: 'مخصصات الديون المشكوك بها', type: 'Equity', parentId: 'coa-3-3-2', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-3-4', code: '3.4', name: 'الأرباح والخسائر', type: 'Equity', parentId: 'coa-3', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-3-4-1', code: '3.4.1', name: 'الأرباح والخسائر', type: 'Equity', parentId: 'coa-3-4', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-3-4-1-1', code: '3.4.1.1', name: 'أرباح (خسائر) مدورة', type: 'Equity', parentId: 'coa-3-4-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-3-4-1-2', code: '3.4.1.2', name: 'أرباح (خسائر) الفترة', type: 'Equity', parentId: 'coa-3-4-1', level: 3, isLocked: false, isCategory: false },

      { id: 'coa-4', code: '4', name: 'المصاريف', type: 'Expenses', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-4-1', code: '4.1', name: 'المصاريف', type: 'Expenses', parentId: 'coa-4', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-4-1-1', code: '4.1.1', name: 'المصاريف', type: 'Expenses', parentId: 'coa-4-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-4-1-1-1', code: '4.1.1.1', name: 'المصاريف الإدارية والعمومية', type: 'Expenses', parentId: 'coa-4-1-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-4-1-1-2', code: '4.1.1.2', name: 'المصاريف التشغيلية', type: 'Expenses', parentId: 'coa-4-1-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-4-1-1-3', code: '4.1.1.3', name: 'المصاريف الصناعية', type: 'Expenses', parentId: 'coa-4-1-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-4-1-1-4', code: '4.1.1.4', name: 'مصروف الاستهلاك', type: 'Expenses', parentId: 'coa-4-1-1', level: 3, isLocked: false, isCategory: false },

      { id: 'coa-5', code: '5', name: 'الإيرادات', type: 'Revenue', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-5-1', code: '5.1', name: 'الإيرادات', type: 'Revenue', parentId: 'coa-5', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-5-1-1', code: '5.1.1', name: 'الإيرادات', type: 'Revenue', parentId: 'coa-5-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-5-1-1-1', code: '5.1.1.1', name: 'الإيرادات', type: 'Revenue', parentId: 'coa-5-1-1', level: 3, isLocked: false, isCategory: false },
      { id: 'coa-5-1-1-2', code: '5.1.1.2', name: 'إيرادات اخرى', type: 'Revenue', parentId: 'coa-5-1-1', level: 3, isLocked: false, isCategory: false },

      { id: 'coa-6', code: '6', name: 'تكلفة البضاعة المباعة', type: 'COGS', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-6-1', code: '6.1', name: 'تكلفة البضاعة المباعة', type: 'COGS', parentId: 'coa-6', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-6-1-1', code: '6.1.1', name: 'تكلفة البضاعة المباعة', type: 'COGS', parentId: 'coa-6-1', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-6-1-1-1', code: '6.1.1.1', name: 'تكلفة البضاعة المباعة', type: 'COGS', parentId: 'coa-6-1-1', level: 3, isLocked: false, isCategory: false },
    ];
  });

  const [firmSettings, setFirmSettings] = useState(() => {
    const saved = localStorage.getItem('audit_pro_firm_settings');
    return saved ? JSON.parse(saved) : {
      name: 'أوديت برو للاستشارات المالية',
      auditorName: 'زيد الدباغ',
      primaryColor: '#2563eb',
      secondaryColor: '#0b1424'
    };
  });

  useEffect(() => localStorage.setItem('audit_pro_companies', JSON.stringify(companies)), [companies]);
  useEffect(() => localStorage.setItem('audit_pro_client_contacts', JSON.stringify(clientContacts)), [clientContacts]);
  useEffect(() => localStorage.setItem('audit_pro_client_docs', JSON.stringify(clientDocuments)), [clientDocuments]);
  useEffect(() => localStorage.setItem('audit_pro_files', JSON.stringify(auditFiles)), [auditFiles]);
  useEffect(() => localStorage.setItem('audit_pro_accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('audit_pro_firm_settings', JSON.stringify(firmSettings)), [firmSettings]);
  useEffect(() => localStorage.setItem('audit_pro_sidebar_state_v3', sidebarState), [sidebarState]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const exportFullDatabase = () => {
    const database = {
      companies,
      clientContacts,
      clientDocuments,
      auditFiles,
      accounts,
      firmSettings,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(database, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AuditPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير النسخة الاحتياطية بنجاح', 'success');
  };

  const importDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error("File is empty");
        
        const data = JSON.parse(content);
        
        if (!data || typeof data !== 'object') {
           throw new Error("Invalid structure: data is not an object");
        }

        if (window.confirm('تنبيه: سيتم استبدال كافة البيانات الحالية بالبيانات الموجودة في الملف المرفوع. هل تريد الاستمرار؟')) {
          // تحديث الحالات بالترتيب مع توفير قيم افتراضية لضمان عدم حدوث أخطاء
          setCompanies(Array.isArray(data.companies) ? data.companies : []);
          setAuditFiles(Array.isArray(data.auditFiles) ? data.auditFiles : []);
          setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
          setClientContacts(Array.isArray(data.clientContacts) ? data.clientContacts : []);
          setClientDocuments(Array.isArray(data.clientDocuments) ? data.clientDocuments : []);
          
          if (data.firmSettings && typeof data.firmSettings === 'object') {
             setFirmSettings(data.firmSettings);
          }
          
          // تصفير الحالات الانتقالية لضمان استقرار العرض
          setActiveMappingFileId(null);
          setIsCompanyFormOpen(false);
          setEditingCompany(null);
          
          showToast('تم استعادة البيانات بنجاح، التطبيق الآن يعرض النسخة المستوردة', 'success');
        }
      } catch (err) {
        console.error("Import Error Detail:", err);
        showToast('فشلت عملية استعادة البيانات، يرجى التأكد من اختيار ملف النسخة الصحيح بصيغة JSON', 'error');
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    
    reader.onerror = () => {
      showToast('خطأ في قراءة الملف من الجهاز', 'error');
    };
    
    reader.readAsText(file);
  };

  const [financialYears] = useState<string[]>(['2023', '2024', '2025']);

  const toggleSidebarMode = () => {
    setSidebarState(prev => prev === 'expanded' ? 'collapsed' : prev === 'collapsed' ? 'hidden' : 'expanded');
  };

  const handleSaveCompany = (company: Company) => {
    if (editingCompany) {
      setCompanies(prev => prev.map(c => c.id === company.id ? company : c));
    } else {
      setCompanies(prev => [company, ...prev]);
    }
    setIsCompanyFormOpen(false);
    setEditingCompany(null);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setIsCompanyFormOpen(true);
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutGrid },
    { id: 'client-db', label: 'قاعدة بيانات العملاء', icon: Database },
    { id: 'company', label: 'الشركات', icon: Building2 },
    { id: 'reports', label: 'ملفات التدقيق', icon: FileText },
    { id: 'settings', label: 'الإعدادات', icon: Settings, subItems: [
        { id: 'firm', label: 'إعدادات الشركة', icon: ShieldCheck },
        { id: 'coa', label: 'شجرة الحسابات', icon: Workflow },
        { id: 'database', label: 'إدارة البيانات', icon: DatabaseZap },
      ]
    },
  ];

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item) => {
      const hasSubItems = !!item.subItems;
      const isExpanded = expandedMenus.has(item.id);
      const isActive = activeTab === item.id || activeSubTab === item.id;
      const isCollapsed = sidebarState === 'collapsed' && level === 0;

      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => {
              if (hasSubItems) {
                const newExpanded = new Set(expandedMenus);
                if (newExpanded.has(item.id)) newExpanded.delete(item.id);
                else newExpanded.add(item.id);
                setExpandedMenus(newExpanded);
                if (sidebarState === 'collapsed') setSidebarState('expanded');
              } else {
                setActiveTab(item.id);
                setActiveSubTab(null);
                setIsCompanyFormOpen(false);
                if (level > 0) setActiveSubTab(item.id);
                if (window.innerWidth < 1024) setIsMobileOpen(false);
              }
            }}
            className={`w-full flex items-center rounded-xl transition-all duration-200 group ${level === 0 ? 'p-3.5' : 'p-2.5'} ${isActive && !hasSubItems ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <item.icon size={level === 0 ? 22 : 18} className={`${isCollapsed ? 'mx-auto' : 'ml-3'}`} />
            {!isCollapsed && <span className={`flex-1 text-right font-bold ${level === 0 ? 'text-base' : 'text-sm'}`}>{item.label}</span>}
            {!isCollapsed && hasSubItems && <span className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity">{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>}
          </button>
          {hasSubItems && isExpanded && !isCollapsed && <div className="mr-5 border-r border-white/10 pr-2 mt-1 space-y-1">{renderNavItems(item.subItems!, level + 1)}</div>}
        </div>
      );
    });
  };

  if (activeMappingFileId) {
    const file = auditFiles.find(f => f.id === activeMappingFileId);
    if (file) return <AccountMappingView file={file} onBack={() => setActiveMappingFileId(null)} onUpdateFile={(updated) => setAuditFiles(prev => prev.map(f => f.id === updated.id ? updated : f))} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-right relative" dir="rtl">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top duration-300">
           <div className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] shadow-2xl border ${
             notification.type === 'success' ? 'bg-green-600 text-white border-green-500' : 'bg-red-600 text-white border-red-500'
           }`}>
              {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-black whitespace-nowrap">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="mr-4 opacity-70 hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
           </div>
        </div>
      )}

      {isMobileOpen && <div className="fixed inset-0 bg-black/60 z-[65] lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileOpen(false)} />}

      <aside style={{ backgroundColor: firmSettings.secondaryColor || '#0b1424' }} className={`fixed inset-y-0 right-0 h-full flex flex-col border-l border-white/5 transition-all duration-300 ease-in-out z-[70] shadow-2xl lg:shadow-none ${isMobileOpen ? 'translate-x-0 w-64' : sidebarState === 'expanded' ? 'lg:translate-x-0 translate-x-full w-64' : sidebarState === 'collapsed' ? 'lg:translate-x-0 translate-x-full w-20' : 'translate-x-full w-0'}`}>
        <div className={`p-6 flex items-center border-b border-white/5 ${sidebarState === 'collapsed' && !isMobileOpen ? 'justify-center' : 'justify-between'}`}>
          <button className="text-slate-400 p-1 hover:bg-white/5 rounded-lg" onClick={() => isMobileOpen ? setIsMobileOpen(false) : toggleSidebarMode()}><CloseIcon size={20} /></button>
          {(sidebarState === 'expanded' || isMobileOpen) && <h1 className="text-xl font-black text-white">AUDIT PRO</h1>}
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto no-scrollbar">{renderNavItems(navItems)}</nav>
        
        <div className={`p-4 border-t border-white/5 ${(sidebarState === 'collapsed' && !isMobileOpen) ? 'items-center' : ''}`}>
           <div className={`flex items-center gap-3 p-3 bg-white/5 rounded-2xl ${sidebarState === 'collapsed' ? 'justify-center' : ''}`}>
              <DatabaseZap size={18} className="text-green-400" />
              {(sidebarState === 'expanded' || isMobileOpen) && (
                <div className="min-w-0">
                   <p className="text-[10px] font-black text-white leading-none">Database Online</p>
                   <p className="text-[8px] font-bold text-slate-400 mt-1">LocalStorage Active</p>
                </div>
              )}
           </div>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarState === 'expanded' ? 'lg:mr-64' : sidebarState === 'collapsed' ? 'lg:mr-20' : 'lg:mr-0'}`}>
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-8 shadow-sm z-50">
          <div className="flex items-center gap-2">
            <button className="lg:hidden p-2 text-gray-500" onClick={() => setIsMobileOpen(true)}><Menu size={24} /></button>
            <button className="hidden lg:flex p-2 text-gray-400 hover:text-blue-600 transition-all" onClick={toggleSidebarMode}>{sidebarState === 'expanded' ? <PanelRightClose size={22} /> : <LayoutPanelLeft size={22} />}</button>
            <h2 className="text-lg sm:text-xl font-black text-gray-800 mr-2">
              {activeTab === 'company' ? 'إدارة الشركات' : 
               activeTab === 'reports' ? 'ملفات التدقيق' : 
               activeTab === 'client-db' ? 'قاعدة بيانات العملاء' : 
               activeSubTab === 'firm' ? 'إعدادات المكتب' : 
               activeSubTab === 'coa' ? 'شجرة الحسابات' : 
               activeSubTab === 'database' ? 'إدارة قاعدة البيانات' : 'Audit Pro'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'company' && !isCompanyFormOpen && (
              <button 
                onClick={() => setIsCompanyFormOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus size={18} /> إضافة شركة
              </button>
            )}
            <div className="relative hidden sm:block"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="بحث سريع..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10 pl-4 py-2 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 w-48 lg:w-64 bg-gray-50 font-medium outline-none" /></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8fafc]">
          {activeSubTab === 'database' ? (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
               <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="flex flex-col items-center text-center mb-10">
                     <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl mb-4 shadow-inner">
                        <Database size={44} />
                     </div>
                     <h3 className="text-2xl font-black text-gray-800">إدارة قاعدة بيانات أوديت برو</h3>
                     <p className="text-sm font-bold text-gray-400 mt-2">تحكم في حفظ واستعادة بيانات العملاء والتدقيق</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                     <div className="p-6 sm:p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-5 flex flex-col items-center text-center">
                        <div className="flex items-center gap-3">
                           <UploadCloud className="text-purple-600" size={32} /> 
                           <h4 className="text-lg font-black text-gray-800">استعادة البيانات</h4>
                        </div>
                        <p className="text-xs text-gray-400 font-bold leading-relaxed px-4">ارفع ملف النسخة الاحتياطية (.json) لاستعادة كافة البيانات السابقة على هذا الجهاز.</p>
                        
                        <label className="cursor-pointer w-full py-6 mt-2 bg-white border-2 border-dashed border-purple-200 text-purple-600 rounded-[1.5rem] font-black hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-2 group">
                           <input type="file" accept=".json" className="hidden" onChange={importDatabase} />
                           <span className="group-hover:scale-110 transition-transform">اختيار ملف النسخة</span>
                        </label>
                     </div>

                     <div className="p-6 sm:p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-5 flex flex-col items-center text-center">
                        <div className="flex items-center gap-3">
                           <DownloadCloud className="text-blue-600" size={32} /> 
                           <h4 className="text-lg font-black text-gray-800">النسخ الاحتياطي</h4>
                        </div>
                        <p className="text-xs text-gray-400 font-bold leading-relaxed px-4">قم بتحميل نسخة كاملة من النظام تحتوي على جميع الشركات، المستخدمين، التربيطات، والملفات المرفوعة.</p>
                        
                        <button 
                           onClick={exportFullDatabase} 
                           className="w-full py-4 mt-auto bg-blue-600 text-white rounded-2xl font-black shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                           تصدير الآن
                        </button>
                     </div>
                  </div>
               </div>

               <div className="bg-amber-50/60 p-5 rounded-[1.5rem] border border-amber-100 flex items-center gap-4 max-w-2xl mx-auto shadow-sm">
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                    <DatabaseZap size={24} />
                  </div>
                  <div className="flex-1">
                     <h5 className="text-[11px] font-black text-amber-900 uppercase tracking-wide">نظام الحفظ التلقائي مفعل</h5>
                     <p className="text-[10px] font-bold text-amber-700 mt-0.5 leading-relaxed">يتم حفظ جميع التعديلات لحظياً في ذاكرة المتصفح. يمكنك الانتقال بين الأجهزة عن طريق "تصدير" و "استيراد" الملف.</p>
                  </div>
               </div>
            </div>
          ) : activeTab === 'client-db' ? (
             <ClientDatabase companies={companies} onAddClient={() => setActiveTab('company')} contacts={clientContacts} setContacts={setClientContacts} documents={clientDocuments} setDocuments={setClientDocuments} />
          ) : activeTab === 'company' ? (
             isCompanyFormOpen ? (
               <CompanyForm 
                 onSave={handleSaveCompany} 
                 onCancel={() => { setIsCompanyFormOpen(false); setEditingCompany(null); }} 
                 initialData={editingCompany} 
                 countries={countries} 
                 currencies={currencies} 
               />
             ) : (
               <CompanyList companies={companies} view="list" onEdit={handleEditCompany} searchQuery={searchQuery} />
             )
          ) : activeSubTab === 'firm' ? (
            <FirmSettingsComponent settings={firmSettings} onSave={setFirmSettings} countries={countries} currencies={currencies} />
          ) : activeTab === 'reports' ? (
             <AuditFileManagement companies={companies} financialYears={financialYears} auditFiles={auditFiles} onUpdateFiles={setAuditFiles} searchQuery={searchQuery} externalShowModal={showAuditModal} setExternalShowModal={setShowAuditModal} onOpenMapping={(id) => setActiveMappingFileId(id)} accounts={accounts} />
          ) : activeSubTab === 'coa' ? (
             <ChartOfAccounts accounts={accounts} onUpdate={setAccounts} userRole={userRole} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
               <Database size={64} className="mb-4 text-slate-300" />
               <h3 className="text-xl font-black text-slate-400">لوحة التحكم قيد التطوير</h3>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
