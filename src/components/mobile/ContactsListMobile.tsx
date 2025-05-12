import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Search, Phone, Mail, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  telephone?: string;
  mobile?: string;
  job_title?: string;
  is_primary: boolean;
}

interface ContactsListMobileProps {
  contacts: Contact[];
  onAdd?: () => void;
}

export function ContactsListMobile({ contacts, onAdd }: ContactsListMobileProps) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { id: companyId } = useParams();

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return contacts.filter(c =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.job_title?.toLowerCase().includes(s)
    );
  }, [contacts, search]);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="flex items-center justify-between p-4">
          <div className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] rounded-full cursor-pointer"
               onClick={() => navigate(`/mobile/company/${companyId}`)}>
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </div>
          <h1 className="text-lg font-semibold">Contacts</h1>
          <div className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] rounded-full cursor-pointer"
               onClick={onAdd}>
            <Plus className="h-6 w-6 text-gray-600" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-[#f0f2f5] border-0 h-12 text-base rounded-xl w-full placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="pt-32 px-4 pb-20">
        <div className="space-y-4">
          {filtered.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-[#4CAF50]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </h3>
                    {contact.is_primary && (
                      <span className="text-xs px-2 py-0.5 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                  {contact.job_title && (
                    <p className="text-sm text-gray-500 mb-2">{contact.job_title}</p>
                  )}
                  <div className="flex flex-col gap-2">
                    {contact.mobile && (
                      <a href={`tel:${contact.mobile}`} className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-[#4CAF50]" />
                        {contact.mobile}
                      </a>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-[#4CAF50]" />
                        {contact.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 