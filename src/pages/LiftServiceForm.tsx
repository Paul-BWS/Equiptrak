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
import { CalendarIcon, Forklift, ArrowLeft, Save, QrCode, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

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
  signature_image: z.string().optional(),
  safe_working_test: z.string().default("NA"),
  emergency_stops_test: z.string().default("NA"),
  limit_switches_test: z.string().default("NA"),
  safety_devices_test: z.string().default("NA"),
  hydraulic_system_test: z.string().default("NA"),
  pressure_relief_test: z.string().default("NA"),
  electrical_system_test: z.string().default("NA"),
  platform_operation_test: z.string().default("NA"),
  fail_safe_devices_test: z.string().default("NA"),
  lifting_structure_test: z.string().default("NA"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

export default function LiftServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyIdParam = searchParams.get('companyId');
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [isFetchingCompanyName, setIsFetchingCompanyName] = useState(false);
  const { user } = useAuth();
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  
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
      signature_image: "",
      swl: "",
      notes: "",
      safe_working_test: "NA",
      emergency_stops_test: "NA",
      limit_switches_test: "NA",
      safety_devices_test: "NA",
      hydraulic_system_test: "NA",
      pressure_relief_test: "NA",
      electrical_system_test: "NA",
      platform_operation_test: "NA",
      fail_safe_devices_test: "NA",
      lifting_structure_test: "NA",
      service_date: new Date(),
    },
  });
  
  // Helper to get auth headers
  const getAuthHeaders = () => {
    const headers = {};
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    return headers;
  };

  // Fetch company name if companyIdParam exists (for new records)
  useEffect(() => {
    if (companyIdParam && !isEditing && user?.token) {
      setIsFetchingCompanyName(true);
      const fetchCompanyName = async () => {
        try {
          const response = await axios.get(`/api/companies/${companyIdParam}`, {
            headers: getAuthHeaders()
          });
          setCompanyName(response.data?.company_name || "Company Not Found");
          // Ensure company_id is set in the form
          form.setValue('company_id', companyIdParam);
        } catch (error) {
          console.error("Error fetching company name:", error);
          setCompanyName("Error loading company name");
        } finally {
          setIsFetchingCompanyName(false);
        }
      };
      fetchCompanyName();
    }
  }, [companyIdParam, isEditing, user?.token, form]);

  // Generate Certificate Number and Set Default Dates on NEW records
  useEffect(() => {
    if (!isEditing && user?.token) {
      const generateNumber = async () => {
        try {
          setIsGeneratingCert(true);
          console.log("Fetching latest certificate number...");
          
          // Get all records sorted by certificate number
          const response = await axios.get('/api/lift-service-records', {
            headers: getAuthHeaders(),
            params: {
              sort: '-certificate_number',
              limit: 1
            }
          });
          
          let nextNumber = 1000; // Default starting point
          
          if (response.data && response.data.length > 0) {
            const latestRecord = response.data[0];
            console.log("Latest record:", latestRecord);
            
            if (latestRecord.certificate_number) {
              const match = latestRecord.certificate_number.match(/BWS-(\d+)/);
              if (match && match[1]) {
                nextNumber = parseInt(match[1], 10) + 1;
                console.log("Extracted number:", match[1], "Next number:", nextNumber);
              }
            }
          }
          
          const newCertNumber = `BWS-${nextNumber}`;
          console.log("Setting new certificate number:", newCertNumber);
          form.setValue('certificate_number', newCertNumber);
          
        } catch (error) {
          console.error("Error generating certificate number:", error);
          toast.error("Could not generate certificate number.");
          form.setValue('certificate_number', `BWS-1000`);
        } finally {
          setIsGeneratingCert(false);
        }
      };
      
      generateNumber();
      
      // Set default dates
      const today = new Date();
      form.setValue('service_date', today);
      form.setValue('retest_date', addDays(today, 364));
    } else if (isEditing) {
       // Clear flag if navigating back to edit mode
       setIsGeneratingCert(false);
    }
  }, [isEditing, user?.token, form.setValue]);

  // Auto-update retest_date when service_date changes (for NEW and EDIT)
  const serviceDateValue = form.watch('service_date');
  useEffect(() => {
    if (serviceDateValue) {
      try {
        form.setValue('retest_date', addDays(new Date(serviceDateValue), 364));
      } catch (e) {
        console.error("Error calculating retest date from service date:", e);
      }
    }
  }, [serviceDateValue, form.setValue]);

  // Fetch lift service record AND company name if editing
  useEffect(() => {
    if (isEditing && id && user?.token) {
      const fetchLiftService = async () => {
        if (!user?.token) {
           console.error("No auth token for fetching lift service record.");
           setLoading(false);
           return;
        }
        try {
          setLoading(true);
          const response = await axios.get(`/api/lift-service-records/${id}`, {
            headers: getAuthHeaders()
          });
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
            signature_image: record.signature_image || "",
            swl: record.swl || "",
            notes: record.notes || "",
            // Convert old boolean values to new string format if needed
            safe_working_test: typeof record.safe_working_test === 'boolean' 
              ? (record.safe_working_test ? "YES" : "NA") 
              : (record.safe_working_test || "NA"),
            emergency_stops_test: typeof record.emergency_stops_test === 'boolean'
              ? (record.emergency_stops_test ? "YES" : "NA") 
              : (record.emergency_stops_test || "NA"),
            limit_switches_test: typeof record.limit_switches_test === 'boolean'
              ? (record.limit_switches_test ? "YES" : "NA") 
              : (record.limit_switches_test || "NA"),
            safety_devices_test: typeof record.safety_devices_test === 'boolean'
              ? (record.safety_devices_test ? "YES" : "NA") 
              : (record.safety_devices_test || "NA"),
            hydraulic_system_test: typeof record.hydraulic_system_test === 'boolean'
              ? (record.hydraulic_system_test ? "YES" : "NA") 
              : (record.hydraulic_system_test || "NA"),
            pressure_relief_test: typeof record.pressure_relief_test === 'boolean'
              ? (record.pressure_relief_test ? "YES" : "NA") 
              : (record.pressure_relief_test || "NA"),
            electrical_system_test: typeof record.electrical_system_test === 'boolean'
              ? (record.electrical_system_test ? "YES" : "NA") 
              : (record.electrical_system_test || "NA"),
            platform_operation_test: typeof record.platform_operation_test === 'boolean'
              ? (record.platform_operation_test ? "YES" : "NA") 
              : (record.platform_operation_test || "NA"),
            fail_safe_devices_test: typeof record.fail_safe_devices_test === 'boolean'
              ? (record.fail_safe_devices_test ? "YES" : "NA") 
              : (record.fail_safe_devices_test || "NA"),
            lifting_structure_test: typeof record.lifting_structure_test === 'boolean'
              ? (record.lifting_structure_test ? "YES" : "NA") 
              : (record.lifting_structure_test || "NA"),
          });
          
          // Fetch company name for the record being edited
          if (record.company_id) {
            setIsFetchingCompanyName(true);
            axios.get(`/api/companies/${record.company_id}`, { headers: getAuthHeaders() })
              .then(res => setCompanyName(res.data?.company_name || "Company Not Found"))
              .catch(err => {
                 console.error("Error fetching company name for edit:", err);
                 setCompanyName("Error loading company name");
              })
              .finally(() => setIsFetchingCompanyName(false));
          } else {
              setCompanyName("No Company Associated");
          }
          setLoading(false);
        } catch (err) {
          console.error('Error fetching lift service record:', err);
          if (axios.isAxiosError(err) && err.response?.status === 401) {
             toast.error("Unauthorized: Could not load record.");
          } else {
             toast.error('Error loading lift service record. Please try again.');
          }
          setLoading(false);
        }
      };
      
      fetchLiftService();
    } else if (!isEditing) { // Handle non-editing case
        setLoading(false);
    }
  }, [isEditing, id, form, user?.token]);
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user?.token) {
       toast.error("Authentication error. Cannot save.");
       return;
    }
    try {
      setSubmitting(true);
      
      // Create API submission object with proper status fields
      const apiSubmission = {
        ...values,
        // Include direct string values for new API format
        safe_working_test_status: values.safe_working_test,
        emergency_stops_test_status: values.emergency_stops_test,
        limit_switches_test_status: values.limit_switches_test,
        safety_devices_test_status: values.safety_devices_test,
        hydraulic_system_test_status: values.hydraulic_system_test,
        pressure_relief_test_status: values.pressure_relief_test,
        electrical_system_test_status: values.electrical_system_test,
        platform_operation_test_status: values.platform_operation_test,
        fail_safe_devices_test_status: values.fail_safe_devices_test,
        lifting_structure_test_status: values.lifting_structure_test,
        // Also include boolean versions for backward compatibility
        safe_working_test: values.safe_working_test === "YES" || values.safe_working_test === "OK",
        emergency_stops_test: values.emergency_stops_test === "YES" || values.emergency_stops_test === "OK",
        limit_switches_test: values.limit_switches_test === "YES" || values.limit_switches_test === "OK",
        safety_devices_test: values.safety_devices_test === "YES" || values.safety_devices_test === "OK",
        hydraulic_system_test: values.hydraulic_system_test === "YES" || values.hydraulic_system_test === "OK",
        pressure_relief_test: values.pressure_relief_test === "YES" || values.pressure_relief_test === "OK",
        electrical_system_test: values.electrical_system_test === "YES" || values.electrical_system_test === "OK",
        platform_operation_test: values.platform_operation_test === "YES" || values.platform_operation_test === "OK",
        fail_safe_devices_test: values.fail_safe_devices_test === "YES" || values.fail_safe_devices_test === "OK",
        lifting_structure_test: values.lifting_structure_test === "YES" || values.lifting_structure_test === "OK",
        service_date: values.service_date.toISOString(),
        retest_date: values.retest_date.toISOString(),
      };
      
      const axiosConfig = {
        headers: getAuthHeaders()
      };

      if (isEditing) {
        await axios.put(`/api/lift-service-records/${id}`, apiSubmission, axiosConfig);
        toast.success('Lift service record updated successfully');
        navigate('/lift-service');
      } else {
        await axios.post('/api/lift-service-records', apiSubmission, axiosConfig);
        toast.success('Lift service record created successfully');
        navigate('/lift-service');
      }
      
      setSubmitting(false);
    } catch (err) {
      console.error('Error saving lift service record:', err);
      toast.error('Error saving lift service record. Please try again.');
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/lift-service');
  };
  
  return (
    <>
      <div className="bg-white w-full border-b mb-6">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleCancel} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex gap-2">
            {isEditing && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/lift-certificate/${id}/qr`)}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/lift-certificate/${id}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Certificate
                </Button>
              </>
            )}
            <Button 
              type="submit" 
              form="lift-service-form"
              className="bg-[#21c15b] hover:bg-[#1ca54e] text-white"
              disabled={submitting}
              onClick={() => {
                document.getElementById('lift-service-form')?.dispatchEvent(
                  new Event('submit', { cancelable: true, bubbles: true })
                );
              }}
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
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-4xl">
        {loading || isFetchingCompanyName || (isGeneratingCert && !isEditing) ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <form id="lift-service-form" onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Equipment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_id">Company *</Label>
                  {companyIdParam || isEditing ? (
                    <p className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 shadow-sm sm:text-sm text-gray-700">
                      {companyName || "Loading..."}
                    </p>
                  ) : (
                    <p className="text-red-600">Please select a company first</p>
                  )}
                  <input type="hidden" {...form.register('company_id')} />
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
                      placeholder={isGeneratingCert ? "Generating..." : "Auto-generated"}
                      disabled
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
                    <Input 
                      id="retest_date"
                      type="date"
                      value={form.watch('retest_date') ? format(form.watch('retest_date'), 'yyyy-MM-dd') : ''}
                      disabled
                      readOnly
                      className="bg-gray-100"
                    />
                    <input type="hidden" {...form.register('retest_date')} />
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
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-6 gap-2 border-b pb-2 mb-2">
                    <div className="col-span-4 font-medium">Test Item</div>
                    <div className="col-span-2 font-medium text-right">Status</div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-4">Safe Working Load Test</div>
                    <div className="col-span-2">
                      <Select
                        value={form.watch('safe_working_test')}
                        onValueChange={(value) => form.setValue('safe_working_test', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="NA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">YES</SelectItem>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="FAIL">FAIL</SelectItem>
                          <SelectItem value="REMEDIAL">REMEDIAL</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-4">Emergency Stops</div>
                    <div className="col-span-2">
                      <Select
                        value={form.watch('emergency_stops_test')}
                        onValueChange={(value) => form.setValue('emergency_stops_test', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="NA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">YES</SelectItem>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="FAIL">FAIL</SelectItem>
                          <SelectItem value="REMEDIAL">REMEDIAL</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-4">Limit Switches</div>
                    <div className="col-span-2">
                      <Select
                        value={form.watch('limit_switches_test')}
                        onValueChange={(value) => form.setValue('limit_switches_test', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="NA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">YES</SelectItem>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="FAIL">FAIL</SelectItem>
                          <SelectItem value="REMEDIAL">REMEDIAL</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-4">Safety Devices</div>
                    <div className="col-span-2">
                      <Select
                        value={form.watch('safety_devices_test')}
                        onValueChange={(value) => form.setValue('safety_devices_test', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="NA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">YES</SelectItem>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="FAIL">FAIL</SelectItem>
                          <SelectItem value="REMEDIAL">REMEDIAL</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-4">Hydraulic System</div>
                    <div className="col-span-2">
                      <Select
                        value={form.watch('hydraulic_system_test')}
                        onValueChange={(value) => form.setValue('hydraulic_system_test', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="NA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">YES</SelectItem>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="FAIL">FAIL</SelectItem>
                          <SelectItem value="REMEDIAL">REMEDIAL</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-4">Pressure Relief Valves</div>
                    <div className="col-span-2">
                      <Select
                        value={form.watch('pressure_relief_test')}
                        onValueChange={(value) => form.setValue('pressure_relief_test', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="NA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">YES</SelectItem>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="FAIL">FAIL</SelectItem>
                          <SelectItem value="REMEDIAL">REMEDIAL</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-4">Electrical System</div>
                    <div className="col-span-2">
                      <Select
                        value={form.watch('electrical_system_test')}
                        onValueChange={(value) => form.setValue('electrical_system_test', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="NA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">YES</SelectItem>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="FAIL">FAIL</SelectItem>
                          <SelectItem value="REMEDIAL">REMEDIAL</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-4">Platform Operation</div>
                    <div className="col-span-2">
                      <Select
                        value={form.watch('platform_operation_test')}
                        onValueChange={(value) => form.setValue('platform_operation_test', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="NA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">YES</SelectItem>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="FAIL">FAIL</SelectItem>
                          <SelectItem value="REMEDIAL">REMEDIAL</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-4">Fail-Safe Devices</div>
                    <div className="col-span-2">
                      <Select
                        value={form.watch('fail_safe_devices_test')}
                        onValueChange={(value) => form.setValue('fail_safe_devices_test', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="NA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">YES</SelectItem>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="FAIL">FAIL</SelectItem>
                          <SelectItem value="REMEDIAL">REMEDIAL</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-4">Lifting Structure</div>
                    <div className="col-span-2">
                      <Select
                        value={form.watch('lifting_structure_test')}
                        onValueChange={(value) => form.setValue('lifting_structure_test', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="NA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">YES</SelectItem>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="FAIL">FAIL</SelectItem>
                          <SelectItem value="REMEDIAL">REMEDIAL</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                  <Select
                    value={form.watch('engineer_name') || undefined}
                    onValueChange={(value) => form.setValue('engineer_name', value, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGINEERS.map((engineer) => (
                        <SelectItem key={engineer} value={engineer}>
                          {engineer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.engineer_name && (
                    <p className="text-sm text-red-500">{form.formState.errors.engineer_name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signature_image">Engineer Signature</Label>
                  <Input
                    id="signature_image"
                    {...form.register('signature_image')}
                    placeholder="Enter engineer signature identifier or leave blank"
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
            </Card>
          </form>
        )}
      </div>
    </>
  );
} 