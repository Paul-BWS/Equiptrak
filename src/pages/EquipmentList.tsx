import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentList as EquipmentListComponent } from "@/components/EquipmentList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, XCircle, Calendar } from "lucide-react";
import { BookEquipmentModal } from "@/components/equipment/BookEquipmentModal";

export default function EquipmentListPage() {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [bookingEquipmentId, setBookingEquipmentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all equipment with company names
  const { data: equipment, isLoading } = useQuery({
    queryKey: ["all-equipment-with-companies"],
    queryFn: async () => {
      try {
        // First, fetch equipment with joined company data
        const { data, error } = await supabase
          .from("equipment")
          .select(`
            *,
            companies:customer_id (
              id,
              company_name
            )
          `)
          .order("next_test_date", { ascending: true });
        
        if (error) throw error;
        
        // Process the data with proper company names
        const processedData = data?.map(item => {
          // Use the actual company name from the join
          const companyName = item.companies?.company_name || "Unknown Company";
          
          return {
            ...item,
            // Ensure status is one of the expected values
            status: validateStatus(item.status),
            // Use the actual company data
            profiles: { 
              company_name: companyName
            },
            // Add equipment type based on type_id
            equipment_types: { 
              name: getEquipmentTypeName(item.type_id),
              description: null
            }
          };
        }) || [];
        
        if (data && data.length > 0) {
          console.log("First equipment item with company:", data[0]);
        }
        
        return processedData;
      } catch (err) {
        console.error("Error in equipment query:", err);
        return [];
      }
    }
  });

  // Helper function to validate status
  function validateStatus(status) {
    const validStatuses = ["valid", "expired", "upcoming"];
    if (!status || !validStatuses.includes(status)) {
      // Default to valid if status is missing or invalid
      return "valid";
    }
    return status;
  }

  // Helper function to get equipment type name from type_id
  function getEquipmentTypeName(typeId) {
    if (!typeId) return "Unknown";
    
    // Map common type IDs to names based on your data
    const typeMap = {
      "spot_welder": "Spot Welder",
      "rivet_tool": "Rivet Tool",
      "compressor": "Compressor",
      "loler": "LOLER Equipment",
      "2135b984-a2e1-4a2a-b613-6c3cabafce19": "MIG Welder"
    };
    
    // Check if it's in our map
    if (typeMap[typeId]) {
      return typeMap[typeId];
    }
    
    // Try to extract a meaningful name from the type_id
    if (typeof typeId === 'string') {
      // If it's a UUID, just return a generic name
      if (typeId.includes('-') && typeId.length > 30) {
        return "Equipment";
      }
      
      const parts = typeId.split('_');
      if (parts.length > 1) {
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }
      
      return typeId;
    }
    
    return `Type ${typeId}`;
  }

  // Calculate counts for dashboard
  const validCount = equipment?.filter(item => item.status === "valid").length || 0;
  const upcomingCount = equipment?.filter(item => item.status === "upcoming").length || 0;
  const expiredCount = equipment?.filter(item => item.status === "expired").length || 0;
  const bookedCount = equipment?.filter(item => item.booking_status === "booked").length || 0;
  const totalCount = equipment?.length || 0;

  // Filter equipment based on search and status filter
  const filteredEquipment = equipment?.filter(item => {
    // Search filter
    const searchMatch = 
      (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.serial_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.profiles?.company_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.equipment_types?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      false;
    
    // Status filter
    let statusMatch = true;
    if (statusFilter !== "all") {
      if (statusFilter === "booked") {
        statusMatch = item.booking_status === "booked";
      } else {
        statusMatch = item.status === statusFilter;
      }
    }
    
    return searchMatch && statusMatch;
  }) || [];

  const handleServiceClick = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
  };

  const handleBookClick = (equipmentId: string) => {
    setBookingEquipmentId(equipmentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Equipment Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage equipment status across all customers
        </p>
      </div>
      
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Valid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              Upcoming Retest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="h-4 w-4 text-red-500 mr-2" />
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 text-blue-500 mr-2" />
              Booked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search equipment, serial number, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="upcoming">Upcoming Retest</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Equipment List */}
      <EquipmentListComponent 
        equipment={filteredEquipment} 
        isLoading={isLoading}
        showCustomer={true}
        onServiceClick={handleServiceClick}
        onViewSpotWelder={setSelectedEquipmentId}
        onViewRivetTool={setSelectedEquipmentId}
        onViewCompressor={setSelectedEquipmentId}
        onBookClick={handleBookClick}
      />

      {/* Booking Modal */}
      {bookingEquipmentId && (
        <BookEquipmentModal
          equipmentId={bookingEquipmentId}
          open={!!bookingEquipmentId}
          onOpenChange={(open) => !open && setBookingEquipmentId(null)}
        />
      )}
    </div>
  );
} 