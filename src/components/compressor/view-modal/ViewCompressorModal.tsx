import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface ViewCompressorModalProps {
  equipmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewCompressorModal({ equipmentId, open, onOpenChange }: ViewCompressorModalProps) {
  const [loading, setLoading] = useState(true);
  const [compressor, setCompressor] = useState<any>(null);
  const [serviceRecords, setServiceRecords] = useState<any[]>([]);

  useEffect(() => {
    if (open && equipmentId) {
      fetchCompressorDetails();
    }
  }, [open, equipmentId]);

  const fetchCompressorDetails = async () => {
    setLoading(true);
    try {
      // Fetch compressor details
      const { data: compressorData, error: compressorError } = await supabase
        .from('compressor_equipment')
        .select(`
          *,
          companies (
            name,
            email
          )
        `)
        .eq('id', equipmentId)
        .single();

      if (compressorError) throw compressorError;
      setCompressor(compressorData);

      // Fetch service records
      const { data: recordsData, error: recordsError } = await supabase
        .from("compressor_service_records")
        .select("*")
        .eq("equipment_id", equipmentId)
        .order("test_date", { ascending: false });

      if (recordsError) throw recordsError;
      setServiceRecords(recordsData || []);
    } catch (error) {
      console.error("Error fetching compressor details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compressor Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !compressor ? (
          <div className="py-4">
            <p>Could not load compressor details.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Equipment Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {compressor.equipment_name || "N/A"}</p>
                  <p><span className="font-medium">Serial Number:</span> {compressor.equipment_serial || "N/A"}</p>
                  <p><span className="font-medium">Model:</span> {compressor.model || "N/A"}</p>
                  <p><span className="font-medium">Manufacturer:</span> {compressor.manufacturer || "N/A"}</p>
                  <p>
                    <span className="font-medium">Next Test Date:</span>{" "}
                    {compressor.next_test_date
                      ? format(new Date(compressor.next_test_date), "dd/MM/yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Company:</span> {compressor.companies?.name || "N/A"}</p>
                  <p><span className="font-medium">Location:</span> {compressor.location || "N/A"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Service History</h3>
              {serviceRecords.length === 0 ? (
                <p>No service records found.</p>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Retest Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Engineer
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serviceRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {record.test_date
                              ? format(new Date(record.test_date), "dd/MM/yyyy")
                              : "N/A"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {record.retest_date
                              ? format(new Date(record.retest_date), "dd/MM/yyyy")
                              : "N/A"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {record.engineer_name || "N/A"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {record.status || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 