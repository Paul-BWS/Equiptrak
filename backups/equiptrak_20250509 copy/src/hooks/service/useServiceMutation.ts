import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useServiceMutation(onSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateCertificateNumber = async () => {
    console.log("Generating certificate number");
    const { data, error } = await supabase.rpc('generate_certificate_number');
    
    if (error) {
      console.error("Error generating certificate number:", error);
      throw error;
    }
    
    console.log("Generated certificate number:", data);
    return data;
  };

  return useMutation({
    mutationFn: async ({
      customerId,
      selectedEngineer,
      testDate,
      retestDate,
      status,
      notes,
      equipment_id,
      equipment1_name,
      equipment1_serial,
      equipment2_name,
      equipment2_serial,
      equipment3_name,
      equipment3_serial,
      equipment4_name,
      equipment4_serial,
      equipment5_name,
      equipment5_serial,
      equipment6_name,
      equipment6_serial,
      equipment7_name,
      equipment7_serial,
      equipment8_name,
      equipment8_serial,
    }: {
      customerId: string;
      selectedEngineer: string;
      testDate: Date;
      retestDate: Date;
      status: "valid" | "upcoming" | "expired";
      notes: string;
      equipment_id: string;
      equipment1_name: string;
      equipment1_serial: string;
      equipment2_name?: string | null;
      equipment2_serial?: string | null;
      equipment3_name?: string | null;
      equipment3_serial?: string | null;
      equipment4_name?: string | null;
      equipment4_serial?: string | null;
      equipment5_name?: string | null;
      equipment5_serial?: string | null;
      equipment6_name?: string | null;
      equipment6_serial?: string | null;
      equipment7_name?: string | null;
      equipment7_serial?: string | null;
      equipment8_name?: string | null;
      equipment8_serial?: string | null;
    }) => {
      if (!selectedEngineer) {
        throw new Error("No engineer selected");
      }

      const certificateNumber = await generateCertificateNumber();

      console.log("Creating service record with data:", {
        engineer_id: selectedEngineer,
        test_date: testDate,
        certificate_number: certificateNumber,
        equipment1_name,
        equipment1_serial,
      });

      const { data, error } = await supabase
        .from("service_records")
        .insert({
          engineer_id: selectedEngineer,
          equipment_id, // Using the passed equipment_id instead of customerId
          test_date: testDate.toISOString(),
          retest_date: retestDate.toISOString(),
          status,
          notes,
          certificate_number: certificateNumber,
          equipment1_name,
          equipment1_serial,
          equipment2_name,
          equipment2_serial,
          equipment3_name,
          equipment3_serial,
          equipment4_name,
          equipment4_serial,
          equipment5_name,
          equipment5_serial,
          equipment6_name,
          equipment6_serial,
          equipment7_name,
          equipment7_serial,
          equipment8_name,
          equipment8_serial,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating service record:", error);
        throw error;
      }

      console.log("Service record created:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service record has been created",
      });
      queryClient.invalidateQueries({ queryKey: ["serviceRecords"] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error in createServiceRecord mutation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create service record",
        variant: "destructive",
      });
    },
  });
}