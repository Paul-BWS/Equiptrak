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
import { useForm } from "react-hook-form";

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
  
  // Use react-hook-form for state management, mirroring AddServiceForm
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<any>();

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

  // Fetch the specific service record data when the modal opens/serviceId changes
  const { data: service, isLoading, error } = useQuery({
    queryKey: ["service-record", serviceId],
    queryFn: async () => {
      if (!serviceId) {
        console.error("ServiceDetailsModal: No serviceId provided for fetch.");
        return null;
      }
      console.log(`ServiceDetailsModal: Fetching record with ID: ${serviceId}`); // Log ID
      try {
        const response = await fetch(`/api/service-records/${serviceId}`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText })); // Get error data
          if (response.status === 401) handleAuthError(errorData); // Pass error data
          throw new Error(errorData.message || `Failed to fetch service record: ${response.statusText}`);
        }
        return await response.json();
      } catch (err) {
        console.error("Fetch error:", err);
        toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
        throw err;
      }
    },
    enabled: !!serviceId && open, // Only fetch when modal is open and ID is present
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
    retry: 1,
  });

  // Effect to reset the form when service data loads or changes
  useEffect(() => {
    if (service) {
      // Format dates correctly for input type="date"
      const formattedData = {
        ...service,
        service_date: service.service_date ? format(new Date(service.service_date), 'yyyy-MM-dd') : '',
        retest_date: service.retest_date ? format(new Date(service.retest_date), 'yyyy-MM-dd') : '',
        // Ensure equipment fields are strings
        equipment1_name: service.equipment_name_1 || '',
        equipment1_serial: service.equipment_serial_1 || '',
        equipment2_name: service.equipment_name_2 || '',
        equipment2_serial: service.equipment_serial_2 || '',
        equipment3_name: service.equipment_name_3 || '',
        equipment3_serial: service.equipment_serial_3 || '',
        equipment4_name: service.equipment_name_4 || '',
        equipment4_serial: service.equipment_serial_4 || '',
        equipment5_name: service.equipment_name_5 || '',
        equipment5_serial: service.equipment_serial_5 || '',
        equipment6_name: service.equipment_name_6 || '',
        equipment6_serial: service.equipment_serial_6 || '',
        notes: service.notes || ''
      };
      reset(formattedData);
      // Fetch company name if company_id is present but company details aren't
      if (service.company_id && !service.company) {
         fetch(`/api/companies/${service.company_id}`, { headers: getAuthHeaders() })
          .then(res => res.json())
          .then(data => setCompanyName(data?.company_name || 'Company not found'))
          .catch(err => console.error("Failed to fetch company name", err));
      } else if (service.company) {
          setCompanyName(service.company.company_name);
      }
    } else {
      reset({});
      setCompanyName("");
    }
  }, [service, reset, open]);

  // Watch service_date to auto-calculate retest_date
  const serviceDate = watch("service_date");
  useEffect(() => {
    if (serviceDate) {
      try {
        const retestDate = format(addDays(new Date(serviceDate), 364), 'yyyy-MM-dd');
        setValue("retest_date", retestDate, { shouldDirty: true });
      } catch (e) {
        console.error("Invalid service date for calculation:", serviceDate);
      }
    }
  }, [serviceDate, setValue]);

  // Handle form submission (UPDATE)
  const onSubmit = async (formData: any) => {
    if (!serviceId) {
      console.error("ServiceDetailsModal: No serviceId provided for update.");
      return;
    }
    console.log(`ServiceDetailsModal: Updating record with ID: ${serviceId}`); // Log ID

    // Add company_id back if it's not in the form data
    if (!formData.company_id && service?.company_id) {
        formData.company_id = service.company_id;
    }

    // Ensure required fields are present before sending
    if (!formData.company_id || !formData.service_date) {
        toast({ title: "Missing Data", description: "Company ID and Service Date are required.", variant: "destructive" });
        return;
    }

    try {
      const response = await fetch(`/api/service-records/${serviceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText })); // Get error data
        if (response.status === 401) handleAuthError(errorData); // Pass error data
        throw new Error(errorData.error || errorData.message || `Failed to update record: ${response.statusText}`);
      }

      toast({ title: "Success", description: "Service record updated." });
      queryClient.invalidateQueries({ queryKey: ["service-records"] }); // Invalidate list
      queryClient.invalidateQueries({ queryKey: ["service-record", serviceId] }); // Invalidate this specific record
      onOpenChange(false); // Close modal on success

    } catch (err) {
      console.error("Update error:", err);
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Style constants for consistency with AddServiceForm
  const labelStyle = "text-sm font-medium text-gray-700";
  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";
  const gridStyle = "grid grid-cols-2 gap-6";
  const sectionTitleStyle = "font-medium text-gray-900";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Record</DialogTitle>
          <DialogDescription>{companyName || "Loading..."}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">Error loading data: {(error as Error).message}</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
            <div className={gridStyle}>
              <div className="space-y-2">
                <Label htmlFor="certificate-number" className={labelStyle}>Certificate Number</Label>
                <Input id="certificate-number" {...register("certificate_number")} className={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engineer_name" className={labelStyle}>Engineer</Label>
                <Select onValueChange={(value) => setValue("engineer_name", value, { shouldDirty: true })} value={watch("engineer_name") || ''}>
                  <SelectTrigger className={inputStyle}>
                    <SelectValue placeholder="Select engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENGINEERS.map((eng) => (<SelectItem key={eng} value={eng}>{eng}</SelectItem>))}
                  </SelectContent>
                </Select>
                <input type="hidden" {...register("engineer_name")} />
              </div>
            </div>

            <div className={gridStyle}>
              <div className="space-y-2">
                <Label htmlFor="service_date" className={labelStyle}>Service Date</Label>
                <Input id="service_date" type="date" {...register("service_date")} className={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retest_date" className={labelStyle}>Retest Date</Label>
                <Input id="retest_date" type="date" {...register("retest_date")} className={inputStyle} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6 mb-2">
                <h3 className={sectionTitleStyle}>Equipment Details</h3>
                <h3 className={sectionTitleStyle}>Serial Number</h3>
              </div>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className={gridStyle}>
                  <Input
                    id={`equipment${num}_name`}
                    {...register(`equipment${num}_name`)}
                    placeholder={`Equipment ${num} name`}
                    className={inputStyle}
                  />
                  <Input
                    id={`equipment${num}_serial`}
                    {...register(`equipment${num}_serial`)}
                    placeholder={`Serial number`}
                    className={inputStyle}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className={labelStyle}>Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                className={`${inputStyle} min-h-[100px]`}
                placeholder="Any additional notes..."
              />
            </div>

            <DialogFooter className="mt-8">
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}; 