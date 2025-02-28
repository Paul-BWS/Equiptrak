import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface NewServiceRecordProps {
  customerId: string;
  onSuccess: () => void;
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

export function NewServiceRecord({ customerId, onSuccess }: NewServiceRecordProps) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [certificateNumber, setCertificateNumber] = useState("");
  const [engineer, setEngineer] = useState("");
  const [testDate, setTestDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [retestDate, setRetestDate] = useState(format(addDays(new Date(), 364), "yyyy-MM-dd"));
  const [isGeneratingCertNumber, setIsGeneratingCertNumber] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Generate certificate number when modal opens
  useEffect(() => {
    if (open) {
      generateCertificateNumber();
    }
  }, [open]);

  // Update retest date when test date changes
  useEffect(() => {
    if (testDate) {
      const newRetestDate = format(addDays(new Date(testDate), 364), "yyyy-MM-dd");
      setRetestDate(newRetestDate);
    }
  }, [testDate]);

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

  const handleEquipmentChange = (index: number, field: 'name' | 'serial', value: string) => {
    const newEquipment = [...equipment];
    newEquipment[index][field] = value;
    setEquipment(newEquipment);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateNumber || !testDate || !retestDate || !engineer) {
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
          customer_id: customerId,
          certificate_number: certificateNumber,
          engineer_name: engineer,
          test_date: testDate,
          retest_date: retestDate,
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
      
      // Reset form and close modal
      setOpen(false);
      onSuccess();
      
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
    <>
      <Button 
        onClick={() => setOpen(true)}
        className={`gap-2 ${
          theme === "light"
            ? "bg-[#7b96d4] text-white"
            : "bg-[#a6e15a] text-[#1a1a1a]"
        }`}
      >
        <Plus className="h-4 w-4" />
        Add Service
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>New Service Record</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Certificate and Engineer Section */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="certificate-number">Certificate Number</Label>
                <Input
                  id="certificate-number"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  disabled={isGeneratingCertNumber}
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
            </div>
            
            {/* Test Date and Retest Date Section */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="test-date">Test Date</Label>
                <Input
                  id="test-date"
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retest-date">Retest Date</Label>
                <Input
                  id="retest-date"
                  type="date"
                  value={retestDate}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            {/* Equipment Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Equipment Details</h3>
              
              {equipment.map((item, index) => (
                <div key={index} className="grid grid-cols-2 gap-6">
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
            
            {/* Notes Section */}
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
            
            {/* Footer */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 