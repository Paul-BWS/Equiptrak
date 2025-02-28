import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SpotWelderParametersProps {
  register: any;
}

export function SpotWelderParameters({ register }: SpotWelderParametersProps) {
  return (
    <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Voltage Max</Label>
            <Input 
              type="number"
              {...register("voltage_max", { valueAsNumber: true })} 
              className="h-12 text-lg w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Voltage Min</Label>
            <Input 
              type="number"
              {...register("voltage_min", { valueAsNumber: true })} 
              className="h-12 text-lg w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Air Pressure</Label>
            <Input 
              type="number"
              {...register("air_pressure", { valueAsNumber: true })} 
              className="h-12 text-lg w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Tip Pressure</Label>
            <Input 
              type="number"
              {...register("tip_pressure", { valueAsNumber: true })} 
              className="h-12 text-lg w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Electrode Length</Label>
            <Input 
              type="number"
              {...register("length", { valueAsNumber: true })} 
              className="h-12 text-lg w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8] font-medium">Electrode Diameter</Label>
            <Input 
              type="number"
              {...register("diameter", { valueAsNumber: true })} 
              className="h-12 text-lg w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}