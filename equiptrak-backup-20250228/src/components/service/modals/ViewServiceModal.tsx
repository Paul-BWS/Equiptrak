import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { ServiceRecord } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

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

interface ViewServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ServiceRecord | null;
}

export function ViewServiceModal({ open, onOpenChange, record }: ViewServiceModalProps) {
  const [isEditing, setIsEditing] = useState(false);
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

  // Load record data when modal opens
  useEffect(() => {
    if (record) {
      setCertificateNumber(record.certificate_number || "");
      setEngineer(record.engineer_name || "");
      setTestDate(record.test_date ? format(new Date(record.test_date), "yyyy-MM-dd") : "");
      setRetestDate(record.retest_date ? format(new Date(record.retest_date), "yyyy-MM-dd") : "");
      
      // Set equipment data
      const newEquipment = [...equipment];
      if (record.equipment1_name) newEquipment[0].name = record.equipment1_name;
      if (record.equipment1_serial) newEquipment[0].serial = record.equipment1_serial;
      if (record.equipment2_name) newEquipment[1].name = record.equipment2_name;
      if (record.equipment2_serial) newEquipment[1].serial = record.equipment2_serial;
      if (record.equipment3_name) newEquipment[2].name = record.equipment3_name;
      if (record.equipment3_serial) newEquipment[2].serial = record.equipment3_serial;
      if (record.equipment4_name) newEquipment[3].name = record.equipment4_name;
      if (record.equipment4_serial) newEquipment[3].serial = record.equipment4_serial;
      if (record.equipment5_name) newEquipment[4].name = record.equipment5_name;
      if (record.equipment5_serial) newEquipment[4].serial = record.equipment5_serial;
      if (record.equipment6_name) newEquipment[5].name = record.equipment6_name;
      if (record.equipment6_serial) newEquipment[5].serial = record.equipment6_serial;
      
      setEquipment(newEquipment);
      setNotes(record.notes || "");
      
      // Fetch company name
      if (record.company_id) {
        fetchCompanyName(record.company_id);
      }
    }
  }, [record]);
  
  // Fetch company name
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
    if (!record) return;
    
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
        .eq("id", record.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service record updated successfully",
      });
      
      // Exit edit mode
      setIsEditing(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["service-records"] });
      
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

  // Style for field headers
  const fieldHeaderStyle = "text-xs text-gray-400 uppercase mb-1 tracking-wider";

  if (!open || !record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Record</DialogTitle>
          <DialogDescription>
            {companyName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
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
                    disabled={!isEditing}
                    className="bg-gray-50 text-base"
                  />
                </div>
                
                <div>
                  <div className={fieldHeaderStyle}>Engineer</div>
                  {isEditing ? (
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
                  ) : (
                    <Input
                      value={engineer}
                      disabled
                      className="bg-gray-50 text-base"
                    />
                  )}
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
                    onChange={(e) => setTestDate(e.target.value)}
                    disabled={!isEditing}
                    className="bg-gray-50 text-base"
                  />
                </div>
                
                <div>
                  <div className={fieldHeaderStyle}>Retest Date</div>
                  <Input
                    type="date"
                    value={retestDate}
                    onChange={(e) => setRetestDate(e.target.value)}
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                    className="bg-gray-50 text-base"
                  />
                  <Input
                    value={item.serial}
                    onChange={(e) => handleEquipmentChange(index, 'serial', e.target.value)}
                    disabled={!isEditing}
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
              disabled={!isEditing}
              className="h-20 bg-gray-50 text-base"
            />
          </div>
        </div>
        
        {/* Footer */}
        <DialogFooter className="pt-2">
          {isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 