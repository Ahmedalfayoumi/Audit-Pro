
import React, { useState } from 'react';
import { 
  ArrowRight, Users, ShieldCheck, Mail, Phone, Plus, 
  Trash2, Edit3, CheckCircle2, AlertTriangle, FileText, 
  MapPin, Globe, History, Download, ExternalLink, Calendar, X
} from 'lucide-react';
import { Company, ClientContact, ClientLegalDocument } from '../../types';

interface ClientDetailViewProps {
  client: Company;
  onBack: () => void;
  contacts: ClientContact[];
  allContacts: ClientContact[];
  setAllContacts: React.Dispatch<React.SetStateAction<ClientContact[]>>;
  documents: ClientLegalDocument[];
  allDocuments: ClientLegalDocument[];
  setAllDocuments: React.Dispatch<React.SetStateAction<ClientLegalDocument[]>>;
}

const ClientDetailView: React.FC<ClientDetailViewProps> = ({ 
  client, 
  onBack, 
  contacts, 
  allContacts, 
  setAllContacts, 
  documents, 
  allDocuments, 
  setAllDocuments 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'vault' | 'history'>('overview');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  const [contactForm, setContactForm] = useState({ name: '', role: '', phone: '', email: '', isPrimary: false });
  const [docForm, setDocForm] = useState({ type: 'Trade License' as any, documentNumber: '', issueDate: '', expiryDate: '' });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    const newContact: ClientContact = {
      id: Math.random().toString(36).substr(2, 9),
      companyId: client.id,
      ...contactForm
    };
    setAllContacts([...allContacts, newContact]);
    setShowContactModal(false);
    setContactForm({ name: '', role: '', phone: '', email: '', isPrimary: false });
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: ClientLegalDocument = {
      id: Math.random().toString(36).substr(2, 9),
      companyId: client.id,
      ...docForm
    };
    setAllDocuments([...allDocuments, newDoc]);
    setShowDocModal(false);
    setDocForm({ type: 'Trade License', documentNumber: '', issueDate: '', expiryDate: '' });
  };

  const deleteContact = (id: string) => {
    if (confirm('هل أنت متأكد من حذف جهة الاتصال هذه؟')) {
      setAllContacts(allContacts.filter(c => c.id !== id));
    }
  };

  const deleteDoc = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) {
      setAllDocuments(allDocuments.filter(d => d.id !== id));
    }
  };

  return (
    <div className="animate-in slide-in-from-left-4 duration-500 text-right" dir="rtl">
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-500"><ArrowRight size={24} /></button>
            <div>
              <div className="flex items-center gap-3 mb-1"><h2 className="text-2xl font-black text-gray-800">{client.name}</h2><span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase">نشط</span></div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400"><p className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500"/> {client.address.city}، {client.address.street}</p><span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span><p className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500"/> تأسيس: {client.foundingDate}</p></div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto"><button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"><Download size={18} /> تصدير الملف</button></div>
        </div>
        <div className="flex items-center gap-2 mt-10 p-1 bg-gray-50 rounded-2xl w-fit">
          {['overview', 'contacts', 'vault', 'history'].map((t: any) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{t === 'overview' ? 'نظرة عامة' : t === 'contacts' ? 'جهات الاتصال' : t === 'vault' ? 'الخزنة القانونية' : 'تاريخ النشاط'}</button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"><h4 className="font-black text-gray-800 mb-6 flex items-center gap-2 border-b pb-4"><FileText size={20} className="text-blue-600" /> معلومات السجل التجاري</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8"><div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">الرقم الوطني</p><p className="font-bold text-gray-700">{client.nationalNumber}</p></div><div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">رقم التسجيل</p><p className="font-bold text-gray-700">{client.registrationNumber}</p></div><div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">رأس المال</p><p className="font-bold text-blue-600">{client.capital} {client.currency}</p></div><div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">السنة المالية</p><p className="font-bold text-gray-700">{client.financialYear}</p></div></div></div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"><h4 className="font-black text-gray-800 mb-6 flex items-center gap-2 border-b pb-4"><Globe size={20} className="text-blue-600" /> الغايات والأهداف</h4><div className="space-y-4">{client.goals.map((goal, i) => (<div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-600 border border-transparent hover:border-blue-100 transition-all"><span className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-blue-600 shadow-sm">{i+1}</span>{goal}</div>))}</div></div>
            </div>
            <div className="space-y-8">
              <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 relative overflow-hidden"><Users size={80} className="absolute -bottom-4 -left-4 opacity-10" /><h5 className="font-black mb-4">جهة الاتصال الرئيسية</h5><p className="text-lg font-black">{client.signatory.name}</p><p className="text-indigo-200 text-xs font-bold mb-6">المفوض بالتوقيع</p><div className="space-y-3"><div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-xl backdrop-blur-sm"><Phone size={16} /> <span dir="ltr">{client.signatory.mobile}</span></div></div></div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
            <div className="flex justify-between items-center border-b pb-4"><h4 className="font-black text-gray-800 flex items-center gap-2"><Users size={20} className="text-blue-600" /> دليل جهات الاتصال</h4><button onClick={() => setShowContactModal(true)} className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-100 transition-all"><Plus size={16} /> إضافة جهة اتصال</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contacts.map(contact => (
                <div key={contact.id} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-blue-200 transition-all relative group">
                  {contact.isPrimary && <span className="absolute top-4 left-4 px-2 py-0.5 bg-blue-600 text-white rounded text-[8px] font-black uppercase">الأساسي</span>}
                  <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-blue-600">{contact.name.charAt(0)}</div><div><p className="font-black text-gray-800">{contact.name}</p><p className="text-[10px] font-bold text-gray-400">{contact.role}</p></div></div>
                  <div className="space-y-2 mb-4"><p className="text-xs font-bold text-gray-600 flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {contact.phone}</p><p className="text-xs font-bold text-gray-600 flex items-center gap-2"><Mail size={14} className="text-gray-400"/> {contact.email}</p></div>
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => deleteContact(contact.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button></div>
                </div>
              ))}
              {contacts.length === 0 && <div className="col-span-full py-10 text-center text-gray-400 font-bold italic">لا توجد جهات اتصال مضافة بعد</div>}
            </div>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
            <div className="flex justify-between items-center border-b pb-4"><h4 className="font-black text-gray-800 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-600" /> الخزنة القانونية (Documents)</h4><button onClick={() => setShowDocModal(true)} className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-100 transition-all"><Plus size={16} /> رفع وثيقة جديدة</button></div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="p-4 text-xs font-black text-gray-500">نوع الوثيقة</th><th className="p-4 text-xs font-black text-gray-500">الرقم المرجعي</th><th className="p-4 text-xs font-black text-gray-500">تاريخ الانتهاء</th><th className="p-4 text-xs font-black text-gray-500 text-center">الحالة</th><th className="p-4 text-xs font-black text-gray-500 text-center">الإجراءات</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {documents.map(doc => {
                    const isExpiring = new Date(doc.expiryDate).getTime() < new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
                    return (
                      <tr key={doc.id} className="hover:bg-blue-50/20 transition-all">
                        <td className="p-4"><p className="font-bold text-gray-700 text-sm">{doc.type}</p><p className="text-[10px] text-gray-400 font-bold">صادر بتاريخ: {doc.issueDate}</p></td>
                        <td className="p-4 font-mono text-xs font-bold text-gray-500">{doc.documentNumber}</td>
                        <td className="p-4 font-bold text-gray-700 text-xs">{doc.expiryDate}</td>
                        <td className="p-4 text-center">{isExpiring ? (<span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black"><AlertTriangle size={10} /> تنتهي قريباً</span>) : (<span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black"><CheckCircle2 size={10} /> سارية</span>)}</td>
                        <td className="p-4"><div className="flex justify-center gap-2"><button onClick={() => deleteDoc(doc.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button></div></td>
                      </tr>
                    );
                  })}
                  {documents.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-400 font-bold italic">لا توجد وثائق قانونية مسجلة</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showContactModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50"><h4 className="text-lg font-black text-gray-800">إضافة جهة اتصال</h4><button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-gray-200 rounded-xl"><X size={20}/></button></div>
            <form onSubmit={handleAddContact} className="p-6 space-y-4">
              <div><label className="text-xs font-black text-gray-500 mb-1 block">الاسم</label><input required value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="w-full p-3 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
              <div><label className="text-xs font-black text-gray-500 mb-1 block">المسمى الوظيفي</label><input required value={contactForm.role} onChange={e => setContactForm({...contactForm, role: e.target.value})} className="w-full p-3 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
              <div><label className="text-xs font-black text-gray-500 mb-1 block">الهاتف</label><input required value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} className="w-full p-3 border border-gray-100 rounded-xl font-bold text-sm text-left outline-none" dir="ltr" /></div>
              <div><label className="text-xs font-black text-gray-500 mb-1 block">البريد</label><input type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="w-full p-3 border border-gray-100 rounded-xl font-bold text-sm text-left outline-none" dir="ltr" /></div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all">حفظ جهة الاتصال</button>
            </form>
          </div>
        </div>
      )}

      {showDocModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50"><h4 className="text-lg font-black text-gray-800">إضافة وثيقة رسمية</h4><button onClick={() => setShowDocModal(false)} className="p-2 hover:bg-gray-200 rounded-xl"><X size={20}/></button></div>
            <form onSubmit={handleAddDoc} className="p-6 space-y-4">
              <div><label className="text-xs font-black text-gray-500 mb-1 block">نوع الوثيقة</label><select value={docForm.type} onChange={e => setDocForm({...docForm, type: e.target.value as any})} className="w-full p-3 border border-gray-100 rounded-xl font-bold text-sm outline-none"><option value="Trade License">رخصة تجارية</option><option value="Tax Certificate">شهادة ضريبية</option><option value="Articles of Association">عقد التأسيس</option></select></div>
              <div><label className="text-xs font-black text-gray-500 mb-1 block">رقم الوثيقة</label><input required value={docForm.documentNumber} onChange={e => setDocForm({...docForm, documentNumber: e.target.value})} className="w-full p-3 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
              <div><label className="text-xs font-black text-gray-500 mb-1 block">تاريخ الإصدار</label><input required type="date" value={docForm.issueDate} onChange={e => setDocForm({...docForm, issueDate: e.target.value})} className="w-full p-3 border border-gray-100 rounded-xl font-bold text-sm outline-none" /></div>
              <div><label className="text-xs font-black text-gray-500 mb-1 block">تاريخ الانتهاء</label><input required type="date" value={docForm.expiryDate} onChange={e => setDocForm({...docForm, expiryDate: e.target.value})} className="w-full p-3 border border-gray-100 rounded-xl font-bold text-sm outline-none" /></div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all">حفظ الوثيقة</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetailView;
