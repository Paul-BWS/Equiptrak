import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Form } from "./ui/form";
import { FormField } from "./forms/FormField";
import { AddressSection } from "./forms/AddressSection";
import { z } from "zod";
import { useToast } from "./ui/use-toast";

const companyFormSchema = z.object({
  id: z.string().optional(),
  company_name: z.string().min(1, "Company name is required"),
  telephone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional().nullable().transform(val => val || ''),
  contact_name: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface AddCustomerFormProps {
  onSuccess: (data?: any) => void;
  initialData?: CompanyFormValues;
  mode?: 'add' | 'edit';
  onClose?: () => void;
}

export function AddCustomerForm({ 
  onSuccess, 
  initialData, 
  mode = 'add', 
  onClose 
}: AddCustomerFormProps) {
  const { toast } = useToast();
  
  console.log("AddCustomerForm - Initial data:", initialData);
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: initialData || {
      company_name: "",
      telephone: "",
      address: "",
      city: "",
      county: "",
      postcode: "",
      country: "United Kingdom",
      industry: "",
      website: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
    },
  });

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      console.log('Form data before cleaning:', data);
      
      // Clean up empty strings to null for optional fields
      const cleanData = {
        ...data,
        company_name: data.company_name, // Ensure company_name is preserved
        name: data.company_name, // Also set name field for API compatibility
        website: data.website || null,
        telephone: data.telephone || null,
        industry: data.industry || null,
        address: data.address || null,
        city: data.city || null,
        county: data.county || null,
        postcode: data.postcode || null,
        country: data.country || 'United Kingdom',
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
      };
      
      console.log('Clean data being sent to API:', cleanData);

      let result;
      
      if (mode === 'edit' && initialData?.id) {
        const { id, ...updateData } = cleanData;
        console.log('Updating company:', initialData.id);
        console.log('Update data:', updateData);
        
        const response = await fetch(`http://localhost:3001/api/companies/${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(errorText || 'Failed to update company');
        }

        result = await response.json();
        console.log('Update successful:', result);
      } else {
        console.log('Creating new company with data:', cleanData);
        
        const response = await fetch('http://localhost:3001/api/companies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(cleanData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(errorText || 'Failed to create company');
        }
        
        result = await response.json();
        console.log('Company creation successful:', result);
      }

      toast({
        title: "Success",
        description: `Company ${mode === 'edit' ? "updated" : "added"} successfully`,
      });
      
      onSuccess(result);
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to save company details',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            form={form}
            name="company_name"
            label="Company Name"
            placeholder="Enter company name"
          />

          <FormField
            form={form}
            name="telephone"
            label="Main Telephone"
            placeholder="Enter main telephone number"
          />

          <FormField
            form={form}
            name="industry"
            label="Industry"
            placeholder="e.g. Manufacturing, Construction, etc."
          />

          <FormField
            form={form}
            name="website"
            label="Website"
            placeholder="https://example.com"
          />

          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">Contact Information</h3>
            
            <FormField
              form={form}
              name="contact_name"
              label="Contact Name"
              placeholder="Enter contact person's name"
            />
            
            <FormField
              form={form}
              name="contact_email"
              label="Contact Email"
              placeholder="Enter contact email"
            />
            
            <FormField
              form={form}
              name="contact_phone"
              label="Contact Phone"
              placeholder="Enter contact phone number"
            />
          </div>

          <AddressSection form={form} />
        </div>

        <Button 
          type="submit"
          className="w-full dark:bg-[#a6e15a] dark:text-black bg-[#7b96d4] text-white hover:dark:bg-[#95cc51] hover:bg-[#6b86c4]"
        >
          {mode === 'edit' ? "Update Company" : "Add Company"}
        </Button>
      </form>
    </Form>
  );
}