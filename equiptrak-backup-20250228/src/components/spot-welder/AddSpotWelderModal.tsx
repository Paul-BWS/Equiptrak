import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddSpotWelderForm } from "./add-modal/AddSpotWelderForm";

interface AddSpotWelderModalProps {
  customerId: string;
}

export function AddSpotWelderModal({ customerId }: AddSpotWelderModalProps) {
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
        Add Spot Welder
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Spot Welder</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
            <AddSpotWelderForm
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