import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ServiceRecordsTable } from "@/components/service/components/ServiceRecordsTable";

export function Service() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto py-6 space-y-6" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Service Records</h1>
          <p className="text-muted-foreground">
            View and manage service records
          </p>
        </div>
        {/* Green Add Service button removed */}
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search service records..."
          className="pl-10 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <ServiceRecordsTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}

export default Service;