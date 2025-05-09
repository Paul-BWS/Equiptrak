import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Equipment } from "@/types/database/types";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Search, Filter, FileCheck, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function CompanyAllEquipment() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get companyId from URL params or user metadata
  const companyId = searchParams.get("id") || user?.id;

  useEffect(() => {
    const fetchEquipmentData = async () => {
      if (!companyId) {
        setError(new Error('No company ID found'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<Equipment[]>(`/api/companies/${companyId}/equipment`);
        const equipmentData = response.data;
        
        if (equipmentData && equipmentData.length > 0) {
          setEquipment(equipmentData);
          
          // Extract unique equipment types
          const types = [...new Set(equipmentData.map(item => item.type))].filter(Boolean);
          setEquipmentTypes(types);
          
          setFilteredEquipment(equipmentData);
        } else {
          setError(new Error('No equipment found for this company'));
        }
      } catch (err) {
        console.error('Error fetching equipment:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentData();
  }, [companyId]);

  // Filter equipment based on search query, type and status
  useEffect(() => {
    if (!equipment.length) {
      setFilteredEquipment([]);
      return;
    }
    
    let filtered = [...equipment];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name?.toLowerCase().includes(query)) ||
        (item.serial_number?.toLowerCase().includes(query)) ||
        (item.certificate_number?.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      const today = new Date();
      
      filtered = filtered.filter(item => {
        if (!item.next_test_date) return false;
        
        const nextTest = new Date(item.next_test_date);
        const daysUntilTest = Math.ceil((nextTest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const itemStatus = daysUntilTest < 0 ? "invalid" : 
                         daysUntilTest <= 30 ? "upcoming" : "valid";
                         
        return itemStatus === statusFilter;
      });
    }
    
    setFilteredEquipment(filtered);
  }, [searchQuery, equipment, typeFilter, statusFilter]);

  // Calculate equipment status
  const getEquipmentStatus = (item: Equipment) => {
    if (!item.next_test_date) return 'unknown';
    
    const nextTest = new Date(item.next_test_date);
    const today = new Date();
    const daysUntilTest = Math.ceil((nextTest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilTest < 0) return 'invalid';
    if (daysUntilTest <= 30) return 'upcoming';
    return 'valid';
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading equipment...</p>
        </div>
      </div>
    );
  }

  if (!equipment.length) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">No Equipment Found</h2>
              <p>{error?.message || "No equipment found for this company."}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Equipment Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, serial number or certificate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Equipment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Equipment Type</SelectLabel>
                  <SelectItem value="all">All Types</SelectItem>
                  {equipmentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="invalid">Invalid</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => {
          const status = getEquipmentStatus(item);
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <Badge className={`
                    ${status === 'valid' ? 'bg-green-100 text-green-800' : 
                      status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : 
                      status === 'invalid' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}
                  `}>
                    {status === 'valid' ? 'Valid' : 
                     status === 'upcoming' ? 'Upcoming' : 
                     status === 'invalid' ? 'Invalid' : 'Unknown'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  {item.certificate_number && (
                    <p><span className="font-medium">Certificate:</span> {item.certificate_number}</p>
                  )}
                  <p><span className="font-medium">Serial Number:</span> {item.serial_number || 'N/A'}</p>
                  <p><span className="font-medium">Type:</span> {item.type || 'N/A'}</p>
                  <p><span className="font-medium">Last Test:</span> {formatDate(item.last_test_date)}</p>
                  <p><span className="font-medium">Next Test:</span> {formatDate(item.next_test_date)}</p>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button variant="outline" size="sm" className="text-xs">
                    <FileCheck className="h-3 w-3 mr-1" />
                    View Certificate
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Filter className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              {searchQuery || typeFilter !== "all" || statusFilter !== "all" ? 
                "No equipment found matching your filters." : 
                error?.message || "No equipment found for this company."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 