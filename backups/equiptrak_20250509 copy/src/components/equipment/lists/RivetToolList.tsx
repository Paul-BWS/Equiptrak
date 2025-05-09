import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { RivetToolCard } from "../cards/RivetToolCard";
import { supabase } from "@/integrations/supabase/client";
import { RivetToolRecord } from "@/types/database/rivet-tools";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AddRivetToolModal } from "../modals/AddRivetToolModal";
import { getStatus } from "@/utils/serviceStatus";

export function RivetToolList() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRivetToolId, setSelectedRivetToolId] = useState<string | null>(null);

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment/types`);
  };

  const { data: rivetTools, isLoading, refetch } = useQuery({
    queryKey: ["rivet-tools", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rivet_tool_records")
        .select("*")
        .eq("company_id", customerId)
        .order("test_date", { ascending: false });

      if (error) throw error;

      // Group by equipment_serial and take the latest record for each
      const latestRecords = (data as RivetToolRecord[]).reduce((acc, record) => {
        if (!acc[record.equipment_serial] || 
            new Date(record.test_date) > new Date(acc[record.equipment_serial].test_date)) {
          acc[record.equipment_serial] = record;
        }
        return acc;
      }, {} as Record<string, RivetToolRecord>);

      const records = Object.values(latestRecords).map(record => ({
        ...record,
        status: getStatus(record.retest_date)
      }));

      return records;
    },
  });

  const handleViewRivetTool = (rivetToolId: string) => {
    navigate(`/admin/customer/${customerId}/equipment/rivet-tool-certificate/${rivetToolId}`);
  };

  const handlePrintRivetTool = async (rivetToolId: string) => {
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
      navigate(`/admin/customer/${customerId}/equipment/rivet-tool-certificate/${rivetToolId}`);
    } catch (error) {
      console.error('Error in handlePrint:', error);
      toast({
        title: "Error",
        description: "Failed to load certificate",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRivetTool = async (rivetToolId: string) => {
    setSelectedRivetToolId(rivetToolId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRivetToolId) return;

    const { error } = await supabase
      .from("rivet_tool_records")
      .delete()
      .eq("id", selectedRivetToolId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete rivet tool record",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Rivet tool record deleted successfully",
      });
      refetch();
    }

    setDeleteDialogOpen(false);
    setSelectedRivetToolId(null);
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
        <AddRivetToolModal customerId={customerId} onSuccess={refetch} />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rivet Tool List</h2>
          <p className="text-muted-foreground">
            View and manage rivet tool equipment
          </p>
        </div>

        {!rivetTools?.length ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No rivet tools found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rivetTools.map((rivetTool) => (
              <RivetToolCard
                key={rivetTool.id}
                record={rivetTool}
                showCustomer={!customerId}
                onView={handleViewRivetTool}
                onPrint={handlePrintRivetTool}
                onDelete={handleDeleteRivetTool}
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
              rivet tool record.
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