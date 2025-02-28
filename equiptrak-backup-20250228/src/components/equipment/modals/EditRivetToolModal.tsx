import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RivetToolRecord } from "@/types/database/rivet-tools";
import { ReactNode, useState } from "react";
import { EditRivetToolForm } from "./forms/EditRivetToolForm";

interface EditRivetToolModalProps {
  customerId: string;
  record: RivetToolRecord;
  trigger: ReactNode;
  onSuccess?: () => void;
}

export function EditRivetToolModal({
  customerId,
  record,
  trigger,
  onSuccess,
}: EditRivetToolModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Rivet Tool</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <EditRivetToolForm
            customerId={customerId}
            record={record}
            onSuccess={() => {
              setOpen(false);
              onSuccess?.();
            }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 