import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import axios from 'axios';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

// Interface for work order data
interface WorkOrder {
  id: string | number;  // Allow both string and number IDs
  company_id: string;
  company_name: string;
  work_order_number: string;
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
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchWorkOrders = async () => {
      if (!user?.token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/work-orders', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setWorkOrders(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error: any) {
        console.error('Error fetching work orders:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load work orders';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrders();
  }, [user?.token]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/work-orders', {
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        params: {
          search: searchTerm
        }
      });
      
      if (response.data) {
        setWorkOrders(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error searching work orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search work orders"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    navigate(`/work-orders/${workOrder.work_order_number}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'QUOTATION': 'bg-blue-500',
      'COMPLETED': 'bg-green-500',
      'AWAIT ATTEND': 'bg-orange-500',
      'AWAIT COMP': 'bg-purple-500',
      'AWAIT DEL': 'bg-indigo-500',
      'AWAIT SPARES': 'bg-red-500',
      'AWAIT ONO': 'bg-pink-500',
      'WORKSHOP': 'bg-cyan-500',
      'WARRANTY': 'bg-emerald-500',
      'ON HIRE': 'bg-teal-500',
      'BWS': 'bg-sky-500',
      'BACK ORDER': 'bg-amber-500',
      'DEBT LIST': 'bg-rose-500',
      'AWAIT RETURN': 'bg-violet-500',
      'PENDING': 'bg-yellow-500'
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'}`}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc]">
        <div className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Work Orders</h1>
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

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Work Orders</h1>
          <Button onClick={() => navigate('/work-orders/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : workOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No work orders found.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Job Tracker</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((workOrder) => (
                  <TableRow 
                    key={workOrder.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleWorkOrderClick(workOrder)}
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
                    <TableCell>{workOrder.work_order_number}</TableCell>
                    <TableCell>{workOrder.job_tracker || '-'}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{workOrder.description}</TableCell>
                    <TableCell>{formatCurrency(workOrder.total)}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(workOrder.status)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWorkOrderClick(workOrder);
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