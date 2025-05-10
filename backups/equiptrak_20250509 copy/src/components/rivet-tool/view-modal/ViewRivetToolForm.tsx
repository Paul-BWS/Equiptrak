import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ServiceEngineerSelect } from "../../service/components/ServiceEngineerSelect";
import { useToast } from "../../../hooks/use-toast";
import { supabase } from "../../../integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { useForm } from "react-hook-form";
import { RivetToolReadings } from "./components/RivetToolReadings";

interface ViewRivetToolFormProps {
  serviceRecord: any;
  equipmentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type FormValues = {
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
};

export function ViewRivetToolForm({
  serviceRecord,
  equipmentId,
  onSuccess,
  onCancel
}: ViewRivetToolFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEngineer, setSelectedEngineer] = useState(serviceRecord.engineer_id);
  const [certificateNumber, setCertificateNumber] = useState("");

  useEffect(() => {
    const generateCertificateNumber = async () => {
      if (serviceRecord.certificate_number) {
        setCertificateNumber(serviceRecord.certificate_number);
        return;
      }

      // Get a new certificate number using the database function
      const { data: newCertificateNumber, error } = await supabase
        .rpc('generate_rivet_tool_certificate_number');

      if (error) {
        console.error('Error generating certificate number:', error);
        return;
      }

      setCertificateNumber(newCertificateNumber);

      // Update the service record with the new certificate number
      const { error: updateError } = await supabase
        .from('rivet_tool_service_records')
        .update({ certificate_number: newCertificateNumber })
        .eq('id', serviceRecord.id);

      if (updateError) {
        console.error('Error updating certificate number:', updateError);
      }
    };

    generateCertificateNumber();
  }, [serviceRecord.id, serviceRecord.certificate_number]);

  const form = useForm<FormValues>({
    defaultValues: {
      model: serviceRecord.equipment1_name,
      serialNumber: serviceRecord.equipment1_serial,
      test_date: format(new Date(serviceRecord.test_date), "yyyy-MM-dd"),
      retest_date: format(new Date(serviceRecord.retest_date), "yyyy-MM-dd"),
      machine_setting_1: serviceRecord.machine_setting_1,
      machine_setting_2: serviceRecord.machine_setting_2,
      machine_setting_3: serviceRecord.machine_setting_3,
      machine_setting_4: serviceRecord.machine_setting_4,
      actual_reading_1: serviceRecord.actual_reading_1,
      actual_reading_2: serviceRecord.actual_reading_2,
      actual_reading_3: serviceRecord.actual_reading_3,
      actual_reading_4: serviceRecord.actual_reading_4,
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const { error } = await supabase
        .from('rivet_tool_service_records')
        .update({
          engineer_id: selectedEngineer,
          test_date: data.test_date,
          retest_date: data.retest_date,
          equipment1_name: data.model,
          equipment1_serial: data.serialNumber,
          machine_setting_1: data.machine_setting_1,
          machine_setting_2: data.machine_setting_2,
          machine_setting_3: data.machine_setting_3,
          machine_setting_4: data.machine_setting_4,
          actual_reading_1: data.actual_reading_1,
          actual_reading_2: data.actual_reading_2,
          actual_reading_3: data.actual_reading_3,
          actual_reading_4: data.actual_reading_4,
        })
        .eq('id', serviceRecord.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['rivetToolServiceRecord'] });
      
      toast({
        title: "Success",
        description: "Service record updated successfully",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error updating service record:', error);
      toast({
        title: "Error",
        description: "Failed to update service record",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Certificate Number</Label>
            <Input 
              value={certificateNumber}
              disabled 
              className="bg-muted h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Test Date</Label>
            <Input
              type="date"
              {...form.register("test_date")}
              className="bg-muted h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Retest Date</Label>
            <Input
              type="date"
              {...form.register("retest_date")}
              disabled
              className="bg-muted h-12 text-lg"
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Model</Label>
            <Input {...form.register("model")} className="bg-muted h-12 text-lg" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Serial</Label>
            <Input {...form.register("serialNumber")} className="bg-muted h-12 text-lg" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Engineer</Label>
            <ServiceEngineerSelect
              selectedEngineer={selectedEngineer}
              setSelectedEngineer={setSelectedEngineer}
            />
          </div>
        </div>
      </div>

      <RivetToolReadings register={form.register} />

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
} 