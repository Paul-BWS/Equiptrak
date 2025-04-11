import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Form } from "./ui/form";
import { FormField } from "./forms/FormField";
import { z } from "zod";
import { useToast } from "./ui/use-toast";

// Updated schema to include all possible fields
const companyFormSchema = z.object({
  id: z.string().optional(),
  company_name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  company_type: z.string().optional(),
  status: z.string().optional(),
  credit_rating: z.string().optional(),
  site_address: z.string().optional(),
  billing_address: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  industry: z.string().optional(),
  company_status: z.string().optional(),
  notes: z.string().optional(),
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
      address: "",
      city: "",
      county: "",
      postcode: "",
      country: "",
      telephone: "",
      email: "",
      website: "",
      company_type: "",
      status: "Active",
      credit_rating: "",
      site_address: "",
      billing_address: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      industry: "",
      company_status: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      console.log('Form data before cleaning:', data);
      
      // Clean up empty strings to null for optional fields
      const cleanData = {
        ...data,
        address: data.address || null,
        city: data.city || null,
        county: data.county || null,
        postcode: data.postcode || null,
        country: data.country || null,
        telephone: data.telephone || null,
        email: data.email || null,
        website: data.website || null,
        company_type: data.company_type || null,
        status: data.status || 'Active',
        credit_rating: data.credit_rating || null,
        site_address: data.site_address || null,
        billing_address: data.billing_address || null,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        industry: data.industry || null,
        company_status: data.company_status || null,
        notes: data.notes || null,
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
            name="address"
            label="Address"
            placeholder="Enter address"
          />

          <FormField
            form={form}
            name="city"
            label="City"
            placeholder="Enter city"
          />
          
          <FormField
            form={form}
            name="county"
            label="County"
            placeholder="Enter county"
          />

          <FormField
            form={form}
            name="postcode"
            label="Postcode"
            placeholder="Enter postcode"
          />
          
          <FormField
            form={form}
            name="country"
            label="Country"
            placeholder="Enter country"
          />
          
          <FormField
            form={form}
            name="telephone"
            label="Telephone"
            placeholder="Enter telephone"
          />
          
          <FormField
            form={form}
            name="email"
            label="Email"
            placeholder="Enter email"
          />
          
          <FormField
            form={form}
            name="website"
            label="Website"
            placeholder="Enter website"
          />
          
          <FormField
            form={form}
            name="industry"
            label="Industry"
            placeholder="Enter industry"
          />
          
          <FormField
            form={form}
            name="company_status"
            label="Company Status"
            placeholder="Enter company status"
          />
          
          <FormField
            form={form}
            name="credit_rating"
            label="Credit Rating"
            placeholder="Enter credit rating"
          />
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