import React from 'react';
import { SingleContactView } from './SingleContactView';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  telephone?: string;
  mobile?: string;
  job_title?: string;
  is_primary?: boolean;
  has_system_access?: boolean;
}

interface ContactInfoCardProps {
  contacts: Contact[];
  title?: string;
  showHeader?: boolean;
  onEditContact?: (contactId: string) => void;
  onDeleteContact?: (contactId: string) => void;
}

export function ContactInfoCard({
  contacts,
  title = "Contact Information",
  showHeader = true,
  onEditContact,
  onDeleteContact
}: ContactInfoCardProps) {
  if (!contacts || contacts.length === 0) {
    return null;
  }

  return (
    <div>
      {showHeader && title && (
        <h3 className="text-lg font-medium mb-2">{title}</h3>
      )}
      <div className="space-y-2">
        {contacts.map(contact => (
          <SingleContactView
            key={contact.id}
            id={contact.id}
            first_name={contact.first_name}
            last_name={contact.last_name}
            job_title={contact.job_title}
            email={contact.email}
            telephone={contact.telephone}
            mobile={contact.mobile}
            is_primary={contact.is_primary}
            has_system_access={contact.has_system_access}
            onEdit={onEditContact}
            onDelete={onDeleteContact}
          />
        ))}
      </div>
    </div>
  );
} 