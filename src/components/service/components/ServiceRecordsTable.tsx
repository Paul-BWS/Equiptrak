import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Trash2, Eye, Calendar, User, RefreshCw, FileText, Printer } from "lucide-react";
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
      let query = supabase
        .from("service_records")
        .select(`
          *,
          companies (
            company_name
          )
        `)
        .order("test_date", { ascending: false });
        
      if (customerId) {
        query = query.eq("company_id", customerId);
      }
        
      const { data, error } = await query;
        
      if (error) throw error;
      return data || [];
    },
  });

  const handleDelete = async () => {
    if (!deleteRecordId) return;
    
    try {
      const { error } = await supabase
        .from("service_records")
        .delete()
        .eq("id", deleteRecordId);
        
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
      setDeleteRecordId(null);
    }
  };

  // Style for icon buttons
  const iconButtonStyle = {
    backgroundColor: 'white',
    color: '#7b96d4',
    border: '1px solid #e2e8f0'
  };

  const deleteButtonStyle = {
    backgroundColor: 'white',
    color: '#ef4444',
    border: '1px solid #e2e8f0'
  };

  const filteredRecords = records?.filter(record => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (record.companies?.company_name && record.companies.company_name.toLowerCase().includes(searchLower)) ||
      (record.engineer_name && record.engineer_name.toLowerCase().includes(searchLower)) ||
      (record.equipment_type && record.equipment_type.toLowerCase().includes(searchLower)) ||
      (record.status && record.status.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading service records...</div>;
  }

  if (!filteredRecords?.length) {
    return (
      <div className="text-center py-8">
        {searchQuery ? "No service records match your search" : "No service records found"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {filteredRecords.map((record) => (
          <div 
            key={record.id} 
            className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedServiceId(record.id)}
          >
            <div className="p-4">
              <h3 className="text-lg font-medium mb-3">
                {record.companies?.company_name || "Unknown Company"}
              </h3>
              
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  {/* Engineer with icon */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{record.engineer_name || "Unknown"}</p>
                  </div>
                  
                  {/* Test Date with icon */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {record.test_date ? format(new Date(record.test_date), "dd/MM/yyyy") : "N/A"}
                    </p>
                  </div>
                  
                  {/* Retest Date with icon */}
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {record.retest_date ? format(new Date(record.retest_date), "dd/MM/yyyy") : "N/A"}
                    </p>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${getStatusColor(record.retest_date)}
                    `}>
                      {getStatus(record.retest_date) === "valid" 
                        ? "Valid" 
                        : getStatus(record.retest_date) === "upcoming"
                          ? "Upcoming"
                          : "Invalid"}
                    </span>
                  </div>
                </div>
                
                {/* Only show buttons on desktop */}
                <div className="hidden sm:flex items-center gap-2 ml-auto">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      setSelectedServiceId(record.id);
                    }}
                    style={iconButtonStyle}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      console.log("Certificate button clicked for record:", record);
                      console.log("Record ID:", record.id);
                      console.log("Navigating to:", `/certificate/${record.id}`);
                      
                      // Try to navigate with a timeout to see if that helps
                      setTimeout(() => {
                        navigate(`/certificate/${record.id}`);
                      }, 100);
                    }}
                    style={iconButtonStyle}
                  >
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">View Certificate</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      setDeleteRecordId(record.id);
                    }}
                    style={deleteButtonStyle}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteRecordId} onOpenChange={(open) => !open && setDeleteRecordId(null)}>
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

      <ServiceDetailsModal
        serviceId={selectedServiceId}
        open={!!selectedServiceId}
        onOpenChange={(open) => !open && setSelectedServiceId(null)}
      />
    </div>
  );
}