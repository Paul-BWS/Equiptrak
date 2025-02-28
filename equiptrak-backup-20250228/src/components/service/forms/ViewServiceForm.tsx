import { useForm } from "react-hook-form";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceRecord } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceEngineerSelect } from "@/components/service/components/ServiceEngineerSelect";
import { useQueryClient } from "@tanstack/react-query";
import { getStatus } from "@/utils/serviceStatus";

type FormValues = {
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
  equipment7_name: string;
  equipment7_serial: string;
  equipment8_name: string;
  equipment8_serial: string;
  notes: string;
};

interface ViewServiceFormProps {
  serviceRecord: ServiceRecord;
  recordId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ViewServiceForm({
  serviceRecord,
  recordId,
  onSuccess,
  onCancel
}: ViewServiceFormProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      engineer_name: serviceRecord.engineer_name,
      test_date: format(new Date(serviceRecord.test_date), "yyyy-MM-dd"),
      retest_date: format(new Date(serviceRecord.retest_date), "yyyy-MM-dd"),
      equipment1_name: serviceRecord.equipment1_name || "",
      equipment1_serial: serviceRecord.equipment1_serial || "",
      equipment2_name: serviceRecord.equipment2_name || "",
      equipment2_serial: serviceRecord.equipment2_serial || "",
      equipment3_name: serviceRecord.equipment3_name || "",
      equipment3_serial: serviceRecord.equipment3_serial || "",
      equipment4_name: serviceRecord.equipment4_name || "",
      equipment4_serial: serviceRecord.equipment4_serial || "",
      equipment5_name: serviceRecord.equipment5_name || "",
      equipment5_serial: serviceRecord.equipment5_serial || "",
      equipment6_name: serviceRecord.equipment6_name || "",
      equipment6_serial: serviceRecord.equipment6_serial || "",
      equipment7_name: serviceRecord.equipment7_name || "",
      equipment7_serial: serviceRecord.equipment7_serial || "",
      equipment8_name: serviceRecord.equipment8_name || "",
      equipment8_serial: serviceRecord.equipment8_serial || "",
      notes: serviceRecord.notes || "",
    }
  });

  const testDate = watch("test_date");
  const retestDate = testDate ? addDays(new Date(testDate), 364) : new Date();

  const handleTestDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTestDate = e.target.value;
    const retestDate = format(addDays(new Date(newTestDate), 364), 'yyyy-MM-dd');
    setValue("test_date", newTestDate);
    setValue("retest_date", retestDate);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await supabase
        .from("service_records")
        .update({
          engineer_name: values.engineer_name,
          test_date: values.test_date,
          retest_date: format(retestDate, "yyyy-MM-dd"),
          status: getStatus(format(retestDate, "yyyy-MM-dd")),
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
          equipment7_name: values.equipment7_name,
          equipment7_serial: values.equipment7_serial,
          equipment8_name: values.equipment8_name,
          equipment8_serial: values.equipment8_serial,
          notes: values.notes,
        })
        .eq("id", recordId);

      if (error) throw error;

      // Invalidate all relevant queries to trigger a refresh
      await queryClient.invalidateQueries({ queryKey: ['serviceRecords'] });
      await queryClient.invalidateQueries({ queryKey: ['serviceRecord', recordId] });

      toast.success("Service record updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating service record:", error);
      toast.error("Failed to update service record");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      {/* Certificate and Engineer Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-500 font-medium">Certificate Number</Label>
            <div className="font-medium text-lg">{serviceRecord.certificate_number}</div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-500 font-medium">Engineer Name</Label>
            <ServiceEngineerSelect
              selectedEngineer={watch("engineer_name")}
              setSelectedEngineer={(value) => setValue("engineer_name", value)}
              hideLabel
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <Label className="text-gray-500 font-medium">Test Date</Label>
            <Input
              type="date"
              {...register("test_date")}
              onChange={handleTestDateChange}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-500 font-medium">Retest Date</Label>
            <Input
              type="date"
              value={format(retestDate, "yyyy-MM-dd")}
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>
      </div>
      
      {/* Equipment Details Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Equipment Details</h3>
        
        {/* Single header for all equipment */}
        <div className="grid grid-cols-2 gap-6 mb-2">
          <div className="font-medium text-gray-500">Name</div>
          <div className="font-medium text-gray-500">Serial</div>
        </div>
        
        {/* Equipment 1-8 */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <div key={num} className="grid grid-cols-2 gap-6 py-2 border-t border-gray-100">
            <Input
              {...register(`equipment${num}_name` as keyof FormValues)}
              placeholder={`Equipment ${num}`}
            />
            <Input
              {...register(`equipment${num}_serial` as keyof FormValues)}
              placeholder="Serial Number"
            />
          </div>
        ))}
      </div>
      
      {/* Notes Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <Label className="text-gray-500 font-medium mb-2 block">Status</Label>
        <div className="font-medium mb-4">{serviceRecord.status}</div>
        
        <Label className="text-gray-500 font-medium mb-2 block">Notes</Label>
        <Textarea
          {...register("notes")}
          className="min-h-[100px] resize-none"
        />
      </div>
      
      {/* Footer with save button */}
      <div className="flex justify-end space-x-4 mt-6">
        <Button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save
        </Button>
      </div>
    </form>
  );
} 