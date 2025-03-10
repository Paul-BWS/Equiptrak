import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddSpotWelderForm } from "./add-modal/AddSpotWelderForm";

export interface AddSpotWelderModalProps {
  customerId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddSpotWelderModal({ 
  customerId,
  open,
  onOpenChange
}: AddSpotWelderModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use the controlled state if provided, otherwise use internal state
  const isDialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      {/* Only render the trigger if we're using internal state */}
      {open === undefined && (
        <DialogTrigger asChild>
          <Button>Add Spot Welder</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Spot Welder</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
          <AddSpotWelderForm
            customerId={customerId}
            onSuccess={() => setDialogOpen(false)}
            onCancel={() => setDialogOpen(false)}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}