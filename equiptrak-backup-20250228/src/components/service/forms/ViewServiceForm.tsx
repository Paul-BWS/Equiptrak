import { useForm } from "react-hook-form";
import { format, addYears, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceRecord } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceEngineerSelect } from "@/components/service/components/ServiceEngineerSelect";
import { useTheme } from "@/components/theme-provider";
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
  const { theme } = useTheme();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Section */}
      <div className="p-4 rounded-lg bg-card border border-border/50">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Certificate Number</Label>
              <div className="p-2 bg-muted rounded-md font-mono">
                {serviceRecord.certificate_number}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Test Date</Label>
              <Input
                type="date"
                {...register("test_date")}
                onChange={handleTestDateChange}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Retest Date</Label>
              <Input
                type="date"
                value={format(retestDate, "yyyy-MM-dd")}
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Engineer</Label>
            <ServiceEngineerSelect
              selectedEngineer={watch("engineer_name")}
              setSelectedEngineer={(value) => setValue("engineer_name", value)}
              hideLabel
            />
          </div>
        </div>
      </div>

      {/* Equipment Section */}
      <div className="p-4 rounded-lg bg-card border border-border/50">
        <h3 className="text-lg font-medium mb-4 text-[#94a3b8]">Equipment Details</h3>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <div key={num} className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#94a3b8] font-medium">Equipment {num} Name</Label>
                <Input
                  {...register(`equipment${num}_name` as keyof FormValues)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#94a3b8] font-medium">Serial Number</Label>
                <Input
                  {...register(`equipment${num}_serial` as keyof FormValues)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="p-4 rounded-lg bg-card border border-border/50">
        <div className="space-y-2">
          <Label className="text-[#94a3b8] font-medium">Notes</Label>
          <Textarea
            {...register("notes")}
            className="min-h-[100px] resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          style={{ 
            backgroundColor: theme === 'dark' ? '#a6e15a' : '#FFFFFF',
            color: theme === 'dark' ? '#1a1a1a' : '#000000',
            border: theme === 'light' ? '1px solid #e2e8f0' : 'none'
          }}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
} 