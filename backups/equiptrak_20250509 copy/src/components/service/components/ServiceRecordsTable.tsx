import { useState, forwardRef, useImperativeHandle } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Trash2, Eye, Calendar, Pencil, FileText, Printer, QrCode, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { getStatus, getStatusColor } from "@/utils/serviceStatus";

interface ServiceRecordsTableProps {
  customerId?: string;
  searchQuery?: string;
}

export type ServiceRecordsTableRef = {
  refetch: () => void;
};

function calculateStatus(retestDate: string | null): "valid" | "upcoming" | "invalid" {
  console.log(`Calculating status for retestDate:`, retestDate); // Log input
  if (!retestDate) {
    console.log("Retest date is null/undefined, returning invalid");
    return "invalid";
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
  
  const retest = new Date(retestDate);
  // Check if date parsing failed
  if (isNaN(retest.getTime())) {
    console.error(`Failed to parse retestDate: '${retestDate}'. Returning invalid.`);
    return "invalid";
  }
  retest.setHours(0, 0, 0, 0); // Normalize retest to the start of the day

  console.log(`Parsed retest date:`, retest.toISOString()); // Log parsed date
  
  const diffTime = retest.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  console.log(`Difference in days:`, diffDays);

  if (diffDays < 0) {
    console.log("Result: invalid (date passed)");
    return "invalid";
  } else if (diffDays <= 30) {
    console.log("Result: upcoming (<= 30 days)");
    return "upcoming";
  } else {
    console.log("Result: valid (> 30 days)");
    return "valid";
  }
}

export const ServiceRecordsTable = forwardRef<ServiceRecordsTableRef, ServiceRecordsTableProps>(
  ({ customerId, searchQuery = "" }, ref) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
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

  const handleEditService = (serviceId: string) => {
    navigate(`/service/edit/${serviceId}`);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading service records...</div>;
  }

  if (error) {
    // Check if it's a 404 error (no records)
    if (error instanceof Error && error.message.includes('404')) {
      return (
        <div className="p-4 border rounded-lg bg-gray-50 text-gray-800">
          <h3 className="font-semibold mb-2">No Service Records Found</h3>
          <p>No service records for this company yet. Click the "Equipment Types" button to create one.</p>
        </div>
      );
    }

    // Handle other errors
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
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Found</h3>
        <p className="text-gray-500 mb-2">This company doesn't have any equipment records yet.</p>
        <p className="text-gray-500">Equipment records will appear here once they're added to the system.</p>
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
    
    // *** Always calculate status on frontend for debugging ***
    const calculatedStatus = calculateStatus(record.retest_date || record.next_service_date);
    console.log(`Record ID: ${record.id}, Backend Status: ${record.status}, Frontend Calculated: ${calculatedStatus}`);

    return {
      id: record.id,
      certificate_number: record.certificate_number,
      service_date: record.service_date || record.test_date,
      retest_date: record.retest_date || record.next_service_date,
      engineer_name: engineerName,
      // *** Use the frontend calculated status directly ***
      status: calculatedStatus, 
      equipment_name: firstEquipment ? firstEquipment.name : (record.equipment_name || (record.equipment && record.equipment.name) || 'N/A'),
      serial_number: firstEquipment ? firstEquipment.serial : (record.serial_number || (record.equipment && record.equipment.serial_number) || 'N/A'),
      equipmentCount: equipmentCount,
      record: record // Keep the full record for any future use
    };
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left">Equipment Name</th>
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
                className="border-b hover:bg-muted/50"
              >
                <td className="p-2 font-medium">
                  {row.equipment_name}
                  {row.equipmentCount > 1 && (
                    <span className="ml-2 text-xs text-gray-500">
                      +{row.equipmentCount - 1} more
                    </span>
                  )}
                </td>
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
                <td className="p-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 hover:text-blue-800"
                      onClick={() => handleEditService(row.id)}
                      title="Edit Record"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePrintCertificate(row.id)}
                      title="View Certificate"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePrintQRCode(row.id)}
                      title="QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      onClick={() => {
                        setDeleteRecordId(row.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      title="Delete Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Record</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service record.
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