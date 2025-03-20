import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [compressors, setCompressors] = useState<Compressor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompressor, setNewCompressor] = useState({
    name: "",
    serial_number: "",
    manufacturer: "",
    model: "",
    location: "",
  });

  useEffect(() => {
    const fetchCompressors = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/compressors');
        if (!response.ok) {
          throw new Error('Failed to fetch compressors');
        }
        const data = await response.json();
        setCompressors(data);
      } catch (error) {
        console.error('Error fetching compressors:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load compressors",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompressors();
  }, [toast]);

  const handleBack = () => {
    navigate("/equipment-types");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompressor(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCompressor = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/compressors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompressor),
      });

      if (!response.ok) {
        throw new Error('Failed to add compressor');
      }

      const addedCompressor = await response.json();
      setCompressors(prev => [...prev, addedCompressor]);
      setIsAddModalOpen(false);
      setNewCompressor({
        name: "",
        serial_number: "",
        manufacturer: "",
        model: "",
        location: "",
      });

      toast({
        title: "Success",
        description: "Compressor added successfully",
      });
    } catch (error) {
      console.error('Error adding compressor:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add compressor",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Compressors</h1>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Compressor
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading compressors...</div>
      ) : !compressors.length ? (
        <div className="text-center py-8">No compressors found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {compressors.map((compressor) => (
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

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Compressor</DialogTitle>
            <DialogDescription>
              Enter the details for the new compressor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={newCompressor.name}
                onChange={handleInputChange}
                placeholder="Enter compressor name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                name="serial_number"
                value={newCompressor.serial_number}
                onChange={handleInputChange}
                placeholder="Enter serial number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                value={newCompressor.manufacturer}
                onChange={handleInputChange}
                placeholder="Enter manufacturer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={newCompressor.model}
                onChange={handleInputChange}
                placeholder="Enter model"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={newCompressor.location}
                onChange={handleInputChange}
                placeholder="Enter location"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCompressor}>
              Add Compressor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}