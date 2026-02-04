
import React, { useState, useRef } from 'react';
import { Building2, Save, Upload, MapPin, User, FileText, CheckCircle2, Image as ImageIcon, Trash2, ShieldCheck, ChevronDown, Palette, Eye, Coins } from 'lucide-react';
import { Country, Currency } from '../../types';

interface FirmSettings {
  name: string;
  auditorName: string;
  licenseNumber: string;
  address: {
    country: string;
    city: string;
    street: string;
    buildingName: string;
    buildingNumber: string;
    floor: string;
    officeNumber: string;
  };
  logo: string | null;
  stamp: string | null;
  primaryColor: string;
  secondaryColor: string;
  defaultCurrencyId: string;
}

interface FirmSettingsProps {
  settings: FirmSettings;
  onSave: (settings: FirmSettings) => void;
  countries: Country[];
  currencies: Currency[];
}

const FirmSettingsComponent: React.FC<FirmSettingsProps> = ({ settings, onSave, countries, currencies }) => {
  const [formData, setFormData] = useState<FirmSettings>(settings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  const selectedCountryData = countries.find(c => c.name === formData.address.country);
  const availableCities = selectedCountryData?.cities || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');

      if (name === 'address.country') {
        const nextCountry = countries.find(c => c.name === value);
        const nextCity = nextCountry?.cities[0]?.name || '';
        setFormData(prev => ({
          ...prev,
          address: { ...prev.address, country: value, city: nextCity }
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FirmSettings] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [type]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      onSave(formData);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-black text-gray-800">إعدادات المكتب</h3>
          <p className="text-gray-500 text-sm mt-1">تخصيص الهوية البصرية والمعلومات الرسمية للمكتب</p>
        </div>
        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-black">
            <CheckCircle2 size={16} />
            تم الحفظ بنجاح
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="flex items-center gap-3 mb-8 text-indigo-600">
            <Palette size={24} />
            <h4 className="text-xl font-black text-gray-800">الهوية البصرية (Theme)</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between transition-all hover:border-indigo-200">
                <div>
                  <p className="text-sm font-black text-gray-800">اللون الأساسي (Primary)</p>
                  <p className="text-[10px] text-gray-400 font-bold">يستخدم للأزرار، الأيقونات النشطة، والروابط</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-400 uppercase">{formData.primaryColor}</span>
                  <div className="relative group">
                    <input 
                      type="color" 
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleInputChange}
                      className="w-12 h-12 rounded-xl border-4 border-white shadow-md cursor-pointer bg-transparent overflow-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between transition-all hover:border-indigo-200">
                <div>
                  <p className="text-sm font-black text-gray-800">اللون الثانوي (Secondary)</p>
                  <p className="text-[10px] text-gray-400 font-bold">يستخدم لخلفية القائمة الجانبية والعناصر الداكنة</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-400 uppercase">{formData.secondaryColor}</span>
                  <input 
                    type="color" 
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                    className="w-12 h-12 rounded-xl border-4 border-white shadow-md cursor-pointer bg-transparent overflow-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-100/50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <Eye size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider">معاينة حية للمظهر</span>
              </div>
              <div className="flex gap-4">
                <div 
                  className="w-16 h-32 rounded-2xl shadow-lg border border-white/20"
                  style={{ backgroundColor: formData.secondaryColor }}
                >
                  <div className="h-6 w-full border-b border-white/5 p-1">
                    <div className="w-2 h-2 rounded-full opacity-50" style={{ backgroundColor: formData.primaryColor }}></div>
                  </div>
                  <div className="p-2 space-y-2">
                    <div className="h-2 w-full rounded bg-white/10"></div>
                    <div className="h-2 w-3/4 rounded" style={{ backgroundColor: formData.primaryColor }}></div>
                    <div className="h-2 w-1/2 rounded bg-white/10"></div>
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                  <div className="h-8 w-full rounded-xl" style={{ backgroundColor: formData.primaryColor }}></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-lg bg-gray-50 border border-gray-100"></div>
                    <div className="h-6 w-6 rounded-lg" style={{ backgroundColor: formData.primaryColor, opacity: 0.2 }}></div>
                  </div>
                </div>
              </div>
              <p className="text-center text-[9px] font-bold text-gray-400">هذا الشكل تقريبي لما ستظهر عليه واجهة النظام</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full" style={{ backgroundColor: formData.primaryColor }}></div>
          <div className="flex items-center gap-3 mb-8">
            <Building2 size={24} style={{ color: formData.primaryColor }} />
            <h4 className="text-xl font-black">المعلومات الرسمية والمالية</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-black text-gray-500">اسم المكتب / الشركة</label>
              <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-500">اسم المدقق المسؤول</label>
              <input name="auditorName" value={formData.auditorName} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-500">رقم إجازة التدقيق</label>
              <input name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold" />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-black text-gray-500 flex items-center gap-2"><Coins size={14} className="text-amber-500" /> العملة الافتراضية للنظام</label>
              <div className="relative">
                <select 
                  name="defaultCurrencyId" 
                  value={formData.defaultCurrencyId} 
                  onChange={handleInputChange} 
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold appearance-none pr-10"
                >
                  {currencies.map(curr => (
                    <option key={curr.id} value={curr.id}>{curr.name} ({curr.code})</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
              <p className="text-[10px] text-gray-400 font-bold mr-1">هذه العملة ستعتبر الأساس (قيمة الصرف = 1) لجميع العملات الأخرى</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-4" style={{ color: formData.primaryColor }}>
              <ImageIcon size={32} />
            </div>
            <h4 className="text-lg font-black text-gray-800">شعار المكتب (Logo)</h4>
            <div className="mt-8 w-full">
              {formData.logo ? (
                <div className="relative group">
                  <img src={formData.logo} alt="Logo" className="w-full max-h-48 object-contain rounded-2xl p-4 bg-gray-50 border border-dashed border-gray-200" />
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, logo: null }))} className="absolute top-2 left-2 p-2 bg-red-100 text-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => logoInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-all text-gray-400 font-black">
                  <Upload size={32} />
                  <span>رفع الشعار</span>
                </button>
              )}
              <input type="file" ref={logoInputRef} className="hidden" accept=".jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'logo')} />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h4 className="text-lg font-black text-gray-800">ختم المكتب (Stamp)</h4>
            <div className="mt-8 w-full">
              {formData.stamp ? (
                <div className="relative group">
                  <img src={formData.stamp} alt="Stamp" className="w-full max-h-48 object-contain rounded-2xl p-4 bg-gray-50 border border-dashed border-gray-200" />
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, stamp: null }))} className="absolute top-2 left-2 p-2 bg-red-100 text-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => stampInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-all text-gray-400 font-black">
                  <Upload size={32} />
                  <span>رفع الختم الرسمي</span>
                </button>
              )}
              <input type="file" ref={stampInputRef} className="hidden" accept=".jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'stamp')} />
            </div>
          </div>
        </div>

        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8 text-red-600">
            <MapPin size={24} />
            <h4 className="text-xl font-black text-gray-800">عنوان المكتب التفصيلي</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-500">الدولة</label>
              <select name="address.country" value={formData.address.country} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold">
                {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-500">المدينة</label>
              <select name="address.city" value={formData.address.city} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold">
                {availableCities.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-black text-gray-500">الشارع</label>
              <input name="address.street" value={formData.address.street} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold" placeholder="اسم الشارع الرئيسي" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-500">اسم المجمع (إن وجد)</label>
              <input name="address.buildingName" value={formData.address.buildingName} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-500">رقم المجمع</label>
              <input name="address.buildingNumber" value={formData.address.buildingNumber} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-500">الطابق</label>
              <input name="address.floor" value={formData.address.floor} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-500">رقم المكتب</label>
              <input name="address.officeNumber" value={formData.address.officeNumber} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 theme-focus-ring outline-none font-bold" />
            </div>
          </div>
        </section>

        <div className="fixed bottom-8 left-8 z-20">
          <button 
            type="submit"
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-4 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: formData.primaryColor }}
          >
            {saveStatus === 'saving' ? 'جاري الحفظ...' : (
              <>
                <Save size={24} />
                <span className="text-lg">حفظ كافة التعديلات</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FirmSettingsComponent;
