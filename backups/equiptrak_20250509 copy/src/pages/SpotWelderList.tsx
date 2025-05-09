import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  ArrowLeft, 
  Search, 
  FileText, 
  QrCode,
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
  DialogTitle 
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SpotWelder {
  id: string;
  certificate_number: string;
  service_date: string;
  retest_date: string;
  status: string;
  model: string;
  serial_number: string;
  engineer_name: string;
  equipment_type: string;
  company_id: string;
}

export default function SpotWelderList() {
  const navigate = useNavigate();
  const location = useLocation();
  const companyId = new URLSearchParams(location.search).get('companyId');
  const { user } = useAuth();
  
  const [spotWelders, setSpotWelders] = useState<SpotWelder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchSpotWelders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!companyId) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`/api/spot-welders?company_id=${companyId}`, {
          headers: getAuthHeaders()
        });
        
        setSpotWelders(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching spot welders:', err);
        
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setSpotWelders([]); // Empty array for no records
          setError(null);
        } else {
          setError('Failed to load spot welders. Please try again later.');
        }
        setLoading(false);
      }
    };
    
    if (companyId) {
      fetchSpotWelders();
    } else {
      setLoading(false);
      setError('No company ID provided. Please select a company to view their spot welders.');
    }
  }, [companyId, user]);

  // Filter records based on search term and category
  const filteredRecords = spotWelders.filter(record => {
    const matchesSearch = 
      !searchTerm || 
      (record.model && record.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.serial_number && record.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.certificate_number && record.certificate_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.equipment_type && record.equipment_type.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = !categoryFilter || (record.equipment_type && record.equipment_type === categoryFilter);
    
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

  const handleBack = () => {
    if (companyId) {
      navigate(`/equipment-types?companyId=${companyId}`);
    } else {
      navigate("/equipment-types");
    }
  };

  const handleAddNew = () => {
    navigate(`/add-spot-welder?companyId=${companyId}`);
  };
  
  const handleEditRecord = (id) => {
    navigate(`/edit-spot-welder/${id}`);
  };
  
  const handleViewCertificate = (id) => {
    navigate(`/spot-welder-certificate/${id}`);
  };
  
  const handlePrintQRCode = (id) => {
    window.open(`/qr-print/spot-welder/${id}`, '_blank');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (!status) return <Badge variant="outline">Pending</Badge>;
    
    switch (status.toLowerCase()) {
      case 'active':
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
  
  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      setIsDeleting(true);
      await axios.delete(`/api/spot-welders/${deletingId}`, {
        headers: getAuthHeaders()
      });
      
      toast.success('Spot welder deleted successfully');
      setSpotWelders(prev => prev.filter(welder => welder.id !== deletingId));
    } catch (error) {
      console.error('Error deleting spot welder:', error);
      toast.error('Failed to delete spot welder');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Top header with back button and title */}
      <div className="bg-white w-full border-b mb-6">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Spot Welder Records</h1>
          </div>
          
          <Button onClick={handleAddNew} className="bg-[#21c15b] hover:bg-[#1ba34d] text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Spot Welder
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
                  placeholder="Search by model, serial number, or type..."
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
                    <SelectItem value="all">All Types</SelectItem>
                    {/* Get unique equipment types */}
                    {Array.from(new Set(spotWelders.map(record => record.equipment_type)))
                      .filter(Boolean)
                      .sort()
                      .map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Content area - loading, error, or table */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            <p className="mt-4">Loading spot welder records...</p>
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-600">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <FileText className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">No spot welder records found</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || categoryFilter
                  ? "Try adjusting your filters to see more results."
                  : companyId
                    ? "This company doesn't have any registered spot welders yet."
                    : "Please select a company to view their spot welders."
                }
              </p>
              {companyId && !searchTerm && !categoryFilter && (
                <Button
                  onClick={handleAddNew}
                  className="mt-6 bg-[#a6e15a] hover:bg-[#95cb51] text-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Spot Welder
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-auto">
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
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.equipment_type || 'N/A'}</TableCell>
                      <TableCell>{record.model || 'N/A'}</TableCell>
                      <TableCell>{record.serial_number || 'N/A'}</TableCell>
                      <TableCell>{record.certificate_number || 'N/A'}</TableCell>
                      <TableCell>{formatDate(record.service_date)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleEditRecord(record.id)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleViewCertificate(record.id)}
                            title="View Certificate"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handlePrintQRCode(record.id)}
                            title="View QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDeleteClick(record.id)} 
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this spot welder record? This action cannot be undone.
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
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}