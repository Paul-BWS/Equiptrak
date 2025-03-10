import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function UserEquipment() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get companyId from user metadata
  const companyId = user?.user_metadata?.company_id;

  useEffect(() => {
    const fetchEquipmentData = async () => {
      if (!companyId) {
        console.error('No company ID found for user');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log(`Fetching equipment data for company ID: ${companyId}`);
        
        // Fetch equipment data
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select(`
            *,
            equipment_types(*)
          `)
          .eq('customer_id', companyId);
          
        if (equipmentError) {
          console.error('Error fetching equipment:', equipmentError);
          setIsLoading(false);
          return;
        }
        
        console.log('Equipment fetched successfully:', equipmentData);
        setEquipment(equipmentData || []);
        setFilteredEquipment(equipmentData || []);
      } catch (error) {
        console.error('Error fetching equipment data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEquipmentData();
  }, [companyId]);

  // Filter equipment based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEquipment(equipment);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = equipment.filter(item => 
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.serial_number && item.serial_number.toLowerCase().includes(query)) ||
      (item.equipment_types?.name && item.equipment_types.name.toLowerCase().includes(query))
    );
    
    setFilteredEquipment(filtered);
  }, [searchQuery, equipment]);

  // Calculate equipment status
  const getEquipmentStatus = (item: any) => {
    if (!item.next_test_date) return 'unknown';
    
    const today = new Date();
    const nextTestDate = new Date(item.next_test_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (nextTestDate < today) {
      return 'overdue';
    } else if (nextTestDate <= thirtyDaysFromNow) {
      return 'upcoming';
    } else {
      return 'valid';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-lg">Loading equipment information...</p>
        </div>
      </div>
    );
  }

  // Show error state if no company ID
  if (!companyId) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Company Not Found</h2>
          <p>No company information is associated with your account.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.href = "/dashboard"}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen -mt-6 -mx-4 px-4 pt-6 pb-20 md:pb-6">
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Button 
              variant="primaryBlue" 
              size="icon" 
              onClick={() => window.location.href = "/dashboard"}
              className="mr-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
            </Button>
            <h1 className="text-[24px] font-bold inline-block">
              {companyId ? 'Equipment' : 'Equipment List'}
            </h1>
          </div>
          <div className="text-gray-500">
            Total items: {filteredEquipment.length}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search equipment by name, serial number, or type..."
              className="pl-10 bg-white border border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Equipment List */}
        {filteredEquipment.length === 0 ? (
          <Card className="bg-white shadow-md">
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">
                {searchQuery ? "No equipment found matching your search." : "No equipment found for your company."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map((item) => (
              <Card 
                key={item.id} 
                className="bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                onClick={() => window.location.href = `/equipment/${item.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-base">{item.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getEquipmentStatus(item) === 'valid' ? 'bg-green-100 text-green-800' : 
                      getEquipmentStatus(item) === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : 
                      getEquipmentStatus(item) === 'overdue' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getEquipmentStatus(item) === 'valid' ? 'Valid' : 
                       getEquipmentStatus(item) === 'upcoming' ? 'Due Soon' : 
                       getEquipmentStatus(item) === 'overdue' ? 'Overdue' : 
                       'Unknown'}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    <div>Type: {item.equipment_types?.name || 'Unknown'}</div>
                    <div>Serial: {item.serial_number || 'N/A'}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
                    <div>
                      <div className="text-gray-500 text-xs">Last Test</div>
                      <div>{item.last_test_date ? new Date(item.last_test_date).toLocaleDateString() : 'Never'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Next Test</div>
                      <div>{item.next_test_date ? new Date(item.next_test_date).toLocaleDateString() : 'Not scheduled'}</div>
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