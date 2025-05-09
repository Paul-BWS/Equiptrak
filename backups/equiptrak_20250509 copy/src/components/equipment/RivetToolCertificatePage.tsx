import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RivetToolRecord } from "@/types/database/rivet-tools";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Printer } from "lucide-react";
import { useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/utils/dates";

export function RivetToolCertificatePage() {
  const navigate = useNavigate();
  const { customerId, serviceId } = useParams();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: record, isLoading } = useQuery({
    queryKey: ["rivet-tool", serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rivet_tool_records")
        .select("*, companies(*)")
        .eq("id", serviceId)
        .single();

      if (error) throw error;
      return data as RivetToolRecord & {
        companies: {
          id: string;
          name: string;
          address: string;
          postcode: string;
        };
      };
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment/rivet-tools`);
  };

  const handleEmail = async () => {
    toast({
      title: "Coming Soon",
      description: "Email functionality will be available soon.",
    });
  };

  useEffect(() => {
    if (record?.certificate_number) {
      document.title = `Certificate ${record.certificate_number}`;
    }
    return () => {
      document.title = "EquipTrak";
    };
  }, [record?.certificate_number]);

  if (isLoading || !record) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div ref={printRef} className="bg-white p-8 rounded-lg shadow-sm print:shadow-none">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Rivet Tool Service Certificate</h1>
            <p className="text-muted-foreground">Certificate: {record.certificate_number}</p>
          </div>

          {/* Company Details */}
          <div className="border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold">Company Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Company Name</p>
                <p>{record.companies.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p>{record.companies.address}</p>
                <p>{record.companies.postcode}</p>
              </div>
            </div>
          </div>

          {/* Equipment Details */}
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold">Equipment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Equipment Name</p>
                <p>{record.equipment_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Serial Number</p>
                <p>{record.equipment_serial}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Model</p>
                <p>{record.rivet_tool_model || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Engineer</p>
                <p>{record.engineer_name}</p>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold">Test Results</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-muted-foreground">Pull Test Result</p>
                <p>{record.pull_test_result || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mandrel Condition</p>
                <p>{record.mandrel_condition || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jaw Condition</p>
                <p>{record.jaw_condition || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Test Dates */}
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Test Date</p>
                <p>{formatDate(record.test_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Retest Due</p>
                <p>{formatDate(record.retest_date)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {record.notes && (
            <div className="border rounded-lg p-4 space-y-2">
              <h2 className="font-semibold">Notes</h2>
              <p className="whitespace-pre-wrap">{record.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>This certificate was generated by EquipTrak</p>
          </div>
        </div>
      </div>
    </div>
  );
} 