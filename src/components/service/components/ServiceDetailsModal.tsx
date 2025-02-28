import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceRecord } from "@/types/database";
import { useState, useEffect } from "react";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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

interface ServiceDetailsModalProps {
  serviceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceDetailsModal({ serviceId, open, onOpenChange }: ServiceDetailsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [certificateNumber, setCertificateNumber] = useState("");
  const [engineer, setEngineer] = useState("");
  const [testDate, setTestDate] = useState("");
  const [retestDate, setRetestDate] = useState("");
  const [equipment, setEquipment] = useState([
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" }
  ]);
  const [notes, setNotes] = useState("");
  const [companyName, setCompanyName] = useState("");

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

  // Load record data when service changes
  useEffect(() => {
    if (service) {
      setCertificateNumber(service.certificate_number || "");
      setEngineer(service.engineer_name || "");
      setTestDate(service.test_date ? format(new Date(service.test_date), "yyyy-MM-dd") : "");
      setRetestDate(service.retest_date ? format(new Date(service.retest_date), "yyyy-MM-dd") : "");
      
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
      
      // Set company name
      if (service.companies?.company_name) {
        setCompanyName(service.companies.company_name);
      } else if (service.company_id) {
        fetchCompanyName(service.company_id);
      }
    }
  }, [service]);

  // Fetch company name from database
  const fetchCompanyName = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("company_name")
        .eq("id", companyId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setCompanyName(data.company_name);
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };

  const handleEquipmentChange = (index: number, field: 'name' | 'serial', value: string) => {
    const newEquipment = [...equipment];
    newEquipment[index][field] = value;
    setEquipment(newEquipment);
  };

  const handleSave = async () => {
    if (!serviceId) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("service_records")
        .update({
          certificate_number: certificateNumber,
          engineer_name: engineer,
          test_date: testDate,
          retest_date: retestDate,
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
        })
        .eq("id", serviceId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service record updated successfully",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["service-record", serviceId] });
      queryClient.invalidateQueries({ queryKey: ["service-records"] });
      
      // Close the modal
      onOpenChange(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update service record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Record</DialogTitle>
          <DialogDescription>
            {companyName || "Loading company information..."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-4 text-center">Loading service record details...</div>
        ) : (
          <div className="space-y-6">
            {/* Certificate and Engineer row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">CERTIFICATE NO</div>
                <Input
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">ENGINEER</div>
                <Select value={engineer} onValueChange={setEngineer}>
                  <SelectTrigger className="bg-gray-50">
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
            
            {/* Date and Retest Date row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">DATE</div>
                <Input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">RETEST DATE</div>
                <Input
                  type="date"
                  value={retestDate}
                  onChange={(e) => setRetestDate(e.target.value)}
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            {/* Equipment Section Headers */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-xs text-gray-500 font-medium">EQUIPMENT</div>
              <div className="text-xs text-gray-500 font-medium">MACHINE SERIAL</div>
            </div>
            
            {/* Equipment rows */}
            {equipment.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-6">
                <Input
                  value={item.name}
                  onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                  className="bg-gray-50"
                  placeholder={`Equipment ${index + 1}`}
                />
                <Input
                  value={item.serial}
                  onChange={(e) => handleEquipmentChange(index, 'serial', e.target.value)}
                  className="bg-gray-50"
                  placeholder="Serial number"
                />
              </div>
            ))}
            
            {/* Notes */}
            <div>
              <div className="text-xs text-gray-500 font-medium mb-1">NOTES</div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-50 min-h-[100px]"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 