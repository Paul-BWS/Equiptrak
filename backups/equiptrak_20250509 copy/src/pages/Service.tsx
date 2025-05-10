import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ServiceRecordsTable, ServiceRecordsTableRef } from "@/components/service/components/ServiceRecordsTable";
import { useTheme } from "@/components/theme-provider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Service() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCleaningUp, setIsCleaningUp] = useState(false);
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
    if (companyId) {
      navigate(`/company/${companyId}`);
    } else {
      navigate(-1);
    }
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

  const handleCleanupTestData = async () => {
    if (!companyId) return;
    
    try {
      setIsCleaningUp(true);
      
      // Get auth token
      const storedUser = localStorage.getItem('equiptrak_user');
      let token = '';
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token || '';
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
      
      // Call the cleanup endpoint
      const response = await fetch(`/api/service-records/delete-test-data?companyId=${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Cleanup result:", result);
      
      toast.success(`Removed ${result.deletedCount} test records`);
      
      // Refresh the data
      if (tableRef.current) {
        tableRef.current.refetch();
      }
      
    } catch (error) {
      console.error("Error cleaning up test data:", error);
      toast.error("Failed to clean up test data");
    } finally {
      setIsCleaningUp(false);
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
          
          <div className="flex items-center gap-2">
            {companyId && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCleanupTestData}
                  disabled={isCleaningUp}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {isCleaningUp ? 'Cleaning...' : 'Remove Test Data'}
                </Button>
                
                <Button 
                  className="bg-[#22c55e] hover:bg-opacity-90 text-white gap-2"
                  onClick={() => navigate(`/service/new?companyId=${companyId}`)}
                >
                  <Plus className="h-4 w-4" />
                  Add Service Record
                </Button>
              </>
            )}
          </div>
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