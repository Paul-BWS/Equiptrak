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
  AlertTriangle,
  Pencil
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

// Configure axios defaults
if (import.meta.env.DEV) {
  axios.defaults.baseURL = 'http://localhost:3001';
} else {
  axios.defaults.baseURL = window.location.origin;
}

axios.interceptors.request.use(request => {
  console.log('[DEBUG] Request:', request.method, request.url);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('[DEBUG] Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('[DEBUG] Response Error:', error.message);
    return Promise.reject(error);
  }
);

export default function LiftServiceList() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyIdParam = searchParams.get('companyId');
  const { user } = useAuth();
  
  console.log('[DEBUG] Component mounted with companyId:', companyIdParam);
  
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
      console.log('[DEBUG] Using auth token:', user.token.substring(0, 10) + '...');
    } else {
      console.warn('[DEBUG] No auth token available');
    }
    return headers;
  };
  
  // Fetch records on component mount
  useEffect(() => {
    const fetchLiftServiceRecords = async () => {
      try {
        console.log('[DEBUG] Starting to fetch records');
        setLoading(true);
        setError(null);
        
        let url = '/api/lift-services';
        if (companyIdParam) {
          url += `?company_id=${companyIdParam}`;
        }
        
        console.log('[DEBUG] Fetching from URL:', url);
        const response = await axios.get(url, { headers: getAuthHeaders() });
        console.log('[DEBUG] Response status:', response.status);
        console.log('[DEBUG] Response data:', response.data);
        
        setLiftRecords(response.data || []);
        console.log('[DEBUG] Records set to state');
        setLoading(false);
      } catch (err) {
        console.error('[DEBUG] Error fetching records:', err);
        if (axios.isAxiosError(err)) {
          console.error('[DEBUG] Response:', err.response?.data);
          console.error('[DEBUG] Status:', err.response?.status);
        }
        setLiftRecords([]);
        setError('Failed to load lift service records. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchLiftServiceRecords();
  }, [companyIdParam, user]);
  
  // Log state changes
  useEffect(() => {
    console.log('[DEBUG] State updated:', {
      recordsCount: liftRecords.length,
      loading,
      error,
      searchTerm,
      categoryFilter
    });
  }, [liftRecords, loading, error, searchTerm, categoryFilter]);
  
  // Filter records based on search term and category
  const filteredRecords = liftRecords.filter(record => {
    const matchesSearch = 
      !searchTerm || 
      (record.model && record.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.serial_number && record.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.certificate_number && record.certificate_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.company?.company_name && record.company.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || record.product_category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  console.log('[DEBUG] Filtered records count:', filteredRecords.length);
  
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
  
  // Handle printing QR code
  const handlePrintQRCode = (id) => {
    window.open(`/qr-print/lift-service/${id}`, '_blank');
  };
  
  // Handle back navigation
  const handleBack = () => {
    if (companyIdParam) {
      navigate(`/equipment-types?companyId=${companyIdParam}`);
    } else {
      navigate('/equipment-types');
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    if (!status) return <Badge variant="outline">Pending</Badge>;
    
    switch (status.toLowerCase()) {
      case 'pass':
      case 'passed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Pass</Badge>;
      case 'fail':
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Fail</Badge>;
      case 'remedial':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Remedial</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="back"
              onClick={handleBack}
              className="mr-4 rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold flex items-center">
              <Forklift className="mr-2 h-6 w-6 text-yellow-500" />
              Lift Service Records
            </h1>
          </div>
          <Button 
            variant="primary"
            onClick={handleAddNew}
            className="rounded-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Lift
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Valid Records</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredRecords.filter(r => r.status?.toLowerCase() === 'pass').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Due Service</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {filteredRecords.filter(r => r.status?.toLowerCase() === 'remedial').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Failed/Expired</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredRecords.filter(r => ['fail', 'expired'].includes(r.status?.toLowerCase())).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by model, serial number, or certificate number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="scissor">Scissor Lift</SelectItem>
              <SelectItem value="boom">Boom Lift</SelectItem>
              <SelectItem value="telehandler">Telehandler</SelectItem>
              <SelectItem value="forklift">Forklift</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Records Table */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="bg-destructive/15 text-destructive p-4 rounded-lg">
            {error}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <Forklift className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No lift service records</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Get started by adding a new lift service record.</p>
              <Button
                variant="primary"
                onClick={handleAddNew}
                className="mt-4 rounded-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lift
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate No.</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Test Date</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.certificate_number || 'N/A'}</TableCell>
                    <TableCell>{record.model || 'N/A'}</TableCell>
                    <TableCell>{record.serial_number || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{record.product_category || 'N/A'}</TableCell>
                    <TableCell>{formatDate(record.test_date)}</TableCell>
                    <TableCell>{formatDate(record.next_test_date)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewRecord(record.id)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCertificate(record.id)}
                          className="h-8 w-8"
                        >
                          <FileText className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrintQRCode(record.id)}
                          className="h-8 w-8"
                        >
                          <QrCode className="h-4 w-4 text-purple-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(record.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Lift Service Record</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this lift service record? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deletingId && handleDelete(deletingId)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 