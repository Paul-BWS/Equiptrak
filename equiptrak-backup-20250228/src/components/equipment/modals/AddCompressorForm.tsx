import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { addDays, format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { ServiceEngineerSelect } from "@/components/service/components/ServiceEngineerSelect";

interface AddCompressorFormProps {
  customerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddCompressorForm({ customerId, onSuccess, onCancel }: AddCompressorFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compressorModel, setCompressorModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [engineerId, setEngineerId] = useState("");
  const [testDate, setTestDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [retestDate, setRetestDate] = useState(format(addDays(new Date(), 364), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  
  const handleTestDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTestDate = e.target.value;
    setTestDate(newTestDate);
    // Calculate new retest date (364 days from test date)
    const newRetestDate = format(addDays(new Date(newTestDate), 364), "yyyy-MM-dd");
    setRetestDate(newRetestDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compressorModel || !serialNumber || !engineerId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create compressor record
      const { error: serviceError } = await supabase
        .from("compressor_records")
        .insert({
          customer_id: customerId,
          engineer_id: engineerId,
          test_date: testDate,
          retest_date: retestDate,
          status: "valid",
          compressor_model: compressorModel,
          equipment_serial: serialNumber,
          notes: notes || null,
        });

      if (serviceError) throw serviceError;

      toast({
        title: "Success",
        description: "Compressor record created successfully",
      });

      // Invalidate the compressors query to refresh the list
      queryClient.invalidateQueries(["compressors", customerId]);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating compressor record:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create compressor record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="compressorModel">Compressor Model *</Label>
          <Input
            id="compressorModel"
            value={compressorModel}
            onChange={(e) => setCompressorModel(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial Number *</Label>
          <Input
            id="serialNumber"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="engineer">Engineer *</Label>
          <ServiceEngineerSelect
            onChange={setEngineerId}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="testDate">Test Date *</Label>
          <Input
            id="testDate"
            type="date"
            value={testDate}
            onChange={handleTestDateChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retestDate">Retest Date</Label>
          <Input
            id="retestDate"
            type="date"
            value={retestDate}
            disabled
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-32"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="dark:bg-[#a6e15a] dark:text-black dark:hover:bg-[#95cc51] bg-[#7b96d4] text-white hover:bg-[#6a85c3]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </form>
  );
} 