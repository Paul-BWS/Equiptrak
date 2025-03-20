import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Printer, Trash, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SpotWelder {
  id: string;
  name: string;
  serial_number: string;
  engineer: string;
  test_date: string | null;
  retest_date: string | null;
  status: string;
}

export default function SpotWelderList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [spotWelders, setSpotWelders] = useState<SpotWelder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSpotWelder, setNewSpotWelder] = useState({
    name: "",
    serial_number: "",
    engineer: "",
  });

  useEffect(() => {
    const fetchSpotWelders = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/spot-welders');
        if (!response.ok) {
          throw new Error('Failed to fetch spot welders');
        }
        const data = await response.json();
        setSpotWelders(data);
      } catch (error) {
        console.error('Error fetching spot welders:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load spot welders",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSpotWelders();
  }, [toast]);

  const handleBack = () => {
    navigate("/equipment-types");
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch (e) {
      return "Invalid Date";
    }
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
    setNewSpotWelder(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSpotWelder = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/spot-welders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSpotWelder),
      });

      if (!response.ok) {
        throw new Error('Failed to add spot welder');
      }

      const addedSpotWelder = await response.json();
      setSpotWelders(prev => [...prev, addedSpotWelder]);
      setIsAddModalOpen(false);
      setNewSpotWelder({
        name: "",
        serial_number: "",
        engineer: "",
      });

      toast({
        title: "Success",
        description: "Spot welder added successfully",
      });
    } catch (error) {
      console.error('Error adding spot welder:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add spot welder",
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
          <h1 className="text-3xl font-bold">Spot Welders</h1>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Spot Welder
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading spot welders...</div>
      ) : !spotWelders.length ? (
        <div className="text-center py-8">No spot welders found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {spotWelders.map((welder) => (
            <Card key={welder.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{welder.name || "Unnamed Spot Welder"}</h3>
                      <Badge className={getStatusColor(welder.status)}>{welder.status || "Unknown"}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Serial: {welder.serial_number || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Engineer: {welder.engineer || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Test Date: {formatDate(welder.test_date)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Retest Date: {formatDate(welder.retest_date)}
                    </p>
                  </div>

                  <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-2`}>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/spot-welders/${welder.id}`)}
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
            <DialogTitle>Add New Spot Welder</DialogTitle>
            <DialogDescription>
              Enter the details for the new spot welder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={newSpotWelder.name}
                onChange={handleInputChange}
                placeholder="Enter spot welder name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                name="serial_number"
                value={newSpotWelder.serial_number}
                onChange={handleInputChange}
                placeholder="Enter serial number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engineer">Engineer</Label>
              <Input
                id="engineer"
                name="engineer"
                value={newSpotWelder.engineer}
                onChange={handleInputChange}
                placeholder="Enter engineer name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSpotWelder}>
              Add Spot Welder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}