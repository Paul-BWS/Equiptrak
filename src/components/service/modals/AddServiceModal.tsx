import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { AddServiceForm } from "../forms/AddServiceForm";

export function AddServiceModal({ 
  customerId,
  onSuccess 
}: { 
  customerId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Log when the modal state changes
    console.log("AddServiceModal state changed:", open ? "opened" : "closed");
  }, [open]);

  const handleSuccess = () => {
    console.log("Service record added successfully, closing modal and refreshing data");
    setOpen(false);
    // Add a slight delay to ensure state updates properly
    setTimeout(() => {
      onSuccess();
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      console.log("Dialog onOpenChange:", newOpen);
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Button 
          className="bg-[#a6e15a] hover:bg-[#95cc4f] text-white gap-2"
          onClick={() => {
            console.log("Add Service button clicked");
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Service Record
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-4xl bg-gray-100 max-h-[90vh] flex flex-col overflow-hidden" 
        onInteractOutside={(e) => {
          console.log("Click outside modal detected");
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          console.log("Escape key pressed in modal");
          e.preventDefault(); 
        }}
      >
        <DialogHeader className="bg-white p-4 rounded-t-lg border border-gray-200 flex-shrink-0">
          <DialogTitle>Add Service Record</DialogTitle>
          <DialogDescription>
            Add a new service record to the system
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 flex-grow">
          <AddServiceForm
            customerId={customerId}
            onSuccess={handleSuccess}
            onCancel={() => {
              console.log("Cancel button clicked in form");
              setOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 