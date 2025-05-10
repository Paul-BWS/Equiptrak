import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, useBeforeUnload } from 'react-router-dom';
import { format } from 'date-fns';
import ProductSelector from '@/components/work-orders/ProductSelector';
import axios from 'axios';
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
  Search,
  ArrowDown
} from 'lucide-react';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

interface WorkOrder {
  id: string | number;
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
  internal_notes: string;
  items: WorkOrderItem[];
  vat_rate: number;
  quickbooks_ref: string;
}

interface NewWorkOrderState extends Omit<WorkOrder, 'id'> {
  items: WorkOrderItem[];
  type?: string;
  carrier?: string;
}

// Define engineers list
const ENGINEERS = [
  "Paul Jones",
  "Danny Jennings",
  "Mark Allen",
  "Tommy Hannon",
  "Connor Hill",
  "Dominic TJ",
  "Mason Poulton",
  "Zack Collins",
  "Fernando Goulart"
];

export default function WorkOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Get work order ID from URL if editing
  const searchParams = new URLSearchParams(location.search);
  const companyId = searchParams.get('companyId');
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCompanySearchModal, setShowCompanySearchModal] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [intendedPath, setIntendedPath] = useState<string | null>(null);
  
  const [workOrder, setWorkOrder] = useState<NewWorkOrderState>({
    company_id: companyId || '',
    company_name: '',
    work_order_number: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    job_tracker: '',
    order_number: '',
    taken_by: user?.email?.split('@')[0] || '',
    staff: '',
    status: 'PENDING',
    description: '',
    internal_notes: '',
    items: [],
    vat_rate: 20,
    quickbooks_ref: '',
    type: '',
    carrier: ''
  });

  // Load existing work order if editing
  useEffect(() => {
    const fetchWorkOrder = async () => {
      if (!id || !user?.token) return;
      
      try {
        setIsEditing(true);
        const response = await axios.get(`/api/work-orders/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        if (response.data) {
          setWorkOrder({
            ...response.data,
            items: response.data.items || []
          });
        }
      } catch (error) {
        console.error('Error fetching work order:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load work order"
        });
      }
    };

    if (id) {
      fetchWorkOrder();
    }
  }, [id, user?.token]);

  useEffect(() => {
    // Only fetch companies if we have a user
    if (!user) return;

    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        
        const response = await axios.get('/api/companies', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setCompanies(response.data);
          setFilteredCompanies(response.data);
          
          if (companyId && response.data.length > 0) {
            const company = response.data.find(c => c.id === companyId);
            if (company) {
              setWorkOrder(prev => ({
                ...prev,
                company_id: company.id,
                company_name: company.company_name
              }));
            }
          }
        } else {
          console.error('Invalid response format from companies API:', response.data);
          setCompanies([]);
          setFilteredCompanies([]);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Invalid data received from server",
          });
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setCompanies([]);
        setFilteredCompanies([]);
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
  }, [user, companyId]);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if no user is found
  if (!user) {
    navigate('/login');
    return null;
  }

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
  
  // Add warning before browser/tab close
  useBeforeUnload(
    React.useCallback((event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        return (event.returnValue = "You have unsaved changes. Are you sure you want to leave?");
      }
    }, [hasUnsavedChanges])
  );

  // Handle navigation attempts
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setIntendedPath(path);
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  };

  // Update hasUnsavedChanges when workOrder changes
  const handleInputChange = (name: string, value: string) => {
    setWorkOrder(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setWorkOrder(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
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
    const newItems = products.map(product => {
      const price = parseFloat(product.price.toString()) || 0;
      return {
        id: `item-${Date.now()}-${product.id}`,
        sku: product.sku,
        description: product.name,
        quantity: 1,
        price: price,
        subtotal: price // Initial subtotal is just the price for quantity 1
      };
    });
    
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
  
  const calculateSubtotal = () => {
    return workOrder.items.reduce((sum, item) => {
      const price = parseFloat(item.price.toString()) || 0;
      const quantity = parseInt(item.quantity.toString()) || 0;
      return sum + (price * quantity);
    }, 0);
  };
  
  const calculateVAT = () => {
    const subtotal = calculateSubtotal();
    const vatRate = parseFloat(workOrder.vat_rate.toString()) || 0;
    return (subtotal * vatRate) / 100;
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const vat = calculateVAT();
    return subtotal + vat;
  };
  
  const handleSave = async () => {
    if (!user?.token) return;
    
    try {
      const endpoint = isEditing ? `/api/work-orders/${id}` : '/api/work-orders';
      const method = isEditing ? 'patch' : 'post';
      
      const response = await axios[method](endpoint, {
        date: workOrder.date,
        company_id: workOrder.company_id,
        job_tracker: workOrder.job_tracker,
        order_number: workOrder.order_number,
        taken_by: workOrder.taken_by,
        staff: workOrder.staff,
        status: workOrder.status,
        description: workOrder.description,
        internal_notes: workOrder.internal_notes,
        quickbooks_ref: workOrder.quickbooks_ref,
        type: workOrder.type,
        carrier: workOrder.carrier,
        items: workOrder.items
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      if (response.data) {
        setHasUnsavedChanges(false);
        toast({
          title: "Success",
          description: `Work order ${isEditing ? 'updated' : 'created'} successfully`
        });
        
        // Navigate back to the appropriate page
        if (companyId) {
          navigate(`/company/${companyId}`);
        } else {
          navigate('/work-orders');
        }
      }
    } catch (error: any) {
      console.error('Error saving work order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} work order`
      });
    }
  };
  
  const handleAddNonStockItem = () => {
    const newItem: WorkOrderItem = {
      id: `non-stock-${Date.now()}`,
      sku: '',
      description: '',
      quantity: 1,
      price: 0,
      subtotal: 0
    };
    
    setWorkOrder(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItemField = (itemId: string, field: keyof WorkOrderItem, value: string | number) => {
    setWorkOrder(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate subtotal if price or quantity changes
          if (field === 'price' || field === 'quantity') {
            updatedItem.subtotal = updatedItem.quantity * updatedItem.price;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                if (hasUnsavedChanges) {
                  setIntendedPath('/work-orders');
                  setShowUnsavedDialog(true);
                } else {
                  navigate(-1);
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold">Work Order</h1>
              {isEditing && (
                <span className="text-2xl ml-2 text-muted-foreground">{workOrder.work_order_number}</span>
              )}
            </div>
          </div>
          <Button 
            onClick={handleSave}
            className="bg-[#21c15b] hover:bg-[#21c15b]/90 text-white"
          >
            {isEditing ? 'Save Changes' : 'Create Work Order'}
          </Button>
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
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
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
                      onChange={(e) => handleInputChange('date', e.target.value)}
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
                    <SelectTrigger className="w-full">
                      <SelectValue>{workOrder.status || ""}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUOTATION">QUOTATION</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                      <SelectItem value="AWAIT ATTEND">AWAIT ATTEND</SelectItem>
                      <SelectItem value="AWAIT COMP">AWAIT COMP</SelectItem>
                      <SelectItem value="AWAIT DEL">AWAIT DEL</SelectItem>
                      <SelectItem value="AWAIT SPARES">AWAIT SPARES</SelectItem>
                      <SelectItem value="AWAIT ONO">AWAIT ONO</SelectItem>
                      <SelectItem value="WORKSHOP">WORKSHOP</SelectItem>
                      <SelectItem value="WARRANTY">WARRANTY</SelectItem>
                      <SelectItem value="ON HIRE">ON HIRE</SelectItem>
                      <SelectItem value="BWS">BWS</SelectItem>
                      <SelectItem value="BACK ORDER">BACK ORDER</SelectItem>
                      <SelectItem value="DEBT LIST">DEBT LIST</SelectItem>
                      <SelectItem value="AWAIT RETURN">AWAIT RETURN</SelectItem>
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
                <ClipboardList className="mr-2 h-5 w-5" /> Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="takenBy">Taken By</Label>
                  <Input 
                    id="takenBy" 
                    value={workOrder.taken_by}
                    onChange={(e) => handleInputChange('taken_by', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="staff">Staff</Label>
                  <Select 
                    value={workOrder.staff}
                    onValueChange={(value) => handleSelectChange('staff', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{workOrder.staff || ""}</SelectValue>
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
                <div>
                  <Label htmlFor="jobTracker">Job Tracker</Label>
                  <Input 
                    id="jobTracker" 
                    value={workOrder.job_tracker}
                    onChange={(e) => handleInputChange('job_tracker', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quickbooksRef">Quickbooks Ref</Label>
                  <Input 
                    id="quickbooksRef" 
                    value={workOrder.quickbooks_ref}
                    onChange={(e) => handleInputChange('quickbooks_ref', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="orderNumber">Order No</Label>
                  <Input 
                    id="orderNumber" 
                    value={workOrder.order_number}
                    onChange={(e) => handleInputChange('order_number', e.target.value)}
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
                value={workOrder.internal_notes}
                onChange={(e) => handleInputChange('internal_notes', e.target.value)}
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
              value={workOrder.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
        
        {/* Line Items */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => handleAddNonStockItem()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Non-Stock Item
              </Button>
              <Button onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Stock Item
              </Button>
            </div>
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
                    <TableCell>
                      <Input
                        value={item.sku}
                        onChange={(e) => updateItemField(item.id, 'sku', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItemField(item.id, 'description', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          updateItemField(item.id, 'quantity', value);
                        }}
                        className="w-16 text-center"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={item.price}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          updateItemField(item.id, 'price', value);
                        }}
                        className="w-24 text-right"
                      />
                    </TableCell>
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
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
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
                  <span className="font-medium">{formatCurrency(calculateVAT())}</span>
                </div>
                
                <div className="border-t pt-4 flex justify-between items-center">
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
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-auto">
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

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedDialog(false);
                setHasUnsavedChanges(false);
                if (intendedPath) {
                  navigate(intendedPath);
                }
              }}
            >
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 