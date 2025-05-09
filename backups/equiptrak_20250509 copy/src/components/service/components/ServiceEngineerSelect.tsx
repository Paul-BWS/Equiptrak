import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ENGINEERS = [
  { id: "1", name: "Paul Jones" },
  { id: "2", name: "Danny Jennings" },
  { id: "3", name: "Tommy Hannon" },
  { id: "4", name: "Mark Allen" },
  { id: "5", name: "Fernando Goulart" },
  { id: "6", name: "Connor Hill" },
  { id: "7", name: "Dominic TJ" },
  { id: "8", name: "Mason Poulton" },
  { id: "9", name: "Zack Collins" }
];

interface ServiceEngineerSelectProps {
  selectedEngineer: string;
  setSelectedEngineer: (value: string) => void;
  hideLabel?: boolean;
}

export default function ServiceEngineerSelect({ selectedEngineer, setSelectedEngineer, hideLabel }: ServiceEngineerSelectProps) {
  return (
    <Select 
      value={selectedEngineer} 
      onValueChange={setSelectedEngineer}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an engineer">
          {selectedEngineer || "Select an engineer"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ENGINEERS.map((engineer) => (
          <SelectItem key={engineer.id} value={engineer.name}>
            {engineer.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { ServiceEngineerSelect }; 