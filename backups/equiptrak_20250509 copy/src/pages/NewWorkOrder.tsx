import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Save,
  FileText,
  User,
  ClipboardList,
  Building,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import ProductSelector from '@/components/work-orders/ProductSelector';
import { formatCurrency } from '@/lib/utils';

interface Company {
  id: string;
  company_name: string;
}

interface WorkOrderItem {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface NewWorkOrderState {
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
  vat_rate: number;
}

export default function NewWorkOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCompanySearchModal, setShowCompanySearchModal] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  
  const [workOrder, setWorkOrder] = useState<NewWorkOrderState>({
    company_id: '',
    company_name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    job_tracker: `JOB-${Date.now().toString().slice(-6)}`, // Generate a unique job number
    order_number: '',
    taken_by: user?.name || user?.email?.split('@')[0] || '',
    staff: '',
    status: 'PENDING',
    description: '',
    internal_notes: '',
    items: [],
    vat_rate: 20 // Default UK VAT rate
  });
  
  useEffect(() => {
    // Fetch companies
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        
        // In a real implementation, this would fetch from the API
        // For now, using mock data
        const mockCompanies: Company[] = [
          { id: '101', company_name: 'Tube & Wire Display Ltd' },
          { id: '102', company_name: 'Smith Manufacturing' },
          { id: '103', company_name: 'Johnson Electronics' },
          { id: '104', company_name: 'ABC Industries' },
          { id: '105', company_name: 'XYZ Corporation' }
        ];
        
        setCompanies(mockCompanies);
        setFilteredCompanies(mockCompanies);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load companies",
        });
      } finally {
        setLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
  useEffect(() => {
    // Filter companies based on search term
    if (!companySearchTerm.trim()) {
      setFilteredCompanies(companies);
      return;
    }
    
    const lowerCaseSearchTerm = companySearchTerm.toLowerCase();
    const filtered = companies.filter(company => 
      company.company_name.toLowerCase().includes(lowerCaseSearchTerm)
    );
    
    setFilteredCompanies(filtered);
  }, [companySearchTerm, companies]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWorkOrder(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setWorkOrder(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectCompany = (company: Company) => {
    setWorkOrder(prev => ({
      ...prev,
      company_id: company.id,
      company_name: company.company_name
    }));
    setShowCompanySearchModal(false);
  };
  
  const handleAddItem = () => {
    setShowAddProductModal(true);
  };
  
  const handleProductsSelected = (products: any[]) => {
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
    setWorkOrder(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }));
    
    setShowAddProductModal(false);
  };
  
  const handleRemoveItem = (itemId: string) => {
    setWorkOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };
  
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setWorkOrder(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            subtotal: quantity * item.price
          };
        }
        return item;
      })
    }));
  };
  
  const calculateSubtotal = () => {
    return workOrder.items.reduce((sum, item) => sum + item.subtotal, 0);
  };
  
  const calculateVAT = () => {
    return calculateSubtotal() * (workOrder.vat_rate / 100);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };
  
  const handleSaveWorkOrder = async () => {
    try {
      // Validate required fields
      if (!workOrder.company_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a company",
        });
        return;
      }
      
      // In a real implementation, this would save to the API
      toast({
        title: "Work Order Created",
        description: "The work order has been successfully created.",
      });
      
      // Navigate to the work orders list
      navigate('/work-orders');
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create work order",
      });
    }
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
            <h1 className="text-2xl font-semibold">New Work Order</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              className="bg-[#21c15b] hover:bg-[#21c15b]/90 text-white border border-[#21c15b]"
              onClick={handleSaveWorkOrder}
            >
              <Save className="mr-2 h-4 w-4" />
              Create Work Order
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
                  <div className="flex">
                    <Input 
                      id="company" 
                      name="company_name"
                      value={workOrder.company_name} 
                      onChange={handleInputChange}
                      placeholder="Select a company"
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button 
                      type="button" 
                      className="rounded-l-none"
                      onClick={() => setShowCompanySearchModal(true)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="date" 
                      name="date"
                      type="date"
                      value={workOrder.date}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={workOrder.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
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
                    name="taken_by"
                    value={workOrder.taken_by} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobTracker">Job Tracker</Label>
                  <Input 
                    id="jobTracker" 
                    name="job_tracker"
                    value={workOrder.job_tracker} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="staff">Staff</Label>
                  <Input 
                    id="staff" 
                    name="staff"
                    value={workOrder.staff} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input 
                    id="orderNumber" 
                    name="order_number"
                    value={workOrder.order_number} 
                    onChange={handleInputChange}
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
                name="internal_notes"
                placeholder="Add internal notes or address information here..."
                value={workOrder.internal_notes}
                onChange={handleInputChange}
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
              name="description"
              placeholder="Describe the work being done..."
              value={workOrder.description}
              onChange={handleInputChange}
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
                  <TableHead className="w-[100px] text-center">Qty</TableHead>
                  <TableHead className="w-[120px] text-right">Price</TableHead>
                  <TableHead className="w-[120px] text-right">Subtotal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrder.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                        className="w-16 text-center"
                      />
                    </TableCell>
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
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <Label htmlFor="vatRate" className="text-gray-500">VAT Rate (%):</Label>
                  <div className="w-20">
                    <Input 
                      id="vatRate"
                      type="number"
                      min="0"
                      max="100"
                      value={workOrder.vat_rate}
                      onChange={(e) => handleSelectChange('vat_rate', e.target.value)}
                      className="text-right"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">VAT Amount:</span>
                  <span>{formatCurrency(calculateVAT())}</span>
                </div>
                
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-xl">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Company Search Modal */}
      {showCompanySearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Select Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search companies..."
                    className="pl-10"
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                {filteredCompanies.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No companies found matching "{companySearchTerm}"
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCompanies.map(company => (
                      <div 
                        key={company.id}
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectCompany(company)}
                      >
                        {company.company_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={() => setShowCompanySearchModal(false)}>
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Product Selection Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>Add Product</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSelector 
                onSelectProducts={handleProductsSelected}
                onCancel={() => setShowAddProductModal(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 