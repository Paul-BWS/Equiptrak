import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";

interface RivetToolReadingsProps {
  register: UseFormRegister<any>;
}

export function RivetToolReadings({ register }: RivetToolReadingsProps) {
  const renderReadingInputs = (index: number) => (
    <div key={index} className="space-y-2">
      <div className="grid grid-cols-4 gap-4">
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          {...register(`machine_setting_${index}`, { 
            valueAsNumber: true,
            max: 15000
          })}
          className="h-12 text-lg text-center w-full"
        />
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          {...register(`actual_reading_${index}`, { 
            valueAsNumber: true,
            max: 15000
          })}
          className="h-12 text-lg text-center w-full"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Machine Settings */}
      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <Label className="text-[#94a3b8] mb-6 block">Machine Settings (kN)</Label>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="space-y-2">
              <Label className="text-[#94a3b8]">Setting {num}</Label>
              <Input
                type="number"
                step="0.01"
                {...register(`machine_setting_${num}`, {
                  setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actual Readings */}
      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/10 border border-border/50">
        <Label className="text-[#94a3b8] mb-6 block">Actual Readings (kN)</Label>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="space-y-2">
              <Label className="text-[#94a3b8]">Reading {num}</Label>
              <Input
                type="number"
                step="0.01"
                {...register(`actual_reading_${num}`, {
                  setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 