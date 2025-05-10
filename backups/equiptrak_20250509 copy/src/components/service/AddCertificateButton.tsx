import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddServiceButton } from "./AddServiceButton";

export function AddCertificateButton({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-[#7b96d4] hover:bg-[#6a85c3] text-white gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Service
      </Button>
      
      {open && (
        <AddServiceButton customerId={customerId} />
      )}
    </>
  );
} 