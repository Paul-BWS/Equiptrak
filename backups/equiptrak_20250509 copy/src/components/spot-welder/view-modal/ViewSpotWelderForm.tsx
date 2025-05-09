import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { SpotWelderServiceRecord } from "@/types/database/spot-welders";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { useState } from "react";
import { StatusBadge } from "@/components/equipment/card/components/StatusBadge";
import { SpotWelderFormHeader } from "./components/SpotWelderFormHeader";
import { SpotWelderParameters } from "./components/SpotWelderParameters";
import { SpotWelderReadings } from "./components/SpotWelderReadings";
import { useTheme } from "@/components/theme-provider";
import { ServiceEngineerSelect } from "@/components/service/components/ServiceEngineerSelect";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getStatus } from "@/utils/serviceStatus";

type FormValues = {
  engineer_name: string;
  test_date: string;
  retest_date: string;
  equipment_name: string;
  equipment_serial: string;
  voltage_max: number | null;
  voltage_min: number | null;
  air_pressure: number | null;
  tip_pressure: number | null;
  length: number | null;
  diameter: number | null;
  welding_time_1: number | null;
  welding_time_2: number | null;
  welding_time_3: number | null;
  welding_time_4: number | null;
  machine_time_1: number | null;
  machine_time_2: number | null;
  machine_time_3: number | null;
  machine_time_4: number | null;
  welding_current_1: number | null;
  welding_current_2: number | null;
  welding_current_3: number | null;
  welding_current_4: number | null;
  machine_current_1: number | null;
  machine_current_2: number | null;
  machine_current_3: number | null;
  machine_current_4: number | null;
  notes?: string;
};

interface ViewSpotWelderFormProps {
  serviceRecord: SpotWelderServiceRecord;
  equipmentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ViewSpotWelderForm({
  serviceRecord,
  equipmentId,
  onSuccess,
  onCancel
}: ViewSpotWelderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();

  const form = useForm<FormValues>({
    defaultValues: {
      engineer_name: serviceRecord.engineer_name,
      test_date: format(new Date(serviceRecord.test_date), 'yyyy-MM-dd'),
      retest_date: format(new Date(serviceRecord.retest_date), 'yyyy-MM-dd'),
      equipment_name: serviceRecord.equipment_name,
      equipment_serial: serviceRecord.equipment_serial,
      voltage_max: serviceRecord.voltage_max,
      voltage_min: serviceRecord.voltage_min,
      air_pressure: serviceRecord.air_pressure,
      tip_pressure: serviceRecord.tip_pressure,
      length: serviceRecord.length,
      diameter: serviceRecord.diameter,
      welding_time_1: serviceRecord.welding_time_1,
      welding_time_2: serviceRecord.welding_time_2,
      welding_time_3: serviceRecord.welding_time_3,
      welding_time_4: serviceRecord.welding_time_4,
      machine_time_1: serviceRecord.machine_time_1,
      machine_time_2: serviceRecord.machine_time_2,
      machine_time_3: serviceRecord.machine_time_3,
      machine_time_4: serviceRecord.machine_time_4,
      welding_current_1: serviceRecord.welding_current_1,
      welding_current_2: serviceRecord.welding_current_2,
      welding_current_3: serviceRecord.welding_current_3,
      welding_current_4: serviceRecord.welding_current_4,
      machine_current_1: serviceRecord.machine_current_1,
      machine_current_2: serviceRecord.machine_current_2,
      machine_current_3: serviceRecord.machine_current_3,
      machine_current_4: serviceRecord.machine_current_4,
      notes: serviceRecord.notes
    }
  });

  const handleTestDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTestDate = e.target.value;
    const retestDate = format(addDays(new Date(newTestDate), 364), 'yyyy-MM-dd');
    form.setValue('test_date', newTestDate);
    form.setValue('retest_date', retestDate);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error: serviceError } = await supabase
        .from('spot_welder_service_records')
        .update({
          engineer_name: values.engineer_name,
          test_date: values.test_date,
          retest_date: values.retest_date,
          status: getStatus(values.retest_date),
          equipment_name: values.equipment_name,
          equipment_serial: values.equipment_serial,
          voltage_max: values.voltage_max,
          voltage_min: values.voltage_min,
          air_pressure: values.air_pressure,
          tip_pressure: values.tip_pressure,
          length: values.length,
          diameter: values.diameter,
          welding_time_1: values.welding_time_1,
          welding_time_2: values.welding_time_2,
          welding_time_3: values.welding_time_3,
          welding_time_4: values.welding_time_4,
          machine_time_1: values.machine_time_1,
          machine_time_2: values.machine_time_2,
          machine_time_3: values.machine_time_3,
          machine_time_4: values.machine_time_4,
          welding_current_1: values.welding_current_1,
          welding_current_2: values.welding_current_2,
          welding_current_3: values.welding_current_3,
          welding_current_4: values.welding_current_4,
          machine_current_1: values.machine_current_1,
          machine_current_2: values.machine_current_2,
          machine_current_3: values.machine_current_3,
          machine_current_4: values.machine_current_4,
          notes: values.notes,
        })
        .eq('id', serviceRecord.id);

