import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceRecord } from "@/types/database";
import { ViewServiceForm } from "../forms/ViewServiceForm";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ServiceRecord | null;
}

export function ViewServiceModal({ open, onOpenChange, record }: ViewServiceModalProps) {
  if (!open) return null;
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>View Service Record</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
          <ViewServiceForm 
            serviceRecord={record}
            recordId={record.id}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 