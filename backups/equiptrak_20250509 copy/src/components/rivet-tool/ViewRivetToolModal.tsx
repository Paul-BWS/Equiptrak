import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ViewRivetToolForm } from "./view-modal/ViewRivetToolForm";
import { useRivetToolServiceQuery } from "@/hooks/service/useRivetToolServiceQuery";

interface ViewRivetToolModalProps {
  equipmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewRivetToolModal({ equipmentId, open, onOpenChange }: ViewRivetToolModalProps) {
  const { data: serviceRecord, isLoading, refetch } = useRivetToolServiceQuery(equipmentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Rivet Tool Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading records...</div>
          </div>
        ) : serviceRecord ? (
          <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
            <ViewRivetToolForm 
              serviceRecord={serviceRecord}
              equipmentId={equipmentId}
              onSuccess={() => {
                refetch();
                onOpenChange(false);
              }}
              onCancel={() => onOpenChange(false)}
            />
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">No rivet tool records found for this equipment.</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}