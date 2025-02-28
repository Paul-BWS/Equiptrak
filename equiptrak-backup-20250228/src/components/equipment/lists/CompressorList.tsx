import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CompressorCard } from "../cards/CompressorCard";
import { supabase } from "@/integrations/supabase/client";
import { CompressorRecord } from "@/types/database/compressors";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AddCompressorModal } from "../modals/AddCompressorModal";
import { getStatus } from "@/utils/serviceStatus";

export function CompressorList() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompressorId, setSelectedCompressorId] = useState<string | null>(null);

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment/types`);
  };

  const { data: compressors, isLoading, refetch } = useQuery({
    queryKey: ["compressors", customerId],
    queryFn: async () => {
      console.log("Starting to fetch compressors for customer ID:", customerId);
      
      const { data, error } = await supabase
        .from("compressor_records")
        .select("*")
        .eq("company_id", customerId)
        .order("test_date", { ascending: false });

      if (error) {
        console.error("Error fetching compressors:", error);
        throw error;
      }

      console.log("Raw compressor data:", data);

      // Group by equipment_serial and take the latest record for each
      const latestRecords = (data as CompressorRecord[]).reduce((acc, record) => {
        if (!acc[record.equipment_serial] || 
            new Date(record.test_date) > new Date(acc[record.equipment_serial].test_date)) {
          acc[record.equipment_serial] = record;
        }
        return acc;
      }, {} as Record<string, CompressorRecord>);

      console.log("Latest records by serial:", latestRecords);

      const records = Object.values(latestRecords).map(record => ({
        ...record,
        status: getStatus(record.retest_date)
      }));

      console.log("Final processed records:", records);
      return records;
    },
  });

  const handleViewCompressor = (compressorId: string) => {
    navigate(`/admin/customer/${customerId}/equipment/compressor-certificate/${compressorId}`);
  };

  const handlePrintCompressor = async (compressorId: string) => {
    if (!customerId) {
      toast({
        title: "Error",
        description: "No customer ID found for this equipment",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Loading certificate",
      description: "Please wait while we load your certificate...",
    });

    try {
      // Navigate directly to the certificate page
      navigate(`/admin/customer/${customerId}/equipment/compressor-certificate/${compressorId}`);
    } catch (error) {
      console.error('Error in handlePrint:', error);
      toast({
        title: "Error",
        description: "Failed to load certificate",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompressor = async (compressorId: string) => {
    setSelectedCompressorId(compressorId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCompressorId) return;

    const { error } = await supabase
      .from("compressor_records")
      .delete()
      .eq("id", selectedCompressorId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete compressor record",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Compressor record deleted successfully",
      });
      refetch();
    }

    setDeleteDialogOpen(false);
    setSelectedCompressorId(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!customerId) {
    return <div>Error: No customer ID provided</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <AddCompressorModal customerId={customerId} onSuccess={refetch} />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compressor List</h2>
          <p className="text-muted-foreground">
            View and manage compressor equipment
          </p>
        </div>

        {!compressors?.length ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No compressors found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {compressors.map((compressor) => (
              <CompressorCard
                key={compressor.id}
                record={compressor}
                showCustomer={!customerId}
                onView={handleViewCompressor}
                onPrint={handlePrintCompressor}
                onDelete={handleDeleteCompressor}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              compressor record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 