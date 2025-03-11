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
    equipment_name: "",
    equipment_serial: "",
    model: "",
    manufacturer: "",
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get the equipment type ID for compressor
      const { data: equipmentTypeData, error: equipmentTypeError } = await supabase
        .from("equipment_types")
        .select("id")
        .eq("name", "compressor")
        .single();

      if (equipmentTypeError) throw equipmentTypeError;

      // Insert the new compressor
      const { data, error } = await supabase.from("equipment").insert({
        customer_id: customerId,
        equipment_type_id: equipmentTypeData.id,
        ...formData,
        next_test_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default to 1 year from now
      });

      if (error) throw error;

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["compressors", customerId] });

      toast.success("Compressor added successfully");
      setOpen(false);
      setFormData({
        equipment_name: "",
        equipment_serial: "",
        model: "",
        manufacturer: "",
        location: "",
      });
    } catch (error: any) {
      console.error("Error adding compressor:", error);
      toast.error(error.message || "Failed to add compressor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Compressor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Compressor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="equipment_name">Equipment Name</Label>
            <Input
              id="equipment_name"
              name="equipment_name"
              value={formData.equipment_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment_serial">Serial Number</Label>
            <Input
              id="equipment_serial"
              name="equipment_serial"
              value={formData.equipment_serial}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Compressor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 