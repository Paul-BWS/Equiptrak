import { useForm } from "react-hook-form";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  equipment7_name?: string;
  equipment7_serial?: string;
  equipment8_name?: string;
  equipment8_serial?: string;
  notes: string;
};

interface AddServiceFormProps {
  customerId: string;
  onSuccess: () => void;
  onCancel: () => void;
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
  onSuccess,
  onCancel
}: AddServiceFormProps) {
  const queryClient = useQueryClient();
  const [isGeneratingCertNumber, setIsGeneratingCertNumber] = useState(true);
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    defaultValues: {
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
    }
  });

  // Generate certificate number on load
  useEffect(() => {
    const generateCertificateNumber = async () => {
      try {
        // Get authentication token
        const token = getAuthToken();
        if (!token) {
          throw new Error("Not authenticated");
        }
        
        // Call our new API endpoint to get a sequential BWS-XXXX number
        const response = await fetch('/api/generate-certificate-number', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to generate certificate number: ${response.status}`);
        }
        
        const data = await response.json();
        setValue("certificate_number", data.certificateNumber);
      } catch (error) {
        console.error("Error generating certificate number:", error);
        // Fallback to a timestamp-based number if there's an error
        const timestamp = Date.now().toString().slice(-6);
        setValue("certificate_number", `BWS-MANUAL-${timestamp}`);
      } finally {
        setIsGeneratingCertNumber(false);
      }
    };
    
    generateCertificateNumber();
  }, [setValue]);

  const testDate = watch("test_date");
  
  // Update retest date when test date changes
  useEffect(() => {
    if (testDate) {
      const retestDate = format(addDays(new Date(testDate), 364), 'yyyy-MM-dd');
      setValue("retest_date", retestDate);
    }
  }, [testDate, setValue]);

  // Helper function to get auth token
  const getAuthToken = () => {
    const storedUser = localStorage.getItem('equiptrak_user');
    if (!storedUser) return null;
    
    try {
      const userData = JSON.parse(storedUser);
      return userData.token || null;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      // Ensure there's at least one equipment name provided
      if (
        !values.equipment1_name &&
        !values.equipment2_name &&
        !values.equipment3_name &&
        !values.equipment4_name &&
        !values.equipment5_name &&
        !values.equipment6_name
      ) {
        toast.error("Please add at least one equipment name");
        return;
      }

      let serviceRecord: Record<string, any> = {
        company_id: customerId,
        certificate_number: values.certificate_number,
        service_date: values.test_date,
        test_date: values.test_date,
        retest_date: values.retest_date,
        status: 'valid', // Default status
        notes: values.notes,
      };

      // Handle the engineer
      if (values.engineer_name) {
        console.log("Engineer name from form:", values.engineer_name);
        serviceRecord.engineer_name = values.engineer_name;
      } else {
        console.log("No engineer name provided in form");
      }

      // Add equipment values
      if (values.equipment1_name) {
        serviceRecord.equipment1_name = values.equipment1_name;
        serviceRecord.equipment1_serial = values.equipment1_serial || '';
      }
      if (values.equipment2_name) {
        serviceRecord.equipment2_name = values.equipment2_name;
        serviceRecord.equipment2_serial = values.equipment2_serial || '';
      }
      if (values.equipment3_name) {
        serviceRecord.equipment3_name = values.equipment3_name;
        serviceRecord.equipment3_serial = values.equipment3_serial || '';
      }
      if (values.equipment4_name) {
        serviceRecord.equipment4_name = values.equipment4_name;
        serviceRecord.equipment4_serial = values.equipment4_serial || '';
      }
      if (values.equipment5_name) {
        serviceRecord.equipment5_name = values.equipment5_name;
        serviceRecord.equipment5_serial = values.equipment5_serial || '';
      }
      if (values.equipment6_name) {
        serviceRecord.equipment6_name = values.equipment6_name;
        serviceRecord.equipment6_serial = values.equipment6_serial || '';
      }
      
      console.log("Full service record being sent:", JSON.stringify(serviceRecord, null, 2));

      // Get auth token
      const token = getAuthToken();
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      console.log("Sending POST request to /api/service-records");
      const response = await fetch('/api/service-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceRecord)
      });

      if (!response.ok) {
        // Try to parse the error response as JSON
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Server responded with status ${response.status}`;
          console.error("Server error response:", errorData);
        } catch (e) {
          // If it's not JSON, get the text
          const errorText = await response.text();
          errorMessage = `Server responded with status ${response.status}: ${errorText}`;
          console.error("Server error response (text):", errorText);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Service record created successfully:", data);
      console.log("Engineer data in created record:", {
        engineer_name: data.record.engineer_name
      });
      
      toast.success("Service record added successfully");
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["service-records"] });
      
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: ["service-records", customerId] });
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error adding service record:", error);
      toast.error(error.message || "Failed to add service record");
    }
  };

  return (
    <div className="p-6 bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="certificate-number">Certificate Number</Label>
            <Input
              id="certificate-number"
              {...register("certificate_number")}
              disabled={isGeneratingCertNumber}
            />
          </div>
          
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
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="test-date">Issue Date</Label>
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
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6 mb-2">
            <h3 className="font-medium">Equipment Details</h3>
            <h3 className="font-medium">Serial Number</h3>
          </div>
          
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="grid grid-cols-2 gap-6">
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
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            className="min-h-[100px]"
            placeholder="Any additional notes about the service"
          />
        </div>
        
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Record
          </Button>
        </div>
      </form>
    </div>
  );
} 