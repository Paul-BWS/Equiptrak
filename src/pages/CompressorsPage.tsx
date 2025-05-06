import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatus, getStatusColor } from "@/utils/serviceStatus";
import { Fan, ArrowLeft, Plus } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Import the existing type or define it if needed
import { CompressorRecord } from "@/types/database/compressors";

export default function CompressorsPage() {
  // State management
  const [compressors, setCompressors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const companyId = searchParams.get('companyId');
  
  // Authentication context
  const { user } = useAuth();
  
  // Helper to get auth headers
  const getAuthHeaders = () => {
    const headers = {};
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    return headers;
  };
  
  // Fetch records on component mount
  useEffect(() => {
    const fetchCompressors = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state on new fetch
        
        if (!companyId) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`/api/compressors?company_id=${companyId}`, { 
          headers: getAuthHeaders() 
        });
        
        // Ensure response data is an array, even if empty
        const data = Array.isArray(response.data) ? response.data : [];
        
        // Process data to match the CompressorRecord type
        setCompressors(data.map((record: any) => ({
          ...record,
          status: getStatus(record.retest_date || record.service_date)
        })));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching compressors:', err);
        
        // Check if it's a 404 error, which means no records, not a real error
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setCompressors([]); // Set to empty array if 404
          setError(null); // Clear any previous errors
        } else {
          // Set error for other types of failures
          setError('Failed to load compressors. Please try again later.');
        }
        setLoading(false);
      }
    };
    
    if (companyId) {
      fetchCompressors();
    } else {
      setLoading(false);
    }
  }, [companyId, user]);
  
  // Navigation handlers
  const handleAddNew = () => {
    navigate(`/add-compressor?companyId=${companyId}`);
  };
  
  const handleBack = () => {
    navigate('/equipment-types');
  };

  const handleViewCompressor = (compressorId: string) => {
    navigate(`/compressor-certificate/${compressorId}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="w-full bg-white shadow-sm print:hidden mb-6">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button 
            variant="outline"
            onClick={handleBack}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-2xl font-bold">Compressors</h1>
          
          {companyId && (
            <Button 
              onClick={handleAddNew}
              className="dark:bg-[#a6e15a] dark:text-black dark:hover:bg-[#95cc51] bg-[#7b96d4] text-white hover:bg-[#6a85c3]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Compressor
            </Button>
          )}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="container mx-auto px-4 pb-6">
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
        
        {/* No company ID state */}
        {!loading && !error && !companyId && (
          <Card className="bg-amber-50 border-amber-200 mb-6">
            <CardContent className="pt-6">
              <p>No company ID provided. Please select a company to view their compressor records.</p>
            </CardContent>
          </Card>
        )}
        
        {/* No records state */}
        {!loading && !error && companyId && compressors.length === 0 && (
          <Card className="bg-gray-50 border-gray-200 mb-6">
            <CardContent className="pt-6 text-center py-12">
              <Fan className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Compressors Found</h3>
              <p className="text-gray-500 mb-6">This company doesn't have any compressor records yet.</p>
              <Button onClick={handleAddNew} 
                className="dark:bg-[#a6e15a] dark:text-black dark:hover:bg-[#95cc51] bg-[#7b96d4] text-white hover:bg-[#6a85c3]">
                <Plus className="h-4 w-4 mr-2" />
                Add Compressor
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Records list */}
        {!loading && !error && compressors.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mt-4">
            {compressors.map((compressor) => (
              <Card 
                key={compressor.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewCompressor(compressor.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{compressor.equipment_name || "Unnamed Compressor"}</h3>
                        <Badge className={getStatusColor(compressor.status)}>{compressor.status || "Unknown"}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Serial: {compressor.equipment_serial || "N/A"}
                      </p>
                      {compressor.certificate_number && (
                        <p className="text-sm text-gray-500">
                          Certificate #: {compressor.certificate_number}
                        </p>
                      )}
                      {compressor.compressor_model && (
                        <p className="text-sm text-gray-500">
                          Model: {compressor.compressor_model}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Service Date: {compressor.service_date ? format(new Date(compressor.service_date), "dd/MM/yyyy") : "Not tested"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Next Test: {compressor.retest_date ? format(new Date(compressor.retest_date), "dd/MM/yyyy") : "Not scheduled"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 