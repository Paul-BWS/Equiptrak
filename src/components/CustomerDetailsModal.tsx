import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomerDetailsModalProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsModal({ customerId, open, onOpenChange }: CustomerDetailsModalProps) {
  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer-modal", customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("id", customerId)
        .single();
        
      return data;
    },
    enabled: !!customerId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{customer?.company_name || "Customer Details"}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-6 text-center">Loading customer details...</div>
        ) : customer ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Company Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {customer.company_name}</p>
                <p><span className="font-medium">Address:</span> {customer.address}</p>
                <p>
                  <span className="font-medium">Location:</span> {[
                    customer.city,
                    customer.county,
                    customer.postcode
                  ].filter(Boolean).join(', ')}
                </p>
                <p><span className="font-medium">Telephone:</span> {customer.telephone || "N/A"}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-red-500">
            Customer not found or error loading details
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 