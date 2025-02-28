import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
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
import { Calendar, User, RefreshCw, Clipboard, Building, FileText, Tool } from "lucide-react";

interface ViewServiceModalProps {
  serviceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewServiceModal({ serviceId, open, onOpenChange }: ViewServiceModalProps) {
  const { data: service, isLoading } = useQuery({
    queryKey: ["service-record", serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      
      const { data, error } = await supabase
        .from("service_records")
        .select(`
          *,
          companies (
            company_name,
            address,
            city,
            county,
            postcode
          )
        `)
        .eq("id", serviceId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId && open,
  });

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#f5f5f5] p-0 overflow-hidden">
        <DialogHeader className="bg-white p-6 border-b">
          <DialogTitle className="text-xl font-bold">Service Record Details</DialogTitle>
          <DialogDescription>
            View the details of this service record.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-6 text-center">Loading service record details...</div>
        ) : service ? (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Company Information */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                Company Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Company Name</Label>
                  <div className="font-medium">{service.companies?.company_name || "N/A"}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Address</Label>
                  <div className="font-medium">
                    {[
                      service.companies?.address,
                      service.companies?.city,
                      service.companies?.county,
                      service.companies?.postcode
                    ].filter(Boolean).join(", ") || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tool className="h-5 w-5 text-muted-foreground" />
                Service Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Engineer</Label>
                  <div className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {service.engineer_name || "N/A"}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Equipment Type</Label>
                  <div className="font-medium">{service.equipment_type || "N/A"}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Test Date</Label>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {service.test_date ? format(new Date(service.test_date), "dd/MM/yyyy") : "N/A"}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Retest Date</Label>
                  <div className="font-medium flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    {service.retest_date ? format(new Date(service.retest_date), "dd/MM/yyyy") : "N/A"}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="font-medium flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${service.status === "valid" ? "bg-green-500" : "bg-red-500"}`}></span>
                    <span className={service.status === "valid" ? "text-green-600" : "text-red-600"}>
                      {service.status || "Unknown"}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Serial Number</Label>
                  <div className="font-medium">{service.serial_number || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {service.notes && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Notes
                </h3>
                <p className="text-sm">{service.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center">Service record not found</div>
        )}

        <DialogFooter className="bg-white p-4 border-t">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-white text-black border border-gray-300 hover:bg-gray-100"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 