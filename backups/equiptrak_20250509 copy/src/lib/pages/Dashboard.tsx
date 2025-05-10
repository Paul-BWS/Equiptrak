import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentList } from "@/components/EquipmentList";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  last_test_date: string | null;
  next_test_date: string | null;
  status: "valid" | "expired" | "upcoming";
  customer_id?: string;
  profiles?: {
    company_name: string | null;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: equipment, isLoading, error } = useQuery({
    queryKey: ["dashboard-equipment"],
    queryFn: async () => {
      console.log("Fetching equipment...");
      
      if (!user) {
        console.log("No user found");
        return [];
      }

      const { data, error } = await supabase
        .from("equipment")
        .select(`
          *,
          profiles:customer_id (
            company_name
          )
        `)
        .order("next_test_date", { ascending: true });

      if (error) {
        console.error("Error fetching equipment:", error);
        console.log("Full error details:", error);
        toast.error("Failed to load equipment");
        throw error;
      }

      console.log("Equipment data received:", data);

      // Transform the data to ensure status is of the correct type
      return (data || []).map(item => ({
        ...item,
        status: item.status as "valid" | "expired" | "upcoming"
      })) as Equipment[];
    },
    enabled: !!user,
  });

  if (error) {
    console.error("Query error:", error);
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">
          Error loading equipment. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Your Equipment</h1>
        <Button
          onClick={() => navigate('/chat')}
          variant="outline"
          className="gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Support Chat
        </Button>
      </div>
      <EquipmentList equipment={equipment || []} isLoading={isLoading} />
    </div>
  );
}