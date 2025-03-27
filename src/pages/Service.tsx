import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ServiceRecordsTable, ServiceRecordsTableRef } from "@/components/service/components/ServiceRecordsTable";
import { AddServiceModal } from "@/components/service/modals/AddServiceModal";
import { useTheme } from "@/components/theme-provider";
import { useQueryClient } from "@tanstack/react-query";

export function Service() {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tableRef = useRef<ServiceRecordsTableRef>(null);
  const searchParams = new URLSearchParams(location.search);
  const companyId = searchParams.get('companyId');
  const { theme } = useTheme();

  useEffect(() => {
    console.log("Service page loaded with companyId:", companyId);
  }, [companyId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleServiceAdded = () => {
    console.log("Service record added, refreshing data...");
    // Instead of reloading the page, invalidate the query cache to trigger a refetch
    if (companyId) {
      queryClient.invalidateQueries({ queryKey: ["service-records", companyId] });
      // Also invalidate the general service records query
      queryClient.invalidateQueries({ queryKey: ["service-records"] });
      console.log("Queries invalidated, data will refresh");
      
      // If we have a reference to the table component, call its refetch method
      if (tableRef.current) {
        tableRef.current.refetch();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* White Header Section */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto py-4 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="outline"
              onClick={handleBack}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Service Records</h1>
          </div>
          
          {companyId && (
            <AddServiceModal 
              customerId={companyId} 
              onSuccess={handleServiceAdded} 
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6 px-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search service records..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {companyId ? (
            <ServiceRecordsTable
              customerId={companyId}
              searchQuery={searchQuery}
              ref={tableRef}
            />
          ) : (
            <div className="p-4 border rounded-lg bg-amber-50">
              <p>No company ID provided. Please select a company to view their service records.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Service;