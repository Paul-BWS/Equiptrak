import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

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

export function AddServiceButton({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
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

  // Handle date change and update retest date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTestDate(newDate);
    
    try {
      // Calculate retest date (364 days after test date)
      const parsedDate = parseISO(newDate);
      const newRetestDate = format(addDays(parsedDate, 364), "yyyy-MM-dd");
      setRetestDate(newRetestDate);
    } catch (error) {
      console.error("Error calculating retest date:", error);
    }
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
      // Log the data we're trying to insert for debugging
      console.log("Inserting service record with data:", {
        company_id: customerId,
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

      const { error } = await supabase
        .from("service_records")
        .insert({
          company_id: customerId,
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
      
      // Refresh data without page reload
      queryClient.invalidateQueries({ queryKey: ["service-records", customerId] });
      
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

  // Style for field headers
  const fieldHeaderStyle = "text-xs text-gray-400 uppercase mb-1 tracking-wider";

  return (
    <>
      <Button 
        onClick={() => {
          setOpen(true);
          generateCertificateNumber();
        }}
        className="bg-[#7b96d4] hover:bg-[#6a85c3] text-white gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Service
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Service Record</DialogTitle>
            <DialogDescription>
              Add a new service record to the system
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top section with certificate, engineer, dates */}
            <div className="space-y-6">
              {/* Certificate and Engineer row */}
              <div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className={fieldHeaderStyle}>Certificate No</div>
                    <Input
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                      disabled={isGeneratingCertNumber}
                      className="bg-gray-50 text-base"
                    />
                  </div>
                  
                  <div>
                    <div className={fieldHeaderStyle}>Engineer</div>
                    <Select onValueChange={setEngineer} value={engineer}>
                      <SelectTrigger className="bg-gray-50 text-base">
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
              </div>
              
              {/* Date and Retest Date row */}
              <div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className={fieldHeaderStyle}>Date</div>
                    <Input
                      type="date"
                      value={testDate}
                      onChange={handleDateChange}
                      className="bg-gray-50 text-base"
                    />
                  </div>
                  
                  <div>
                    <div className={fieldHeaderStyle}>Retest Date</div>
                    <Input
                      type="date"
                      value={retestDate}
                      disabled
                      className="bg-gray-50 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Equipment Section */}
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className={fieldHeaderStyle}>Equipment</div>
                <div className={fieldHeaderStyle}>Machine Serial</div>
                
                {equipment.map((item, index) => (
                  <React.Fragment key={index}>
                    <Input
                      value={item.name}
                      onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                      className="bg-gray-50 text-base"
                    />
                    <Input
                      value={item.serial}
                      onChange={(e) => handleEquipmentChange(index, 'serial', e.target.value)}
                      className="bg-gray-50 text-base"
                    />
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Notes Section */}
            <div>
              <div className={fieldHeaderStyle}>Notes</div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-20 bg-gray-50 text-base"
              />
            </div>
            
            {/* Footer */}
            <DialogFooter className="pt-2">
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