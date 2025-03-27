import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface AddCompressorModalProps {
  customerId: string;
}

export function AddCompressorModal({ customerId }: AddCompressorModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    serial_number: "",
    model: "",
    manufacturer: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("Submit button clicked");
    console.log("Form data:", formData);
    console.log("Customer ID:", customerId);
    
    if (!customerId) {
      toast.error("Customer ID is required");
      return;
    }
    
    if (!formData.name || !formData.serial_number) {
      toast.error("Name and Serial are required");
      return;
    }
    
    setLoading(true);

    try {
      // Insert the new compressor directly
      const nextTestDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      
      // Direct insert with correct field names
      const { data: compressorData, error: compressorError } = await supabase
        .from('compressor_equipment')
        .insert({
          name: formData.name,
          serial_number: formData.serial_number,
          company_id: customerId,
          status: 'valid',
          type: 'compressor',
          next_test_date: nextTestDate,
          last_test_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (compressorError) {
        console.error("Error inserting compressor:", compressorError);
        throw compressorError;
      }

      // Invalidate queries to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["compressors", customerId] });

      toast.success("Compressor added successfully");
      
      // Reset form and close modal
      setFormData({
        name: "",
        serial_number: "",
        model: "",
        manufacturer: "",
      });
      
      // Force close the modal
      setOpen(false);
    } catch (error: any) {
      console.error("Error adding compressor:", error);
      toast.error(error.message || "Failed to add compressor");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    // Reset form when closing
    if (!newOpen) {
      setFormData({
        name: "",
        serial_number: "",
        model: "",
        manufacturer: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="h-14 w-14 rounded-full shadow-lg p-0 bg-[#7b96d4] hover:bg-[#6a85c3] text-white"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Compressor</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serial_number" className="text-right">
              Serial
            </Label>
            <Input
              id="serial_number"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Input
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="manufacturer" className="text-right">
              Manufacturer
            </Label>
            <Input
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-[#7b96d4] hover:bg-[#6a85c3] text-white"
            type="button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 