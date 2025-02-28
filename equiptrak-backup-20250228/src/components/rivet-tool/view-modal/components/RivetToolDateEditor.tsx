import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RivetToolDateEditorProps {
  record: {
    id: string;
    test_date: string;
    retest_date: string;
  };
  onUpdate: () => void;
}

export function RivetToolDateEditor({ record, onUpdate }: RivetToolDateEditorProps) {
  const [editingField, setEditingField] = useState<'test_date' | null>(null);
  const { toast } = useToast();

  const handleTestDateChange = async (newDate: string) => {
    const testDate = new Date(newDate);
    const retestDate = new Date(testDate);
    retestDate.setDate(retestDate.getDate() + 364);
    
    try {
      const { error } = await supabase
        .from('rivet_tool_service_records')
        .update({
          test_date: testDate.toISOString(),
          retest_date: retestDate.toISOString()
        })
        .eq('id', record.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Dates updated successfully",
      });

      onUpdate();
      setEditingField(null);
    } catch (error) {
      console.error('Error updating dates:', error);
      toast({
        title: "Error",
        description: "Failed to update dates",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <div>
        <p className="text-sm text-muted-foreground">Test Date</p>
        {editingField === 'test_date' ? (
          <Input
            type="date"
            defaultValue={format(new Date(record.test_date), "yyyy-MM-dd")}
            onChange={(e) => handleTestDateChange(e.target.value)}
            className="w-40"
            onBlur={() => setEditingField(null)}
          />
        ) : (
          <div 
            className="cursor-pointer hover:text-blue-500"
            onClick={() => setEditingField('test_date')}
          >
            {format(new Date(record.test_date), "dd/MM/yyyy")}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Retest Date</p>
        <div>
          {format(new Date(record.retest_date), "dd/MM/yyyy")}
        </div>
      </div>
    </div>
  );
}