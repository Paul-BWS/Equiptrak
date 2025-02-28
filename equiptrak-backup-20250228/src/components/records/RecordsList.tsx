import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Record {
  id: string;
  test_date: string;
  retest_date: string;
  status: string;
  certificate_number?: string;
  notes?: string;
}

interface RecordsListProps {
  customerId: string;
  tableName: string;  // e.g. 'service_records', 'spot_welder_records', etc.
  onRecordClick?: (record: Record) => void;
}

export function RecordsList({ customerId, tableName, onRecordClick }: RecordsListProps) {
  const { data: records = [], isLoading } = useQuery({
    queryKey: [tableName, customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from(tableName)
        .select()
        .eq('company_id', customerId)
        .order('test_date', { ascending: false });

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return [];
      }

      return data || [];
    },
    enabled: !!customerId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No records found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div
          key={record.id}
          onClick={() => onRecordClick?.(record)}
          className="p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Certificate: {record.certificate_number || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">
                Test Date: {new Date(record.test_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Retest Date: {new Date(record.retest_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                record.status === 'valid' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {record.status}
              </span>
            </div>
          </div>
          {record.notes && (
            <p className="mt-2 text-sm text-muted-foreground">{record.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
} 