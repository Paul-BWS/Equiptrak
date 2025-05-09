import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDeleteEquipmentMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipmentId: string) => {
      // First, delete any associated compressor service records
      const { error: serviceError } = await supabase
        .from("compressor_service_records")
        .delete()
        .eq("equipment_id", equipmentId);

      if (serviceError) {
        console.error("Error deleting service records:", serviceError);
        throw serviceError;
      }

      // Then delete the equipment itself
      const { error: equipmentError } = await supabase
        .from("equipment")
        .delete()
        .eq("id", equipmentId);

      if (equipmentError) {
        console.error("Error deleting equipment:", equipmentError);
        throw equipmentError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Equipment has been deleted",
      });
      // Invalidate both equipment and compressor queries
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["compressors"] });
    },
    onError: (error) => {
      console.error("Error deleting equipment:", error);
      toast({
        title: "Error",
        description: "Failed to delete equipment. Please try again.",
        variant: "destructive",
      });
    },
  });
}