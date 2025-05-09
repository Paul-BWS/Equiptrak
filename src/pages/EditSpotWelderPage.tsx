import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define engineers list
const ENGINEERS = [
  "Paul Jones",
  "Danny Jennings",
  "Mark Allen",
  "Tommy Hannon",
  "Connor Hill",
  "Dominic TJ",
  "Mason Poulton",
  "Zack Collins",
  "Fernando Goulart"
];

export default function EditSpotWelderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // State for form fields
  const [formData, setFormData] = useState({
    certificate_number: "",
    service_date: "",
    retest_date: "",
    status: "Active",
    model: "",
    serial_number: "",
    engineer_name: "",
    equipment_type: "",
    voltage_max: "",
    voltage_min: "",
    air_pressure: "",
    tip_pressure: "",
    length: "",
    diameter: "",
    machine1: "",
    meter1: "",
    machine_time1: "",
    meter_time1: "",
    machine2: "",
    meter2: "",
    machine_time2: "",
    meter_time2: "",
    machine3: "",
    meter3: "",
    machine_time3: "",
    meter_time3: "",
    machine4: "",
    meter4: "",
    machine_time4: "",
    meter_time4: "",
    notes: ""
  });

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const headers = {};
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    return headers;
  };

  // Fetch spot welder data
  useEffect(() => {
    const fetchSpotWelder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/spot-welders/${id}`, {
          headers: getAuthHeaders()
        });
        
        if (response.status !== 200) {
          throw new Error('Failed to fetch spot welder data');
        }
        
        const data = response.data;
        setCompanyId(data.company_id);
        
        // Convert dates to YYYY-MM-DD format for input fields
        const formatDate = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          certificate_number: data.certificate_number || "",
          service_date: formatDate(data.service_date) || "",
          retest_date: formatDate(data.retest_date) || "",
          status: data.status || "Active",
          model: data.model || "",
          serial_number: data.serial_number || "",
          engineer_name: data.engineer_name || ENGINEERS[0],
          equipment_type: data.equipment_type || "",
          voltage_max: data.voltage_max || "",
          voltage_min: data.voltage_min || "",
          air_pressure: data.air_pressure || "",
          tip_pressure: data.tip_pressure || "",
          length: data.length || "",
          diameter: data.diameter || "",
          machine1: data.machine1 || "",
          meter1: data.meter1 || "",
          machine_time1: data.machine_time1 || "",
          meter_time1: data.meter_time1 || "",
          machine2: data.machine2 || "",
          meter2: data.meter2 || "",
          machine_time2: data.machine_time2 || "",
          meter_time2: data.meter_time2 || "",
          machine3: data.machine3 || "",
          meter3: data.meter3 || "",
          machine_time3: data.machine_time3 || "",
          meter_time3: data.meter_time3 || "",
          machine4: data.machine4 || "",
          meter4: data.meter4 || "",
          machine_time4: data.machine_time4 || "",
          meter_time4: data.meter_time4 || "",
          notes: data.notes || ""
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching spot welder:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load spot welder data"
        });
        navigate(`/spot-welders${companyId ? `?companyId=${companyId}` : ''}`);
      }
    };
    
    fetchSpotWelder();
  }, [id, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "service_date") {
      // Update retest_date to be 364 days after new service_date
      const newServiceDate = new Date(value);
      const newRetestDate = new Date(newServiceDate);
      newRetestDate.setDate(newRetestDate.getDate() + 364);
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        retest_date: newRetestDate.toISOString().split('T')[0]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!id || !companyId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required information"
      });
      return;
    }
    
    try {
      const response = await axios.put(`/api/spot-welders/${id}`, {
        ...formData
      }, {
        headers: getAuthHeaders()
      });

      if (response.status !== 200) {
        throw new Error('Failed to update spot welder');
      }

      toast({
        title: "Success",
        description: "Spot welder updated successfully"
      });
      
      // Navigate back to the spot welders list
      navigate(`/spot-welders?companyId=${companyId}`);
    } catch (error) {
      console.error('Error updating spot welder:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update spot welder"
      });
    }
  };

  const handleBack = () => {
    navigate(`/spot-welders?companyId=${companyId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        <p className="mt-4">Loading spot welder data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="flex items-center p-4 bg-white border-b">
        <Button
          variant="outline"
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Spot Welder</h1>
        
        <div className="ml-auto">
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-[#21c15b] hover:bg-[#1ca54e] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Update Record
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 mt-4">
        <Card className="border rounded-lg shadow-sm mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-8">Equipment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <Label htmlFor="certificate_number" className="text-sm font-semibold uppercase mb-2 block">Certificate No</Label>
                <Input
                  id="certificate_number"
                  name="certificate_number"
                  value={formData.certificate_number}
                  onChange={handleInputChange}
                  className="h-12 bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="model" className="text-sm font-semibold uppercase mb-2 block">Model</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="h-12 bg-gray-100"
                  placeholder="Enter model"
                />
              </div>

              <div>
                <Label htmlFor="service_date" className="text-sm font-semibold uppercase mb-2 block">Date</Label>
                <Input
                  id="service_date"
                  name="service_date"
                  type="date"
                  value={formData.service_date}
                  onChange={handleInputChange}
                  className="h-12 bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="serial_number" className="text-sm font-semibold uppercase mb-2 block">Serial Number</Label>
                <Input
                  id="serial_number"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleInputChange}
                  className="h-12 bg-gray-100"
                  placeholder="Enter serial number"
                />
              </div>

              <div>
                <Label htmlFor="retest_date" className="text-sm font-semibold uppercase mb-2 block">Retest Date</Label>
                <Input
                  id="retest_date"
                  name="retest_date"
                  type="date"
                  value={formData.retest_date}
                  readOnly
                  className="h-12 bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="engineer_name" className="text-sm font-semibold uppercase mb-2 block">Engineer</Label>
                <Select
                  value={formData.engineer_name}
                  onValueChange={(value) => handleSelectChange("engineer_name", value)}
                >
                  <SelectTrigger className="h-12 bg-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENGINEERS.map((engineer) => (
                      <SelectItem key={engineer} value={engineer}>
                        {engineer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8">
              <Label htmlFor="notes" className="text-sm font-semibold uppercase mb-2 block">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="h-32 bg-gray-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border rounded-lg shadow-sm mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-8">Measurements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
              <div>
                <Label htmlFor="voltage_max" className="text-sm font-semibold uppercase mb-2 block text-gray-600">Voltage Max</Label>
                <Input
                  id="voltage_max"
                  name="voltage_max"
                  value={formData.voltage_max}
                  onChange={handleInputChange}
                  className="h-12 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="voltage_min" className="text-sm font-semibold uppercase mb-2 block text-gray-600">Voltage Min</Label>
                <Input
                  id="voltage_min"
                  name="voltage_min"
                  value={formData.voltage_min}
                  onChange={handleInputChange}
                  className="h-12 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="air_pressure" className="text-sm font-semibold uppercase mb-2 block text-gray-600">Air Pressure</Label>
                <Input
                  id="air_pressure"
                  name="air_pressure"
                  value={formData.air_pressure}
                  onChange={handleInputChange}
                  className="h-12 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="tip_pressure" className="text-sm font-semibold uppercase mb-2 block text-gray-600">Tip Pressure</Label>
                <Input
                  id="tip_pressure"
                  name="tip_pressure"
                  value={formData.tip_pressure}
                  onChange={handleInputChange}
                  className="h-12 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="length" className="text-sm font-semibold uppercase mb-2 block text-gray-600">Length</Label>
                <Input
                  id="length"
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                  className="h-12 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="diameter" className="text-sm font-semibold uppercase mb-2 block text-gray-600">Diameter</Label>
                <Input
                  id="diameter"
                  name="diameter"
                  value={formData.diameter}
                  onChange={handleInputChange}
                  className="h-12 bg-gray-100"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold my-8">Machine Readings</h2>
            <div className="mt-4 mb-2">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <Label className="text-sm font-semibold uppercase mb-2 block text-gray-600">Machine</Label>
                </div>
                <div>
                  <Label className="text-sm font-semibold uppercase mb-2 block text-gray-600">Meter</Label>
                </div>
                <div>
                  <Label className="text-sm font-semibold uppercase mb-2 block text-gray-600">Machine Time</Label>
                </div>
                <div>
                  <Label className="text-sm font-semibold uppercase mb-2 block text-gray-600">Meter Time</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-6">
                  <Input
                    id="machine1"
                    name="machine1"
                    value={formData.machine1}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="meter1"
                    name="meter1"
                    value={formData.meter1}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="machine_time1"
                    name="machine_time1"
                    value={formData.machine_time1}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="meter_time1"
                    name="meter_time1"
                    value={formData.meter_time1}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-6">
                  <Input
                    id="machine2"
                    name="machine2"
                    value={formData.machine2}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="meter2"
                    name="meter2"
                    value={formData.meter2}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="machine_time2"
                    name="machine_time2"
                    value={formData.machine_time2}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="meter_time2"
                    name="meter_time2"
                    value={formData.meter_time2}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-6">
                  <Input
                    id="machine3"
                    name="machine3"
                    value={formData.machine3}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="meter3"
                    name="meter3"
                    value={formData.meter3}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="machine_time3"
                    name="machine_time3"
                    value={formData.machine_time3}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="meter_time3"
                    name="meter_time3"
                    value={formData.meter_time3}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-6">
                  <Input
                    id="machine4"
                    name="machine4"
                    value={formData.machine4}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="meter4"
                    name="meter4"
                    value={formData.meter4}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="machine_time4"
                    name="machine_time4"
                    value={formData.machine_time4}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                  <Input
                    id="meter_time4"
                    name="meter_time4"
                    value={formData.meter_time4}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 