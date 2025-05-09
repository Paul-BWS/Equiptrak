import React from 'react';
import { Mail, Phone, Smartphone, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactProps {
  id: string;
  first_name: string;
  last_name: string;
  job_title?: string;
  email?: string;
  telephone?: string;
  mobile?: string;
  is_primary?: boolean;
  has_system_access?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  iconColor?: string;
}

export function SingleContactView({
  id,
  first_name,
  last_name,
  job_title,
  email,
  telephone,
  mobile,
  is_primary,
  has_system_access,
  onEdit,
  onDelete,
  iconColor = "#000000"
}: ContactProps) {
  return (
    <div className="p-4 border rounded-md bg-white shadow hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        {/* Contact name and badges section */}
        <div className="flex flex-wrap items-center gap-2 min-w-[200px]">
          <h3 className="font-medium text-base">{first_name} {last_name}</h3>
          {is_primary && (
            <span className="bg-a6e15a text-black text-xs px-2 py-0.5 rounded-full">
              Primary
            </span>
          )}
          {has_system_access && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              System Access
            </span>
          )}
          {job_title && (
            <span className="text-sm text-gray-500">{job_title}</span>
          )}
        </div>
        
        {/* Contact details section - spread out evenly */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          {email && (
            <a href={`mailto:${email}`} className="flex items-center text-blue-600 hover:underline text-sm">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{email}</span>
            </a>
          )}
          {telephone && (
            <a href={`tel:${telephone}`} className="flex items-center hover:underline text-sm">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{telephone}</span>
            </a>
          )}
          {mobile && (
            <a href={`tel:${mobile}`} className="flex items-center hover:underline text-sm">
              <Smartphone className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{mobile}</span>
            </a>
          )}
        </div>
        
        {/* Action buttons section */}
        <div className="flex gap-1 ml-auto">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(id)} className="h-8 w-8 p-0">
              <Pencil className="h-4 w-4" style={{ color: iconColor }} />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(id)} className="h-8 w-8 p-0 text-red-500">
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 