      if (serviceError) throw serviceError;

      // Invalidate all relevant queries to trigger a refresh
      await queryClient.invalidateQueries({ queryKey: ['spot-welders'] });
      await queryClient.invalidateQueries({ queryKey: ['spotWelderServiceRecords'] });

      toast({
        title: "Success",
        description: "Spot welder record has been updated",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating spot welder record:", error);
      toast({
        title: "Error",
        description: "Failed to update spot welder record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Equipment Info */}
        <div className="p-4 rounded-lg bg-card border border-border/50">
          <div className="space-y-4">
            {/* Test and Retest Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#94a3b8] font-medium">Test Date</Label>
                <Input
                  type="date"
                  {...form.register("test_date")}
                  onChange={(e) => {
                    const newTestDate = e.target.value;
                    const retestDate = format(addDays(new Date(newTestDate), 364), 'yyyy-MM-dd');
                    form.setValue('test_date', newTestDate);
                    form.setValue('retest_date', retestDate);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#94a3b8] font-medium">Retest Date</Label>
                <Input
                  type="date"
                  {...form.register("retest_date")}
                  disabled
                />
              </div>
            </div>

            {/* Model, Serial, and Engineer */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[#94a3b8] font-medium">Model</Label>
                <Input
                  {...form.register("equipment_name")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#94a3b8] font-medium">Serial</Label>
                <Input
                  {...form.register("equipment_serial")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#94a3b8] font-medium">Engineer</Label>
                <ServiceEngineerSelect
                  selectedEngineer={form.watch("engineer_name")}
                  setSelectedEngineer={(value) => form.setValue("engineer_name", value)}
                  hideLabel
                />
              </div>
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="p-4 rounded-lg bg-card border border-border/50">
          <h3 className="text-lg font-medium mb-4 text-[#94a3b8]">Parameters</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Voltage Max</Label>
              <Input
                type="number"
                {...form.register("voltage_max", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Voltage Min</Label>
              <Input
                type="number"
                {...form.register("voltage_min", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Air Pressure</Label>
              <Input
                type="number"
                {...form.register("air_pressure", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Tip Pressure</Label>
              <Input
                type="number"
                {...form.register("tip_pressure", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Length</Label>
              <Input
                type="number"
                {...form.register("length", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Diameter</Label>
              <Input
                type="number"
                {...form.register("diameter", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        {/* Welding Readings */}
        <div className="p-4 rounded-lg bg-card border border-border/50">
          <h3 className="text-lg font-medium mb-4 text-[#94a3b8]">Welding Readings</h3>
          <div className="grid grid-cols-4 gap-4 mb-2">
            <Label className="text-[#94a3b8] font-medium">Welding Current</Label>
            <Label className="text-[#94a3b8] font-medium">Machine Current</Label>
            <Label className="text-[#94a3b8] font-medium">Welding Time</Label>
            <Label className="text-[#94a3b8] font-medium">Machine Time</Label>
          </div>
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="grid grid-cols-4 gap-4 mb-4">
              <Input
                type="number"
                {...form.register(`welding_current_${index}` as keyof FormValues, { valueAsNumber: true })}
              />
              <Input
                type="number"
                {...form.register(`machine_current_${index}` as keyof FormValues, { valueAsNumber: true })}
              />
              <Input
                type="number"
                {...form.register(`welding_time_${index}` as keyof FormValues, { valueAsNumber: true })}
              />
              <Input
                type="number"
                {...form.register(`machine_time_${index}` as keyof FormValues, { valueAsNumber: true })}
              />
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="p-4 rounded-lg bg-card border border-border/50">
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Notes</Label>
            <Textarea
              {...form.register("notes")}
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
            disabled={isSubmitting}
            style={{ 
              backgroundColor: theme === 'dark' ? '#a6e15a' : '#FFFFFF',
              color: theme === 'dark' ? '#1a1a1a' : '#000000',
              border: theme === 'light' ? '1px solid #e2e8f0' : 'none'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}