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

interface AddSpotWelderFormProps {
  customerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddSpotWelderForm({ customerId, onSuccess, onCancel }: AddSpotWelderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spotWelderName, setSpotWelderName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [engineerId, setEngineerId] = useState("");
  const [testDate, setTestDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [retestDate, setRetestDate] = useState(format(addDays(new Date(), 364), "yyyy-MM-dd"));
  const [voltageMax, setVoltageMax] = useState("");
  const [voltageMin, setVoltageMin] = useState("");
  const [airPressure, setAirPressure] = useState("");
  const [tipPressure, setTipPressure] = useState("");
  const [length, setLength] = useState("");
  const [diameter, setDiameter] = useState("");
  const [notes, setNotes] = useState("");
  
  // Welding readings
  const [weldingReadings, setWeldingReadings] = useState({
    welding_current_1: "", machine_current_1: "", welding_time_1: "", machine_time_1: "",
    welding_current_2: "", machine_current_2: "", welding_time_2: "", machine_time_2: "",
    welding_current_3: "", machine_current_3: "", welding_time_3: "", machine_time_3: "",
    welding_current_4: "", machine_current_4: "", welding_time_4: "", machine_time_4: "",
  });
  
  const handleTestDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTestDate = e.target.value;
    setTestDate(newTestDate);
    // Calculate new retest date (364 days from test date)
    const newRetestDate = format(addDays(new Date(newTestDate), 364), "yyyy-MM-dd");
    setRetestDate(newRetestDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotWelderName || !serialNumber || !engineerId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!customerId) {
      toast({
        title: "Error",
        description: "No company ID provided",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First verify the company exists
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("id", customerId)
        .single();

      if (companyError) {
        throw new Error("Company not found. Please ensure the company exists.");
      }

      // Create spot welder service record
      const { error: serviceError } = await supabase
        .from("spot_welder_service_records")
        .insert({
          company_id: customerId,
          engineer_id: engineerId,
          test_date: testDate,
          retest_date: retestDate,
          status: "valid",
          equipment_name: spotWelderName,
          equipment_serial: serialNumber,
          voltage_max: voltageMax ? parseFloat(voltageMax) : null,
          voltage_min: voltageMin ? parseFloat(voltageMin) : null,
          air_pressure: airPressure ? parseFloat(airPressure) : null,
          tip_pressure: tipPressure ? parseFloat(tipPressure) : null,
          length: length ? parseFloat(length) : null,
          diameter: diameter ? parseFloat(diameter) : null,
          notes: notes,
          ...Object.fromEntries(
            Object.entries(weldingReadings).map(([key, value]) => [
              key,
              value ? parseFloat(value) : null
            ])
          )
        });

      if (serviceError) {
        throw new Error(serviceError.message || "Failed to create spot welder record");
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["spot-welders"] });

      toast({
        title: "Success",
        description: "Spot welder record has been created",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create spot welder record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeldingReadingChange = (field: string, value: string) => {
    setWeldingReadings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Equipment Info */}
      <div className="p-4 rounded-lg bg-card border border-border/50">
        <div className="space-y-4">
          {/* Test and Retest Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Test Date</Label>
              <Input
                type="date"
                value={testDate}
                onChange={handleTestDateChange}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Retest Date</Label>
              <Input
                type="date"
                value={retestDate}
                disabled
              />
            </div>
          </div>

          {/* Model, Serial, and Engineer */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Model</Label>
              <Input
                value={spotWelderName}
                onChange={(e) => setSpotWelderName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Serial</Label>
              <Input
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8] font-medium">Engineer</Label>
              <ServiceEngineerSelect
                selectedEngineer={engineerId}
                setSelectedEngineer={setEngineerId}
                hideLabel
              />
            </div>
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div className="p-4 rounded-lg bg-card border border-border/50">
        <h3 className="text-lg font-medium mb-4">Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Voltage Max</Label>
            <Input
              type="number"
              value={voltageMax}
              onChange={(e) => setVoltageMax(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Voltage Min</Label>
            <Input
              type="number"
              value={voltageMin}
              onChange={(e) => setVoltageMin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Air Pressure</Label>
            <Input
              type="number"
              value={airPressure}
              onChange={(e) => setAirPressure(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Tip Pressure</Label>
            <Input
              type="number"
              value={tipPressure}
              onChange={(e) => setTipPressure(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Length</Label>
            <Input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Diameter</Label>
            <Input
              type="number"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Welding Readings */}
      <div className="p-4 rounded-lg bg-card border border-border/50">
        <h3 className="text-lg font-medium mb-4">Welding Readings</h3>
        <div className="grid grid-cols-4 gap-4 mb-2">
          <Label className="text-[#94a3b8] font-medium">Welding Current</Label>
          <Label className="text-[#94a3b8] font-medium">Machine Current</Label>
          <Label className="text-[#94a3b8] font-medium">Welding Time</Label>
          <Label className="text-[#94a3b8] font-medium">Machine Time</Label>
        </div>
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="grid grid-cols-4 gap-4 mb-4">
            <Input
              type="number"
              value={weldingReadings[`welding_current_${index}` as keyof typeof weldingReadings]}
              onChange={(e) => handleWeldingReadingChange(`welding_current_${index}`, e.target.value)}
            />
            <Input
              type="number"
              value={weldingReadings[`machine_current_${index}` as keyof typeof weldingReadings]}
              onChange={(e) => handleWeldingReadingChange(`machine_current_${index}`, e.target.value)}
            />
            <Input
              type="number"
              value={weldingReadings[`welding_time_${index}` as keyof typeof weldingReadings]}
              onChange={(e) => handleWeldingReadingChange(`welding_time_${index}`, e.target.value)}
            />
            <Input
              type="number"
              value={weldingReadings[`machine_time_${index}` as keyof typeof weldingReadings]}
              onChange={(e) => handleWeldingReadingChange(`machine_time_${index}`, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="p-4 rounded-lg bg-card border border-border/50">
        <div className="space-y-2">
          <Label className="text-[#94a3b8] font-medium">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
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
          className={`${
            theme === 'dark' 
              ? 'bg-[#a6e15a] text-[#1a1a1a] hover:bg-[#95cc51]' 
              : 'bg-white text-black border border-border hover:bg-gray-50'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Spot Welder'
          )}
        </Button>
      </div>
    </form>
  );
}