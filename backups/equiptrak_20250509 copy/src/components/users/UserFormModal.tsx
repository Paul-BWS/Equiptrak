import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { createUser } from '@/utils/userService';

interface UserFormModalProps {
  user: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    company_name?: string;
    telephone?: string;
  } | null;
  open: boolean;
  onClose: (refreshNeeded: boolean) => void;
  companies: string[];
}

// Add the formSchema
const formSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
  name: z.string().optional(),
  role: z.string(),
  company_name: z.string().optional(),
  telephone: z.string().optional()
});

export function UserFormModal({ user, open, onClose, companies }: UserFormModalProps) {
  console.log('UserFormModal rendering with props:', { user, open, companies: companies.length });
  
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'customer');
  const [companyName, setCompanyName] = useState(user?.company_name || 'none');
  const [telephone, setTelephone] = useState(user?.telephone || '');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const isEditMode = !!user?.id;

  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  // Copy password to clipboard
  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    toast({
      title: 'Copied',
      description: 'Password copied to clipboard',
    });
  };

  // Update the proxyServerRequest function to use Supabase directly
  const proxyServerRequest = async (endpoint: string, options: RequestInit = {}) => {
    console.log(`Making request to Supabase for: ${endpoint}`);
    
    // Instead of trying different server URLs, we'll use Supabase directly
    try {
      // This is a placeholder - the actual implementation will depend on what
      // the endpoint is trying to do. You'll need to replace this with the
      // appropriate Supabase API calls.
      
      // For example, if this was fetching users:
      // const { data, error } = await supabase.from('users').select('*');
      
      // For now, we'll just log that this function needs to be updated
      console.warn('proxyServerRequest needs to be updated to use Supabase directly');
      throw new Error('This function needs to be updated to use Supabase directly');
    } catch (error) {
      console.error('Error making request:', error);
      throw error;
    }
  };

  // Update the handleSubmit function
  const handleSubmit = async () => {
    console.log('handleSubmit called');
    setSubmitting(true);
    setError(null);
    
    try {
      if (isEditMode) {
        // Update existing user
        console.log('Updating user:', { name, role, companyName, telephone });
        
        const response = await proxyServerRequest('api/update-user', {
          method: 'POST',
          body: JSON.stringify({
            userId: user?.id,
            name,
            role,
            company_name: companyName === 'none' ? '' : companyName,
            telephone
          }),
        });
        
        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          console.error('Error parsing response:', e);
          throw new Error(`Failed to parse server response: ${response.status} ${response.statusText}`);
        }
        
        if (!response.ok) {
          throw new Error(responseData.error || `Failed to update user: ${response.status} ${response.statusText}`);
        }
        
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        // Create new user
        console.log('Creating user:', { email, password, name, role, companyName, telephone });
        
        const result = await createUser({
          email,
          password,
          name,
          role,
          company_name: companyName === 'none' ? '' : companyName,
          telephone
        });
        
        console.log('User creation result:', result);
        
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
        
        onClose(true); // Close modal and refresh user list
      }
    } catch (error) {
      console.error('Error submitting user form:', error);
      
      // Format the error message for better readability
      let errorMessage = error.message || 'An error occurred';
      let helpText = '';
      
      // Handle specific error cases
      if (errorMessage.includes('already exists')) {
        errorMessage = 'A user with this email already exists. Please use a different email address.';
      } else if (errorMessage.includes('Database error')) {
        errorMessage = 'Database error: There was a problem saving the user data.';
        helpText = 'This may be due to Supabase configuration issues. Please check your Supabase setup and permissions.';
      }
      
      setError(errorMessage + (helpText ? `\n\n${helpText}` : ''));
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Generate a password on initial render for new users
  useEffect(() => {
    if (!isEditMode && !password) {
      generatePassword();
    }
  }, [isEditMode]);

  // Add error boundary
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update user details below.' 
              : 'Fill in the information to create a new user.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              disabled={isEditMode} // Can't change email for existing users
            />
          </div>
          
          {/* Password field with toggle and generate button */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              {isEditMode ? 'New Password' : 'Password'}
            </Label>
            <div className="col-span-3 flex">
              <div className="relative flex-grow">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generatePassword}
                className="ml-2"
                title="Generate password"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyPassword}
                className="ml-2"
                title="Copy password"
                disabled={!password}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Company
            </Label>
            <Select value={companyName} onValueChange={setCompanyName}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Company</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telephone" className="text-right">
              Telephone
            </Label>
            <Input
              id="telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          {error && (
            <div className="col-span-4 p-4 text-sm text-red-600 bg-red-50 rounded-md">
              <div className="font-medium mb-1">Error:</div>
              <div className="whitespace-pre-line">{error}</div>
              
              {error.includes('Database error') && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="font-medium mb-1">Troubleshooting steps:</div>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Check that your Supabase project is active and not in maintenance mode</li>
                    <li>Verify that the service role key has the necessary permissions</li>
                    <li>Ensure the 'profiles' table exists in your Supabase database</li>
                    <li>Check for any RLS (Row Level Security) policies that might be blocking the operation</li>
                    <li>Verify that your database is not in read-only mode</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 