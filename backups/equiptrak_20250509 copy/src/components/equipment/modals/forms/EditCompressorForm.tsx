import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { ServiceEngineerSelect } from "@/components/service/components/ServiceEngineerSelect";
import { CompressorRecord } from "@/types/database/compressors";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditCompressorFormProps {
  compressor: CompressorRecord;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditCompressorForm({ compressor, onSuccess, onCancel }: EditCompressorFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compressorModel, setCompressorModel] = useState(compressor.compressor_model || "");
  const [serialNumber, setSerialNumber] = useState(compressor.equipment_serial);
  const [engineerName, setEngineerName] = useState(compressor.engineer_name);
  const [testDate, setTestDate] = useState(format(parseISO(compressor.test_date), "yyyy-MM-dd"));
  const [retestDate, setRetestDate] = useState(format(parseISO(compressor.retest_date), "yyyy-MM-dd"));
  const [notes, setNotes] = useState(compressor.notes || "");
  const [pressureTestResult, setPressureTestResult] = useState<string | null>(compressor.pressure_test_result);
  const [safetyValveTest, setSafetyValveTest] = useState<string | null>(compressor.safety_valve_test);
  const [oilLevel, setOilLevel] = useState<string | null>(compressor.oil_level);
  const [beltCondition, setBeltCondition] = useState<string | null>(compressor.belt_condition);
  
  const handleTestDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTestDate = e.target.value;
    setTestDate(newTestDate);
    // Calculate new retest date (364 days from test date)
    const newRetestDate = format(addDays(new Date(newTestDate), 364), "yyyy-MM-dd");
    setRetestDate(newRetestDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compressorModel || !serialNumber || !engineerName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: serviceError } = await supabase
        .from("compressor_records")
        .update({
          engineer_name: engineerName,
          test_date: testDate,
          retest_date: retestDate,
          status: "valid",
          compressor_model: compressorModel,
          equipment_name: compressorModel,
          equipment_serial: serialNumber,
          pressure_test_result: pressureTestResult,
          safety_valve_test: safetyValveTest,
          oil_level: oilLevel,
          belt_condition: beltCondition,
          notes: notes || null,
        })
        .eq('id', compressor.id);

      if (serviceError) throw serviceError;

      toast({
        title: "Success",
        description: "Compressor record updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["compressors", compressor.company_id] });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error updating compressor record:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update compressor record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Equipment Info */}
      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <div className="space-y-4">
          {/* Test and Retest Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Test Date *</Label>
              <Input
                id="testDate"
                type="date"
                value={testDate}
                onChange={handleTestDateChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Retest Date</Label>
              <Input
                id="retestDate"
                type="date"
                value={retestDate}
                disabled
              />
            </div>
          </div>

          {/* Model, Serial, and Engineer */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Model *</Label>
              <Input
                id="compressorModel"
                value={compressorModel}
                onChange={(e) => setCompressorModel(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Serial *</Label>
              <Input
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Engineer *</Label>
              <ServiceEngineerSelect
                defaultValue={engineerName}
                onChange={setEngineerName}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <h3 className="text-lg font-medium mb-4 text-[#94a3b8]">Test Results</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Pressure Test Result</Label>
            <Select onValueChange={setPressureTestResult} defaultValue={pressureTestResult || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Safety Valve Test</Label>
            <Select onValueChange={setSafetyValveTest} defaultValue={safetyValveTest || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Oil Level</Label>
            <Select onValueChange={setOilLevel} defaultValue={oilLevel || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Belt Condition</Label>
            <Select onValueChange={setBeltCondition} defaultValue={beltCondition || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="worn">Worn</SelectItem>
                <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <div className="space-y-2">
          <Label className="text-[#94a3b8] font-medium">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-32"
          />
        </div>
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
          style={{ 
            backgroundColor: theme === 'dark' ? '#a6e15a' : '#FFFFFF',
            color: theme === 'dark' ? '#1a1a1a' : '#000000',
            border: theme === 'light' ? '1px solid #e2e8f0' : 'none'
          }}
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