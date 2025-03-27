import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AddServiceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export function AddServiceCertificateModal({ isOpen, onClose, customerId }: AddServiceCertificateModalProps) {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date());
  const [retestDate, setRetestDate] = useState<Date | undefined>(undefined);
  const [engineer, setEngineer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateNumber || !issueDate || !retestDate || !engineer) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: serviceData, error: serviceError } = await supabase
        .from('service_records')
        .insert({
          company_id: customerId,
          engineer_id: user.id,
          test_date: values.test_date,
          retest_date: values.next_test_date,
          status: 'valid',
          notes: values.notes,
          equipment1_name: values.equipment1_name,
          equipment1_serial: values.equipment1_serial,
          equipment2_name: values.equipment2_name,
          equipment2_serial: values.equipment2_serial,
          equipment3_name: values.equipment3_name,
          equipment3_serial: values.equipment3_serial,
          equipment4_name: values.equipment4_name,
          equipment4_serial: values.equipment4_serial,
          equipment5_name: values.equipment5_name,
          equipment5_serial: values.equipment5_serial,
          equipment6_name: values.equipment6_name,
          equipment6_serial: values.equipment6_serial,
          equipment7_name: values.equipment7_name,
          equipment7_serial: values.equipment7_serial,
          equipment8_name: values.equipment8_name,
          equipment8_serial: values.equipment8_serial,
        })
        .select()
        .single();
        
      if (serviceError) throw serviceError;
      
      toast({
        title: "Success",
        description: "Service record added successfully",
      });
      
      // Reset form
      setCertificateNumber("");
      setIssueDate(new Date());
      setRetestDate(undefined);
      setEngineer("");
      
      // Close dialog
      onClose();
      
      // Refresh data
      queryClient.invalidateQueries(["service-records", customerId]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add service record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Service Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificate-number">Certificate Number</Label>
            <Input
              id="certificate-number"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="Enter certificate number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issue-date">Issue Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !issueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {issueDate ? format(issueDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={issueDate}
                  onSelect={setIssueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="retest-date">Retest Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !retestDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {retestDate ? format(retestDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={retestDate}
                  onSelect={setRetestDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="engineer">Engineer</Label>
            <Input
              id="engineer"
              value={engineer}
              onChange={(e) => setEngineer(e.target.value)}
              placeholder="Enter engineer name"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 