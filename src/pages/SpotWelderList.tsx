import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Printer, Trash, Plus } from "lucide-react";
import { AddSpotWelderModal } from "@/components/spot-welder/AddSpotWelderModal";
import { ViewSpotWelderModal } from "@/components/spot-welder/ViewSpotWelderModal";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStatus } from "@/utils/serviceStatus";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

// Add this interface at the top of the file
interface SpotWelder {
  id: string;
  equipment_name?: string;
  equipment_serial?: string;
  engineer_name?: string;
  test_date: string | null;
  retest_date: string | null;
  status: string;
  company_id?: string;
}

export default function SpotWelderList() {
  const { customerId, id } = useParams();
  const navigate = useNavigate();
  const [selectedSpotWelderId, setSelectedSpotWelderId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const isMobile = useIsMobile();
  const [spotWelders, setSpotWelders] = useState<SpotWelder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpotWelder, setSelectedSpotWelder] = useState<SpotWelder | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Query the spot_welder_service_records table directly
  const { data: spotWeldersData, isLoading } = useQuery({
    queryKey: ["spot-welders", customerId],
    queryFn: async () => {
      try {
        console.log("Fetching spot welders with customerId:", customerId);
        
        // Query the spot_welder_service_records table
        const { data, error } = await supabase
          .from("spot_welder_service_records")
          .select("*")
          .eq("company_id", customerId);

        if (error) {
          console.error("Spot welder fetch error:", error);
          throw error;
        }

        console.log("Spot welder data:", data);
        
        // Map the data to include status
        return data?.map(item => ({
          ...item,
          status: getStatus(item.retest_date || item.test_date)
        })) || [];
      } catch (error) {
        console.error("Error in spot welder query:", error);
        return [];
      }
    },
    retry: 1,
  });

  useEffect(() => {
    const fetchSpotWelders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/spot-welders');
        if (!response.ok) {
          throw new Error('Failed to fetch spot welders');
        }
        const data = await response.json();
        setSpotWelders(data);
        
        // If we have an ID parameter, find and select that spot welder
        if (id) {
          const foundWelder = data.find((welder: SpotWelder) => welder.id === id);
          if (foundWelder) {
            setSelectedSpotWelder(foundWelder);
            setIsViewModalOpen(true);
          }
        }
      } catch (error) {
        console.error('Error fetching spot welders:', error);
        toast.error('Failed to load spot welders');
      } finally {
        setLoading(false);
      }
    };

    fetchSpotWelders();
  }, [id]);

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment-types`);
  };

  // Function to format date or return placeholder
  const formatDate = (date: string | null) => {
    if (!date) return "Invalid Date";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-500 hover:bg-green-600">Valid</Badge>;
      case "upcoming":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Upcoming</Badge>;
      case "invalid":
        return <Badge className="bg-red-500 hover:bg-red-600">Invalid</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 relative pb-16">
      <div>
        <Button
          variant="ghost"
          onClick={handleBack}
          className="w-10 h-10 p-0 rounded-md bg-[#273f78] text-white hover:bg-[#1e3266] hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Spot Welder List</h2>
          <p className="text-muted-foreground">
            View and manage spot welder equipment
          </p>
        </div>

        {loading ? (
          <div>Loading spot welders...</div>
        ) : !spotWelders?.length ? (
          <div>No spot welders found.</div>
        ) : (
          <div className="space-y-4">
            {spotWelders.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-4">
                    {/* Equipment Name - Bold */}
                    <h3 className="text-lg font-bold">{item.equipment_name || "ARO 13K Inverter"}</h3>
                    
                    {/* Single row with all information */}
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-5 gap-6 flex-grow">
                        <div>
                          <p className="text-sm text-muted-foreground">Serial Number</p>
                          <p>{item.equipment_serial || "—"}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Engineer</p>
                          <p>{item.engineer_name || "—"}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Test Date</p>
                          <p>{formatDate(item.test_date)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Retest Date</p>
                          <p>{formatDate(item.retest_date)}</p>
                        </div>
                        
                        <div>
                          {renderStatusBadge(item.status)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedSpotWelderId(item.id)}
                          className="text-[#7b96d4] hover:text-[#7b96d4] hover:bg-[#7b96d4]/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-[#7b96d4] hover:text-[#7b96d4] hover:bg-[#7b96d4]/10"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for adding spot welders */}
      <Button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 bg-[#7b96d4] hover:bg-[#6a85c3] shadow-md text-white"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Spot Welder Modal */}
      {showAddModal && (
        <AddSpotWelderModal 
          customerId={customerId || ''} 
          open={showAddModal}
          onOpenChange={setShowAddModal}
        />
      )}

      {/* View Spot Welder Modal */}
      {selectedSpotWelderId && (
        <ViewSpotWelderModal
          equipmentId={selectedSpotWelderId}
          open={!!selectedSpotWelderId}
          onOpenChange={(open) => !open && setSelectedSpotWelderId(null)}
        />
      )}
    </div>
  );
}