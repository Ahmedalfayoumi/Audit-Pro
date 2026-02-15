
import React, { useState, useMemo } from 'react';
import { 
  Building2, Users, FileShield, Search, Filter, 
  ChevronLeft, Plus, Mail, Phone, Calendar, 
  CheckCircle2, AlertCircle, Clock, ArrowLeft,
  Briefcase, MoreHorizontal, UserCheck, ShieldCheck, List, LayoutGrid, Hash
} from 'lucide-react';
import { Company, ClientContact, ClientLegalDocument } from '../../types';
import ClientDetailView from './ClientDetailView';

interface ClientDatabaseProps {
  companies: Company[];
  onAddClient: () => void;
  contacts: ClientContact[];
  setContacts: React.Dispatch<React.SetStateAction<ClientContact[]>>;
  documents: ClientLegalDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<ClientLegalDocument[]>>;
}

const ClientDatabase: React.FC<ClientDatabaseProps> = ({ 
  companies, 
  onAddClient, 
  contacts, 
  setContacts, 
  documents, 
  setDocuments 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase().trim();
    return companies.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.nationalNumber.includes(q)
    );
  }, [companies, searchQuery]);

  const selectedClient = companies.find(c => c.id === selectedClientId);

  if (selectedClientId && selectedClient) {
    return (
      <ClientDetailView 
        client={selectedClient} 
        onBack={() => setSelectedClientId(null)} 
        contacts={contacts.filter(c => c.companyId === selectedClient.id)}
        allContacts={contacts}
        setAllContacts={setContacts}
        documents={documents.filter(d => d.companyId === selectedClient.id)}
        allDocuments={documents}
        setAllDocuments={setDocuments}
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-10" dir="rtl">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-800">قاعدة بيانات العملاء</h3>
          <p className="text-gray-500 text-sm mt-1 font-medium">نظام إدارة بيانات العملاء، جهات الاتصال، والوثائق القانونية</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="بحث في أسماء العملاء..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex gap-1">
            <button 
              onClick={() => setCurrentView('list')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <List size={16} /> قائمة
            </button>
            <button 
              onClick={() => setCurrentView('grid')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-black ${currentView === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={16} /> شبكة
            </button>
          </div>

          <button 
            onClick={onAddClient}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> إضافة عميل جديد
          </button>
        </div>
      </div>

      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-blue-600/0 group-hover:bg-blue-600 transition-all"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">
                  {client.name.charAt(0)}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {client.type}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black">
                    <CheckCircle2 size={10} /> نشط
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-black text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {client.name}
              </h4>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Briefcase size={14} className="text-blue-400" />
                  <span className="truncate">{client.sectors.join('، ')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <ShieldCheck size={14} className="text-blue-400" />
                  <span>رقم وطني: {client.nationalNumber}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex -space-x-2 space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400" title="المفوض">
                    {client.signatory.name.charAt(0)}
                  </div>
                </div>
                <button className="text-blue-600 text-[11px] font-black flex items-center gap-1 group-hover:underline">
                  الملف الكامل <ChevronLeft size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-5 font-black text-gray-500 text-xs uppercase tracking-wider">العميل</th>
                  <th className="p-5 font-black text-gray-500 text-xs uppercase tracking-wider text-center">الرقم الوطني</th>
                  <th className="p-5 font-black text-gray-500 text-xs uppercase tracking-wider">القطاعات</th>
                  <th className="p-5 font-black text-gray-500 text-xs uppercase tracking-wider text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id} 
                    onClick={() => setSelectedClientId(client.id)}
                    className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm">{client.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{client.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                       <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600">
                        <Hash size={14} className="text-gray-300" />
                        <span>{client.nationalNumber}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {client.sectors.slice(0, 2).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-black">{s}</span>
                        ))}
                        {client.sectors.length > 2 && <span className="text-[9px] text-gray-400">+{client.sectors.length - 2}</span>}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                       <button className="text-blue-600 text-[11px] font-black flex items-center gap-1 justify-center group-hover:underline">
                        عرض التفاصيل <ChevronLeft size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredClients.length === 0 && (
        <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 opacity-50">
          <Building2 size={64} className="mb-4" />
          <p className="font-black italic">لا يوجد عملاء يطابقون بحثك</p>
        </div>
      )}
    </div>
  );
};

export default ClientDatabase;
