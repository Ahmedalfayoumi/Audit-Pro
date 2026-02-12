
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Building2, Users, FileText, Settings, Plus, Search, ChevronDown, ChevronUp, ChevronRight, Database, Globe, Coins, List, Briefcase, CalendarDays, Workflow, ShieldCheck, Palette, Layers, Menu, X as CloseIcon, ArrowRight } from 'lucide-react';
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
import { Company, CompanyType, Country, Account, Position, Department, Currency, AuditFile, TbAccountData } from './types';

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
  const [activeTab, setActiveTab] = useState<string>('reports');
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set<string>());
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [activeMappingFileId, setActiveMappingFileId] = useState<string | null>(null);
  
  const [userRole] = useState<'مدير نظام' | 'مدقق' | 'مشاهد'>('مدير نظام');

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('audit_pro_companies');
    if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);
    return [
      {
        id: 'c1',
        name: 'شركة الأمل للتجارة العامة',
        type: CompanyType.LLC,
        foundingDate: '2020-05-15',
        sectors: ['تجاري'],
        nationalNumber: '200154879',
        registrationNumber: '55487',
        taxNumber: '1002548',
        isSubjectToSalesTax: true,
        isNotRegisteredInSS: false,
        socialSecurityNumber: 'SS-998877',
        address: { country: 'الأردن', city: 'عمان', street: 'شارع مكة', buildingName: '10', floor: '2', officeNumber: '201', buildingNumber: '10' },
        signatory: { isEmployee: true, name: 'محمد علي', mobile: '0791234567' },
        goals: ['استيراد وتصدير المواد الغذائية', 'التوزيع بالجملة'],
        financialYear: '2024',
        capital: '50000',
        currency: 'دينار أردني'
      },
      {
        id: 'c2',
        name: 'شركة النور للحلويات',
        type: CompanyType.LLC,
        foundingDate: '2018-03-20',
        sectors: ['صناعي', 'تجاري'],
        nationalNumber: '200055123',
        registrationNumber: '44123',
        taxNumber: '112233',
        isSubjectToSalesTax: true,
        isNotRegisteredInSS: false,
        socialSecurityNumber: 'SS-441122',
        address: { country: 'الأردن', city: 'الزرقاء', street: 'شارع الجيش', buildingName: 'مجمع النور', buildingNumber: '15', floor: '1', officeNumber: '5' },
        signatory: { isEmployee: false, name: 'سناء يوسف', mobile: '0785554433' },
        goals: ['تصنيع الحلويات الشرقية والغربية', 'التصدير للأسواق المجاورة'],
        financialYear: '2024',
        capital: '75000',
        currency: 'دينار أردني'
      }
    ];
  });

  const [financialYears] = useState<string[]>(['2023', '2024', '2025']);

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('audit_pro_accounts');
    if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);

    return [
      { id: 'coa-1', code: '1', name: 'الموجودات', type: 'Assets', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-11', code: '11', name: 'الموجودات المتداولة', type: 'Assets', parentId: 'coa-1', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-111', code: '111', name: 'النقد في الصندوق ولدى البنوك', type: 'Assets', parentId: 'coa-11', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-11101', code: '11101', name: 'النقد وما يعادله', type: 'Assets', parentId: 'coa-111', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-11102', code: '11102', name: 'البنوك', type: 'Assets', parentId: 'coa-111', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-112', code: '112', name: 'الذمم المدينة', type: 'Assets', parentId: 'coa-11', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-11201', code: '11201', name: 'ذمم العملاء', type: 'Assets', parentId: 'coa-112', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-113', code: '113', name: 'ذمم مدينة أخرى', type: 'Assets', parentId: 'coa-11', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-11301', code: '11301', name: 'مصاريف مدفوعة مقدما', type: 'Assets', parentId: 'coa-113', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-114', code: '114', name: 'المستودعات', type: 'Assets', parentId: 'coa-11', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-11401', code: '11401', name: 'مستودع البضاعة الجاهزة', type: 'Assets', parentId: 'coa-114', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-115', code: '115', name: 'تأمينات وكفالات', type: 'Assets', parentId: 'coa-11', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-11501', code: '11501', name: 'تأمينات مستردة', type: 'Assets', parentId: 'coa-115', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-12', code: '12', name: 'الموجودات الثابتة والاستهلاكات', type: 'Assets', parentId: 'coa-1', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-121', code: '121', name: 'الموجودات الثابتة ومجمع الاستهلاك', type: 'Assets', parentId: 'coa-12', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-12101', code: '12101', name: 'الموجودات الثابتة', type: 'Assets', parentId: 'coa-121', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-12102', code: '12102', name: 'مجمع استهلاك الموجودات الثابتة', type: 'Assets', parentId: 'coa-121', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-2', code: '2', name: 'المطلوبات', type: 'Liabilities', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-21', code: '21', name: 'المطلوبات المتداولة', type: 'Liabilities', parentId: 'coa-2', level: 1, isLocked: true, isCategory: true },
      { id: 'coa-211', code: '211', name: 'الذمم الدائنة', type: 'Liabilities', parentId: 'coa-21', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-21101', code: '21101', name: 'ذمم الموردين', type: 'Liabilities', parentId: 'coa-211', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-212', code: '212', name: 'شيكات آجلة', type: 'Liabilities', parentId: 'coa-21', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-21201', code: '21201', name: 'شيكات مؤجلة الدفع', type: 'Liabilities', parentId: 'coa-212', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-213', code: '213', name: 'ذمم دائنة أخرى', type: 'Liabilities', parentId: 'coa-21', level: 2, isLocked: true, isCategory: true },
      { id: 'coa-21303', code: '21303', name: 'مصاريف مستحقة', type: 'Liabilities', parentId: 'coa-213', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-3', code: '3', name: 'حقوق الملكية', type: 'Equity', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-31101', code: '31101', name: 'رأس المال', type: 'Equity', parentId: 'coa-3', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-34101', code: '34101', name: 'أرباح (خسائر) مدورة', type: 'Equity', parentId: 'coa-3', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-32101', code: '32101', name: 'جاري الشركاء', type: 'Equity', parentId: 'coa-3', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-4', code: '4', name: 'المصاريف', type: 'Expenses', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-41101', code: '41101', name: 'المصاريف الإدارية والعمومية', type: 'Expenses', parentId: 'coa-4', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-5', code: '5', name: 'الإيرادات', type: 'Revenue', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-51101', code: '51101', name: 'الإيرادات', type: 'Revenue', parentId: 'coa-5', level: 3, isLocked: true, isCategory: false },
      { id: 'coa-6', code: '6', name: 'تكلفة البضاعة المباعة', type: 'COGS', parentId: null, level: 0, isLocked: true, isCategory: true },
      { id: 'coa-61101', code: '61101', name: 'تكلفة البضاعة المباعة', type: 'COGS', parentId: 'coa-6', level: 3, isLocked: true, isCategory: false },
    ];
  });

  const [auditFiles, setAuditFiles] = useState<AuditFile[]>(() => {
    const saved = localStorage.getItem('audit_pro_files');
    if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);
    
    const accountsSnapshot = JSON.parse(localStorage.getItem('audit_pro_accounts') || '[]');

    const tbDataFromScreenshot: TbAccountData[] = [
      { name: 'الصندوق الرئيسي', openingDebit: 0, openingCredit: 0, periodDebit: 120720.929, periodCredit: 120720.929 },
      { name: 'البنك العربي الكويتي - دينار', openingDebit: 114.857, openingCredit: 0, periodDebit: 55078, periodCredit: 51959.043 },
      { name: 'البنك العربي الكويتي - دولار', openingDebit: 0, openingCredit: 0, periodDebit: 363.42, periodCredit: 10 },
      { name: 'رش بنك االتحاد - كة مخلب الحيوان', openingDebit: 0, openingCredit: 0, periodDebit: 21549.682, periodCredit: 21549.782 },
      { name: 'مخزون البضاعة الجاهزه', openingDebit: 91712.82, openingCredit: 0, periodDebit: 85777.246, periodCredit: 78482.417 },
      { name: 'ذمم عمالء داخليون', openingDebit: 0, openingCredit: 11967.2, periodDebit: 125196.203, periodCredit: 88158.759 },
      { name: 'وسيط سند تسليم بضائع للعمالء', openingDebit: 0, openingCredit: 0, periodDebit: 8.613, periodCredit: 0 },
      { name: 'بضاعة ف الطريق', openingDebit: 34702.689, openingCredit: 0, periodDebit: 27644.787, periodCredit: 62347.476 },
      { name: 'تأمينات رشكة الكهرباء االردنية', openingDebit: 570, openingCredit: 0, periodDebit: 0, periodCredit: 0 },
      { name: 'تأمينات بطاقة المستورد', openingDebit: 12000, openingCredit: 0, periodDebit: 0, periodCredit: 12000 },
      { name: 'ايجار مدفوع مقدما', openingDebit: 1000, openingCredit: 0, periodDebit: 0, periodCredit: 0 },
      { name: 'عدد وادوات', openingDebit: 914, openingCredit: 0, periodDebit: 0, periodCredit: 0 },
      { name: 'أجهزة كمبيوتر', openingDebit: 1628.448, openingCredit: 0, periodDebit: 0, periodCredit: 0 },
      { name: 'اثاث وديكورات', openingDebit: 10386.687, openingCredit: 0, periodDebit: 325, periodCredit: 0 },
      { name: 'سيارات', openingDebit: 8000, openingCredit: 0, periodDebit: 0, periodCredit: 0 },
      { name: 'نظام اطفاء حريق', openingDebit: 1007, openingCredit: 0, periodDebit: 0, periodCredit: 0 },
      { name: 'مجمع استهالك عدد ادوات', openingDebit: 0, openingCredit: 335.75, periodDebit: 0, periodCredit: 0 },
      { name: 'مجمع استهالك أجهزة كمبيوتر', openingDebit: 0, openingCredit: 351.379, periodDebit: 0, periodCredit: 0 },
      { name: 'مجمع استهالك اثاث وديكورات', openingDebit: 0, openingCredit: 2852.679, periodDebit: 0, periodCredit: 0 },
      { name: 'مجمع استهالك سيارات', openingDebit: 0, openingCredit: 3200, periodDebit: 0, periodCredit: 0 },
      { name: 'مجمع استهالك نظام اطفاء حريق', openingDebit: 0, openingCredit: 402.8, periodDebit: 0, periodCredit: 0 },
      { name: 'ذمم موردين داخليون', openingDebit: 0, openingCredit: 32322.656, periodDebit: 28035.111, periodCredit: 44350.702 },
      { name: 'ذمم موردين خارجيون', openingDebit: 0, openingCredit: 0, periodDebit: 55732.996, periodCredit: 55732.996 },
      { name: 'شيكات اجلة البنك االردن', openingDebit: 0, openingCredit: 3730, periodDebit: 0, periodCredit: 0 },
      { name: 'حساب رواتب مستحقة الدفع', openingDebit: 0, openingCredit: 2600, periodDebit: 8465.32, periodCredit: 6110 },
      { name: 'امانات ضيبة المبيعات والمشتريات', openingDebit: 0, openingCredit: 952.624, periodDebit: 10399.956, periodCredit: 13984.038 },
      { name: 'امانات ضيبة الدخل السنوي للرشكة', openingDebit: 2140.95, openingCredit: 0, periodDebit: 883.18, periodCredit: 0 },
      { name: 'كهرباء مستحقة الدفع', openingDebit: 0, openingCredit: 125.045, periodDebit: 0, periodCredit: 0 },
      { name: 'اتعاب مهنية مستحقة', openingDebit: 0, openingCredit: 165, periodDebit: 5452.5, periodCredit: 5387.5 },
      { name: 'راس المال المسجل', openingDebit: 0, openingCredit: 5000, periodDebit: 0, periodCredit: 0 },
      { name: 'ارباح وخسائر مدوره', openingDebit: 14738.652, openingCredit: 0, periodDebit: 0, periodCredit: 0 },
      { name: 'جاري الشريك / اية هللا المأمون مصطفى', openingDebit: 0, openingCredit: 48750, periodDebit: 0, periodCredit: 1250 },
      { name: 'جاري الشريك / خالد ناضالخ ض', openingDebit: 0, openingCredit: 43484.67, periodDebit: 59321.608, periodCredit: 45836.938 },
      { name: 'جاري الشريك / دينامصطفى كمال الشنط', openingDebit: 0, openingCredit: 22676.3, periodDebit: 3176.3, periodCredit: 500 },
      { name: 'كلفة البضاعة المباعة', openingDebit: 0, openingCredit: 0, periodDebit: 78473.803, periodCredit: 30035.632 },
      { name: 'م رواتب', openingDebit: 0, openingCredit: 0, periodDebit: 12956, periodCredit: 0 },
      { name: 'م الكهرباء والماء', openingDebit: 0, openingCredit: 0, periodDebit: 1279.788, periodCredit: 0 },
      { name: 'م ايجارات', openingDebit: 0, openingCredit: 0, periodDebit: 4999.96, periodCredit: 0 },
      { name: 'م قرطاسيه ومطبوعات', openingDebit: 0, openingCredit: 0, periodDebit: 20.664, periodCredit: 0 },
      { name: 'م عموالت بنكية', openingDebit: 0, openingCredit: 0, periodDebit: 85.324, periodCredit: 0 },
      { name: 'م رسوم واشتراكات حكومية', openingDebit: 0, openingCredit: 0, periodDebit: 97.358, periodCredit: 0 },
      { name: 'زي موحد', openingDebit: 0, openingCredit: 0, periodDebit: 255, periodCredit: 0 },
      { name: 'م.ا. اتعاب مهنية', openingDebit: 0, openingCredit: 0, periodDebit: 4550, periodCredit: 0 },
      { name: 'م هاتف وانتنت', openingDebit: 0, openingCredit: 0, periodDebit: 193.74, periodCredit: 0 },
      { name: 'م.ا. توصيل طلبات', openingDebit: 0, openingCredit: 0, periodDebit: 1714.667, periodCredit: 0 },
      { name: 'م.ا. صيانة المستودع', openingDebit: 0, openingCredit: 0, periodDebit: 491.599, periodCredit: 0 },
      { name: 'م.ا. نظافة', openingDebit: 0, openingCredit: 0, periodDebit: 39, periodCredit: 0 },
      { name: 'م.ا. ضيافة', openingDebit: 0, openingCredit: 0, periodDebit: 137.904, periodCredit: 0 },
      { name: 'م.ا. ترتعات', openingDebit: 0, openingCredit: 0, periodDebit: 1600, periodCredit: 800 },
      { name: 'م.ا. سيارات وتنقالت', openingDebit: 0, openingCredit: 0, periodDebit: 4031.689, periodCredit: 0 },
      { name: 'م.ا. تحميل وتتت', openingDebit: 0, openingCredit: 0, periodDebit: 750, periodCredit: 0 },
      { name: 'م نقل بضائع', openingDebit: 0, openingCredit: 0, periodDebit: 81, periodCredit: 0 },
      { name: 'عموالت تحصيل مبيعات', openingDebit: 0, openingCredit: 0, periodDebit: 5760.066, periodCredit: 0 },
      { name: 'م بلديه', openingDebit: 0, openingCredit: 0, periodDebit: 209.645, periodCredit: 0 },
      { name: 'م دعاية واعالن', openingDebit: 0, openingCredit: 0, periodDebit: 631.169, periodCredit: 0 },
      { name: 'مصاريف صيانة اجهزة معدات', openingDebit: 0, openingCredit: 0, periodDebit: 103.948, periodCredit: 0 },
      { name: 'ايراد المبيعات', openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 87400.239 },
      { name: 'مردود المبيعات', openingDebit: 0, openingCredit: 0, periodDebit: 23.276, periodCredit: 0 }
    ];

    const screenshotFile: AuditFile = {
      id: 'f-screenshot-mapped-2024',
      companyId: 'c1',
      companyName: 'شركة الأمل للتجارة العامة',
      financialYear: '2024',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      accounts: accountsSnapshot,
      tbMappings: {
        'الصندوق الرئيسي': 'coa-11101',
        'البنك العربي الكويتي - دينار': 'coa-11102',
        'البنك العربي الكويتي - دولار': 'coa-11102',
        'رش بنك االتحاد - كة مخلب الحيوان': 'coa-11102',
        'مخزون البضاعة الجاهزه': 'coa-11401',
        'ذمم عمالء داخليون': 'coa-11201',
        'وسيط سند تسليم بضائع للعمالء': 'coa-11401',
        'بضاعة ف الطريق': 'coa-11401',
        'تأمينات رشكة الكهرباء االردنية': 'coa-11501',
        'تأمينات بطاقة المستورد': 'coa-11501',
        'ايجار مدفوع مقدما': 'coa-11301',
        'عدد وادوات': 'coa-12101',
        'أجهزة كمبيوتر': 'coa-12101',
        'اثاث وديكورات': 'coa-12101',
        'سيارات': 'coa-12101',
        'نظام اطفاء حريق': 'coa-12101',
        'مجمع استهالك عدد ادوات': 'coa-12102',
        'مجمع استهالك أجهزة كمبيوتر': 'coa-12102',
        'مجمع استهالك اثاث وديكورات': 'coa-12102',
        'مجمع استهالك سيارات': 'coa-12102',
        'مجمع استهالك نظام اطفاء حريق': 'coa-12102',
        'ذمم موردين داخليون': 'coa-21101',
        'ذمم موردين خارجيون': 'coa-21101',
        'شيكات اجلة البنك االردن': 'coa-21201',
        'حساب رواتب مستحقة الدفع': 'coa-21303',
        'امانات ضيبة المبيعات والمشتريات': 'coa-11501',
        'امانات ضيبة الدخل السنوي للرشكة': 'coa-11501',
        'كهرباء مستحقة الدفع': 'coa-21303',
        'اتعاب مهنية مستحقة': 'coa-21303',
        'راس المال المسجل': 'coa-31101',
        'ارباح وخسائر مدوره': 'coa-34101',
        'جاري الشريك / اية هللا المأمون مصطفى': 'coa-32101',
        'جاري الشريك / خالد ناضالخ ض': 'coa-32101',
        'جاري الشريك / دينامصطفى كمال الشنط': 'coa-32101',
        'كلفة البضاعة المباعة': 'coa-61101',
        'م رواتب': 'coa-41101',
        'م الكهرباء والماء': 'coa-41101',
        'م ايجارات': 'coa-41101',
        'م قرطاسيه ومطبوعات': 'coa-41101',
        'م عموالت بنكية': 'coa-41101',
        'م رسوم واشتراكات حكومية': 'coa-41101',
        'زي موحد': 'coa-41101',
        'م.ا. اتعاب مهنية': 'coa-41101',
        'م هاتف وانتنت': 'coa-41101',
        'م.ا. توصيل طلبات': 'coa-41101',
        'م.ا. صيانة المستودع': 'coa-41101',
        'م.ا. نظافة': 'coa-41101',
        'م.ا. ضيافة': 'coa-41101',
        'م.ا. ترتعات': 'coa-41101',
        'م.ا. سيارات وتنقالت': 'coa-41101',
        'م.ا. تحميل وتتت': 'coa-41101',
        'م نقل بضائع': 'coa-41101',
        'عموالت تحصيل مبيعات': 'coa-41101',
        'م بلديه': 'coa-41101',
        'م دعاية واعالن': 'coa-41101',
        'مصاريف صيانة اجهزة معدات': 'coa-41101',
        'ايراد المبيعات': 'coa-51101',
        'مردود المبيعات': 'coa-51101'
      },
      tbAccounts: tbDataFromScreenshot
    };

    return [screenshotFile];
  });

  const [firmSettings, setFirmSettings] = useState(() => {
    const saved = localStorage.getItem('audit_pro_firm_settings');
    return saved ? JSON.parse(saved) : {
      name: 'أوديت برو للاستشارات المالية',
      auditorName: 'زيد الدباغ',
      licenseNumber: 'AU-2024-9988',
      address: { country: 'الأردن', city: 'عمان', street: 'شارع وصفي التل', buildingName: 'مجمع قعوار', buildingNumber: '150', floor: '4', officeNumber: '401', },
      logo: null, stamp: null, primaryColor: '#2563eb', secondaryColor: '#0b1424', defaultCurrencyId: '1'
    };
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', firmSettings.primaryColor || '#2563eb');
    root.style.setProperty('--secondary-color', firmSettings.secondaryColor || '#0b1424');
  }, [firmSettings.primaryColor, firmSettings.secondaryColor]);

  useEffect(() => localStorage.setItem('audit_pro_companies', JSON.stringify(companies)), [companies]);
  useEffect(() => {
    localStorage.setItem('audit_pro_accounts', JSON.stringify(accounts));
  }, [accounts]);
  useEffect(() => localStorage.setItem('audit_pro_files', JSON.stringify(auditFiles)), [auditFiles]);
  useEffect(() => localStorage.setItem('audit_pro_firm_settings', JSON.stringify(firmSettings)), [firmSettings]);

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) newExpanded.delete(menuId);
    else newExpanded.add(menuId);
    setExpandedMenus(newExpanded);
  };

  const handleUpdateAuditFiles = (newFiles: AuditFile[]) => {
    setAuditFiles(newFiles);
  };

  const activeMappingFile = auditFiles.find(f => f.id === activeMappingFileId);

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
        { id: 'coa', label: 'شجرة الحسابات', icon: Workflow },
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
              if (hasSubItems) toggleMenu(item.id);
              else {
                setActiveTab(item.id);
                setActiveSubTab(null);
                if (level > 0) setActiveSubTab(item.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }
            }}
            className={`w-full flex items-center rounded-xl transition-all duration-200 ${
              level === 0 ? 'p-3.5' : 'p-2.5'
            } ${
              isActive && !hasSubItems
                ? 'theme-bg-primary text-white shadow-lg' 
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

  if (activeMappingFileId && activeMappingFile) {
    return (
      <AccountMappingView 
        file={activeMappingFile}
        onBack={() => setActiveMappingFileId(null)}
        onUpdateFile={(updatedFile) => {
          setAuditFiles(auditFiles.map(f => f.id === updatedFile.id ? updatedFile : f));
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-right" dir="rtl">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[65] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        style={{ backgroundColor: 'var(--secondary-color)' }}
        className={`fixed inset-y-0 right-0 lg:relative lg:translate-x-0 h-full flex flex-col border-l border-white/5 transition-all duration-300 z-[70] w-64 min-w-[256px] shadow-2xl lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5 min-w-[256px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-bg-primary flex items-center justify-center font-black text-white">AP</div>
            <h1 className="text-xl font-black tracking-tighter truncate theme-text-primary">AUDIT PRO</h1>
          </div>
          <button className="lg:hidden text-slate-400 p-1 hover:bg-white/5 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
            <CloseIcon size={20} />
          </button>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto custom-scrollbar min-w-[256px]">
          {renderNavItems(navItems)}
        </nav>
        <div className="p-4 mt-auto border-t border-white/5 min-w-[256px]">
           <div className="p-3 rounded-2xl bg-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full theme-bg-primary flex items-center justify-center font-bold text-white text-xs">A</div>
              <div className="flex-1 truncate">
                 <p className="text-white text-[11px] font-black leading-tight truncate">المستخدم المسؤول</p>
                 <p className="text-slate-500 text-[9px] font-bold truncate">admin@auditpro.com</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative transition-all duration-300 w-full">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-8 shadow-sm z-50 shrink-0">
          <div className="flex items-center gap-4">
             <button 
               className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
               onClick={() => setIsSidebarOpen(true)}
             >
                <Menu size={24} />
             </button>
             <h2 className="text-lg sm:text-xl font-black text-gray-800 truncate max-w-[150px] sm:max-w-none">
              {activeTab === 'company' ? 'إدارة الشركات' : 
               activeTab === 'reports' ? 'ملفات التدقيق' :
               activeSubTab === 'firm' ? 'إعدادات المكتب' : 
               activeSubTab === 'coa' ? 'شجرة الحسابات' : 'Audit Pro'}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="relative group hidden sm:block">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="بحث سريع..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10 pl-4 py-2 border border-gray-100 rounded-xl text-xs theme-focus-ring w-48 lg:w-64 bg-gray-50 font-medium outline-none" />
            </div>
            <button className="sm:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl">
               <Search size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8fafc] custom-scrollbar">
          {activeTab === 'company' ? (
             <CompanyList companies={companies} view="grid" onEdit={() => {}} searchQuery={searchQuery} />
          ) : activeSubTab === 'firm' ? (
            <FirmSettingsComponent settings={firmSettings} onSave={setFirmSettings} countries={[]} currencies={[]} />
          ) : activeTab === 'reports' ? (
             <AuditFileManagement companies={companies} financialYears={financialYears} auditFiles={auditFiles} onUpdateFiles={handleUpdateAuditFiles} searchQuery={searchQuery} externalShowModal={showAuditModal} setExternalShowModal={setShowAuditModal} onOpenMapping={(id) => setActiveMappingFileId(id)} accounts={accounts} />
          ) : activeSubTab === 'coa' ? (
             <ChartOfAccounts accounts={accounts} onUpdate={setAccounts} userRole={userRole} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
               <Database size={64} className="mb-4 text-slate-300" />
               <h3 className="text-xl font-black text-slate-400">لوحة التحكم قيد التطوير</h3>
               <p className="text-xs font-bold text-slate-400 mt-1">سيتم إضافة إحصائيات التدقيق هنا قريباً</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
