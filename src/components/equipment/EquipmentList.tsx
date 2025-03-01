import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Calendar, Tag, RotateCw, Search, Plus } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface EquipmentListProps {
  customerId: string;
  searchQuery?: string;
}

export function EquipmentList({ customerId, searchQuery = "" }: EquipmentListProps) {
  const [deleteEquipmentId, setDeleteEquipmentId] = useState<string | null>(null);
  const [deleteEquipmentType, setDeleteEquipmentType] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch equipment for this customer from multiple tables
  const { data: compressorRecords, error: compressorError } = useQuery({
    queryKey: ["compressor-records", customerId],
    queryFn: async () => {
      console.log("Fetching compressor records for customer:", customerId);
      
      const { data, error } = await supabase
        .from("compressor_records")
        .select("*")
        .eq("company_id", customerId);
        
      if (error) {
        console.error("Error fetching compressor records:", error);
        throw error;
      }
      
      // Add equipment type manually after fetching
      return (data || []).map(record => ({
        ...record,
        equipment_type: "Compressor"
      }));
    },
    enabled: !!customerId,
  });

  // Similarly for spot welder records
  const { data: spotWelderRecords, error: spotWelderError } = useQuery({
    queryKey: ["spot-welder-records", customerId],
    queryFn: async () => {
      console.log("Fetching spot welder records for customer:", customerId);
      
      const { data, error } = await supabase
        .from("spot_welder_service_records")
        .select("*")
        .eq("company_id", customerId);
        
      if (error) {
        console.error("Error fetching spot welder records:", error);
        throw error;
      }
      
      // Add equipment type manually after fetching
      return (data || []).map(record => ({
        ...record,
        equipment_type: "SpotWelder"
      }));
    },
    enabled: !!customerId,
  });

  const handleDelete = async () => {
    if (!deleteEquipmentId || !deleteEquipmentType) return;
    
    try {
      const { error } = await supabase
        .from(deleteEquipmentType)
        .delete()
        .eq("id", deleteEquipmentId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Equipment deleted successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete equipment",
        variant: "destructive",
      });
    } finally {
      setDeleteEquipmentId(null);
      setDeleteEquipmentType(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "dd/MM/yyyy") : "Invalid date";
  };

  // Filter equipment based on search query
  const filteredEquipment = [...(compressorRecords || []), ...(spotWelderRecords || [])].filter(item => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // Search in serial number
    if (item.serial_number && item.serial_number.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in test date
    if (item.test_date && formatDate(item.test_date).toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in retest date
    if (item.retest_date && formatDate(item.retest_date).toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in equipment type
    if (item.equipment_type && item.equipment_type.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });

  if (compressorError || spotWelderError) {
    return (
      <div className="text-center py-8">
        <div className="bg-white rounded-lg border p-6 max-w-lg mx-auto">
          <h3 className="text-lg font-medium mb-2">Unable to load equipment</h3>
          <p className="text-gray-600 mb-4">
            There was an error loading the equipment list. Please try again.
          </p>
          <Button 
            onClick={() => refetch()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!filteredEquipment.length) {
    return (
      <div className="text-center py-8">
        <p>No equipment found for this customer</p>
        <p className="text-gray-500 mt-2">
          Equipment is added through service records in the specific equipment tables.
        </p>
      </div>
    );
  }

  if (!filteredEquipment.length) {
    return (
      <div className="text-center py-8">
        <p>No equipment matches your search</p>
        <p className="text-gray-500 mt-2">
          Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto sm:flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search equipment by serial number, test date..." 
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button 
          variant="primaryBlue" 
          onClick={() => navigate(`/admin/customer/${customerId}/equipment-types`)}
          className="whitespace-nowrap"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredEquipment.map((item) => (
          <div 
            key={`${item.table_name}-${item.id}`} 
            className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/admin/customer/${customerId}/equipment/${item.table_name}/${item.id}`)}
          >
            <div className="p-4">
              <h3 className="text-lg font-medium mb-3">
                {item.equipment_type || "Unknown Equipment Type"}
              </h3>
              
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  {/* Serial Number with icon */}
                  {item.serial_number && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">SN: {item.serial_number}</p>
                    </div>
                  )}
                  
                  {/* Test Date with icon */}
                  {item.test_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Tested: {formatDate(item.test_date)}</p>
                    </div>
                  )}
                  
                  {/* Retest Date with icon */}
                  {item.retest_date && (
                    <div className="flex items-center gap-2">
                      <RotateCw className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Retest: {formatDate(item.retest_date)}</p>
                    </div>
                  )}
                </div>
                
                {/* Only show buttons on desktop */}
                <div className="hidden sm:flex items-center gap-2 ml-auto">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      navigate(`/admin/customer/${customerId}/equipment/${item.table_name}/${item.id}`);
                    }}
                    style={{
                      backgroundColor: 'white',
                      color: '#7b96d4',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      navigate(`/admin/customer/${customerId}/equipment/${item.table_name}/${item.id}/edit`);
                    }}
                    style={{
                      backgroundColor: 'white',
                      color: '#7b96d4',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      setDeleteEquipmentId(item.id);
                      setDeleteEquipmentType(item.table_name);
                    }}
                    style={{
                      backgroundColor: 'white',
                      color: '#ef4444',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteEquipmentId} onOpenChange={(open) => {
        if (!open) {
          setDeleteEquipmentId(null);
          setDeleteEquipmentType(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this equipment and all associated records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 