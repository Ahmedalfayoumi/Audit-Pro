
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Check, Save, Building, MapPin, User, FileBarChart, Briefcase, Coins, ChevronDown } from 'lucide-react';
import { CompanyType, SECTORS, Company, Country, Currency } from '../../types';

interface CompanyFormProps {
  onSave: (company: Company) => void;
  onCancel: () => void;
  initialData?: Company | null;
  countries: Country[];
  currencies: Currency[];
}

const CompanyForm: React.FC<CompanyFormProps> = ({ onSave, onCancel, initialData, countries, currencies }) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    type: CompanyType.LLC,
    foundingDate: '',
    sectors: [],
    nationalNumber: '',
    registrationNumber: '',
    taxNumber: '',
    isSubjectToSalesTax: false,
    isNotRegisteredInSS: false,
    socialSecurityNumber: '',
    capital: '',
    currency: currencies[0]?.name || 'دينار أردني',
    address: {
      country: countries[0]?.name || 'الأردن',
      city: countries[0]?.cities[0]?.name || 'عمان',
      street: '',
      buildingName: '',
      buildingNumber: '',
      floor: '',
      officeNumber: '',
    },
    signatory: {
      isEmployee: false,
      name: '',
      mobile: '',
    },
    goals: ['', '', ''],
    financialYear: new Date().getFullYear().toString(),
  });

  // Get available cities for the selected country
  const selectedCountryData = countries.find(c => c.name === formData.address.country);
  const availableCities = selectedCountryData?.cities || [];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        goals: initialData.goals.length >= 3 ? initialData.goals : [...initialData.goals, ...Array(3 - initialData.goals.length).fill('')]
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      // Special logic for country change: update city list
      if (name === 'address.country') {
        const nextCountry = countries.find(c => c.name === value);
        const nextCity = nextCountry?.cities[0]?.name || '';
        
        setFormData((prev: any) => ({
          ...prev,
          address: {
            ...prev.address,
            country: value,
            city: nextCity
          }
        }));
        return;
      }

      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] as any),
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSectorToggle = (sector: string) => {
    setFormData((prev: any) => {
      const currentSectors = prev.sectors || [];
      const newSectors = currentSectors.includes(sector)
        ? currentSectors.filter((s: string) => s !== sector)
        : [...currentSectors, sector];
      return { ...prev, sectors: newSectors };
    });
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...(formData.goals || [])];
    newGoals[index] = value;
    setFormData({ ...formData, goals: newGoals });
  };

  const addGoal = () => {
    setFormData({ ...formData, goals: [...(formData.goals || []), ''] });
  };

  const removeGoal = (index: number) => {
    const newGoals = (formData.goals || []).filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, goals: newGoals });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.nationalNumber) {
      alert('يرجى تعبئة جميع الحقول الإجبارية');
      return;
    }

    const cleanedGoals = (formData.goals || []).filter((g: string) => g.trim() !== '');

    onSave({
      ...formData as Company,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      goals: cleanedGoals
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center mb-8 pb-4">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          {initialData ? 'تعديل بيانات الشركة' : 'اضافة شركة جديدة'}
          <Building className="theme-text-primary" size={28} />
        </h3>
      </div>

      <div className="space-y-8">
        {/* Section: Basic Info */}
        <section className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="flex items-center mb-8 theme-text-primary">
            <h4 className="text-xl font-bold ml-3 text-gray-800">المعلومات الأساسية</h4>
            <Building size={22} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">اسم الشركة (حسب السجل التجاري) *</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none transition-all bg-gray-50/50 font-bold"
                placeholder="أدخل اسم الشركة بالكامل"
              />
            </div>
            
            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-bold text-gray-600">نوع الشركة *</label>
              <div className="relative">
                <select 
                  required
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none transition-all bg-white appearance-none pr-10 font-bold"
                >
                  {Object.values(CompanyType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">تاريخ التأسيس *</label>
              <input 
                required
                type="date"
                name="foundingDate"
                value={formData.foundingDate}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none transition-all bg-gray-50/50 font-bold"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">السنة المالية *</label>
              <input 
                required
                type="number"
                name="financialYear"
                value={formData.financialYear}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none transition-all bg-gray-50/50 font-bold"
                placeholder="2024"
              />
            </div>
          </div>
        </section>

        {/* Section: Official Numbers */}
        <section className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="flex items-center mb-8 theme-text-primary">
            <h4 className="text-xl font-bold ml-3 text-gray-800">الأرقام الرسمية والضريبية</h4>
            <FileBarChart size={22} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">الرقم الوطني للمنشأة *</label>
              <input 
                required
                name="nationalNumber"
                value={formData.nationalNumber}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">رقم التسجيل *</label>
              <input 
                required
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">الرقم الضريبي *</label>
              <div className="space-y-4">
                <input 
                  required
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleInputChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold"
                />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    name="isSubjectToSalesTax"
                    checked={formData.isSubjectToSalesTax}
                    onChange={handleInputChange}
                    className="w-5 h-5 theme-text-primary rounded-md border-gray-300 focus:ring-2 theme-focus-ring"
                  />
                  <span className="text-sm font-bold text-gray-600">خاضعة للضريبة العامة على المبيعات</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3 pt-4 border-t border-gray-50">
              <label className="text-sm font-bold text-gray-600">الضمان الاجتماعي</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-gray-50/50 border border-transparent hover:border-blue-200 transition-all">
                  <input 
                    type="checkbox"
                    id="isNotRegisteredInSS"
                    name="isNotRegisteredInSS"
                    checked={formData.isNotRegisteredInSS}
                    onChange={handleInputChange}
                    className="w-5 h-5 theme-text-primary rounded-md border-gray-300 focus:ring-2 theme-focus-ring"
                  />
                  <span className="text-sm font-bold text-gray-600">الشركة غير مسجلة في الضمان الاجتماعي</span>
                </label>
                {!formData.isNotRegisteredInSS && (
                  <input 
                    name="socialSecurityNumber"
                    value={formData.socialSecurityNumber || ''}
                    onChange={handleInputChange}
                    placeholder="رقم الضمان الاجتماعي للشركة"
                    className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none w-full bg-gray-50/50 font-bold"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section: Sectors */}
        <section className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="flex items-center mb-6 theme-text-primary">
            <h4 className="text-xl font-bold ml-3 text-gray-800">القطاعات</h4>
            <Briefcase size={22} />
          </div>
          <p className="text-sm text-gray-500 mb-6 font-medium">(يمكنك اختيار أكثر من قطاع من خلال الضغط عليها)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {SECTORS.map(sector => (
              <label 
                key={sector} 
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.sectors?.includes(sector) 
                    ? 'theme-bg-primary border-transparent text-white shadow-lg scale-[1.02]' 
                    : 'bg-white border-gray-100 hover:border-blue-200 text-gray-600 shadow-sm'
                }`}
              >
                <input 
                  type="checkbox"
                  className="hidden"
                  checked={formData.sectors?.includes(sector)}
                  onChange={() => handleSectorToggle(sector)}
                />
                <span className="text-sm font-bold">{sector}</span>
                {formData.sectors?.includes(sector) && <Check size={18} className="mr-auto" />}
              </label>
            ))}
          </div>
        </section>

        {/* Section: Address */}
        <section className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="flex items-center mb-8 theme-text-primary">
            <h4 className="text-xl font-bold ml-3 text-gray-800">عنوان الشركة</h4>
            <MapPin size={22} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">الدولة *</label>
              <div className="relative">
                <select 
                  required
                  name="address.country"
                  value={formData.address?.country}
                  onChange={handleInputChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none transition-all bg-white appearance-none pr-10 font-bold"
                >
                  {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">المدينة *</label>
              <div className="relative">
                <select 
                  required
                  name="address.city"
                  value={formData.address?.city}
                  onChange={handleInputChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none transition-all bg-white appearance-none pr-10 font-bold"
                >
                  {availableCities.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">الشارع *</label>
              <input 
                required
                name="address.street"
                value={formData.address?.street || ''}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">اسم المجمع (ان وجد)</label>
              <input 
                name="address.buildingName"
                value={formData.address?.buildingName || ''}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">رقم المجمع *</label>
              <input 
                required
                name="address.buildingNumber"
                value={formData.address?.buildingNumber || ''}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">الطابق *</label>
              <input 
                required
                name="address.floor"
                value={formData.address?.floor || ''}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">رقم المكتب/المحل *</label>
              <input 
                required
                name="address.officeNumber"
                value={formData.address?.officeNumber || ''}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold"
              />
            </div>
          </div>
        </section>

        {/* Section: Authorized Signatory */}
        <section className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="flex items-center mb-8 theme-text-primary">
            <h4 className="text-xl font-bold ml-3 text-gray-800">المفوض بالتوقيع</h4>
            <User size={22} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">اسم المفوض بالتوقيع *</label>
              <input 
                required
                name="signatory.name"
                value={formData.signatory?.name || ''}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">رقم الموبايل *</label>
              <input 
                required
                name="signatory.mobile"
                value={formData.signatory?.mobile || ''}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none text-left bg-gray-50/50 font-bold"
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox"
                id="isEmployee"
                name="signatory.isEmployee"
                checked={formData.signatory?.isEmployee || false}
                onChange={handleInputChange}
                className="w-5 h-5 theme-text-primary rounded-md border-gray-300 focus:ring-2 theme-focus-ring"
              />
              <label htmlFor="isEmployee" className="text-sm font-bold text-gray-600 cursor-pointer">موظف في الشركة</label>
            </div>
          </div>
        </section>

        {/* Section: Financial & Extra Fields */}
        <section className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="flex items-center mb-8 theme-text-primary">
            <h4 className="text-xl font-bold ml-3 text-gray-800">معلومات مالية إضافية</h4>
            <Coins size={22} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">رأس المال المسجل</label>
              <input 
                type="text"
                name="capital"
                value={formData.capital || ''}
                onChange={handleInputChange}
                className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 text-left font-bold"
                dir="ltr"
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">عملة رأس المال</label>
              <div className="relative">
                <select 
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold appearance-none pr-10"
                >
                  {currencies.map(curr => (
                    <option key={curr.id} value={curr.name}>{curr.name} ({curr.code})</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Goals */}
        <section className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="flex items-center justify-between mb-8 theme-text-primary">
            <button 
              type="button" 
              onClick={addGoal}
              className="flex items-center gap-2 text-sm font-bold bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
            >
              <Plus size={18} />
              إضافة غاية جديدة
            </button>
            <div className="flex items-center">
              <h4 className="text-xl font-bold ml-3 text-gray-800">غايات الشركة</h4>
              <Plus size={22} />
            </div>
          </div>

          <div className="space-y-4">
            {formData.goals?.map((goal: string, index: number) => (
              <div key={index} className="flex gap-4">
                <input 
                  required={index < 1} // At least one goal
                  value={goal}
                  onChange={(e) => handleGoalChange(index, e.target.value)}
                  placeholder={`الغاية رقم ${index + 1}`}
                  className="flex-1 p-3.5 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none bg-gray-50/50 font-bold"
                />
                {index > 2 && (
                  <button 
                    type="button" 
                    onClick={() => removeGoal(index)}
                    className="p-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                  >
                    <Minus size={24} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section: Bottom Action Buttons */}
        <section className="flex items-center justify-end gap-4 pt-12 border-t border-gray-200">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-12 py-3.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 font-black transition-all shadow-sm active:scale-95"
          >
            إلغاء
          </button>
          <button 
            type="submit"
            className="px-10 py-3.5 rounded-xl theme-bg-primary text-white hover:opacity-90 font-black flex items-center shadow-lg theme-shadow-primary transition-all hover:scale-[1.02] active:scale-95 gap-3"
          >
            <span>{initialData ? 'تحديث البيانات' : 'حفظ البيانات'}</span>
            <Save size={20} />
          </button>
        </section>
      </div>
    </form>
  );
};

export default CompanyForm;
