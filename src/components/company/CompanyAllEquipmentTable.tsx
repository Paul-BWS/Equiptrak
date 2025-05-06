import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EquipmentItem {
  id: string;
  equipment_type: string;
  certificate_number: string;
  service_date: string;
  retest_date: string;
  name: string;
  serial_number: string;
  status: string;
}

interface CompanyAllEquipmentTableProps {
  companyId: string;
}

export function CompanyAllEquipmentTable({ companyId }: CompanyAllEquipmentTableProps) {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllEquipment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get authentication token
        const storedUser = localStorage.getItem('equiptrak_user');
        let headers: Record<string, string> = {};
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            if (userData.token) {
              headers = {
                'Authorization': `Bearer ${userData.token}`,
                'Content-Type': 'application/json'
              };
            }
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
        
        const response = await fetch(`/api/service-records/all-equipment?companyId=${companyId}`, {
          headers,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch equipment: ${response.status}`);
        }
        
        const data = await response.json();
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching all equipment:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (companyId) {
      fetchAllEquipment();
    }
  }, [companyId]);

  // Filter equipment based on search term
  const filteredEquipment = equipment.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.serial_number && item.serial_number.toLowerCase().includes(searchLower)) ||
      (item.certificate_number && item.certificate_number.toLowerCase().includes(searchLower))
    );
  });

  const handleEditEquipment = (item: EquipmentItem) => {
    switch (item.equipment_type) {
      case 'service_record':
        navigate(`/service/edit/${item.id}`);
        break;
      case 'spot_welder':
        navigate(`/edit-spot-welder/${item.id}`);
        break;
      case 'lift_service':
        navigate(`/lift-service/edit/${item.id}`);
        break;
      default:
        toast({
          title: "Not Implemented",
          description: `Editing ${item.equipment_type} is not implemented yet`,
          variant: "destructive",
        });
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
      case 'upcoming':
        return <Badge className="bg-yellow-100 text-yellow-800">Upcoming</Badge>;
      case 'invalid':
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Invalid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEquipmentTypeLabel = (type: string) => {
    switch (type) {
      case 'service_record':
        return 'Service Record';
      case 'spot_welder':
        return 'Spot Welder';
      case 'lift_service':
        return 'Lift Service';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading equipment...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-800">
        <h3 className="font-semibold mb-2">Error loading equipment</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      {filteredEquipment.length === 0 ? (
        <div className="text-center py-8 border rounded text-muted-foreground">
          No equipment found
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead>Certificate #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map((item) => (
                <TableRow key={`${item.equipment_type}-${item.id}`}>
                  <TableCell className="font-medium">{item.name || 'N/A'}</TableCell>
                  <TableCell>{item.serial_number || 'N/A'}</TableCell>
                  <TableCell>{getEquipmentTypeLabel(item.equipment_type)}</TableCell>
                  <TableCell>
                    {item.service_date ? format(new Date(item.service_date), 'dd/MM/yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.retest_date ? format(new Date(item.retest_date), 'dd/MM/yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>{item.certificate_number || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 hover:text-blue-800"
                      onClick={() => handleEditEquipment(item)}
                      title="Edit Record"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 