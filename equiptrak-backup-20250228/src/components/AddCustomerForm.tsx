import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Form } from "./ui/form";
import { FormField } from "./forms/FormField";
import { AddressSection } from "./forms/AddressSection";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
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
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface AddCustomerFormProps {
  onSuccess: () => void;
  initialData?: CompanyFormValues;
  isEditing?: boolean;
  onClose?: () => void;
}

export function AddCustomerForm({ onSuccess, initialData, isEditing = false, onClose }: AddCustomerFormProps) {
  const { toast } = useToast();
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
    },
  });

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      // Clean up empty strings to null for optional fields
      const cleanData = {
        ...data,
        website: data.website || null,
        telephone: data.telephone || null,
        industry: data.industry || null,
        address: data.address || null,
        city: data.city || null,
        county: data.county || null,
        postcode: data.postcode || null,
        country: data.country || 'United Kingdom',
      };

      if (isEditing && initialData?.id) {
        const { id, ...updateData } = cleanData;
        console.log('Updating company:', initialData.id);
        console.log('Update data:', updateData);
        
        const { data: result, error } = await supabase
          .from("companies")
          .update(updateData)
          .eq("id", initialData.id)
          .select()
          .single();

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }

        console.log('Update successful:', result);
      } else {
        const { error } = await supabase
          .from("companies")
          .insert([cleanData]);

        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
      }

      toast({
        title: "Success",
        description: `Company ${isEditing ? "updated" : "added"} successfully`,
      });
      
      onSuccess();
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

          <AddressSection form={form} />
        </div>

        <Button 
          type="submit"
          className="w-full dark:bg-[#a6e15a] dark:text-black bg-[#7b96d4] text-white hover:dark:bg-[#95cc51] hover:bg-[#6b86c4]"
        >
          {isEditing ? "Update Company" : "Add Company"}
        </Button>
      </form>
    </Form>
  );
}