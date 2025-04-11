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

  const testDate = watch("test_date");
  
  // Update retest date when test date changes
  useEffect(() => {
    if (testDate) {
      const retestDate = format(addDays(new Date(testDate), 364), 'yyyy-MM-dd');
      setValue("retest_date", retestDate);
    }
  }, [testDate, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      console.log("Submitting service record:", values);
      
      // Format the record according to your existing schema
      const serviceRecord = {
        company_id: customerId,
        service_date: values.test_date,
        retest_date: values.retest_date,
        engineer_name: values.engineer_name,
        notes: values.notes || '',
        status: 'valid',
        equipment1_name: values.equipment1_name || '',
        equipment1_serial: values.equipment1_serial || '',
        equipment2_name: values.equipment2_name || '',
        equipment2_serial: values.equipment2_serial || '',
        equipment3_name: values.equipment3_name || '',
        equipment3_serial: values.equipment3_serial || '',
        equipment4_name: values.equipment4_name || '',
        equipment4_serial: values.equipment4_serial || '',
        equipment5_name: values.equipment5_name || '',
        equipment5_serial: values.equipment5_serial || '',
        equipment6_name: values.equipment6_name || '',
        equipment6_serial: values.equipment6_serial || '',
      };
      
      // Get auth token
      const token = getAuthToken();
      
      // Submit to your existing API endpoint
      const response = await fetch('/api/service-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify(serviceRecord)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Service record created successfully:", data);
      
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

  const getAuthToken = () => {
    try {
      const storedUser = localStorage.getItem('equiptrak_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          return userData.token || null;
        } catch (e) {
          console.error("Error parsing user data:", e);
          return null;
        }
      }
      return null;
    } catch (e) {
      console.error("Error getting auth token:", e);
      return null;
    }
  };

  return (
    <div className="p-6 bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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