import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EquipmentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function EquipmentSearch({ searchTerm, onSearchChange }: EquipmentSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search equipment by name, serial number or retest date..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-background"
      />
    </div>
  );
}