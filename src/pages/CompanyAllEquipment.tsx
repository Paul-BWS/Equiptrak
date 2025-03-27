import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Equipment } from "@/types/database/types";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthProvider";
import { User } from "@/contexts/AuthContext";

export function CompanyAllEquipment() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<Error | null>(null);

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

  // Filter equipment based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEquipment(equipment);
      return;
    }

    const filtered = equipment.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serial_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEquipment(filtered);
  }, [searchQuery, equipment]);

  // Calculate equipment status
  const getEquipmentStatus = (item: Equipment) => {
    if (!item.next_test_date) return 'unknown';
    
    const nextTest = new Date(item.next_test_date);
    const today = new Date();
    const daysUntilTest = Math.ceil((nextTest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilTest < 0) return 'overdue';
    if (daysUntilTest <= 30) return 'due-soon';
    return 'ok';
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
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search equipment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Serial Number:</span> {item.serial_number}</p>
                <p><span className="font-medium">Type:</span> {item.type}</p>
                <p><span className="font-medium">Last Test:</span> {item.last_test_date || 'N/A'}</p>
                <p><span className="font-medium">Next Test:</span> {item.next_test_date || 'N/A'}</p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    getEquipmentStatus(item) === 'overdue' ? 'bg-red-100 text-red-800' :
                    getEquipmentStatus(item) === 'due-soon' ? 'bg-yellow-100 text-yellow-800' :
                    getEquipmentStatus(item) === 'ok' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getEquipmentStatus(item).toUpperCase()}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              {searchQuery ? "No equipment found matching your search." : error?.message || "No equipment found for this company."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 