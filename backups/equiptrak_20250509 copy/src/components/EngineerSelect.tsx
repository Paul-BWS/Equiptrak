import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EngineerSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EngineerSelect({ value, onChange, disabled }: EngineerSelectProps) {
  const { data: engineers, isLoading } = useQuery({
    queryKey: ["engineers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("engineers")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading engineers..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an engineer" />
      </SelectTrigger>
      <SelectContent>
        {engineers?.map((engineer) => (
          <SelectItem key={engineer.id} value={engineer.id}>
            {engineer.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 