
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
      <div className="flex items-center mb-6 sm:mb-8 pb-4 border-b border-gray-100 lg:border-none">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
          {initialData ? 'تعديل بيانات الشركة' : 'إضافة شركة جديدة'}
          <Building className="text-blue-600 hidden sm:block" size={28} />
        </h3>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Basic Info */}
        <section className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center mb-6 sm:mb-8 border-r-4 border-blue-600 pr-4">
            <h4 className="text-lg sm:text-xl font-black text-gray-800 ml-3">المعلومات الأساسية</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-gray-600">اسم الشركة (حسب السجل التجاري) *</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="p-3 sm:p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 font-bold text-sm text-gray-900"
                placeholder="أدخل اسم الشركة بالكامل"
              />
            </div>
            
            <div className="flex flex-col gap-2 relative">
              <label className="text-xs sm:text-sm font-bold text-gray-600">نوع الشركة *</label>
              <div className="relative">
                <select 
                  required
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white appearance-none pr-10 font-bold text-sm text-gray-900"
                >
                  {Object.values(CompanyType).map(type => (
                    <option key={type} value={type} className="text-gray-900">{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-gray-600">تاريخ التأسيس *</label>
              <input 
                required
                type="date"
                name="foundingDate"
                value={formData.foundingDate}
                onChange={handleInputChange}
                className="p-3 sm:p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 font-bold text-sm text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-gray-600">السنة المالية *</label>
              <input 
                required
                type="number"
                name="financialYear"
                value={formData.financialYear}
                onChange={handleInputChange}
                className="p-3 sm:p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 font-bold text-sm text-gray-900"
                placeholder="2024"
              />
            </div>
          </div>
        </section>

        {/* Official Numbers */}
        <section className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center mb-6 sm:mb-8 border-r-4 border-blue-600 pr-4">
            <h4 className="text-lg sm:text-xl font-black text-gray-800 ml-3">الأرقام الرسمية والضريبية</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-gray-600">الرقم الوطني للمنشأة *</label>
              <input 
                required
                name="nationalNumber"
                value={formData.nationalNumber}
                onChange={handleInputChange}
                className="p-3 sm:p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 font-bold text-sm text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-gray-600">رقم التسجيل *</label>
              <input 
                required
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="p-3 sm:p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 font-bold text-sm text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-gray-600">الرقم الضريبي *</label>
              <div className="space-y-4">
                <input 
                  required
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 font-bold text-sm text-gray-900"
                />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    name="isSubjectToSalesTax"
                    checked={formData.isSubjectToSalesTax}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm font-bold text-gray-600">خاضعة لضريبة المبيعات</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3 pt-4 border-t border-gray-50">
              <label className="text-xs sm:text-sm font-bold text-gray-600">الضمان الاجتماعي</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
                <label className="flex items-center gap-3 cursor-pointer p-3 sm:p-4 rounded-xl bg-gray-50/50 border border-transparent hover:border-blue-200 transition-all">
                  <input 
                    type="checkbox"
                    id="isNotRegisteredInSS"
                    name="isNotRegisteredInSS"
                    checked={formData.isNotRegisteredInSS}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm font-bold text-gray-600 leading-tight">الشركة غير مسجلة في الضمان</span>
                </label>
                {!formData.isNotRegisteredInSS && (
                  <input 
                    name="socialSecurityNumber"
                    value={formData.socialSecurityNumber || ''}
                    onChange={handleInputChange}
                    placeholder="رقم الضمان الاجتماعي"
                    className="p-3 sm:p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full bg-gray-50/50 font-bold text-sm text-gray-900"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sectors */}
        <section className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center mb-6 border-r-4 border-blue-600 pr-4">
            <h4 className="text-lg sm:text-xl font-black text-gray-800 ml-3">القطاعات</h4>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mb-6 font-medium">(يمكنك اختيار أكثر من قطاع)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {SECTORS.map(sector => (
              <label 
                key={sector} 
                className={`flex items-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.sectors?.includes(sector) 
                    ? 'bg-blue-600 border-transparent text-white shadow-lg scale-[1.02]' 
                    : 'bg-white border-gray-100 hover:border-blue-200 text-gray-600 shadow-sm'
                }`}
              >
                <input 
                  type="checkbox"
                  className="hidden"
                  checked={formData.sectors?.includes(sector)}
                  onChange={() => handleSectorToggle(sector)}
                />
                <span className="text-[11px] sm:text-sm font-black truncate">{sector}</span>
                {formData.sectors?.includes(sector) && <Check size={16} className="mr-auto shrink-0" />}
              </label>
            ))}
          </div>
        </section>

        {/* Goals */}
        <section className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="border-r-4 border-blue-600 pr-4">
              <h4 className="text-lg sm:text-xl font-black text-gray-800">غايات الشركة</h4>
            </div>
            <button 
              type="button" 
              onClick={addGoal}
              className="flex items-center gap-2 text-xs font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all shadow-sm active:scale-95"
            >
              <Plus size={16} /> إضافة غاية
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {formData.goals?.map((goal: string, index: number) => (
              <div key={index} className="flex gap-2 sm:gap-4">
                <input 
                  required={index < 1}
                  value={goal}
                  onChange={(e) => handleGoalChange(index, e.target.value)}
                  placeholder={`الغاية رقم ${index + 1}`}
                  className="flex-1 p-3 sm:p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 font-bold text-sm text-gray-900"
                />
                {index > 2 && (
                  <button 
                    type="button" 
                    onClick={() => removeGoal(index)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 shrink-0"
                  >
                    <Minus size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-8 border-t border-gray-200">
          <button 
            type="button" 
            onClick={onCancel}
            className="w-full sm:w-auto px-10 py-3 sm:py-3.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 font-black transition-all shadow-sm active:scale-95 text-sm"
          >
            إلغاء
          </button>
          <button 
            type="submit"
            className="w-full sm:w-auto px-10 py-3 sm:py-3.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-black flex items-center justify-center shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 gap-3 text-sm"
          >
            <span className="opacity-100 visible">{initialData ? 'تحديث البيانات' : 'حفظ البيانات'}</span>
            <Save size={18} />
          </button>
        </section>
      </div>
    </form>
  );
};

export default CompanyForm;
