import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface AddServiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export function AddServiceRecordModal({ isOpen, onClose, customerId }: AddServiceRecordModalProps) {
  const [serviceDate, setServiceDate] = useState<Date | undefined>(new Date());
  const [nextServiceDate, setNextServiceDate] = useState<Date | undefined>(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  );
  const [technicianName, setTechnicianName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceDate || !nextServiceDate || !technicianName) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from("service_records")
        .insert({
          customer_id: customerId,
          service_date: serviceDate.toISOString(),
          next_service_date: nextServiceDate.toISOString(),
          technician_name: technicianName,
          notes: notes,
          status: "completed"
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Service record added",
        description: "The service record has been added successfully",
      });
      
      // Refresh the service records list
      queryClient.invalidateQueries({ queryKey: ["service-records", customerId] });
      
      // Close the modal and reset form
      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error adding service record",
        description: error.message || "An error occurred while adding the service record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setServiceDate(new Date());
    setNextServiceDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
    setTechnicianName("");
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Service Record</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-date">Service Date</Label>
              <DatePicker
                date={serviceDate}
                setDate={setServiceDate}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="next-service-date">Next Service Date</Label>
              <DatePicker
                date={nextServiceDate}
                setDate={setNextServiceDate}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="technician">Technician Name</Label>
            <Input
              id="technician"
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              placeholder="Enter technician name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter service notes"
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Service Record"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 