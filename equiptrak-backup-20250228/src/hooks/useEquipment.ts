import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Equipment } from "@/types/equipment";
import { useUser } from "@/hooks/useUser";

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const fetchEquipment = async () => {
      try {
        const { data, error } = await supabase
          .from("equipment")
          .select("*")
          .eq("company_id", user.company_id)
          .order("name");

        if (error) throw error;

        setEquipment(data || []);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();

    // Subscribe to equipment changes
    const equipmentSubscription = supabase
      .channel("equipment_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "equipment",
          filter: `company_id=eq.${user.company_id}`,
        },
        () => {
          fetchEquipment();
        }
      )
      .subscribe();

    return () => {
      equipmentSubscription.unsubscribe();
    };
  }, [user]);

  return { equipment, loading };
} 