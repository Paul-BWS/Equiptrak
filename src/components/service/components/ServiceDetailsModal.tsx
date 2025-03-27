import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

// Hard-coded engineers list - this is the source of truth for engineer names
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
  open: boolean;
  serviceId: string | null;
  onOpenChange: (open: boolean) => void;
}

interface Equipment {
  name: string;
  serial: string;
}

export const ServiceDetailsModal = ({ open, serviceId, onOpenChange }: ServiceDetailsModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, handleAuthError } = useAuth();
  
  // State variables for the form
  const [certificateNumber, setCertificateNumber] = useState("");
  const [engineer, setEngineer] = useState("");
  const [testDate, setTestDate] = useState<Date | undefined>(undefined);
  const [retestDate, setRetestDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>([
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" },
    { name: "", serial: "" }
  ]);
  const [notes, setNotes] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    return headers;
  };

  // Query service record from the API
  const { data: service, isLoading } = useQuery({
    queryKey: ["service-record", serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      
      try {
        const response = await fetch(`/api/service-records/${serviceId}`, {
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          
          // Handle unauthorized errors
          if (response.status === 401) {
            handleAuthError(errorData);
          }
          
          throw new Error(errorData.message || 'Failed to fetch service record');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching service record:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load service record",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!serviceId && open
  });

  // Effect to populate the form with the service data
  useEffect(() => {
    if (service) {
      console.log("Setting form data from service:", JSON.stringify(service, null, 2));
      
      // Set certificate number if available
      setCertificateNumber(service.certificate_number || '');
      
      // Set engineer name directly - no fallbacks
      console.log("Engineer name from API:", service.engineer_name);
      setEngineer(service.engineer_name || '');
      
      // Set test date
      if (service.service_date) {
        setTestDate(new Date(service.service_date));
      }
      
      // Always calculate retest date as 364 days after test date
      // This ensures the retest date is always properly set
      if (service.service_date) {
        const testDate = new Date(service.service_date);
        setRetestDate(addDays(testDate, 364));
      }
      
      // Set equipment
      const newEquipment = [...equipment];
      for (let i = 1; i <= 6; i++) {
        const name = service[`equipment${i}_name`];
        const serial = service[`equipment${i}_serial`];
        if (name || serial) {
          newEquipment[i-1] = {
            name: name || '',
            serial: serial || ''
          };
        }
      }
      setEquipment(newEquipment);
      
      // Set notes
      setNotes(service.notes || '');
      
      // Set company name if available
      if (service.company) {
        setCompanyName(service.company.company_name || '');
      } else if (service.company_id) {
        // Fetch company name if needed
        fetch(`/api/companies/${service.company_id}`, {
          headers: getAuthHeaders(),
          credentials: 'include'
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.company_name) {
              setCompanyName(data.company_name);
            }
          })
          .catch(error => {
            console.error('Error fetching company:', error);
          });
      }
    }
  }, [service]);

  // Handle test date change and update retest date automatically
  const handleTestDateChange = (date: Date | undefined) => {
    setTestDate(date);
    if (date) {
      // Set retest date to 364 days from test date (just under 1 year)
      setRetestDate(addDays(date, 364));
    } else {
      setRetestDate(undefined);
    }
  };

  // Handle equipment changes
  const handleEquipmentChange = (index: number, field: 'name' | 'serial', value: string) => {
    const newEquipment = [...equipment];
    newEquipment[index] = { ...newEquipment[index], [field]: value };
    setEquipment(newEquipment);
  };

  // Handle form submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      console.log("====== SERVICE RECORD UPDATE DEBUG ======");
      console.log("ServiceId:", serviceId);
      console.log("Certificate Number:", certificateNumber);
      console.log("Engineer:", engineer);
      console.log("Test Date:", testDate);
      console.log("Retest Date:", retestDate);
      console.log("Equipment:", equipment);
      
      // Validate that at least one equipment name is provided
      if (!equipment.some(e => e.name.trim())) {
        toast({
          title: "Validation Error",
          description: "At least one equipment name is required",
          variant: "destructive"
        });
        return;
      }
      
      // Format certificate number if needed
      let formattedCertNumber = certificateNumber;
      if (!formattedCertNumber.trim()) {
        formattedCertNumber = "BWS-2000";
      } else if (!formattedCertNumber.startsWith("BWS-")) {
        formattedCertNumber = `BWS-${formattedCertNumber}`;
      }
      
      // Log the engineer value before preparing the update data
      console.log("Engineer value being saved:", engineer);
      
      // Prepare data for update 
      const updateData = {
        certificate_number: formattedCertNumber,
        engineer_name: engineer,
        service_date: testDate ? format(testDate, "yyyy-MM-dd") : null,
        test_date: testDate ? format(testDate, "yyyy-MM-dd") : null,
        retest_date: retestDate ? format(retestDate, "yyyy-MM-dd") : null,
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
      
      console.log("Update data being sent:", JSON.stringify(updateData, null, 2));
      
      // Use fetch API to update the service record
      if (serviceId) {
        console.log(`Sending PUT request to /api/service-records/${serviceId}`);
        const response = await fetch(`/api/service-records/${serviceId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response from server: ${errorText}`);
          
          const errorData = response.headers.get('content-type')?.includes('application/json') 
            ? JSON.parse(errorText)
            : { message: `Server responded with status ${response.status}: ${errorText}` };
          
          // Handle unauthorized errors
          if (response.status === 401) {
            handleAuthError(errorData);
            throw new Error('Your session has expired. Please log in again.');
          }
          
          throw new Error(errorData.message || 'Failed to update service record');
        }
        
        const updatedRecord = await response.json();
        console.log("Service record updated successfully:", updatedRecord);
        
        toast({
          title: "Success",
          description: "Service record updated successfully"
        });
        
        // Invalidate queries to refresh the UI - use a more comprehensive approach
        console.log("Invalidating queries to refresh the UI");
        
        // Invalidate all service records queries
        queryClient.invalidateQueries({ queryKey: ["service-records"] });
        
        // Invalidate specific service record query
        queryClient.invalidateQueries({ queryKey: ["service-record", serviceId] });
        
        // Also invalidate any company-specific service record queries
        if (service?.company_id) {
          queryClient.invalidateQueries({ 
            queryKey: ["service-records", service.company_id]
          });
        }
        
        // Force a refetch of the current service record
        queryClient.refetchQueries({ queryKey: ["service-record", serviceId] });
        
        console.log("All relevant queries invalidated");
        
        // Close the modal
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error updating service record:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the service record",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Style for field headers
  const fieldHeaderStyle = "text-xs text-gray-400 uppercase mb-1 tracking-wider";

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
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSave}>
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
                        className="bg-gray-50 text-base"
                      />
                    </div>
                    
                    <div>
                      <div className={fieldHeaderStyle}>Engineer</div>
                      <Select 
                        onValueChange={(value) => {
                          console.log("Engineer selected:", value);
                          setEngineer(value);
                        }} 
                        value={engineer}
                      >
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
                        value={testDate ? format(testDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => handleTestDateChange(e.target.value ? new Date(e.target.value) : undefined)}
                        className="bg-gray-50 text-base"
                      />
                    </div>
                    
                    <div>
                      <div className={fieldHeaderStyle}>Retest Date</div>
                      <Input
                        type="date"
                        value={retestDate ? format(retestDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => setRetestDate(e.target.value ? new Date(e.target.value) : undefined)}
                        className="bg-gray-50 text-base"
                        // Not marking as disabled, but will auto-update when service date changes
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Equipment section */}
              <div>
                <h3 className="mb-4 text-lg font-medium">Equipment on this certificate</h3>
                <p className="mb-4 text-sm text-gray-500">All items listed below are covered by certificate</p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className={fieldHeaderStyle}>Equipment</div>
                    <div className={fieldHeaderStyle}>Machine Serial</div>
                  </div>
                  
                  {equipment.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 gap-6">
                      <Input
                        value={item.name}
                        onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                        placeholder={`Equipment ${index + 1}`}
                        className="bg-gray-50"
                      />
                      <Input
                        value={item.serial}
                        onChange={(e) => handleEquipmentChange(index, 'serial', e.target.value)}
                        placeholder="Serial number"
                        className="bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Notes section */}
              <div>
                <div className={fieldHeaderStyle}>Notes</div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any notes about this service record"
                  className="min-h-[100px] bg-gray-50"
                />
              </div>
            </div>
            
            <DialogFooter className="mt-8">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  ); 
} 