import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Forklift, ArrowLeft, Save } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

// Define form schema
const formSchema = z.object({
  company_id: z.string().min(1, "Company is required"),
  product_category: z.string().min(1, "Lift type is required"),
  model: z.string().min(1, "Model is required"),
  serial_number: z.string().min(1, "Serial number is required"),
  certificate_number: z.string().optional(),
  service_date: z.date({ required_error: "Service date is required" }),
  retest_date: z.date({ required_error: "Retest date is required" }),
  swl: z.string().optional(),
  engineer_name: z.string().min(1, "Engineer name is required"),
  engineer_signature: z.string().optional(),
  safe_working_test: z.boolean().default(false),
  emergency_stops_test: z.boolean().default(false),
  limit_switches_test: z.boolean().default(false),
  safety_devices_test: z.boolean().default(false),
  hydraulic_system_test: z.boolean().default(false),
  pressure_relief_test: z.boolean().default(false),
  electrical_system_test: z.boolean().default(false),
  platform_operation_test: z.boolean().default(false),
  fail_safe_devices_test: z.boolean().default(false),
  lifting_structure_test: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LiftServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyIdParam = searchParams.get('companyId');
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_id: companyIdParam || "",
      product_category: "",
      model: "",
      serial_number: "",
      certificate_number: "",
      engineer_name: "",
      engineer_signature: "",
      swl: "",
      notes: "",
      safe_working_test: false,
      emergency_stops_test: false,
      limit_switches_test: false,
      safety_devices_test: false,
      hydraulic_system_test: false,
      pressure_relief_test: false,
      electrical_system_test: false,
      platform_operation_test: false,
      fail_safe_devices_test: false,
      lifting_structure_test: false,
    },
  });
  
  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get('/api/companies');
        setCompanies(response.data);
        setLoadingCompanies(false);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
  // Fetch lift service record if editing
  useEffect(() => {
    if (isEditing) {
      const fetchLiftService = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/lift-service-records/${id}`);
          const record = response.data;
          
          // Parse dates
          const serviceDate = record.service_date ? new Date(record.service_date) : undefined;
          const retestDate = record.retest_date ? new Date(record.retest_date) : undefined;
          
          // Update form values
          form.reset({
            company_id: record.company_id || "",
            product_category: record.product_category || "",
            model: record.model || "",
            serial_number: record.serial_number || "",
            certificate_number: record.certificate_number || "",
            service_date: serviceDate,
            retest_date: retestDate,
            engineer_name: record.engineer_name || "",
            engineer_signature: record.engineer_signature || "",
            swl: record.swl || "",
            notes: record.notes || "",
            safe_working_test: record.safe_working_test || false,
            emergency_stops_test: record.emergency_stops_test || false,
            limit_switches_test: record.limit_switches_test || false,
            safety_devices_test: record.safety_devices_test || false,
            hydraulic_system_test: record.hydraulic_system_test || false,
            pressure_relief_test: record.pressure_relief_test || false,
            electrical_system_test: record.electrical_system_test || false,
            platform_operation_test: record.platform_operation_test || false,
            fail_safe_devices_test: record.fail_safe_devices_test || false,
            lifting_structure_test: record.lifting_structure_test || false,
          });
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching lift service record:', err);
          toast.error('Error loading lift service record. Please try again.');
          setLoading(false);
        }
      };
      
      fetchLiftService();
    }
  }, [isEditing, id, form]);
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      
      const formattedValues = {
        ...values,
        service_date: values.service_date.toISOString(),
        retest_date: values.retest_date.toISOString(),
      };
      
      if (isEditing) {
        await axios.put(`/api/lift-service-records/${id}`, formattedValues);
        toast.success('Lift service record updated successfully');
      } else {
        const response = await axios.post('/api/lift-service-records', formattedValues);
        toast.success('Lift service record created successfully');
        // Navigate to the newly created record
        navigate(`/lift-service/${response.data.id}`);
        return; // Prevent further navigation
      }
      
      setSubmitting(false);
      navigate('/lift-service');
    } catch (err) {
      console.error('Error saving lift service record:', err);
      toast.error('Error saving lift service record. Please try again.');
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate(companyIdParam ? `/company/${companyIdParam}` : '/lift-service');
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={handleCancel} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold flex items-center">
          <Forklift className="h-6 w-6 mr-2 text-[#7b96d4]" />
          {isEditing ? "Edit Lift Service Record" : "New Lift Service Record"}
        </h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Company & Equipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_id">Company *</Label>
                <Select
                  value={form.watch('company_id') || undefined}
                  onValueChange={(value) => form.setValue('company_id', value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCompanies ? (
                      <div className="p-2 text-center">Loading...</div>
                    ) : companies.length === 0 ? (
                      <div className="p-2 text-center">No companies found</div>
                    ) : (
                      companies.map((company) => (
                        company.id ? (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name || "Unnamed Company"}
                          </SelectItem>
                        ) : null
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.company_id && (
                  <p className="text-sm text-red-500">{form.formState.errors.company_id.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_category">Lift Type *</Label>
                  <Select
                    value={form.watch('product_category') || undefined}
                    onValueChange={(value) => form.setValue('product_category', value, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lift type" />
                    </SelectTrigger>
                    <SelectContent>
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
                  {form.formState.errors.product_category && (
                    <p className="text-sm text-red-500">{form.formState.errors.product_category.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    {...form.register('model')}
                    placeholder="Enter model"
                  />
                  {form.formState.errors.model && (
                    <p className="text-sm text-red-500">{form.formState.errors.model.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number *</Label>
                  <Input
                    id="serial_number"
                    {...form.register('serial_number')}
                    placeholder="Enter serial number"
                  />
                  {form.formState.errors.serial_number && (
                    <p className="text-sm text-red-500">{form.formState.errors.serial_number.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certificate_number">Certificate Number</Label>
                  <Input
                    id="certificate_number"
                    {...form.register('certificate_number')}
                    placeholder="Auto-generated if left empty"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_date">Service Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.watch('service_date') && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('service_date') ? (
                          format(form.watch('service_date'), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('service_date')}
                        onSelect={(date) => form.setValue('service_date', date, { shouldValidate: true })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.service_date && (
                    <p className="text-sm text-red-500">{form.formState.errors.service_date.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retest_date">Retest Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.watch('retest_date') && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('retest_date') ? (
                          format(form.watch('retest_date'), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('retest_date')}
                        onSelect={(date) => form.setValue('retest_date', date, { shouldValidate: true })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.retest_date && (
                    <p className="text-sm text-red-500">{form.formState.errors.retest_date.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="swl">Safe Working Load (SWL)</Label>
                <Input
                  id="swl"
                  {...form.register('swl')}
                  placeholder="Enter safe working load"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Inspection Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="safe_working_test"
                    checked={form.watch('safe_working_test')}
                    onCheckedChange={(checked) => 
                      form.setValue('safe_working_test', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="safe_working_test">Safe Working Load Test</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency_stops_test"
                    checked={form.watch('emergency_stops_test')}
                    onCheckedChange={(checked) => 
                      form.setValue('emergency_stops_test', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="emergency_stops_test">Emergency Stops</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="limit_switches_test"
                    checked={form.watch('limit_switches_test')}
                    onCheckedChange={(checked) => 
                      form.setValue('limit_switches_test', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="limit_switches_test">Limit Switches</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="safety_devices_test"
                    checked={form.watch('safety_devices_test')}
                    onCheckedChange={(checked) => 
                      form.setValue('safety_devices_test', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="safety_devices_test">Safety Devices</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hydraulic_system_test"
                    checked={form.watch('hydraulic_system_test')}
                    onCheckedChange={(checked) => 
                      form.setValue('hydraulic_system_test', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="hydraulic_system_test">Hydraulic System</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pressure_relief_test"
                    checked={form.watch('pressure_relief_test')}
                    onCheckedChange={(checked) => 
                      form.setValue('pressure_relief_test', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="pressure_relief_test">Pressure Relief Valves</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="electrical_system_test"
                    checked={form.watch('electrical_system_test')}
                    onCheckedChange={(checked) => 
                      form.setValue('electrical_system_test', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="electrical_system_test">Electrical System</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="platform_operation_test"
                    checked={form.watch('platform_operation_test')}
                    onCheckedChange={(checked) => 
                      form.setValue('platform_operation_test', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="platform_operation_test">Platform Operation</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fail_safe_devices_test"
                    checked={form.watch('fail_safe_devices_test')}
                    onCheckedChange={(checked) => 
                      form.setValue('fail_safe_devices_test', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="fail_safe_devices_test">Fail-Safe Devices</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lifting_structure_test"
                    checked={form.watch('lifting_structure_test')}
                    onCheckedChange={(checked) => 
                      form.setValue('lifting_structure_test', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="lifting_structure_test">Lifting Structure</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Engineer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="engineer_name">Engineer Name *</Label>
                <Input
                  id="engineer_name"
                  {...form.register('engineer_name')}
                  placeholder="Enter engineer name"
                />
                {form.formState.errors.engineer_name && (
                  <p className="text-sm text-red-500">{form.formState.errors.engineer_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="engineer_signature">Engineer Signature</Label>
                <Input
                  id="engineer_signature"
                  {...form.register('engineer_signature')}
                  placeholder="Enter engineer signature identifier"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  {...form.register('notes')}
                  placeholder="Enter any additional notes about the service"
                  rows={4}
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <div className="flex justify-end space-x-4 w-full">
                <Button variant="outline" onClick={handleCancel} type="button">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#a6e15a] hover:bg-[#95cc4f] text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner /> 
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? "Update Record" : "Create Record"}
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
} 