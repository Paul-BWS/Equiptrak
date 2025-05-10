import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RivetToolCertificateEditorProps {
  record: {
    id: string;
    certificate_number: string;
  };
  onUpdate: () => void;
}

export function RivetToolCertificateEditor({ record, onUpdate }: RivetToolCertificateEditorProps) {
  const [editingField, setEditingField] = useState(false);
  const { toast } = useToast();

  const handleCertificateNumberChange = async (newCertificateNumber: string) => {
    try {
      const { error } = await supabase
        .from('rivet_tool_service_records')
        .update({
          certificate_number: newCertificateNumber
        })
        .eq('id', record.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Certificate number updated successfully",
      });

      onUpdate();
      setEditingField(false);
    } catch (error) {
      console.error('Error updating certificate number:', error);
      toast({
        title: "Error",
        description: "Failed to update certificate number",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <div>
        <p className="text-sm text-muted-foreground">Certificate Number</p>
        {editingField ? (
          <Input
            type="text"
            defaultValue={record.certificate_number}
            onBlur={(e) => handleCertificateNumberChange(e.target.value)}
            className="w-40"
          />
        ) : (
          <div 
            className="cursor-pointer hover:text-blue-500"
            onClick={() => setEditingField(true)}
          >
            {record.certificate_number}
          </div>
        )}
      </div>
    </div>
  );
}