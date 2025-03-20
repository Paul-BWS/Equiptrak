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
  onDelete
}: ContactProps) {
  return (
    <div className="p-3 border rounded-md bg-white shadow hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-1 min-w-[200px]">
            <h3 className="font-medium text-base">{first_name} {last_name}</h3>
            {is_primary && (
              <span className="ml-1 bg-a6e15a text-black text-xs px-2 py-0.5 rounded-full">
                Primary
              </span>
            )}
            {has_system_access && (
              <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                System Access
              </span>
            )}
          </div>
          
          {job_title && (
            <p className="text-sm text-gray-500 ml-1 border-l pl-2">{job_title}</p>
          )}

          <div className="flex items-center gap-4 ml-2">
            {email && (
              <a href={`mailto:${email}`} className="flex items-center text-blue-600 hover:underline text-sm">
                <Mail className="h-4 w-4 mr-1" />
                <span>{email}</span>
              </a>
            )}
            {telephone && (
              <a href={`tel:${telephone}`} className="flex items-center hover:underline text-sm">
                <Phone className="h-4 w-4 mr-1" />
                <span>{telephone}</span>
              </a>
            )}
            {mobile && (
              <a href={`tel:${mobile}`} className="flex items-center hover:underline text-sm">
                <Smartphone className="h-4 w-4 mr-1" />
                <span>{mobile}</span>
              </a>
            )}
          </div>
        </div>
        
        <div className="flex gap-1">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(id)} className="h-8 w-8 p-0">
              <Pencil className="h-4 w-4" />
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