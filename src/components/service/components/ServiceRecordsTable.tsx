import { useState, forwardRef, useImperativeHandle } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Trash2, Eye, Calendar, User, RefreshCw, FileText, Printer, QrCode } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { ViewServiceModal } from "./ViewServiceModal";
import { ServiceDetailsModal } from "./ServiceDetailsModal";
import { getStatus, getStatusColor } from "@/utils/serviceStatus";

interface ServiceRecordsTableProps {
  customerId?: string;
  searchQuery?: string;
}

export type ServiceRecordsTableRef = {
  refetch: () => void;
};

function calculateStatus(retestDate: string | null): "valid" | "upcoming" | "invalid" {
  if (!retestDate) return "invalid";
  
  const today = new Date();
  const retest = new Date(retestDate);
  
  // Calculate the difference in days
  const diffTime = retest.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return "invalid"; // Past retest date
  } else if (diffDays <= 30) {
    return "upcoming"; // Within 30 days of retest
  } else {
    return "valid"; // More than 30 days until retest
  }
}

export const ServiceRecordsTable = forwardRef<ServiceRecordsTableRef, ServiceRecordsTableProps>(
  ({ customerId, searchQuery = "" }, ref) => {
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  const { data: records, isLoading, refetch, error } = useQuery({
    queryKey: ["service-records", customerId, searchQuery],
    queryFn: async () => {
      let url = '/api/service-records';
      if (customerId) {
        url += `?company_id=${customerId}`;
      }
      if (searchQuery) {
        url += `${customerId ? '&' : '?'}search=${encodeURIComponent(searchQuery)}`;
      }
      
      console.log(`Fetching service records from: ${url}`);
      
      // Get authentication token
      const storedUser = localStorage.getItem('equiptrak_user');
      let headers = {};
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.token) {
            headers = {
              'Authorization': `Bearer ${userData.token}`,
              'Content-Type': 'application/json'
            };
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
      
      try {
        console.log("Fetching service records with headers:", headers);
        const response = await fetch(url, {
          headers,
          credentials: 'include'
        });
        
        console.log(`Service records response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error fetching service records: Status ${response.status}`, errorText);
          throw new Error(`Failed to fetch service records: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`Successfully retrieved ${data.length} service records`);
        console.log("First few records:", data.slice(0, 2));
        return data;
      } catch (error) {
        console.error("Error in service records request:", error);
        throw error;
      }
    },
    staleTime: 0, // Always refetch data when queryKey changes
    retry: 1,
  });

  // Expose the refetch function through the ref
  useImperativeHandle(ref, () => ({
    refetch
  }));

  const handleDelete = async () => {
    if (!deleteRecordId) return;
    
    try {
      // Get authentication token
      const storedUser = localStorage.getItem('equiptrak_user');
      let headers = {};
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.token) {
            headers = {
              'Authorization': `Bearer ${userData.token}`,
              'Content-Type': 'application/json'
            };
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
      
      const response = await fetch(`/api/service-records/${deleteRecordId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete service record');
      }
      
      toast({
        title: "Success",
        description: "Service record deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting service record:', error);
      toast({
        title: "Error",
        description: "Failed to delete service record",
        variant: "destructive",
      });
    } finally {
      setDeleteRecordId(null);
    }
  };

  const handlePrintCertificate = (serviceId: string) => {
    navigate(`/service-certificate/${serviceId}`);
  };

  const handlePrintQRCode = (serviceId: string) => {
    navigate(`/service-certificate/${serviceId}/qr`);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading service records...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-800">
        <h3 className="font-semibold mb-2">Error loading service records</h3>
        <p>{error instanceof Error ? error.message : "Unknown error occurred"}</p>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No service records found.</p>
      </div>
    );
  }

  // Prepare rows for display - one row per certificate
  const serviceRows = records.map(record => {
    // Find the first piece of equipment
    let firstEquipment = null;
    let equipmentCount = 0;
    
    // Check for equipment in the record
    for (let i = 1; i <= 8; i++) {
      const nameField = `equipment${i}_name`;
      if (record[nameField]) {
        equipmentCount++;
        if (!firstEquipment) {
          firstEquipment = {
            name: record[nameField],
            serial: record[`equipment${i}_serial`] || 'N/A'
          };
        }
      }
    }
    
    // Properly handle engineer name from various possible sources
    let engineerName = 'Not assigned';
    // Log the available engineer fields for debugging
    console.log(`Engineer fields for record ${record.id}:`, {
      engineer: record.engineer,
      engineer_name: record.engineer_name,
      engineer_id: record.engineer_id
    });

    if (record.engineer && record.engineer.name) {
      engineerName = record.engineer.name;
      console.log(`Using engineer.name: ${engineerName}`);
    } else if (record.engineer_name) {
      engineerName = record.engineer_name;
      console.log(`Using engineer_name: ${engineerName}`);
    } else if (record.engineer_id) {
      engineerName = record.engineer_id;
      console.log(`Using engineer_id: ${engineerName}`);
    } else if (record.engineer && typeof record.engineer === 'string') {
      engineerName = record.engineer;
      console.log(`Using engineer string value: ${engineerName}`);
    }
    
    console.log(`Resolved engineer name for record ${record.id}: ${engineerName}`);
    
    return {
      id: record.id,
      certificate_number: record.certificate_number,
      service_date: record.service_date || record.test_date,
      retest_date: record.retest_date || record.next_service_date,
      engineer_name: engineerName,
      status: record.status || calculateStatus(record.retest_date || record.next_service_date),
      equipment_name: firstEquipment ? firstEquipment.name : (record.equipment_name || (record.equipment && record.equipment.name) || 'N/A'),
      serial_number: firstEquipment ? firstEquipment.serial : (record.serial_number || (record.equipment && record.equipment.serial_number) || 'N/A'),
      equipmentCount: equipmentCount,
      record: record // Keep the full record for the modal
    };
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left">Equipment</th>
              <th className="p-2 text-left">Serial Number</th>
              <th className="p-2 text-left">Certificate No.</th>
              <th className="p-2 text-left">Service Date</th>
              <th className="p-2 text-left">Retest Date</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {serviceRows.map((row) => (
              <tr 
                key={row.id} 
                className="border-b hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedServiceId(row.id)}
              >
                <td className="p-2">
                  <div className="flex flex-col">
                    <span>{row.equipment_name}</span>
                    {row.equipmentCount > 1 && (
                      <span className="text-xs text-muted-foreground">
                        +{row.equipmentCount - 1} more items
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-2">{row.serial_number}</td>
                <td className="p-2 font-medium">{row.certificate_number || "-"}</td>
                <td className="p-2">
                  {row.service_date ? format(new Date(row.service_date), 'dd/MM/yyyy') : 'N/A'}
                </td>
                <td className="p-2">
                  {row.retest_date ? format(new Date(row.retest_date), 'dd/MM/yyyy') : 'N/A'}
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.status === 'valid' ? 'bg-green-100 text-green-800' : 
                    row.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {row.status === 'valid' ? 'Valid' : 
                     row.status === 'upcoming' ? 'Upcoming' : 
                     'Invalid'}
                  </span>
                </td>
                <td className="p-2 text-right space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedServiceId(row.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintCertificate(row.id);
                    }}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintQRCode(row.id);
                    }}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteRecordId(row.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View/Edit service modal */}
      {selectedServiceId && (
        <ServiceDetailsModal
          serviceId={selectedServiceId}
          open={!!selectedServiceId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedServiceId(null);
              refetch();
            }
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteRecordId} onOpenChange={(open) => !open && setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});