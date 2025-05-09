import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { addDays, format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Engineers list
const ENGINEERS = [
  "John Smith",
  "Sarah Johnson",
  "Michael Brown",
  "Emily Davis",
  "David Wilson",
  "Lisa Thompson",
  "Robert Taylor",
  "Jennifer Anderson",
  "William Jones",
  "Karen Miller"
];

// Test result options
const TEST_RESULTS = [
  { value: "NA", label: "N/A" },
  { value: "PASS", label: "Pass" },
  { value: "FAIL", label: "Fail" }
];

export default function AddCompressorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId') || '';
  
  // Debug companyId
  console.log('AddCompressorPage - companyId from URL:', companyId);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [model, setModel] = useState("");
  const [engineerName, setEngineerName] = useState("");
  const [testDate, setTestDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [retestDate, setRetestDate] = useState(format(addDays(new Date(), 364), "yyyy-MM-dd"));
  const [pressureTestResult, setPressureTestResult] = useState("NA");
  const [safetyValveTest, setSafetyValveTest] = useState("NA");
  const [oilLevel, setOilLevel] = useState("NA");
  const [filterCheckResult, setFilterCheckResult] = useState("NA");
  const [notes, setNotes] = useState("");

  const handleTestDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTestDate = e.target.value;
    setTestDate(newTestDate);
    // Calculate new retest date (364 days from test date)
    const newRetestDate = format(addDays(new Date(newTestDate), 364), "yyyy-MM-dd");
    setRetestDate(newRetestDate);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId) {
      toast({
        title: "Error",
        description: "Company ID is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (!name || !serialNumber || !engineerName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields: Name, Serial Number, and Engineer",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get auth token from localStorage - update to match CompressorsPage
      const storedUser = localStorage.getItem('equiptrak_user');
      console.log('StoredUser data from localStorage:', storedUser ? 'Found' : 'Not found');
      
      if (!storedUser) {
        throw new Error("User data not found. Please log in again.");
      }
      
      let token;
      try {
        const userData = JSON.parse(storedUser);
        console.log('userData parsed:', userData ? 'Valid JSON' : 'Invalid JSON');
        token = userData.token;
        console.log('Token found in userData:', token ? 'Yes' : 'No');
      } catch (e) {
        console.error("Error parsing user data:", e);
        throw new Error("Invalid user data. Please log in again.");
      }
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Convert string values to boolean for database
      const convertTestResultToBoolean = (result) => {
        if (result === "PASS") return true;
        if (result === "FAIL") return false;
        return null; // For "NA"
      };
      
      // Prepare payload for API
      const payload = {
        company_id: companyId,
        // Map to real column names
        equipment_name: name,
        equipment_serial: serialNumber,
        notes: notes,
        status: "valid",
        // Convert string test results to boolean values for database
        safety_valve_test_result: convertTestResultToBoolean(safetyValveTest),
        oil_level_check_result: convertTestResultToBoolean(oilLevel),
        pressure_test_result: convertTestResultToBoolean(pressureTestResult),
        filter_check_result: convertTestResultToBoolean(filterCheckResult),
        // Use test_date as service_date
        service_date: testDate,
        // Add retest_date
        retest_date: retestDate
      };
      
      console.log('Sending payload to API:', payload);
      
      // Send to API
      const response = await fetch('/api/compressors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response from API:', errorData);
        } catch (e) {
          console.error('Error parsing error response:', e);
          throw new Error(`Failed to add compressor: ${response.statusText} (${response.status})`);
        }
        throw new Error(errorData.error || `Failed to add compressor: ${response.statusText} (${response.status})`);
      }

      toast({
        title: "Success",
        description: "Compressor added successfully",
      });
      
      // Navigate back to previous page
      navigate(-1);
      
    } catch (error: any) {
      console.error('Error adding compressor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add compressor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      {/* Header */}
      <div className="w-full bg-white shadow-sm mb-6 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Add New Compressor</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Compressor Details</CardTitle>
          {companyId && <p className="text-sm text-muted-foreground">Company ID: {companyId}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Equipment Info */}
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-slate-800 border border-border/50">
              <h3 className="text-lg font-medium mb-4">Equipment Details</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter compressor name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number *</Label>
                    <Input
                      id="serialNumber"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="Enter serial number"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Enter model"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="engineerName">Engineer *</Label>
                  <Select onValueChange={setEngineerName} value={engineerName}>
                    <SelectTrigger id="engineerName">
                      <SelectValue placeholder="Select engineer" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="testDate">Test Date *</Label>
                    <Input
                      id="testDate"
                      type="date"
                      value={testDate}
                      onChange={handleTestDateChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="retestDate">Retest Date</Label>
                    <Input
                      id="retestDate"
                      type="date"
                      value={retestDate}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-slate-800 border border-border/50">
              <h3 className="text-lg font-medium mb-4">Test Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pressureTestResult">Pressure Test Result</Label>
                  <Select onValueChange={setPressureTestResult} value={pressureTestResult}>
                    <SelectTrigger id="pressureTestResult">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_RESULTS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="safetyValveTest">Safety Valve Test</Label>
                  <Select onValueChange={setSafetyValveTest} value={safetyValveTest}>
                    <SelectTrigger id="safetyValveTest">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_RESULTS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oilLevel">Oil Level Check</Label>
                  <Select onValueChange={setOilLevel} value={oilLevel}>
                    <SelectTrigger id="oilLevel">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_RESULTS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filterCheckResult">Filter Check Result</Label>
                  <Select onValueChange={setFilterCheckResult} value={filterCheckResult}>
                    <SelectTrigger id="filterCheckResult">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_RESULTS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-slate-800 border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes here..."
                  className="min-h-24"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Compressor'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 