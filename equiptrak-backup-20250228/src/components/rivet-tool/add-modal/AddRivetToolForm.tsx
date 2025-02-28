import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServiceEngineerSelect } from "@/components/service/components/ServiceEngineerSelect";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { useForm } from "react-hook-form";
import { RivetToolReadings } from "../view-modal/components/RivetToolReadings";
import { useQueryClient } from "@tanstack/react-query";

interface AddRivetToolFormProps {
  customerId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

interface FormValues {
  model: string;
  serialNumber: string;
  engineerId: string;
  test_date: string;
  retest_date: string;
  machine_setting_1?: number;
  machine_setting_2?: number;
  machine_setting_3?: number;
  machine_setting_4?: number;
  actual_reading_1?: number;
  actual_reading_2?: number;
  actual_reading_3?: number;
  actual_reading_4?: number;
}

export function AddRivetToolForm({ customerId, onSuccess, onCancel }: AddRivetToolFormProps) {
  const { toast } = useToast();
  const [equipmentTypeId, setEquipmentTypeId] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      test_date: format(new Date(), 'yyyy-MM-dd'),
      retest_date: format(addDays(new Date(), 364), 'yyyy-MM-dd')
    }
  });
  const queryClient = useQueryClient();

  const test_date = watch('test_date');

  useEffect(() => {
    // Fetch the equipment type ID for rivet tools
    const fetchEquipmentTypeId = async () => {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('id')
        .eq('name', 'rivet_tool')
        .single();

      if (error) {
        console.error('Error fetching equipment type:', error);
        return;
      }

      setEquipmentTypeId(data.id);
    };

    fetchEquipmentTypeId();
  }, []);

  useEffect(() => {
    if (test_date) {
      const retestDate = format(addDays(new Date(test_date), 364), 'yyyy-MM-dd');
      setValue('retest_date', retestDate);
    }
  }, [test_date, setValue]);

  const onSubmit = async (data: FormValues) => {
    if (!equipmentTypeId) {
      toast({
        title: "Error",
        description: "Equipment type not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // First create the equipment record
      const { data: equipment, error: equipmentError } = await supabase
        .from("equipment")
        .insert({
          name: data.model,
          serial_number: data.serialNumber,
          customer_id: customerId,
          type_id: equipmentTypeId,
          last_test_date: data.test_date,
          next_test_date: data.retest_date,
          status: "valid"
        })
        .select()
        .single();

      if (equipmentError) throw equipmentError;

      // Then create the service record
      const { data: certificateNumber, error: certificateError } = await supabase
        .rpc('generate_rivet_tool_certificate_number');

      if (certificateError) throw certificateError;

      const { error: serviceError } = await supabase
        .from("rivet_tool_service_records")
        .insert({
          equipment_id: equipment.id,
          engineer_id: data.engineerId,
          test_date: data.test_date,
          retest_date: data.retest_date,
          status: "valid",
          certificate_number: certificateNumber,
          equipment1_name: data.model,
          equipment1_serial: data.serialNumber,
          machine_setting_1: data.machine_setting_1,
          machine_setting_2: data.machine_setting_2,
          machine_setting_3: data.machine_setting_3,
          machine_setting_4: data.machine_setting_4,
          actual_reading_1: data.actual_reading_1,
          actual_reading_2: data.actual_reading_2,
          actual_reading_3: data.actual_reading_3,
          actual_reading_4: data.actual_reading_4
        });

      if (serviceError) throw serviceError;

      toast({
        title: "Success",
        description: "Rivet tool record created successfully",
      });

      await queryClient.invalidateQueries({ 
        queryKey: ["rivet-tools", customerId] 
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating rivet tool record:", error);
      toast({
        title: "Error",
        description: "Failed to create rivet tool record",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Test and Retest Dates */}
      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Test Date</Label>
            <Input
              type="date"
              {...register("test_date")}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Retest Date</Label>
            <Input
              type="date"
              {...register("retest_date")}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Equipment Details */}
      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Model</Label>
            <Input
              {...register("model")}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Serial Number</Label>
            <Input
              {...register("serialNumber")}
            />
          </div>
          <div className="space-y-2">
            <div className="text-[#94a3b8] text-sm mb-2">Engineer</div>
            <ServiceEngineerSelect
              selectedEngineer={watch("engineerId")}
              setSelectedEngineer={(value) => setValue("engineerId", value)}
              hideLabel
            />
          </div>
        </div>
      </div>

      <RivetToolReadings register={register} />

      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="submit"
          className="dark:bg-[#a6e15a] dark:text-black dark:hover:bg-[#95cc51] bg-[#7b96d4] text-white hover:bg-[#6a85c3]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Rivet Tool Record"}
        </Button>
      </div>
    </form>
  );
}