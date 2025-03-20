import { useState } from "react";
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

export function ServiceRecordsTable({ customerId, searchQuery = "" }: ServiceRecordsTableProps) {
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  const { data: records, isLoading, refetch } = useQuery({
    queryKey: ["service-records", customerId],
    queryFn: async () => {
      let url = 'http://localhost:3001/api/service-records';
      if (customerId) {
        url += `?customerId=${customerId}`;
      }
      if (searchQuery) {
        url += `${customerId ? '&' : '?'}search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error("Error fetching service records:", error);
        throw new Error(error);
      }
      
      const data = await response.json();
      return data;
    },
    retry: 1,
  });

  const handleDelete = async () => {
    if (!deleteRecordId) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/service-records/${deleteRecordId}`, {
        method: 'DELETE',
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
    // TODO: Implement QR code printing
    console.log('Print QR code for service:', serviceId);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading service records...</div>;
  }

  if (!records || records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No service records found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left">Equipment</th>
              <th className="p-2 text-left">Serial Number</th>
              <th className="p-2 text-left">Service Date</th>
              <th className="p-2 text-left">Retest Date</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const status = calculateStatus(record.retest_date);
              const statusColor = getStatusColor(status);
              
              return (
                <tr key={record.id} className="border-b">
                  <td className="p-2">{record.equipment_name}</td>
                  <td className="p-2">{record.serial_number}</td>
                  <td className="p-2">{format(new Date(record.service_date), 'dd/MM/yyyy')}</td>
                  <td className="p-2">{record.retest_date ? format(new Date(record.retest_date), 'dd/MM/yyyy') : 'N/A'}</td>
                  <td className="p-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedServiceId(record.id)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePrintCertificate(record.id)}
                        title="Print Certificate"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePrintQRCode(record.id)}
                        title="Print QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setDeleteRecordId(record.id)}
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedServiceId && (
        <ViewServiceModal
          serviceId={selectedServiceId}
          onClose={() => setSelectedServiceId(null)}
        />
      )}
    </div>
  );
}