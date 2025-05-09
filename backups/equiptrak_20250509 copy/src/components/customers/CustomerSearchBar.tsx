import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CustomerSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function CustomerSearchBar({ searchQuery, onSearchChange }: CustomerSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search customers..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}