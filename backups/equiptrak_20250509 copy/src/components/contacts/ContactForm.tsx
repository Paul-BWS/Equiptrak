import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface ContactFormProps {
  companyId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<ContactData>;
}

interface ContactData {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  mobile: string;
  job_title: string;
  is_primary: boolean;
}

export function ContactForm({ companyId, onSuccess, onCancel, initialData }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ContactData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    telephone: initialData?.telephone || '',
    mobile: initialData?.mobile || '',
    job_title: initialData?.job_title || '',
    is_primary: initialData?.is_primary || false,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_primary: checked
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name) {
        throw new Error('First name and last name are required');
      }
      
      if (initialData?.id) {
        // Update existing contact
        const response = await fetch(`http://localhost:3001/api/contacts/${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            company_id: companyId
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update contact');
        }
        
        toast({
          title: 'Success',
          description: 'Contact updated successfully',
          variant: 'default'
        });
      } else {
        // Create new contact
        const response = await fetch('http://localhost:3001/api/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            company_id: companyId
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create contact');
        }
        
        toast({
          title: 'Success',
          description: 'Contact added successfully',
          variant: 'default'
        });
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save contact',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telephone">Telephone</Label>
          <Input
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Enter telephone number"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile</Label>
          <Input
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter mobile number"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="job_title">Job Title</Label>
        <Input
          id="job_title"
          name="job_title"
          value={formData.job_title}
          onChange={handleChange}
          placeholder="Enter job title"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="is_primary" 
          checked={formData.is_primary}
          onCheckedChange={handleCheckboxChange}
        />
        <Label htmlFor="is_primary">Primary Contact</Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          className="bg-a6e15a text-black hover:bg-opacity-90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Contact' : 'Add Contact'}
        </Button>
      </div>
    </form>
  );
} 