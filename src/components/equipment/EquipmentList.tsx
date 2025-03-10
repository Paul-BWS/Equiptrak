import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Calendar, Tag, RotateCw, Search, Plus, CheckCircle, AlertCircle, XCircle, FileText, Wrench } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ViewSpotWelderModal } from "@/components/spot-welder/ViewSpotWelderModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EquipmentListProps {
  customerId: string;
  searchQuery?: string;
  hideAddButton?: boolean;
}

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  next_test_date: string;
  status: "valid" | "expired" | "upcoming";
  customer_id?: string;
  companies?: {
    company_name: string | null;
  } | null;
  // ... other properties
}

export function EquipmentList({ customerId, searchQuery: initialSearchQuery = "", hideAddButton = false }: EquipmentListProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(initialSearchQuery);
  const [deleteEquipmentId, setDeleteEquipmentId] = useState<string | null>(null);
  const [deleteEquipmentType, setDeleteEquipmentType] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for modals
  const [selectedSpotWelderId, setSelectedSpotWelderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const query = supabase
          .from('equipment')
          .select(`
            *,
            companies:customer_id (
              company_name
            )
          `);
          
        if (customerId) {
          query.eq('customer_id', customerId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setEquipment(data || []);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEquipment();
  }, [customerId]);

  const refetch = () => {
    // Implement refetch logic
  };

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
  const filteredEquipment = equipment.filter(item => {
    if (!localSearchQuery) return true;
    
    const searchLower = localSearchQuery.toLowerCase();
    
    // Search in serial number
    if (item.serial_number && item.serial_number.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in test date
    if (item.next_test_date && formatDate(item.next_test_date).toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in status
    if (item.status && item.status.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in company name
    if (item.companies && item.companies.company_name && item.companies.company_name.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });

  // Function to render status badge with correct styling
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Valid
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Upcoming
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  // Handle view button click based on equipment type
  const handleViewClick = (e: React.MouseEvent, item: any) => {
    e.stopPropagation(); // Prevent row click navigation
    
    // Determine equipment type and open appropriate modal
    const equipmentType = item.table_name || item.type_id;
    
    switch (equipmentType) {
      case 'spot_welder':
        setSelectedSpotWelderId(item.id);
        break;
      default:
        // For other equipment types, show a toast message for now
        toast({
          title: "View Equipment",
          description: `Viewing details for ${item.name || 'this equipment'} will be available soon.`,
        });
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="bg-white rounded-lg border p-6 max-w-lg mx-auto">
          <h3 className="text-lg font-medium mb-2">Loading equipment...</h3>
          <p className="text-gray-600 mb-4">
            Please wait while we load the equipment list.
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

  if (!equipment.length) {
    return (
      <div className="text-center py-8">
        <p>No equipment found for this customer</p>
        <p className="text-gray-500 mt-2">
          Equipment is added through service records in the specific equipment tables.
        </p>
      </div>
    );
  }

  if (equipment.length > 0 && !filteredEquipment.length) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-auto sm:flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search equipment by serial number, test date..." 
              className="pl-10 w-full"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
          </div>
          
          {!hideAddButton && (
            <Button 
              variant="primaryBlue" 
              onClick={() => navigate(`/admin/customer/${customerId}/equipment-types`)}
              className="whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          )}
        </div>
        
        <div className="text-center py-8">
          <p>No equipment matches your search</p>
          <p className="text-gray-500 mt-2">
            Try adjusting your search criteria.
          </p>
        </div>
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
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Only show the button if hideAddButton is false */}
        {!hideAddButton && (
          <Button 
            variant="primaryBlue" 
            onClick={() => navigate(`/admin/customer/${customerId}/equipment-types`)}
            className="whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        )}
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
                {item.name || "Unknown Equipment Name"}
                {!customerId && item.companies && item.companies.company_name && 
                  ` - ${item.companies.company_name}`}
              </h3>
              
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  {/* Serial Number */}
                  {item.serial_number && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">SN: {item.serial_number}</p>
                    </div>
                  )}
                  
                  {/* Last Test Date */}
                  {item.last_test_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Last Test: {formatDate(item.last_test_date)}
                      </p>
                    </div>
                  )}
                  
                  {/* Next Test Date */}
                  {item.next_test_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Next Test: {formatDate(item.next_test_date)}
                      </p>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {renderStatusBadge(item.status)}
                </div>
                
                {/* Only show buttons on desktop */}
                <div className="hidden sm:flex items-center gap-2 ml-auto">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => handleViewClick(e, item)}
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

      {/* Only include the spot welder modal */}
      {selectedSpotWelderId && (
        <ViewSpotWelderModal
          equipmentId={selectedSpotWelderId}
          open={!!selectedSpotWelderId}
          onOpenChange={(open) => !open && setSelectedSpotWelderId(null)}
        />
      )}

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

export function EquipmentListAdmin({ searchQuery = "" }: { searchQuery?: string }) {
  const navigate = useNavigate();
  
  const { data: equipment, isLoading } = useQuery({
    queryKey: ["all-equipment", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("equipment")
        .select(`
          *,
          profiles:customer_id(*),
          equipment_types:type_id(*)
        `);
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,serial_number.ilike.%${searchQuery}%,profiles.company_name.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching equipment:", error);
        return [];
      }
      
      return data || [];
    }
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleViewEquipment = (equipmentId: string) => {
    navigate(`/admin/equipment/${equipmentId}`);
  };
  
  const handleServiceClick = (equipmentId: string) => {
    navigate(`/admin/equipment/${equipmentId}/service`);
  };
  
  const handleCertificateClick = (equipmentId: string) => {
    navigate(`/admin/equipment/${equipmentId}/certificate`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (!equipment || equipment.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No equipment found</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Last Test</TableHead>
            <TableHead>Next Test</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.serial_number}</TableCell>
              <TableCell>{item.equipment_types?.name || "Unknown"}</TableCell>
              <TableCell>{item.profiles?.company_name || "Unknown"}</TableCell>
              <TableCell>{item.last_test_date ? new Date(item.last_test_date).toLocaleDateString() : "Never"}</TableCell>
              <TableCell>{item.next_test_date ? new Date(item.next_test_date).toLocaleDateString() : "Not scheduled"}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(item.status)}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewEquipment(item.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleServiceClick(item.id)}>
                    <Wrench className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCertificateClick(item.id)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 