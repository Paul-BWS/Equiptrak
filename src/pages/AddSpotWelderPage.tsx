import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

export default function AddSpotWelderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const companyId = new URLSearchParams(location.search).get('companyId');

  // Calculate default service and retest dates
  const today = new Date();
  const defaultServiceDate = today.toISOString().split('T')[0];
  
  const retestDate = new Date(today);
  retestDate.setDate(retestDate.getDate() + 364); // 364 days from today
  const defaultRetestDate = retestDate.toISOString().split('T')[0];

  // State for form fields
  const [formData, setFormData] = useState({
    certificate_number: "",
    service_date: defaultServiceDate,
    retest_date: defaultRetestDate,
    model: "",
    serial_number: "",
    engineer_name: ENGINEERS[0],
    equipment_type: "Spot Welder", // Keep this field for API compatibility
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
  
  // Fetch the last certificate number to generate a new one
  useEffect(() => {
    const generateCertificateNumber = async () => {
      if (!companyId) return;
      
      try {
        // Get all spot welders to find the last certificate number
        const response = await axios.get('/api/spot-welders', {
          params: { company_id: companyId },
          headers: getAuthHeaders()
        });
        
        let nextNumber = 1; // Default starting number
        
        if (response.data && response.data.length > 0) {
          // Find certificates that match our pattern
          const certificates = response.data
            .map(record => record.certificate_number)
            .filter(cert => cert && cert.startsWith('SW-'))
            .map(cert => {
              const matches = cert.match(/SW-(\d+)/);
              return matches ? parseInt(matches[1], 10) : 0;
            })
            .filter(num => !isNaN(num));
          
          // Get the highest number and add 1
          if (certificates.length > 0) {
            nextNumber = Math.max(...certificates) + 1;
          }
        }
        
        // Create new certificate number with padding
        const newCertNum = `SW-${nextNumber.toString().padStart(4, '0')}`;
        
        setFormData(prev => ({
          ...prev,
          certificate_number: newCertNum
        }));
      } catch (error) {
        console.error('Error generating certificate number:', error);
        // Default to SW-0001 if we can't fetch the last one
        setFormData(prev => ({
          ...prev,
          certificate_number: "SW-0001"
        }));
      }
    };
    
    generateCertificateNumber();
  }, [companyId, user]);

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
    
    if (!companyId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Company ID is required"
      });
      return;
    }
    
    try {
      // Prepare the data with all required fields
      const requestData = {
        ...formData,
        company_id: companyId,
        equipment_type: formData.equipment_type || "Spot Welder",
        status: "Active" // Add status field that's required by the server
      };
      
      // Convert empty strings to null for numeric fields to prevent SQL errors
      const numericFields = ['voltage_max', 'voltage_min', 'air_pressure', 'tip_pressure', 'length', 'diameter'];
      for (const field of numericFields) {
        if (requestData[field] === '') {
          requestData[field] = null;
        }
      }
      
      console.log('Sending data to server:', requestData);
      
      const response = await axios.post('/api/spot-welders', requestData, {
        headers: getAuthHeaders()
      });

      if (response.status !== 201) {
        throw new Error('Failed to add spot welder');
      }

      toast({
        title: "Success",
        description: "Spot welder added successfully"
      });
      
      // Navigate back to the spot welders list
      navigate(`/spot-welders?companyId=${companyId}`);
    } catch (error) {
      console.error('Error adding spot welder:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.details || error.response?.data?.error || "Failed to add spot welder"
      });
    }
  };

  const handleBack = () => {
    navigate(`/spot-welders?companyId=${companyId}`);
  };

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
        <h1 className="text-2xl font-bold">Add Spot Welder</h1>
        
        <div className="ml-auto">
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-[#21c15b] hover:bg-[#1ca54e] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Create Record
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
                  readOnly
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
            <div className="grid grid-cols-6 gap-6 mb-6">
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