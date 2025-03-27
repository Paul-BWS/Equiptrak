import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Forklift, ArrowLeft, FileText, QrCode, PencilLine, Trash2, AlertTriangle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";

interface CompanyData {
  id: string;
  company_name: string;
}

interface LiftServiceRecord {
  id: string;
  company_id: string;
  certificate_number: string;
  product_category: string;
  model: string;
  serial_number: string;
  service_date: string;
  retest_date: string;
  swl: string;
  engineer_name: string;
  engineer_signature: string;
  notes: string;
  safe_working_test: boolean;
  emergency_stops_test: boolean;
  limit_switches_test: boolean;
  safety_devices_test: boolean;
  hydraulic_system_test: boolean;
  pressure_relief_test: boolean;
  electrical_system_test: boolean;
  platform_operation_test: boolean;
  fail_safe_devices_test: boolean;
  lifting_structure_test: boolean;
  status?: string;
  public_access_token: string;
  company?: CompanyData;
}

export default function LiftServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [record, setRecord] = useState<LiftServiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Fetch the lift service record
  useEffect(() => {
    const fetchLiftServiceRecord = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/lift-service-records/${id}`);
        setRecord(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lift service record:", err);
        setError("Could not load the lift service record. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchLiftServiceRecord();
  }, [id]);
  
  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };
  
  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/api/lift-service-records/${id}`);
      toast.success("Lift service record deleted successfully");
      navigate("/lift-service");
    } catch (err) {
      console.error("Error deleting lift service record:", err);
      toast.error("Error deleting lift service record. Please try again.");
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Handle edit
  const handleEdit = () => {
    navigate(`/lift-service/edit/${id}`);
  };
  
  // Handle view certificate
  const handleViewCertificate = () => {
    navigate(`/lift-certificate/${id}`);
  };
  
  // Handle QR code generation
  const handlePrintQRCode = () => {
    navigate(`/lift-certificate/${id}/qr`);
  };
  
  // Handle back button
  const handleBack = () => {
    navigate("/lift-service");
  };
  
  // Get status badge
  const getStatusBadge = (status: string | undefined) => {
    switch(status) {
      case 'valid':
        return <Badge className="bg-green-500">Valid</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expired</Badge>;
      case 'due':
        return <Badge className="bg-amber-500">Due Soon</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !record) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error || "Record not found"}</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/lift-service')} 
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lift Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header with controls */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Forklift className="h-6 w-6 mr-2 text-[#7b96d4]" />
              {record.product_category || "Lift Service"}
            </h1>
            <p className="text-gray-500">
              {record.company?.company_name || "Unknown Company"}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrintQRCode}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          <Button variant="outline" onClick={handleViewCertificate}>
            <FileText className="h-4 w-4 mr-2" />
            Certificate
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <PencilLine className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this lift service record? 
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <LoadingSpinner /> : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Equipment details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Equipment Details</CardTitle>
                {getStatusBadge(record.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Lift Type</p>
                  <p className="font-medium">{record.product_category || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{record.model || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="font-medium">{record.serial_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Safe Working Load (SWL)</p>
                  <p className="font-medium">{record.swl || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Certificate Number</p>
                  <p className="font-medium">{record.certificate_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Engineer</p>
                  <p className="font-medium">{record.engineer_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service Date</p>
                  <p className="font-medium">{formatDate(record.service_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Retest Date</p>
                  <p className="font-medium">{formatDate(record.retest_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Inspection Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span>Safe Working Load Test</span>
                  <Badge className={record.safe_working_test ? "bg-green-500" : "bg-red-500"}>
                    {record.safe_working_test ? "PASS" : "FAIL"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Emergency Stops</span>
                  <Badge className={record.emergency_stops_test ? "bg-green-500" : "bg-red-500"}>
                    {record.emergency_stops_test ? "PASS" : "FAIL"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Limit Switches</span>
                  <Badge className={record.limit_switches_test ? "bg-green-500" : "bg-red-500"}>
                    {record.limit_switches_test ? "PASS" : "FAIL"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Safety Devices</span>
                  <Badge className={record.safety_devices_test ? "bg-green-500" : "bg-red-500"}>
                    {record.safety_devices_test ? "PASS" : "FAIL"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Hydraulic System</span>
                  <Badge className={record.hydraulic_system_test ? "bg-green-500" : "bg-red-500"}>
                    {record.hydraulic_system_test ? "PASS" : "FAIL"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Pressure Relief Valves</span>
                  <Badge className={record.pressure_relief_test ? "bg-green-500" : "bg-red-500"}>
                    {record.pressure_relief_test ? "PASS" : "FAIL"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Electrical System</span>
                  <Badge className={record.electrical_system_test ? "bg-green-500" : "bg-red-500"}>
                    {record.electrical_system_test ? "PASS" : "FAIL"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Platform Operation</span>
                  <Badge className={record.platform_operation_test ? "bg-green-500" : "bg-red-500"}>
                    {record.platform_operation_test ? "PASS" : "FAIL"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Fail-Safe Devices</span>
                  <Badge className={record.fail_safe_devices_test ? "bg-green-500" : "bg-red-500"}>
                    {record.fail_safe_devices_test ? "PASS" : "FAIL"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Lifting Structure</span>
                  <Badge className={record.lifting_structure_test ? "bg-green-500" : "bg-red-500"}>
                    {record.lifting_structure_test ? "PASS" : "FAIL"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {record.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{record.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right column - Company info and sharing */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{record.company?.company_name || "N/A"}</p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate(`/company/${record.company_id}`)}
              >
                View Customer
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Share this certificate with your customer by generating a QR code
                or by giving them the certificate number.
              </p>
              <Button 
                variant="outline" 
                className="w-full mb-2"
                onClick={handleViewCertificate}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Certificate
              </Button>
              <Button 
                className="w-full bg-[#a6e15a] hover:bg-[#95cc4f] text-white"
                onClick={handlePrintQRCode}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 