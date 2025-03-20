import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Calendar, User, RefreshCw, Clipboard, Building, FileText, Wrench } from "lucide-react";

interface ViewServiceModalProps {
  serviceId: string;
  onClose: () => void;
}

export function ViewServiceModal({ serviceId, onClose }: ViewServiceModalProps) {
  const [open, setOpen] = useState(true);
  
  const { data: service, isLoading } = useQuery({
    queryKey: ["service-record", serviceId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3001/api/service-records/${serviceId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error("Error fetching service record:", error);
        throw new Error(error);
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!serviceId,
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Service Record Details</DialogTitle>
          <DialogDescription>
            View the details of this service record.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-4">Loading service record...</div>
        ) : !service ? (
          <div className="text-center py-4 text-red-500">Service record not found.</div>
        ) : (
          <div className="grid gap-6">
            {/* Company Information */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <p className="text-sm text-muted-foreground">{service.company_name}</p>
                </div>
                <div>
                  <Label>Address</Label>
                  <p className="text-sm text-muted-foreground">
                    {[
                      service.address,
                      service.city,
                      service.county,
                      service.postcode
                    ].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Equipment Information */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Equipment Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Equipment Name</Label>
                  <p className="text-sm text-muted-foreground">{service.equipment_name}</p>
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <p className="text-sm text-muted-foreground">{service.serial_number}</p>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Clipboard className="h-4 w-4" />
                Service Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Service Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(service.service_date), "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <Label>Retest Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {service.retest_date ? format(new Date(service.retest_date), "dd/MM/yyyy") : "N/A"}
                  </p>
                </div>
                <div>
                  <Label>Engineer</Label>
                  <p className="text-sm text-muted-foreground">{service.engineer_name}</p>
                </div>
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground">{service.notes || "No notes"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 