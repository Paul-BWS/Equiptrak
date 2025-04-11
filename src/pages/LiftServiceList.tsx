import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Forklift, 
  Plus, 
  ArrowLeft, 
  Search, 
  FileText, 
  QrCode,
  Calendar,
  Printer,
  Filter,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LiftServiceList() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyIdParam = searchParams.get('companyId');
  const { user } = useAuth();
  
  const [liftRecords, setLiftRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Helper to get auth headers
  const getAuthHeaders = () => {
    const headers = {};
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    return headers;
  };
  
  // Fetch records on component mount
  useEffect(() => {
    const fetchLiftServiceRecords = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state on new fetch
        
        // Build query URL with optional company filter
        let url = '/api/lift-service-records';
        
        // Only filter by company if a company ID is provided and user is not an admin
        if (companyIdParam) {
          url += `?company_id=${companyIdParam}`;
        }
        
        const response = await axios.get(url, { headers: getAuthHeaders() });
        // Ensure response data is an array, even if empty
        setLiftRecords(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lift service records:', err);
        // Check if it's a 404 error, which means no records, not a real error
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setLiftRecords([]); // Set to empty array if 404
          setError(null); // Clear any previous errors
        } else {
          // Set error for other types of failures
          setError('Failed to load lift service records. Please try again later.');
        }
        setLoading(false);
      }
    };
    
    // Admin users can view all lift service records, others need a company ID
    if (user?.role === 'admin' || companyIdParam) {
      fetchLiftServiceRecords();
    } else {
      setLoading(false);
      setError('No company ID provided. Please select a company to view their service records.');
    }
  }, [companyIdParam, user]);
  
  // Filter records based on search term and category
  const filteredRecords = liftRecords.filter(record => {
    const matchesSearch = 
      !searchTerm || 
      (record.model && record.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.serial_number && record.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.certificate_number && record.certificate_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.company?.company_name && record.company.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = !categoryFilter || record.product_category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  // Handle navigation to create new record
  const handleAddNew = () => {
    if (!companyIdParam && user?.role !== 'admin') {
      toast.error("Please select a company first");
      return;
    }
    const url = companyIdParam 
      ? `/lift-service/new?companyId=${companyIdParam}` 
      : '/lift-service/new';
    navigate(url);
  };
  
  // Handle navigation to view record
  const handleViewRecord = (id) => {
    navigate(`/lift-service/edit/${id}`);
  };
  
  // Handle navigation to view certificate
  const handleViewCertificate = (id) => {
    navigate(`/lift-certificate/${id}`);
  };
  
  // Handle QR code generation
  const handlePrintQRCode = async (id: string) => {
    try {
      // First check if we need to generate a token
      const response = await axios.get(`/api/lift-service-records/${id}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.data.public_access_token) {
        // Generate public access token
        await axios.post(`/api/lift-service-records/${id}/public-token`, null, {
          headers: getAuthHeaders()
        });
        toast.success('QR Code generated successfully');
      }
      
      // Navigate to QR code page
      navigate(`/lift-certificate/${id}/qr`);
    } catch (err) {
      console.error('Error generating QR code:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Please try again.';
      toast.error('Failed to generate QR code: ' + errorMessage);
    }
  };
  
  const handleBack = () => {
    // If came from a company, go back to company
    if (companyIdParam) {
      navigate(`/company/${companyIdParam}`);
    } else {
      // Otherwise go to equipment types
      navigate('/equipment-types');
    }
  };
  
  // Get status badge color based on status
  const getStatusBadge = (status) => {
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
  
  // Add delete handler
  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/lift-service-records/${id}`, {
        headers: getAuthHeaders()
      });
      toast.success('Lift service record deleted successfully');
      // Remove the deleted record from the state
      setLiftRecords(prevRecords => prevRecords.filter(record => record.id !== id));
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting lift service record:', err);
      toast.error('Error deleting lift service record. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <div className="bg-white w-full border-b mb-6">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold flex items-center">
              Lift Service Records
            </h1>
          </div>
          
          <Button onClick={handleAddNew} className="bg-[#21c15b] hover:bg-[#1ca54e] text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Lift Service
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by model, serial number, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            
              <div className="w-full md:w-64">
                <Select 
                  value={categoryFilter} 
                  onValueChange={(value) => setCategoryFilter(value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="scissor_lift">Scissor Lift</SelectItem>
                    <SelectItem value="jacking_beam">Jacking Beam</SelectItem>
                    <SelectItem value="2_post_lift">2 Post Lift</SelectItem>
                    <SelectItem value="4_post_lift">4 Post Lift</SelectItem>
                    <SelectItem value="mobile_column_lift">Mobile Column Lift</SelectItem>
                    <SelectItem value="in_ground_lift">In-Ground Lift</SelectItem>
                    <SelectItem value="platform_lift">Platform Lift</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}
      
        {/* Error state */}
        {error && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
      
        {/* No records state */}
        {!loading && !error && filteredRecords.length === 0 && (
          <Card className="bg-gray-50 border-gray-200 mb-6">
            <CardContent className="pt-6 text-center py-12">
              <Forklift className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Lift Service Records Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || categoryFilter
                  ? "No records match your current search criteria. Try adjusting your filters."
                  : "Get started by adding your first lift service record."}
              </p>
              <Button onClick={handleAddNew} className="bg-[#a6e15a] hover:bg-[#95cc4f] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Lift Service Record
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Records list - Table Format */}
        {!loading && !error && filteredRecords.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Serial #</TableHead>
                  <TableHead>Certificate #</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map(record => (
                  <TableRow 
                    key={record.id} 
                    className="cursor-pointer"
                    onClick={() => handleViewRecord(record.id)}
                  >
                    <TableCell>
                      {record.product_category ? record.product_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {record.model || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {record.serial_number || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.certificate_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatDate(record.service_date)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCertificate(record.id);
                          }}
                          title="View Certificate"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintQRCode(record.id);
                          }}
                          title="QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(record.id);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Add Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingId(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 