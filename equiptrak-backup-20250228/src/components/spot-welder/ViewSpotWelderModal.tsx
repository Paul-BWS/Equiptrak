import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ViewSpotWelderForm } from "./view-modal/ViewSpotWelderForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getStatus } from "@/utils/serviceStatus";

interface ViewSpotWelderModalProps {
  equipmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewSpotWelderModal({ equipmentId, open, onOpenChange }: ViewSpotWelderModalProps) {
  const { data: serviceRecords, isLoading, refetch } = useQuery({
    queryKey: ['spotWelderServiceRecords', equipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spot_welder_service_records')
        .select('*')
        .eq('id', equipmentId)
        .order('test_date', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include calculated status
      return data?.map(record => ({
        ...record,
        status: getStatus(record.retest_date)
      }));
    },
    enabled: open && !!equipmentId,
  });

  const latestRecord = serviceRecords?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Spot Welder Service Records</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div>Loading records...</div>
        ) : latestRecord ? (
          <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
            <ViewSpotWelderForm 
              serviceRecord={latestRecord}
              equipmentId={equipmentId}
              onSuccess={() => {
                refetch();
                onOpenChange(false);
              }}
              onCancel={() => onOpenChange(false)}
            />
          </ScrollArea>
        ) : (
          <div>No service records found for this spot welder.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}