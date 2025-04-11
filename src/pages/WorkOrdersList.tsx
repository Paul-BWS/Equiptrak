import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  FileText,
  ChevronRight,
  Calendar,
  Building,
  ClipboardList
} from 'lucide-react';

// Interface for work order data
interface WorkOrder {
  id: string;
  company_id: string;
  company_name: string;
  date: string;
  job_tracker: string;
  order_number: string;
  taken_by: string;
  staff: string;
  status: string;
  description: string;
  total: number;
  vat: number;
  discount: number;
  created_at: string;
  updated_at: string;
}

export default function WorkOrdersList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    // In a real implementation, this would fetch work orders from the API
    // For now, I'll use mock data
    const mockWorkOrders: WorkOrder[] = [
      {
        id: '1',
        company_id: '101',
        company_name: 'Tube & Wire Display Ltd',
        date: '2025-04-01',
        job_tracker: '20929',
        order_number: 'Simon',
        taken_by: 'dan',
        staff: 'Dominic Jones',
        status: 'COMPLETED',
        description: 'Butt welder faulty slide piston going across slowly. Stripped Air control valve and replaced hose to footpedal...',
        total: 480.00,
        vat: 80.00,
        discount: 0,
        created_at: '2025-04-01T09:00:00Z',
        updated_at: '2025-04-01T14:30:00Z'
      },
      {
        id: '2',
        company_id: '102',
        company_name: 'Smith Manufacturing',
        date: '2025-03-28',
        job_tracker: '20928',
        order_number: 'P-1234',
        taken_by: 'sarah',
        staff: 'Michael Brown',
        status: 'PENDING',
        description: 'Annual maintenance of CNC machines',
        total: 750.00,
        vat: 150.00,
        discount: 50.00,
        created_at: '2025-03-28T10:15:00Z',
        updated_at: '2025-03-28T10:15:00Z'
      },
      {
        id: '3',
        company_id: '103',
        company_name: 'Johnson Electronics',
        date: '2025-03-25',
        job_tracker: '20927',
        order_number: 'JE-555',
        taken_by: 'robert',
        staff: 'Dominic Jones',
        status: 'IN PROGRESS',
        description: 'Replacement of faulty circuit boards in control panel',
        total: 1250.00,
        vat: 250.00,
        discount: 0,
        created_at: '2025-03-25T13:45:00Z',
        updated_at: '2025-03-26T09:30:00Z'
      }
    ];

    setWorkOrders(mockWorkOrders);
    setLoading(false);
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter work orders based on search term
    // In a real implementation, this would call the API with the search term
  };

  const handleWorkOrderClick = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc]">
        <div className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Jobs</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fc]">
        <div className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Jobs</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <Badge className="bg-green-500">COMPLETED</Badge>;
      case 'IN PROGRESS':
        return <Badge className="bg-blue-500">IN PROGRESS</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">PENDING</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <div className="flex items-center">
            <div className="text-gray-600 flex items-center mr-4">
              <span className="font-medium">Hello {user?.email?.split('@')[0] || 'User'}</span>
              <span className="mx-2">•</span>
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <Button 
              className="bg-[#21c15b] hover:bg-[#21c15b]/90 text-white border border-[#21c15b]"
              onClick={() => navigate('/work-orders/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by company, description, job tracker..."
              className="pl-10 pr-20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-1 top-1 h-8"
            >
              Search
            </Button>
          </div>
        </form>

        {workOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="rounded-full bg-muted p-3 mb-3">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No jobs found</h3>
              <p className="text-center text-muted-foreground mb-4">
                {searchTerm ? 
                  `No jobs match your search for "${searchTerm}"` : 
                  "You don't have any jobs yet."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
              {!searchTerm && (
                <Button 
                  className="bg-[#21c15b] hover:bg-[#21c15b]/90 text-white border border-[#21c15b]"
                  onClick={() => navigate('/work-orders/new')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[180px]">Date</TableHead>
                  <TableHead className="w-[250px]">Company</TableHead>
                  <TableHead className="w-[120px]">Job #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Total</TableHead>
                  <TableHead className="w-[120px] text-center">Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((workOrder) => (
                  <TableRow 
                    key={workOrder.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleWorkOrderClick(workOrder.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        {formatDate(workOrder.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4 text-gray-400" />
                        {workOrder.company_name}
                      </div>
                    </TableCell>
                    <TableCell>{workOrder.job_tracker}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{workOrder.description}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(workOrder.total)}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(workOrder.status)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWorkOrderClick(workOrder.id);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
} 