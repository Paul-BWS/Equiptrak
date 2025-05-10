import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddRivetToolForm } from "./forms/AddRivetToolForm";

interface AddRivetToolModalProps {
  customerId: string;
  onSuccess?: () => void;
}

export function AddRivetToolModal({ customerId, onSuccess }: AddRivetToolModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#a6e15a] hover:bg-[#a6e15a]/90 text-black">
          <Plus className="h-4 w-4" />
          Add Rivet Tool
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Rivet Tool</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <AddRivetToolForm
            customerId={customerId}
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