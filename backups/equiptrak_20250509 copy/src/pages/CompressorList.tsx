import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Fan, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Compressor {
  id: string;
  name: string;
  serial_number: string;
  manufacturer: string;
  model: string;
  location: string;
  next_service_date: string;
  status: string;
}

export default function CompressorList() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [compressors, setCompressors] = useState<Compressor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get companyId from URL params
  const searchParams = new URLSearchParams(location.search);
  const companyId = searchParams.get('companyId') || '';
  
  useEffect(() => {
    const fetchCompressors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use baseURL and companyId parameter if available
        const url = companyId 
          ? `/api/compressors?company_id=${companyId}`
          : '/api/compressors';
          
        const response = await fetch(url);
        // Treat 404 as empty data - this is necessary when API route isn't registered yet
        if (response.status === 404) {
          console.log('Compressor API endpoint not found, treating as empty data');
          setCompressors([]);
        } else if (!response.ok) {
          throw new Error(`Failed to fetch compressors: ${response.status}`);
        } else {
          const data = await response.json();
          setCompressors(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching compressors:', error);
        // Don't show error to user, just show empty state
        setCompressors([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompressors();
  }, [toast, companyId]);

  const handleBack = () => {
    if (companyId) {
      navigate(`/equipment-types?companyId=${companyId}`);
    } else {
      navigate("/equipment-types");
    }
  };

  const handleAddCompressor = () => {
    if (companyId) {
      // For now, just show a notification since the API doesn't exist yet
      toast({
        title: "Feature coming soon",
        description: "Adding compressors will be available soon.",
      });
      // For development comment out the above and uncomment below when API is ready
      // navigate(`/add-compressor?companyId=${companyId}`);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Company ID is required to add a compressor",
      });
    }
  };

  // Filter compressors based on search term
  const filteredCompressors = compressors.filter(compressor => {
    return (
      !searchTerm ||
      (compressor.name && compressor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (compressor.serial_number && compressor.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (compressor.model && compressor.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (compressor.manufacturer && compressor.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "due soon":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "valid":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <div className="bg-white w-full border-b mb-6">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Compressors</h1>
          </div>
          <Button 
            onClick={handleAddCompressor}
            className="bg-[#21c15b] hover:bg-[#1ca54e] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Compressor
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Search filter */}
        {(!loading && !error && compressors.length > 0) && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, model, or serial number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* No records state */}
        {!loading && !error && filteredCompressors.length === 0 && (
          <Card className="bg-gray-50 border-gray-200 mb-6">
            <CardContent className="pt-6 text-center py-12">
              <Fan className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Compressor Records Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "No records match your current search criteria. Try adjusting your filters."
                  : "Get started by adding your first compressor record."}
              </p>
              <Button 
                onClick={handleAddCompressor} 
                className="bg-[#21c15b] hover:bg-[#1ca54e] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Compressor Record
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Compressor list */}
        {!loading && !error && filteredCompressors.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filteredCompressors.map((compressor) => (
              <Card key={compressor.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{compressor.name || "Unnamed Compressor"}</h3>
                        <Badge className={getStatusColor(compressor.status)}>{compressor.status || "Unknown"}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Serial: {compressor.serial_number || "N/A"}
                      </p>
                      {compressor.manufacturer && (
                        <p className="text-sm text-gray-500">
                          Manufacturer: {compressor.manufacturer}
                        </p>
                      )}
                      {compressor.model && (
                        <p className="text-sm text-gray-500">
                          Model: {compressor.model}
                        </p>
                      )}
                      {compressor.location && (
                        <p className="text-sm text-gray-500">
                          Location: {compressor.location}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Next Service Date:{" "}
                        {compressor.next_service_date
                          ? format(new Date(compressor.next_service_date), "dd/MM/yyyy")
                          : "Not set"}
                      </p>
                    </div>

                    <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-2`}>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/compressors/${compressor.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}