import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SpotWelderReadingsProps {
  register: any;
}

export function SpotWelderReadings({ register }: SpotWelderReadingsProps) {
  const renderReadingInputs = (index: number) => (
    <div key={index} className="space-y-2">
      <div className="grid grid-cols-4 gap-4">
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          {...register(`welding_current_${index}`, { 
            valueAsNumber: true,
            max: 15000
          })}
          className="h-12 text-lg text-center w-full"
        />
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          {...register(`machine_current_${index}`, { 
            valueAsNumber: true,
            max: 15000
          })}
          className="h-12 text-lg text-center w-full"
        />
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          {...register(`welding_time_${index}`, { 
            valueAsNumber: true,
            max: 999
          })}
          className="h-12 text-lg text-center w-full"
        />
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          {...register(`machine_time_${index}`, { 
            valueAsNumber: true,
            max: 999
          })}
          className="h-12 text-lg text-center w-full"
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Label className="text-center font-medium text-[#94a3b8]">Welding Current</Label>
        <Label className="text-center font-medium text-[#94a3b8]">Machine Current</Label>
        <Label className="text-center font-medium text-[#94a3b8]">Welding Time</Label>
        <Label className="text-center font-medium text-[#94a3b8]">Machine Time</Label>
      </div>
      <div className="space-y-6">
        {[1, 2, 3, 4].map((index) => renderReadingInputs(index))}
      </div>
    </div>
  );
}