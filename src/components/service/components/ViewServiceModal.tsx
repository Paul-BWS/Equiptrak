import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { DatePicker } from "@/components/ui/date-picker";

interface ViewServiceModalProps {
  serviceId: string;
  onClose: () => void;
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

export function ViewServiceModal({ serviceId, onClose }: ViewServiceModalProps) {
  const [open, setOpen] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [certificateNumber, setCertificateNumber] = useState("");
  const [engineer, setEngineer] = useState("");
  const [testDate, setTestDate] = useState("");
  const [retestDate, setRetestDate] = useState("");
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
  
  const { data: service, isLoading } = useQuery({
    queryKey: ["service-record", serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      
      const { data, error } = await supabase
        .from("service_records")
        .select(`
          *,
          companies (
            company_name
          )
        `)
        .eq("id", serviceId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId && open,
  });

  // Load service record data when service changes
  useEffect(() => {
    if (service) {
      // Set a proper BWS-2000 format certificate number if missing
      if (!service.certificate_number) {
        setCertificateNumber("BWS-2000");
      } else if (!service.certificate_number.startsWith("BWS-")) {
        setCertificateNumber(`BWS-${service.certificate_number}`);
      } else {
        setCertificateNumber(service.certificate_number);
      }
      
      setEngineer(service.engineer_name || "");
      
      // For date fields, ensure we have proper Date objects
      let testDateObj: Date;
      if (service.test_date) {
        testDateObj = new Date(service.test_date);
      } else if (service.service_date) {
        testDateObj = new Date(service.service_date);
      } else {
        testDateObj = new Date();
      }
      
      // Format test date for display and store it
      const formattedTestDate = format(testDateObj, "yyyy-MM-dd");
      setTestDate(formattedTestDate);
      
      // ALWAYS calculate retest date as exactly 364 days after test date
      // This OVERRIDES any value from the database to ensure correctness
      const calculatedRetestDate = addDays(testDateObj, 364);
      const formattedRetestDate = format(calculatedRetestDate, "yyyy-MM-dd");
      
      console.log("TEST DATE:", testDateObj.toISOString());
      console.log("CALCULATED RETEST DATE:", calculatedRetestDate.toISOString());
      console.log("FORMATTED TEST DATE:", formattedTestDate);
      console.log("FORMATTED RETEST DATE:", formattedRetestDate);
      
      setRetestDate(formattedRetestDate);
      
      // Set equipment data
      const newEquipment = [...equipment];
      if (service.equipment1_name) newEquipment[0].name = service.equipment1_name;
      if (service.equipment1_serial) newEquipment[0].serial = service.equipment1_serial;
      if (service.equipment2_name) newEquipment[1].name = service.equipment2_name;
      if (service.equipment2_serial) newEquipment[1].serial = service.equipment2_serial;
      if (service.equipment3_name) newEquipment[2].name = service.equipment3_name;
      if (service.equipment3_serial) newEquipment[2].serial = service.equipment3_serial;
      if (service.equipment4_name) newEquipment[3].name = service.equipment4_name;
      if (service.equipment4_serial) newEquipment[3].serial = service.equipment4_serial;
      if (service.equipment5_name) newEquipment[4].name = service.equipment5_name;
      if (service.equipment5_serial) newEquipment[4].serial = service.equipment5_serial;
      if (service.equipment6_name) newEquipment[5].name = service.equipment6_name;
      if (service.equipment6_serial) newEquipment[5].serial = service.equipment6_serial;
      
      setEquipment(newEquipment);
      setNotes(service.notes || "");
    }
  }, [service]);

  // Update retest date when test date changes
  useEffect(() => {
    if (testDate) {
      const newRetestDate = format(addDays(new Date(testDate), 364), "yyyy-MM-dd");
      setRetestDate(newRetestDate);
    }
  }, [testDate]);

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onClose();
    }
  };

  // Handle equipment field change
  const handleEquipmentChange = (index: number, field: 'name' | 'serial', value: string) => {
    const updatedEquipment = [...equipment];
    updatedEquipment[index][field] = value;
    setEquipment(updatedEquipment);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Check if at least one equipment name is provided
      const hasEquipment = equipment.some(item => item.name.trim() !== "");
      
      if (!hasEquipment) {
        toast({
          title: "Error",
          description: "Please enter at least one equipment name",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Format certificate number if needed
      let formattedCertNumber = certificateNumber;
      if (!formattedCertNumber.trim()) {
        formattedCertNumber = "BWS-2000";
      } else if (!formattedCertNumber.startsWith("BWS-")) {
        formattedCertNumber = `BWS-${formattedCertNumber}`;
      }
      
      // Prepare the data to update
      const updateData = {
        certificate_number: formattedCertNumber,
        engineer_name: engineer,
        test_date: testDate,
        retest_date: retestDate,
        status: "valid", // Status will be calculated based on dates
        notes: notes || null,
        equipment1_name: equipment[0].name || null,
        equipment1_serial: equipment[0].serial || null,
        equipment2_name: equipment[1].name || null,
        equipment2_serial: equipment[1].serial || null,
        equipment3_name: equipment[2].name || null,
        equipment3_serial: equipment[2].serial || null,
        equipment4_name: equipment[3].name || null,
        equipment4_serial: equipment[3].serial || null,
        equipment5_name: equipment[4].name || null,
        equipment5_serial: equipment[4].serial || null,
        equipment6_name: equipment[5].name || null,
        equipment6_serial: equipment[5].serial || null,
      };
      
      // Use the supabase client to update the record
      supabase
        .from("service_records")
        .update(updateData)
        .eq("id", serviceId)
        .then(result => {
          if (result.error) {
            throw result.error;
          }
          
          toast({
            title: "Success",
            description: "Service record updated successfully"
          });
          
          // Invalidate queries to refresh the UI
          queryClient.invalidateQueries({ queryKey: ["service-records"] });
          queryClient.invalidateQueries({ queryKey: ["service-record", serviceId] });
          
          // Close the modal
          onClose();
        })
        .catch(error => {
          console.error("Error updating service record:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to update service record",
            variant: "destructive"
          });
          setIsSubmitting(false);
        });
      
    } catch (error: any) {
      console.error("Error updating service record:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update service record",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Service Record Details</DialogTitle>
          <DialogDescription>
            View and update the service record details
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-10 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-4"></div>
            <p>Loading service record...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Certificate and Engineer row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="certificate" className="text-xs text-gray-500 font-medium">CERTIFICATE NO</Label>
                <Input
                  id="certificate"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label htmlFor="engineer" className="text-xs text-gray-500 font-medium">ENGINEER</Label>
                <Select value={engineer} onValueChange={setEngineer}>
                  <SelectTrigger id="engineer" className="bg-gray-50">
                    <SelectValue placeholder="Select engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENGINEERS.map((eng) => (
                      <SelectItem key={eng} value={eng}>{eng}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Date and Retest Date row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="test-date" className="text-xs text-gray-500 font-medium">DATE</Label>
                <Input
                  id="test-date"
                  type="date"
                  value={testDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setTestDate(newDate);
                    
                    // Calculate retest date when test date changes - always 364 days later
                    if (newDate) {
                      const testDateObj = new Date(newDate);
                      const retestDateObj = addDays(testDateObj, 364);
                      const formattedRetestDate = format(retestDateObj, "yyyy-MM-dd");
                      console.log(`Setting retest date to ${formattedRetestDate} based on test date ${newDate}`);
                      setRetestDate(formattedRetestDate);
                    }
                  }}
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label htmlFor="retest-date" className="text-xs text-gray-500 font-medium">RETEST DATE</Label>
                <Input
                  id="retest-date"
                  type="date"
                  value={retestDate}
                  // Making it read-only since it should always be calculated from test date
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            {/* Equipment Section */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-base font-semibold mb-4">Equipment on this certificate</h3>
              <p className="text-sm text-gray-500 mb-4">All items listed below are covered by certificate {certificateNumber}</p>
              
              {/* Equipment Section Headers */}
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="text-xs text-gray-500 font-medium">EQUIPMENT</div>
                <div className="text-xs text-gray-500 font-medium">MACHINE SERIAL</div>
              </div>
              
              {/* Equipment rows */}
              {equipment.map((item, index) => (
                <div key={index} className={`grid grid-cols-2 gap-6 ${item.name || item.serial ? 'mt-2' : 'mt-2 opacity-60'}`}>
                  <Input
                    value={item.name}
                    onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                    className="bg-gray-50"
                    placeholder=""
                  />
                  <Input
                    value={item.serial}
                    onChange={(e) => handleEquipmentChange(index, 'serial', e.target.value)}
                    className="bg-gray-50"
                    placeholder=""
                  />
                </div>
              ))}
            </div>
            
            {/* Notes */}
            <div className="mt-6">
              <Label htmlFor="notes" className="text-xs text-gray-500 font-medium">NOTES</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-50 min-h-[100px]"
                placeholder=""
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 
