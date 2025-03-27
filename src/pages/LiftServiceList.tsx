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
  Filter
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LiftServiceList() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyIdParam = searchParams.get('companyId');
  
  const [liftRecords, setLiftRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Fetch records on component mount
  useEffect(() => {
    const fetchLiftServiceRecords = async () => {
      try {
        setLoading(true);
        
        // Build query URL with optional company filter
        let url = '/api/lift-service-records';
        if (companyIdParam) {
          url += `?company_id=${companyIdParam}`;
        }
        
        const response = await axios.get(url);
        setLiftRecords(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lift service records:', err);
        setError('Failed to load lift service records. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchLiftServiceRecords();
  }, [companyIdParam]);
  
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
    const url = companyIdParam 
      ? `/lift-service/new?companyId=${companyIdParam}` 
      : '/lift-service/new';
    navigate(url);
  };
  
  // Handle navigation to view record
  const handleViewRecord = (id) => {
    navigate(`/lift-service/${id}`);
  };
  
  // Handle navigation to view certificate
  const handleViewCertificate = (id) => {
    navigate(`/lift-certificate/${id}`);
  };
  
  // Handle QR code generation
  const handlePrintQRCode = (id) => {
    navigate(`/lift-certificate/${id}/qr`);
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
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold flex items-center">
            <Forklift className="h-6 w-6 mr-2 text-[#7b96d4]" />
            Lift Service Records
          </h1>
        </div>
        
        <Button onClick={handleAddNew} className="bg-[#a6e15a] hover:bg-[#95cc4f] text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Lift Service
        </Button>
      </div>
      
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
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="scissor lift">Scissor Lift</SelectItem>
                  <SelectItem value="jacking beam">Jacking Beam</SelectItem>
                  <SelectItem value="2 post lift">2 Post Lift</SelectItem>
                  <SelectItem value="4 post lift">4 Post Lift</SelectItem>
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
      
      {/* Records list */}
      {!loading && !error && filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map(record => (
            <Card 
              key={record.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewRecord(record.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">
                    {record.product_category || 'Lift Service'}
                  </CardTitle>
                  {getStatusBadge(record.status)}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {record.company?.company_name || 'Unknown Company'}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Model:</span>
                    <span className="font-medium">{record.model || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Serial:</span>
                    <span className="font-medium">{record.serial_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Certificate:</span>
                    <span className="font-medium">{record.certificate_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Service Date:</span>
                    <span className="font-medium">{formatDate(record.service_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Retest Date:</span>
                    <span className="font-medium">{formatDate(record.retest_date)}</span>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCertificate(record.id);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Certificate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintQRCode(record.id);
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 