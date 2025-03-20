import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { toast } from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from '@/components/ui/switch';
import { createUser } from '@/utils/userService';
import { EyeOff, Eye } from 'lucide-react';
import { CheckCircle } from 'lucide-react';

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
  role?: string;
  company_id?: string;
}

interface EditContactModalProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactUpdated?: () => void;
}

export function EditContactModal({ 
  contact, 
  open, 
  onOpenChange,
  onContactUpdated 
}: EditContactModalProps) {
  const [first_name, setFirstName] = useState(contact?.first_name || '');
  const [last_name, setLastName] = useState(contact?.last_name || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [telephone, setTelephone] = useState(contact?.telephone || '');
  const [mobile, setMobile] = useState(contact?.mobile || '');
  const [job_title, setJobTitle] = useState(contact?.job_title || '');
  const [isSystemUser, setIsSystemUser] = useState(contact?.has_system_access || false);
  const [role, setRole] = useState<string>(contact?.role || 'user');
  const [systemUserPassword, setSystemUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (contact) {
      setFirstName(contact.first_name || '');
      setLastName(contact.last_name || '');
      setEmail(contact.email || '');
      setTelephone(contact.telephone || '');
      setMobile(contact.mobile || '');
      setJobTitle(contact.job_title || '');
      setIsSystemUser(contact.has_system_access || false);
      setRole(contact.role || 'user');
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Update contact information using our PostgreSQL API
      const updateData = {
        first_name,
        last_name,
        email,
        telephone,
        mobile,
        job_title,
        has_system_access: isSystemUser,
        role,
        company_id: contact?.company_id
      };

      const response = await fetch(`http://localhost:3001/api/contacts/${contact?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      // If system access is enabled and this is a new system user
      if (isSystemUser && !contact?.has_system_access) {
        try {
          await createUser({
            email,
            password: systemUserPassword,
            role,
            first_name,
            last_name,
            company_id: contact?.company_id
          });
          toast.success('User account created successfully');
        } catch (error) {
          console.error('Error creating user account:', error);
          toast.error('Failed to create user account');
          throw error;
        }
      }

      toast.success('Contact updated successfully');
      if (onContactUpdated) {
        onContactUpdated();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating contact:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      toast.error('Failed to update contact');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Telephone</Label>
              <Input
                id="telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              value={job_title}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="system-access"
                checked={isSystemUser}
                onCheckedChange={setIsSystemUser}
              />
              <Label htmlFor="system-access">Enable System Access</Label>
            </div>
          </div>

          {isSystemUser && (
            <>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!contact?.has_system_access && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={systemUserPassword}
                      onChange={(e) => setSystemUserPassword(e.target.value)}
                      placeholder="Leave empty to generate secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 