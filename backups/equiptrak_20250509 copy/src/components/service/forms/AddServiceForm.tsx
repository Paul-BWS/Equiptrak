import { useForm } from "react-hook-form";
import { format, addDays, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

type FormValues = {
  certificate_number: string;
  engineer_name: string;
  test_date: string;
  retest_date: string;
  equipment1_name: string;
  equipment1_serial: string;
  equipment2_name: string;
  equipment2_serial: string;
  equipment3_name: string;
  equipment3_serial: string;
  equipment4_name: string;
  equipment4_serial: string;
  equipment5_name: string;
  equipment5_serial: string;
  equipment6_name: string;
  equipment6_serial: string;
  notes: string;
  status?: string;
};

interface AddServiceFormProps {
  customerId: string;
  serviceRecord?: any;
  isEditing?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  setFormRef?: Dispatch<SetStateAction<HTMLFormElement | null>>;
  showActionButtons?: boolean;
}

const ENGINEERS = [
  "Paul Jones",
  "Danny Jennings",
  "Mark Allen",
  "Tommy Hannon",
  "Connor Hill",
  "Dominic TJ",
  "Mason Poulton",
  "Zack Collins",
  "Fernando Goulart"
];

export function AddServiceForm({
  customerId,
  serviceRecord,
  isEditing = false,
  onSuccess,
  onCancel,
  setFormRef,
  showActionButtons = true
}: AddServiceFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const formElementRef = useRef<HTMLFormElement>(null);
  
  // Connect the form ref to the parent component if setFormRef is provided
  useEffect(() => {
    if (setFormRef && formElementRef.current) {
      setFormRef(formElementRef.current);
    }
  }, [setFormRef, formElementRef]);
  
  // Format date for use in the form
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return format(new Date(), "yyyy-MM-dd");
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (error) {
      console.error("Error formatting date:", error);
      return format(new Date(), "yyyy-MM-dd");
    }
  };

  // Set default values based on whether we're editing or creating
  const getDefaultValues = () => {
    if (isEditing && serviceRecord) {
      console.log("Setting default values for editing with record:", serviceRecord);
      
      return {
        certificate_number: serviceRecord.certificate_number || "",
        engineer_name: serviceRecord.engineer_name || "",
        test_date: formatDateForInput(serviceRecord.service_date),
        retest_date: formatDateForInput(serviceRecord.retest_date),
        equipment1_name: serviceRecord.equipment_name_1 || serviceRecord.equipment1_name || "",
        equipment1_serial: serviceRecord.equipment_serial_1 || serviceRecord.equipment1_serial || "",
        equipment2_name: serviceRecord.equipment_name_2 || serviceRecord.equipment2_name || "",
        equipment2_serial: serviceRecord.equipment_serial_2 || serviceRecord.equipment2_serial || "",
        equipment3_name: serviceRecord.equipment_name_3 || serviceRecord.equipment3_name || "",
        equipment3_serial: serviceRecord.equipment_serial_3 || serviceRecord.equipment3_serial || "",
        equipment4_name: serviceRecord.equipment_name_4 || serviceRecord.equipment4_name || "",
        equipment4_serial: serviceRecord.equipment_serial_4 || serviceRecord.equipment4_serial || "",
        equipment5_name: serviceRecord.equipment_name_5 || serviceRecord.equipment5_name || "",
        equipment5_serial: serviceRecord.equipment_serial_5 || serviceRecord.equipment5_serial || "",
        equipment6_name: serviceRecord.equipment_name_6 || serviceRecord.equipment6_name || "",
        equipment6_serial: serviceRecord.equipment_serial_6 || serviceRecord.equipment6_serial || "",
        notes: serviceRecord.notes || "",
        status: serviceRecord.status || "pending"
      };
    } else {
      return {
        certificate_number: "",
        engineer_name: "",
        test_date: format(new Date(), "yyyy-MM-dd"),
        retest_date: format(addDays(new Date(), 364), "yyyy-MM-dd"),
        equipment1_name: "",
        equipment1_serial: "",
        equipment2_name: "",
        equipment2_serial: "",
        equipment3_name: "",
        equipment3_serial: "",
        equipment4_name: "",
        equipment4_serial: "",
        equipment5_name: "",
        equipment5_serial: "",
        equipment6_name: "",
        equipment6_serial: "",
        notes: "",
        status: "pending"
      };
    }
  };
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    defaultValues: getDefaultValues()
  });

  const testDate = watch("test_date");
  
  // Update retest date when test date changes
  useEffect(() => {
    if (testDate) {
      const retestDate = format(addDays(new Date(testDate), 364), 'yyyy-MM-dd');
      setValue("retest_date", retestDate);
    }
  }, [testDate, setValue]);

  // Initialize engineer_name from the form data
  useEffect(() => {
    if (isEditing && serviceRecord?.engineer_name) {
      setValue("engineer_name", serviceRecord.engineer_name);
    }
  }, [isEditing, serviceRecord, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Exclude certificate_number from the submitted data
      const { certificate_number, ...submissionValues } = values;
      
      console.log(`${isEditing ? "Updating" : "Submitting"} service record values from form:`, submissionValues);
      
      // Create the serviceRecord object to send to the backend
      const serviceData = {
        company_id: customerId,
        service_date: submissionValues.test_date,
        retest_date: submissionValues.retest_date,
        engineer_name: submissionValues.engineer_name,
        notes: submissionValues.notes || '',
        status: submissionValues.status || 'pending',
        equipment1_name: submissionValues.equipment1_name || null,
        equipment1_serial: submissionValues.equipment1_serial || null,
        equipment2_name: submissionValues.equipment2_name || null,
        equipment2_serial: submissionValues.equipment2_serial || null,
        equipment3_name: submissionValues.equipment3_name || null,
        equipment3_serial: submissionValues.equipment3_serial || null,
        equipment4_name: submissionValues.equipment4_name || null,
        equipment4_serial: submissionValues.equipment4_serial || null,
        equipment5_name: submissionValues.equipment5_name || null,
        equipment5_serial: submissionValues.equipment5_serial || null,
        equipment6_name: submissionValues.equipment6_name || null,
        equipment6_serial: submissionValues.equipment6_serial || null
      };
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token || ''}`
      };

      let response;
      let url;
      
      if (isEditing && serviceRecord?.id) {
        // Update existing record
        url = `/api/service-records/${serviceRecord.id}`;
        console.log(`Sending PUT request to ${url}`);
        
        response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(serviceData)
        });
      } else {
        // Create new record
        url = '/api/service-records';
        console.log(`Sending POST request to ${url}`);
        
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(serviceData)
        });
      }
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(`Server responded with status ${response.status}: ${errorData?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log(`Service record ${isEditing ? 'updated' : 'created'} successfully:`, data);
      
      // Use a more direct toast approach
      window.setTimeout(() => {
        toast(`Service record ${isEditing ? 'updated' : 'added'} successfully`, {
          duration: 6000,
          position: 'top-center',
          style: {
            backgroundColor: '#10b981', // Green background
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        });
      }, 100);
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["service-records"] });
      
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: ["service-records", customerId] });
      }
      
      onSuccess();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} service record:`, error);
      // Error toast with stronger styling
      window.setTimeout(() => {
        toast(error.message || `Failed to ${isEditing ? 'update' : 'add'} service record`, {
          duration: 6000,
          position: 'top-center',
          style: {
            backgroundColor: '#ef4444', // Red background
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        });
      }, 100);
    }
  };

  return (
    <div className="p-6 bg-white">
      <form ref={formElementRef} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Equipment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="certificate-number">Certificate No</Label>
              <Input
                id="certificate-number"
                {...register("certificate_number")}
                placeholder="Certificate Number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-date">Test Date</Label>
              <Input
                id="test-date"
                type="date"
                {...register("test_date")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retest-date">Retest Date</Label>
              <Input
                id="retest-date"
                type="date"
                {...register("retest_date")}
                disabled
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="engineer">Engineer</Label>
              <Select 
                onValueChange={(value) => setValue("engineer_name", value)}
                defaultValue={watch("engineer_name")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select engineer" />
                </SelectTrigger>
                <SelectContent>
                  {ENGINEERS.map((engineer) => (
                    <SelectItem key={engineer} value={engineer}>
                      {engineer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Equipment Inspected</h2>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <h3 className="font-medium">Equipment Details</h3>
            <h3 className="font-medium">Serial Number</h3>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    id={`equipment${num}-name`}
                    {...register(`equipment${num}_name` as keyof FormValues)}
                    placeholder={`Equipment ${num} name`}
                  />
                </div>
                <div>
                  <Input
                    id={`equipment${num}-serial`}
                    {...register(`equipment${num}_serial` as keyof FormValues)}
                    placeholder={`Serial number`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Notes</h2>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Additional notes or information"
            rows={4}
            className="w-full"
          />
        </div>
        
        {showActionButtons && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#a6e15a] hover:bg-[#a6e15a]/90 text-black dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              {isSubmitting ? (
                <span className="animate-spin h-4 w-4 rounded-full border-t-2 border-b-2 border-black mr-2" />
              ) : null}
              {isEditing ? "Update" : "Save"} Service Record
            </Button>
          </div>
        )}
      </form>
    </div>
  );
} 