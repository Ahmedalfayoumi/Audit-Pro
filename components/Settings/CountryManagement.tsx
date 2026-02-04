
import React, { useState } from 'react';
import { Globe, Plus, MapPin, Trash2, Edit2, Search, X, Save, List, LayoutGrid, AlertTriangle } from 'lucide-react';
import { Country, City, Company } from '../../types';

interface CountryManagementProps {
  countries: Country[];
  onUpdate: (countries: Country[]) => void;
  companies: Company[];
}

const CountryManagement: React.FC<CountryManagementProps> = ({ countries, onUpdate, companies }) => {
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(countries[0]?.id || null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const [newCountry, setNewCountry] = useState({ name: '', code: '' });
  const [newCityName, setNewCityName] = useState('');

  const selectedCountry = countries.find(c => c.id === selectedCountryId);

  // التحقق من الارتباط
  const isCountryLinked = (countryName: string) => companies.some(c => c.address.country === countryName);
  const isCityLinked = (cityName: string, countryName: string) => companies.some(c => c.address.country === countryName && c.address.city === cityName);

  const handleOpenEditCountry = (country: Country) => {
    if (isCountryLinked(country.name)) {
      alert(`لا يمكن تعديل الدولة "${country.name}" لوجود شركات مرتبطة بها حالياً.`);
      return;
    }
    setEditingCountry(country);
    setNewCountry({ name: country.name, code: country.code });
    setShowCountryModal(true);
  };

  const handleOpenEditCity = (city: City) => {
    if (selectedCountry && isCityLinked(city.name, selectedCountry.name)) {
      alert(`لا يمكن تعديل المدينة "${city.name}" لوجود شركات مرتبطة بها في هذا البلد.`);
      return;
    }
    setEditingCity(city);
    setNewCityName(city.name);
    setShowCityModal(true);
  };

  const handleAddCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountry.name || !newCountry.code) return;

    if (editingCountry) {
      onUpdate(countries.map(c => c.id === editingCountry.id ? { ...c, name: newCountry.name, code: newCountry.code.toUpperCase() } : c));
    } else {
      const country: Country = { id: Math.random().toString(36).substr(2, 9), name: newCountry.name, code: newCountry.code.toUpperCase(), cities: [], };
      onUpdate([...countries, country]);
      setSelectedCountryId(country.id);
    }
    setNewCountry({ name: '', code: '' });
    setEditingCountry(null);
    setShowCountryModal(false);
  };

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName || !selectedCountryId) return;

    if (editingCity) {
      onUpdate(countries.map(c => c.id === selectedCountryId 
        ? { ...c, cities: c.cities.map(ct => ct.id === editingCity.id ? { ...ct, name: newCityName } : ct) } 
        : c 
      ));
    } else {
      const city: City = { id: Math.random().toString(36).substr(2, 9), name: newCityName, };
      onUpdate(countries.map(c => c.id === selectedCountryId ? { ...c, cities: [...c.cities, city] } : c ));
    }
    setNewCityName('');
    setEditingCity(null);
    setShowCityModal(false);
  };

  const deleteCity = (cityId: string, cityName: string) => { 
    if (selectedCountry && isCityLinked(cityName, selectedCountry.name)) {
      alert(`فشل الحذف: المدينة "${cityName}" مرتبطة بشركات مسجلة حالياً.`);
      return;
    }

    if (confirm(`هل أنت متأكد من حذف المدينة "${cityName}"؟`)) {
      onUpdate(countries.map(c => c.id === selectedCountryId ? { ...c, cities: c.cities.filter(city => city.id !== cityId) } : c )); 
    }
  };

  const deleteCountry = (id: string, countryName: string) => {
    if (isCountryLinked(countryName)) {
      alert(`فشل الحذف: الدولة "${countryName}" مرتبطة بشركات مسجلة حالياً.`);
      return;
    }

    if (confirm(`هل أنت متأكد من حذف الدولة "${countryName}" وجميع مدنها؟`)) {
      const updated = countries.filter(c => c.id !== id);
      onUpdate(updated);
      if (selectedCountryId === id) { setSelectedCountryId(updated[0]?.id || null); }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-end mb-4">
        <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex gap-1">
          <button 
            onClick={() => setCurrentView('list')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'list' ? 'theme-bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <List size={16} /> قائمة
          </button>
          <button 
            onClick={() => setCurrentView('grid')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'grid' ? 'theme-bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <LayoutGrid size={16} /> شبكة
          </button>
        </div>
      </div>

      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {countries.map((country) => {
            const isLinked = isCountryLinked(country.name);
            return (
              <div 
                key={country.id} 
                onClick={() => { setSelectedCountryId(country.id); setCurrentView('list'); }}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black">
                    <Globe size={24} />
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 bg-gray-100 text-gray-500 rounded-lg">{country.code}</span>
                </div>
                <h4 className="font-black text-gray-800 text-lg mb-2">{country.name}</h4>
                <p className="text-xs font-bold text-gray-400 mb-6 flex items-center gap-2"><MapPin size={14}/> {country.cities.length} مدينة مسجلة</p>
                <div className="pt-4 border-t border-gray-50 flex justify-between">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenEditCountry(country); }} 
                    className={`text-[10px] font-black ${isLinked ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 group-hover:underline'}`}
                  >
                    تعديل
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteCountry(country.id, country.name); }}
                    className={`${isLinked ? 'text-gray-200 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          <div 
            onClick={() => { setEditingCountry(null); setNewCountry({name: '', code: ''}); setShowCountryModal(true); }}
            className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer gap-2"
          >
            <Plus size={32} />
            <span className="text-xs font-black">إضافة دولة جديدة</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-black text-gray-800">الدول</h4>
              <button onClick={() => { setEditingCountry(null); setNewCountry({name: '', code: ''}); setShowCountryModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Plus size={20} /></button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50"><div className="relative"><Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="بحث عن دولة..." className="w-full pr-9 pl-3 py-2 bg-gray-50 border-none rounded-lg text-xs outline-none" /></div></div>
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto custom-scrollbar">
                {countries.map((country) => {
                  const isLinked = isCountryLinked(country.name);
                  return (
                    <div key={country.id} className="group flex items-center bg-white">
                      <button onClick={() => setSelectedCountryId(country.id)} className={`flex-1 text-right p-4 flex items-center justify-between transition-all ${selectedCountryId === country.id ? 'theme-bg-primary text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
                        <div className="flex items-center gap-3"><Globe size={18} /><span className="font-bold">{country.name}</span></div>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${selectedCountryId === country.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{country.code}</span>
                      </button>
                      <div className="flex">
                        <button 
                          onClick={() => handleOpenEditCountry(country)} 
                          className={`p-4 transition-all border-r border-gray-50 opacity-0 group-hover:opacity-100 ${isLinked ? 'text-gray-200 cursor-not-allowed' : (selectedCountryId === country.id ? 'text-white hover:bg-white/10' : 'text-blue-400 hover:text-blue-600')}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteCountry(country.id, country.name)} 
                          className={`p-4 transition-all border-r border-gray-50 opacity-0 group-hover:opacity-100 ${isLinked ? 'text-gray-200 cursor-not-allowed' : (selectedCountryId === country.id ? 'text-white hover:bg-white/10' : 'text-red-400 hover:text-red-600')}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2"><h4 className="font-black text-gray-800">{selectedCountry ? `المدن في ${selectedCountry.name}` : 'اختر دولة لعرض المدن'}</h4>{selectedCountry && ( <button onClick={() => { setEditingCity(null); setNewCityName(''); setShowCityModal(true); }} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-100 transition-all"><Plus size={16} /> إضافة مدينة</button> )}</div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6">
                {selectedCountry?.cities.map((city) => {
                  const isLinked = isCityLinked(city.name, selectedCountry.name);
                  return (
                    <div key={city.id} className="group flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-white transition-all shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><MapPin size={16} /></div><span className="font-bold text-gray-700 text-sm sm:text-base">{city.name}</span></div>
                      <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEditCity(city)} 
                          className={`p-1.5 rounded-lg ${isLinked ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteCity(city.id, city.name)} 
                          className={`p-1.5 rounded-lg ${isLinked ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!selectedCountry || selectedCountry.cities.length === 0) && ( <div className="col-span-1 sm:col-span-2 py-24 flex flex-col items-center justify-center text-gray-400 gap-4"><MapPin size={48} strokeWidth={1} /><p className="italic font-bold">لا توجد مدن مضافة لهذه الدولة</p></div> )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCountryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50"><h4 className="text-lg font-black text-gray-800">{editingCountry ? 'تعديل الدولة' : 'إضافة دولة جديدة'}</h4><button onClick={() => setShowCountryModal(false)} className="p-2 hover:bg-gray-200 rounded-xl"><X size={20} /></button></div>
            <form onSubmit={handleAddCountry} className="p-5 space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500">اسم الدولة</label><input required value={newCountry.name} onChange={e => setNewCountry({...newCountry, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none font-bold" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500">الرمز (ISO)</label><input required value={newCountry.code} onChange={e => setNewCountry({...newCountry, code: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none uppercase text-left font-bold" maxLength={3} /></div>
              <button type="submit" className="w-full theme-bg-primary text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-95"><Save size={18} /> {editingCountry ? 'تحديث' : 'حفظ'}</button>
            </form>
          </div>
        </div>
      )}
      {showCityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50"><h4 className="text-lg font-black text-gray-800 leading-tight">{editingCity ? 'تعديل مدينة' : `إضافة مدينة إلى ${selectedCountry?.name}`}</h4><button onClick={() => setShowCityModal(false)} className="p-2 hover:bg-gray-200 rounded-xl"><X size={20} /></button></div>
            <form onSubmit={handleAddCity} className="p-5 space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500">اسم المدينة</label><input required value={newCityName} onChange={e => setNewCityName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 theme-focus-ring outline-none font-bold" autoFocus /></div>
              <button type="submit" className="w-full theme-bg-primary text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 active:scale-95 shadow-lg"><Save size={18} /> {editingCity ? 'تحديث' : 'إضافة'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryManagement;
