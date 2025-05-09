import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddRivetToolForm } from "./add-modal/AddRivetToolForm";

interface AddRivetToolModalProps {
  customerId: string;
}

export function AddRivetToolModal({ customerId }: AddRivetToolModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="dark:bg-[#a6e15a] dark:text-black dark:hover:bg-[#95cc51] bg-[#7b96d4] text-white hover:bg-[#6a85c3]"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Rivet Tool
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Rivet Tool</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
            <AddRivetToolForm
              customerId={customerId}
              onSuccess={handleSuccess}
              onCancel={() => setOpen(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}