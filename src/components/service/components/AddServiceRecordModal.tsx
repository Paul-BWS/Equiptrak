import { useState, useEffect } from "react";
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
import { format, addDays } from "date-fns";

interface AddServiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export function AddServiceRecordModal({ isOpen, onClose, customerId }: AddServiceRecordModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [technicianName, setTechnicianName] = useState("");
  const [serviceDate, setServiceDate] = useState<Date>(new Date());
  const [nextServiceDate, setNextServiceDate] = useState<Date>(addDays(new Date(), 364));
  const [notes, setNotes] = useState("");
  
  // Update next service date when service date changes
  useEffect(() => {
    if (serviceDate) {
      // Calculate next service date as 364 days after service date
      setNextServiceDate(addDays(serviceDate, 364));
    }
  }, [serviceDate]);

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
      // Prepare data for insert
      const recordData = {
        company_id: customerId,
        engineer_id: user.id,
        test_date: format(serviceDate, "yyyy-MM-dd"),
        retest_date: format(nextServiceDate, "yyyy-MM-dd"),
        status: "valid",
        notes: notes,
        equipment1_name: "",
        equipment1_serial: "",
        equipment2_name: "",
        equipment2_serial: "",
        equipment3_name: "",
        equipment3_serial: "",
        equipment4_name: "",
        equipment4_serial: "",
        equipment5_name: "",
        equipment5_serial: "",
        equipment6_name: "",
        equipment6_serial: "",
        equipment7_name: "",
        equipment7_serial: "",
        equipment8_name: "",
        equipment8_serial: "",
      };

      // Use promise chaining for supabase insert
      const { data: serviceData, error: serviceError } = await supabase
        .from('service_records')
        .insert(recordData)
        .select()
        .single();

      if (serviceError) throw serviceError;
      
      toast({
        title: "Success",
        description: "Service record added successfully"
      });
      
      // Refresh the service records list
      queryClient.invalidateQueries({ queryKey: ["service-records", customerId] });
      
      // Close the modal and reset form
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Error creating service record:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service record",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setServiceDate(new Date());
    setNextServiceDate(addDays(new Date(), 364));
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
              <Label htmlFor="service-date" className="text-xs text-gray-500 font-medium">SERVICE DATE</Label>
              <DatePicker
                date={serviceDate}
                setDate={setServiceDate}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="next-service-date" className="text-xs text-gray-500 font-medium">NEXT SERVICE DATE</Label>
              <DatePicker
                date={nextServiceDate}
                setDate={setNextServiceDate}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="technician" className="text-xs text-gray-500 font-medium">TECHNICIAN NAME</Label>
            <Input
              id="technician"
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              placeholder=""
              required
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs text-gray-500 font-medium">NOTES</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder=""
              rows={4}
              className="bg-gray-50"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#a6e15a] hover:bg-opacity-90 text-white dark:bg-[#a6e15a] dark:text-white light:bg-white light:text-black light:border light:border-gray-300"
              disabled={isSubmitting}
            >
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