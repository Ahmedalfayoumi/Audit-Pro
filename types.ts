
export enum CompanyType {
  SOLE_PROPRIETORSHIP = 'مؤسسة فردية',
  GENERAL_PARTNERSHIP = 'شركة تضامن',
  LIMITED_PARTNERSHIP = 'شركة توصية بسيطة',
  LLC = 'شركة ذات مسؤولية محدودة',
  FOREIGN_OPERATING = 'أجنبية فرع عامل',
  FOREIGN_NON_OPERATING = 'أجنبية فرع غير عامل',
  EXEMPT = 'معفاة',
  NON_PROFIT = 'شركة غير ربحية',
  FREE_ZONE = 'شركة مناطق حرة',
  JOINT_INVESTMENT = 'شركة استثمار مشترك',
  CIVIL = 'شركة مدنية',
  PARTNERSHIP_BY_SHARES = 'شركة توصية بالأسهم',
  PUBLIC_SHAREHOLDING = 'مساهمة عامة محدودة',
  PRIVATE_SHAREHOLDING = 'مساهمة خاصة محدودة',
}

export const SECTORS = [
  'تجاري', 'خدمي', 'صناعي', 'صحي', 'فندقي', 'عقارات', 
  'اتصالات', 'تكنولوجيا المعلومات', 'التعدين', 'التعليم', 
  'زراعة', 'سياحة', 'الصناعات الدوائية والطبية', 
  'الصناعات الغذائية', 'البترول والغاز', 'الغزل والنسيج'
];

export interface City {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  cities: City[];
}

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
}

export interface Department {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
  department: string;
}

export interface Address {
  country: string;
  city: string;
  street: string;
  buildingName?: string;
  buildingNumber: string;
  floor: string;
  officeNumber: string;
}

export interface AuthorizedSignatory {
  isEmployee: boolean;
  name: string;
  mobile: string;
}

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  foundingDate: string;
  sectors: string[];
  nationalNumber: string;
  registrationNumber: string;
  taxNumber: string;
  isSubjectToSalesTax: boolean;
  socialSecurityNumber?: string;
  isNotRegisteredInSS: boolean;
  address: Address;
  signatory: AuthorizedSignatory;
  goals: string[];
  financialYear: string;
  capital?: string;
  currency?: string;
}

// Chart of Accounts Types
export type AccountType = 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses' | 'COGS';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  level: number;
  isLocked: boolean;
  isCategory: boolean;
}

export interface TbAccountData {
  name: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
}

export interface MaterialityData {
  riskLevel: number;
  otherBasis?: number;
  otherBasisReason?: string;
  notes?: string;
}

export interface AuditFile {
  id: string;
  companyId: string;
  companyName: string;
  financialYear: string;
  appointmentLetterFile?: string;
  registrationFile?: string;
  licenseFile?: string;
  trialBalanceFile?: string;
  lastYearFinancialsFile?: string;
  uploadDate: string;
  status: 'Pending' | 'Completed' | 'Review';
  accounts: Account[];
  tbMappings: Record<string, string>;
  tbAccounts: TbAccountData[];
  materialityData?: MaterialityData;
}
