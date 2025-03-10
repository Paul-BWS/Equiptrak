import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { toast } from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { createClient } from "@supabase/supabase-js";
import { createUserAsAdmin } from "../../components/auth/authUtils";
import { Switch } from '@/components/ui/switch';
import { createUser } from '@/utils/userService';
import { EyeOff, Eye } from 'lucide-react';
import { CheckCircle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  position: string;
  telephone: string;
  mobile: string;
  email: string;
  // Make these optional since they might not exist in the database yet
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

// Add this for direct Supabase auth
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function EditContactModal({ 
  contact, 
  open, 
  onOpenChange,
  onContactUpdated 
}: EditContactModalProps) {
  const [name, setName] = useState(contact?.name || '');
  const [position, setPosition] = useState(contact?.position || '');
  const [telephone, setTelephone] = useState(contact?.telephone || '');
  const [mobile, setMobile] = useState(contact?.mobile || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [hasSystemAccess, setHasSystemAccess] = useState(false);
  const [role, setRole] = useState(contact?.role || 'Contact');
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSystemUser, setIsSystemUser] = useState(contact?.has_system_access || false);
  const [systemUserPassword, setSystemUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name || "");
      setPosition(contact.position || "");
      setTelephone(contact.telephone || "");
      setMobile(contact.mobile || "");
      setEmail(contact.email || "");
      setHasSystemAccess(contact.has_system_access || false);
      setRole(contact.role || "Contact");
      setPassword("");
      setIsSystemUser(contact.has_system_access || false);
      setSystemUserPassword("");
      setShowPassword(true);
    }
  }, [contact]);

  useEffect(() => {
    if (!contact?.has_system_access && isSystemUser && !systemUserPassword) {
      generatePassword();
    }
  }, [isSystemUser, contact, systemUserPassword]);

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSystemUserPassword(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // First, update the contact information
      const updateData: any = {
        name,
        position,
        telephone,
        mobile,
        email,
        role // Make sure role is included
      };
      
      // Only update has_system_access if we successfully create a user
      // This prevents the UI from showing "System User" when auth creation fails
      
      const { error: contactError } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', contact?.id);
        
      if (contactError) throw contactError;

      // If system access is granted and we have an email and password
      if (isSystemUser && !contact?.has_system_access) {
        setCreatingUser(true);
        
        try {
          // Create a system user using the Edge Function (which uses admin API)
          try {
            console.log("Creating system user with data:", {
              email,
              name,
              role: role === 'Admin' ? 'admin' : role === 'User' ? 'user' : 'customer',
              contact_id: contact?.id
            });
            
            const result = await createUser({
              email,
              password: systemUserPassword,
              name: name,
              role: role === 'Admin' ? 'admin' : role === 'User' ? 'user' : 'customer',
              company_name: '',
              telephone: telephone,
              contact_id: contact?.id // Pass the contact ID to link the user to a contact
            });
            
            console.log("User creation result:", result);
            
            // Only update the contact if user creation was successful
            const { error: updateError } = await supabase
              .from('contacts')
              .update({ has_system_access: true })
              .eq('id', contact?.id);
              
            if (updateError) {
              console.error("Error updating contact:", updateError);
              throw new Error(`Failed to update contact: ${updateError.message}`);
            }
            
            toast.success("Contact updated and system user created successfully");
            if (onContactUpdated) onContactUpdated();
            onOpenChange(false);
          } catch (error: any) {
            console.error('Error creating system user:', error);
            console.error('Error details:', error.response?.data || error);
            
            // Show appropriate error message
            if (error.message && error.message.includes('401')) {
              setErrorMessage("System user creation failed: Unauthorized (401). Your Edge Function doesn't have the correct service role key.");
            } else if (error.message && error.message.includes('Signups not allowed')) {
              setErrorMessage("System user creation failed: Signups not allowed. Your Edge Function needs to use the admin.createUser method.");
            } else if (error.message && error.message.includes('404')) {
              setErrorMessage("The Edge Function is not available. Please ensure it's deployed in your Supabase project.");
            } else {
              setErrorMessage(`System user creation failed: ${error.message || "Unknown error"}`);
            }
            
            // Don't update the contact's has_system_access flag if user creation failed
            toast.error(`Contact saved but system user creation failed`);
          }
        } catch (userError: any) {
          console.error('Error in user creation process:', userError);
          setErrorMessage(`Failed to create system user: ${userError.message || "Unknown error"}`);
          toast.error(`Contact saved but failed to create system user`);
        } finally {
          setCreatingUser(false);
        }
      } else {
        toast.success("Contact updated successfully");
        if (onContactUpdated) onContactUpdated();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error updating contact:", error);
      toast.error(error.message || "Failed to update contact");
      setErrorMessage(error.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name*</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input 
              id="position" 
              value={position} 
              onChange={(e) => setPosition(e.target.value)} 
            />
          </div>
          
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
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              System Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="Contact">Contact (No Access)</option>
              <option value="User">User (Basic Access)</option>
              <option value="Admin">Admin (Full Access)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              This determines what permissions the contact will have if given system access
            </p>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">System Access</h3>
                <p className="text-sm text-gray-500">Allow this contact to log in to the system</p>
              </div>
              <Switch 
                checked={isSystemUser} 
                onCheckedChange={setIsSystemUser}
                disabled={contact?.has_system_access || isLoading}
              />
            </div>
            
            {isSystemUser && !contact?.has_system_access && (
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <h4 className="font-medium text-blue-800 mb-2">System User Details</h4>
                <p className="text-sm text-blue-700 mb-3">
                  A system user will be created with the following details:
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-blue-800">Email:</span>
                    <span className="text-sm text-blue-700 col-span-2">{email}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-blue-800">Password:</span>
                    <div className="col-span-2 flex items-center">
                      <div className="relative flex-grow">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={systemUserPassword}
                          onChange={(e) => setSystemUserPassword(e.target.value)}
                          className="text-sm p-1 border rounded w-full"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-2 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-3 w-3 text-gray-400" />
                          ) : (
                            <Eye className="h-3 w-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generatePassword}
                        className="ml-2"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-blue-800">Role:</span>
                    <span className="text-sm text-blue-700 col-span-2">{role}</span>
                  </div>
                </div>
              </div>
            )}
            
            {contact?.has_system_access && (
              <div className="bg-green-50 p-4 rounded-md mb-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-sm text-green-700">
                    This contact already has system access
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {errorMessage && (
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <h4 className="font-medium text-red-800 mb-2">Error</h4>
              <p className="text-sm text-red-700">{errorMessage}</p>
              
              {errorMessage.includes('Signups not allowed') && (
                <div className="mt-2 text-sm text-red-700">
                  <p><strong>This is a Supabase configuration issue:</strong></p>
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to Authentication → Settings</li>
                    <li>Under "User Signups", enable "Allow new users to sign up"</li>
                    <li>Or use the Admin API in your Edge Function instead of public signup</li>
                  </ol>
                </div>
              )}
              
              {errorMessage.includes('Edge Function') && (
                <div className="mt-2 text-sm text-red-700">
                  <p>To fix this issue:</p>
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Ensure the Edge Function is deployed in your Supabase project</li>
                    <li>Check that your Supabase URL and anon key are correct</li>
                    <li>Verify that the function has the proper permissions</li>
                    <li>Note: Edge Functions may take a few minutes to initialize after deployment</li>
                  </ol>
                </div>
              )}
              
              {errorMessage.includes('404') && (
                <div className="mt-2 text-sm text-red-700">
                  <p><strong>Note:</strong> If you just deployed the Edge Function, it might still be initializing. Please wait a few minutes and try again.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 