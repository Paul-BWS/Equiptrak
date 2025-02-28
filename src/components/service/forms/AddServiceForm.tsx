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
  
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
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
        setIsGeneratingCertNumber(true);
        
        // Get the count of existing records to determine the next number
        const { count, error } = await supabase
          .from("service_records")
          .select("*", { count: "exact", head: true });
          
        if (error) throw error;
        
        // Generate certificate number (BWS-2000 + count)
        const nextNumber = 2000 + (count || 0);
        const certificateNumber = `BWS-${nextNumber}`;
        
        setValue("certificate_number", certificateNumber);
      } catch (error) {
        console.error("Error generating certificate number:", error);
        setValue("certificate_number", "BWS-ERROR");
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

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await supabase
        .from("service_records")
        .insert({
          customer_id: customerId,
          certificate_number: values.certificate_number,
          engineer_name: values.engineer_name,
          test_date: values.test_date,
          retest_date: values.retest_date,
          status: "valid",
          equipment1_name: values.equipment1_name,
          equipment1_serial: values.equipment1_serial,
          equipment2_name: values.equipment2_name,
          equipment2_serial: values.equipment2_serial,
          equipment3_name: values.equipment3_name,
          equipment3_serial: values.equipment3_serial,
          equipment4_name: values.equipment4_name,
          equipment4_serial: values.equipment4_serial,
          equipment5_name: values.equipment5_name,
          equipment5_serial: values.equipment5_serial,
          equipment6_name: values.equipment6_name,
          equipment6_serial: values.equipment6_serial,
          notes: values.notes,
        });

      if (error) throw error;

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['serviceRecords'] });

      toast.success("Service record added successfully");
      onSuccess();
    } catch (error) {
      console.error("Error adding service record:", error);
      toast.error("Failed to add service record");
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
              placeholder="Enter certificate number"
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
          <h3 className="font-medium">Equipment Details</h3>
          
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor={`equipment${num}-name`}>Equipment {num}</Label>
                <Input
                  id={`equipment${num}-name`}
                  {...register(`equipment${num}_name` as keyof FormValues)}
                  placeholder="Enter equipment name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`equipment${num}-serial`}>Serial Number</Label>
                <Input
                  id={`equipment${num}-serial`}
                  {...register(`equipment${num}_serial` as keyof FormValues)}
                  placeholder="Enter serial number"
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
            placeholder="Enter notes"
            className="min-h-[100px]"
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