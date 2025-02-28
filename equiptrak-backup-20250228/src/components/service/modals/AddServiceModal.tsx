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
import { useState } from "react";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`gap-2 ${
            theme === "light"
              ? "bg-[#7b96d4] text-white"
              : "bg-[#a6e15a] text-[#1a1a1a]"
          }`}
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-gray-100">
        <DialogHeader className="bg-white p-4 rounded-t-lg border border-gray-200">
          <DialogTitle>Add Service Record</DialogTitle>
          <DialogDescription>
            Add a new service record to the system
          </DialogDescription>
        </DialogHeader>
        <AddServiceForm
          customerId={customerId}
          onSuccess={() => {
            setOpen(false);
            onSuccess();
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 