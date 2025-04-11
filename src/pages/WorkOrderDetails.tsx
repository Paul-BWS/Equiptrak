import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  ArrowLeft, 
  Calendar,
  Plus,
  Trash2,
  Printer,
  Save,
  FileText,
  User,
  ClipboardList,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import ProductSelector from '@/components/work-orders/ProductSelector';

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
  internal_notes: string;
  items: WorkOrderItem[];
  total: number;
  vat_rate: number;
  vat: number;
  discount: number;
  created_at: string;
  updated_at: string;
}

interface WorkOrderItem {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function WorkOrderDetails() {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  
  useEffect(() => {
    // In a real implementation, this would fetch the work order from the API
    // For now, I'll use mock data
    setTimeout(() => {
      const mockWorkOrder: WorkOrder = {
        id: '1',
        company_id: '101',
        company_name: 'Tube & Wire Display Ltd',
        date: '2025-04-01',
        job_tracker: '20929',
        order_number: 'Simon',
        taken_by: 'dan',
        staff: 'Dominic Jones',
        status: 'COMPLETED',
        description: 'Butt welder faulty slide piston going across slowly. Stripped Air control valve and replaced hose to footpedal. Then stripped and repaired the push piston. Returned to welder rebuilt and tested ok',
        internal_notes: '',
        items: [
          {
            id: '101',
            sku: 'DJ100',
            description: 'Labour Hour DOMTJ100',
            quantity: 2,
            price: 0,
            subtotal: 0
          },
          {
            id: '102',
            sku: 'P100',
            description: 'Labour parts and travel',
            quantity: 1,
            price: 400,
            subtotal: 400
          }
        ],
        total: 480.00,
        vat_rate: 20,
        vat: 80.00,
        discount: 0,
        created_at: '2025-04-01T09:00:00Z',
        updated_at: '2025-04-01T14:30:00Z'
      };
      
      setWorkOrder(mockWorkOrder);
      setLoading(false);
    }, 1000);
  }, [workOrderId]);

  const handleAddItem = () => {
    setShowAddProductModal(true);
  };

  const handleProductsSelected = (products: any[]) => {
    if (!workOrder) return;
    
    // Convert selected products to work order items
    const newItems = products.map(product => ({
      id: `item-${Date.now()}-${product.id}`, // Generate a unique ID
      sku: product.sku,
      description: product.name,
      quantity: 1,
      price: product.price,
      subtotal: product.price // quantity * price
    }));
    
    // Add new items to existing items
    const updatedItems = [...workOrder.items, ...newItems];
    
    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const vat = subtotal * (workOrder.vat_rate / 100);
    const total = subtotal + vat - workOrder.discount;
    
    setWorkOrder({
      ...workOrder,
      items: updatedItems,
      total,
      vat
    });
    
    setShowAddProductModal(false);
  };

  const handleCancelProductSelection = () => {
    setShowAddProductModal(false);
  };

  const handleRemoveItem = (itemId: string) => {
    if (!workOrder) return;
    
    const updatedItems = workOrder.items.filter(item => item.id !== itemId);
    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const vat = subtotal * (workOrder.vat_rate / 100);
    const total = subtotal + vat - workOrder.discount;
    
    setWorkOrder({
      ...workOrder,
      items: updatedItems,
      total,
      vat
    });
  };

  const handleSaveWorkOrder = () => {
    // In a real implementation, this would save the work order to the API
    toast({
      title: "Work Order Saved",
      description: "The work order has been successfully saved.",
    });
  };

  const handlePrintWorkOrder = () => {
    // In a real implementation, this would open a print dialog
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc]">
        <div className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <h1 className="text-2xl font-semibold">Work Order</h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="min-h-screen bg-[#f8f9fc]">
        <div className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <h1 className="text-2xl font-semibold">Work Order</h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive">{error || "Work order not found"}</p>
              <Button onClick={() => navigate('/work-orders')} className="mt-4">Back to Work Orders</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-2xl font-semibold">Work Order #{workOrder.job_tracker}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              onClick={handlePrintWorkOrder}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              className="bg-[#21c15b] hover:bg-[#21c15b]/90 text-white border border-[#21c15b]"
              onClick={handleSaveWorkOrder}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" /> Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    value={workOrder.company_name} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="date" 
                      type="date"
                      value={workOrder.date}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <div className="p-2 border rounded-md bg-gray-50">
                    <Badge 
                      className={
                        workOrder.status.toUpperCase() === 'COMPLETED' ? 'bg-green-500' :
                        workOrder.status.toUpperCase() === 'IN PROGRESS' ? 'bg-blue-500' :
                        workOrder.status.toUpperCase() === 'PENDING' ? 'bg-yellow-500' :
                        ''
                      }
                    >
                      {workOrder.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" /> Job Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="takenBy">Taken By</Label>
                  <Input 
                    id="takenBy" 
                    value={workOrder.taken_by} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobTracker">Job Tracker</Label>
                  <Input 
                    id="jobTracker" 
                    value={workOrder.job_tracker} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="staff">Staff</Label>
                  <Input 
                    id="staff" 
                    value={workOrder.staff} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input 
                    id="orderNumber" 
                    value={workOrder.order_number} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add internal notes or address information here..."
                value={workOrder.internal_notes}
                className="min-h-[130px]"
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe the work being done..."
              value={workOrder.description}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
        
        {/* Line Items */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[80px] text-center">Qty</TableHead>
                  <TableHead className="w-[100px] text-right">Price</TableHead>
                  <TableHead className="w-[120px] text-right">Subtotal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrder.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {workOrder.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No items added yet. Click "Add Item" to add products or services.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Totals */}
        <div className="flex justify-end mb-6">
          <Card className="w-full md:w-[400px]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>{formatCurrency(workOrder.total - workOrder.vat)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">VAT ({workOrder.vat_rate}%):</span>
                  <span>{formatCurrency(workOrder.vat)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Discount:</span>
                  <span>{formatCurrency(workOrder.discount)}</span>
                </div>
                
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-xl">{formatCurrency(workOrder.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* This is a placeholder for the product selection modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>Add Product</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSelector 
                onSelectProducts={handleProductsSelected}
                onCancel={handleCancelProductSelection}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 