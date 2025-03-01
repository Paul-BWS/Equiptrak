import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
}

const ENGINEERS = [
  "Paul Jones",
  "Danny Jennings",
  "Mark Allen",
  "Tommy Hannon",
  "Connor Hill",
  "Dominic TJ",
  "Mason Poulton",
  "Zack Collins",
  "Fernando Goulart"
];

function AddServiceDialog({ open, onOpenChange, customerId, customerName }: AddServiceDialogProps) {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date());
  const [retestDate, setRetestDate] = useState<Date | undefined>(addDays(new Date(), 364));
  const [engineer, setEngineer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCertNumber, setIsGeneratingCertNumber] = useState(true);
  
  // Equipment state
  const [equipment, setEquipment] = useState([
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" }
  ]);
  
  const [notes, setNotes] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate certificate number on load
  useEffect(() => {
    const generateCertificateNumber = async () => {
      try {
        setIsGeneratingCertNumber(true);
        
        // Get the count of existing records to determine the next number
        const { count, error } = await supabase
          .from("service_records")
          .select("*", { count: "exact", head: true });
          
        if (error) throw error;
        
        // Generate certificate number (BWS-2000 + count)
        const nextNumber = 2000 + (count || 0);
        const certificateNumber = `BWS-${nextNumber}`;
        
        setCertificateNumber(certificateNumber);
      } catch (error) {
        console.error("Error generating certificate number:", error);
        setCertificateNumber("BWS-ERROR");
      } finally {
        setIsGeneratingCertNumber(false);
      }
    };
    
    if (open) {
      generateCertificateNumber();
    }
  }, [open]);

  // Update retest date when issue date changes
  useEffect(() => {
    if (issueDate) {
      setRetestDate(addDays(issueDate, 364));
    }
  }, [issueDate]);

  const handleEquipmentChange = (index: number, field: 'name' | 'serial', value: string) => {
    const newEquipment = [...equipment];
    newEquipment[index][field] = value;
    setEquipment(newEquipment);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateNumber || !issueDate || !retestDate || !engineer) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("service_records")
        .insert({
          company_id: customerId,
          certificate_number: certificateNumber,
          engineer_name: engineer,
          test_date: issueDate.toISOString(),
          retest_date: retestDate.toISOString(),
          status: "valid",
          equipment1_name: equipment[0].name,
          equipment1_serial: equipment[0].serial,
          equipment2_name: equipment[1].name,
          equipment2_serial: equipment[1].serial,
          equipment3_name: equipment[2].name,
          equipment3_serial: equipment[2].serial,
          equipment4_name: equipment[3].name,
          equipment4_serial: equipment[3].serial,
          equipment5_name: equipment[4].name,
          equipment5_serial: equipment[4].serial,
          equipment6_name: equipment[5].name,
          equipment6_serial: equipment[5].serial,
          notes: notes,
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service record added successfully",
      });
      
      // Reset form
      setCertificateNumber("");
      setIssueDate(new Date());
      setRetestDate(addDays(new Date(), 364));
      setEngineer("");
      setEquipment([
        { name: "", serial: "" },
        { name: "", serial: "" },
        { name: "", serial: "" },
        { name: "", serial: "" },
        { name: "", serial: "" },
        { name: "", serial: "" }
      ]);
      setNotes("");
      
      // Close dialog
      onOpenChange(false);
      
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

  const { data: customers } = useQuery({
    queryKey: ["customers-for-service"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, company_name")
        .order("company_name");
        
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Service Record for {customerName}</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new service record
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificate-number">Certificate Number</Label>
            <Input
              id="certificate-number"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              disabled={isGeneratingCertNumber}
              placeholder="Enter certificate number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="engineer">Engineer</Label>
            <Select onValueChange={setEngineer} value={engineer}>
              <SelectTrigger>
                <SelectValue placeholder="Select engineer" />
              </SelectTrigger>
              <SelectContent>
                {ENGINEERS.map((eng) => (
                  <SelectItem key={eng} value={eng}>
                    {eng}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  disabled
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
          
          <div className="space-y-4">
            <h3 className="font-medium">Equipment Details</h3>
            
            {equipment.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`equipment-${index}-name`}>Equipment {index + 1}</Label>
                  <Input
                    id={`equipment-${index}-name`}
                    value={item.name}
                    onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                    placeholder="Enter equipment name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`equipment-${index}-serial`}>Serial Number</Label>
                  <Input
                    id={`equipment-${index}-serial`}
                    value={item.serial}
                    onChange={(e) => handleEquipmentChange(index, 'serial', e.target.value)}
                    placeholder="Enter serial number"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes"
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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

export const ServiceDialogs = {
  Add: AddServiceDialog,
}; 