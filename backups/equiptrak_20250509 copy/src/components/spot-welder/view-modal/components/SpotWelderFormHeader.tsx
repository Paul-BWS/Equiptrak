import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ServiceEngineerSelect } from "@/components/service/components/ServiceEngineerSelect";

interface SpotWelderFormHeaderProps {
  register: any;
  selectedEngineer: string;
  setSelectedEngineer: (value: string) => void;
}

export function SpotWelderFormHeader({
  register,
  selectedEngineer,
  setSelectedEngineer,
}: SpotWelderFormHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Test and Retest Dates */}
      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Test Date</Label>
            <Input type="date" {...register("test_date")} />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Retest Date</Label>
            <Input type="date" {...register("retest_date")} disabled />
          </div>
        </div>
      </div>

      {/* Model, Serial, and Engineer */}
      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Model</Label>
            <Input {...register("equipment_name")} />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Serial</Label>
            <Input {...register("equipment_serial")} />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Engineer</Label>
            <ServiceEngineerSelect
              selectedEngineer={selectedEngineer}
              setSelectedEngineer={setSelectedEngineer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}