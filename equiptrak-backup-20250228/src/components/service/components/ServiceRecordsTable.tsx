import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ServiceRecord {
  id: string;
  certificate_number: string;
  issue_date: string;
  retest_date: string;
  engineer: string;
  status: "valid" | "expired" | "upcoming";
}

interface ServiceRecordsTableProps {
  customerId: string;
}

export function ServiceRecordsTable({ customerId }: ServiceRecordsTableProps) {
  const navigate = useNavigate();
  const [deleteCertificateId, setDeleteCertificateId] = useState<string | null>(null);
  const { toast } = useToast();

  console.log("ServiceRecordsTable rendering for customerId:", customerId);

  const { data: certificates, isLoading, error } = useQuery({
    queryKey: ["service-records", customerId],
    queryFn: async () => {
      console.log("Fetching service records for customer:", customerId);
      
      const { data, error } = await supabase
        .from("service_certificates")
        .select("*")
        .eq("customer_id", customerId)
        .order("issue_date", { ascending: false });
        
      if (error) {
        console.error("Error fetching service records:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  const handleDelete = async () => {
    if (!deleteCertificateId) return;
    
    try {
      const { error } = await supabase
        .from("service_certificates")
        .delete()
        .eq("id", deleteCertificateId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service record deleted successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service record",
        variant: "destructive",
      });
    } finally {
      setDeleteCertificateId(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-lg font-medium text-red-700">Error loading service records</h3>
        <p className="text-red-600">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  try {
    return (
      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Certificate No</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Retest Date</TableCell>
              <TableCell>Engineer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell className="text-right">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading service records...
                </TableCell>
              </TableRow>
            ) : certificates && certificates.length > 0 ? (
              certificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell>{certificate.certificate_number}</TableCell>
                  <TableCell>{formatDate(certificate.issue_date)}</TableCell>
                  <TableCell>{formatDate(certificate.retest_date)}</TableCell>
                  <TableCell>{certificate.engineer}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(certificate.status)}`}>
                      {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/service/certificate/${certificate.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/service/certificate/${certificate.id}/print`)}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteCertificateId(certificate.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No service records found for this customer
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <AlertDialog open={!!deleteCertificateId} onOpenChange={(open) => !open && setDeleteCertificateId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this service record. This action cannot be undone.
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
      </div>
    );
  } catch (error) {
    console.error("Error in ServiceRecordsTable:", error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-lg font-medium text-red-700">Error loading service records</h3>
        <p className="text-red-600">{error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }
}