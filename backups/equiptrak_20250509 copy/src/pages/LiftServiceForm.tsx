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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  notes: z.string().optional(),
  status: z.string().default("pending"),
  
  // Boolean fields
  load_test_conducted: z.boolean().default(false),
  equipment_out_of_action: z.boolean().default(false),
  
  // New inspection fields
  load_test: z.string().nullable().default(null),
  tension_suspension_rope: z.string().nullable().default(null),
  tension_foundation_bolt: z.string().nullable().default(null),
  tension_column_bolt: z.string().nullable().default(null),
  tension_platform_bolt: z.string().nullable().default(null),
  cable_pulley: z.string().nullable().default(null),
  drive_belt_chains: z.string().nullable().default(null),
  hydraulic_connections: z.string().nullable().default(null),
  oil_levels: z.string().nullable().default(null),
  guide_rollers: z.string().nullable().default(null),
  wheel_free_systems: z.string().nullable().default(null),
  limit_devices: z.string().nullable().default(null),
  arm_locks: z.string().nullable().default(null),
  safety_devices: z.string().nullable().default(null),
  clean_safety_rods: z.string().nullable().default(null),
  auto_chocks_fixed_stops: z.string().nullable().default(null),
  anti_toe_chocks: z.string().nullable().default(null),
  lift_markings_swl: z.string().nullable().default(null),
  lifting_arms_pads: z.string().nullable().default(null),
  air_safety_locks: z.string().nullable().default(null),
  column_alignment: z.string().nullable().default(null),
  electrical_check: z.string().nullable().default(null),
  dead_man_controls: z.string().nullable().default(null),
  guards_fixings: z.string().nullable().default(null),
  main_screw_load_safety_nuts: z.string().nullable().default(null),
  
  // Legacy fields for backward compatibility - setting all to NA by default
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

// Reusable components for form fields
const CheckField = ({ label, name, form }) => {
  return (
    <div className="grid grid-cols-6 gap-2 items-center border-b pb-2">
      <div className="col-span-4">{label}</div>
      <div className="col-span-2">
        <Select
          value={form.watch(name) || ""}
          onValueChange={(value) => form.setValue(name, value === "NA" ? null : value, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="N/A" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">A - Take out out of use</SelectItem>
            <SelectItem value="B">B - Repairs Required Immediately</SelectItem>
            <SelectItem value="C">C - Repairs required in next 2 months</SelectItem>
            <SelectItem value="D">D - Serviceable</SelectItem>
            <SelectItem value="R">R - Component Replaced</SelectItem>
            <SelectItem value="T">T - Oil/Refrigerant Topped up</SelectItem>
            <SelectItem value="YES">Yes</SelectItem>
            <SelectItem value="NA">N/A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const YesNoField = ({ label, name, form }) => {
  return (
    <div className="grid grid-cols-6 gap-2 items-center border-b pb-2">
      <div className="col-span-4">{label}</div>
      <div className="col-span-2">
        <Select
          value={form.watch(name) || ""}
          onValueChange={(value) => form.setValue(name, value === "NA" ? null : value, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="N/A" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="YES">Yes</SelectItem>
            <SelectItem value="NO">No</SelectItem>
            <SelectItem value="NA">N/A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const BooleanCheckField = ({ label, name, form }) => {
  return (
    <div className="flex items-center space-x-2 py-2 border-b">
      <Checkbox 
        id={name}
        checked={form.watch(name) || false}
        onCheckedChange={(checked) => form.setValue(name, !!checked, { shouldValidate: true })}
      />
      <Label htmlFor={name} className="font-normal text-sm">{label}</Label>
    </div>
  );
};

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
      engineer_name: ENGINEERS[0],
      signature_image: "",
      swl: "",
      notes: "",
      status: "pending",
      
      // Boolean fields
      load_test_conducted: false,
      equipment_out_of_action: false,
      
      // New inspection fields
      load_test: null,
      tension_suspension_rope: null,
      tension_foundation_bolt: null,
      tension_column_bolt: null,
      tension_platform_bolt: null,
      cable_pulley: null,
      drive_belt_chains: null,
      hydraulic_connections: null,
      oil_levels: null,
      guide_rollers: null,
      wheel_free_systems: null,
      limit_devices: null,
      arm_locks: null,
      safety_devices: null,
      clean_safety_rods: null,
      auto_chocks_fixed_stops: null,
      anti_toe_chocks: null,
      lift_markings_swl: null,
      lifting_arms_pads: null,
      air_safety_locks: null,
      column_alignment: null,
      electrical_check: null,
      dead_man_controls: null,
      guards_fixings: null,
      main_screw_load_safety_nuts: null,
      
      // Legacy fields for backward compatibility
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

  // Ensure axios has the correct base URL
  useEffect(() => {
    // If running in development, point to localhost:3001
    // If in production, need to get the actual API URL
    if (import.meta.env.DEV) {
      axios.defaults.baseURL = 'http://localhost:3001';
    } else {
      // In production, use the server URL (adjust if your API is deployed elsewhere)
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : 'https://api.equiptrak.com'; // Change this to match your actual API domain
      axios.defaults.baseURL = apiUrl;
    }

    console.log('Axios base URL set to:', axios.defaults.baseURL);
  }, []);

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

  // Set Default Dates on NEW records
  useEffect(() => {
    if (!isEditing) {
      // Set default dates
      const today = new Date();
      form.setValue('service_date', today);
      form.setValue('retest_date', addDays(today, 364));
    }
  }, [isEditing, form]);

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
            status: record.status || "pending",
            
            // Boolean fields
            load_test_conducted: record.load_test_conducted || false,
            equipment_out_of_action: record.equipment_out_of_action || false,
            
            // New inspection fields
            load_test: record.load_test || null,
            tension_suspension_rope: record.tension_suspension_rope || null,
            tension_foundation_bolt: record.tension_foundation_bolt || null,
            tension_column_bolt: record.tension_column_bolt || null,
            tension_platform_bolt: record.tension_platform_bolt || null,
            cable_pulley: record.cable_pulley || null,
            drive_belt_chains: record.drive_belt_chains || null,
            hydraulic_connections: record.hydraulic_connections || null,
            oil_levels: record.oil_levels || null,
            guide_rollers: record.guide_rollers || null,
            wheel_free_systems: record.wheel_free_systems || null,
            limit_devices: record.limit_devices || null,
            arm_locks: record.arm_locks || null,
            safety_devices: record.safety_devices || null,
            clean_safety_rods: record.clean_safety_rods || null,
            auto_chocks_fixed_stops: record.auto_chocks_fixed_stops || null,
            anti_toe_chocks: record.anti_toe_chocks || null,
            lift_markings_swl: record.lift_markings_swl || null,
            lifting_arms_pads: record.lifting_arms_pads || null,
            air_safety_locks: record.air_safety_locks || null,
            column_alignment: record.column_alignment || null,
            electrical_check: record.electrical_check || null,
            dead_man_controls: record.dead_man_controls || null,
            guards_fixings: record.guards_fixings || null,
            main_screw_load_safety_nuts: record.main_screw_load_safety_nuts || null,
            
            // Legacy fields for backward compatibility 
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
    console.log("onSubmit called with values:", values);
    
    try {
      setSubmitting(true);
      console.log("Setting submitting to true");
      
      // For new records: remove certificate_number entirely
      let apiSubmission;
      if (!isEditing) {
        console.log("Creating new record - removing certificate_number");
        const { certificate_number, ...dataWithoutCertNumber } = values;
        apiSubmission = dataWithoutCertNumber;
      } else {
        console.log("Updating existing record");
        apiSubmission = values;
      }
      
      // Create axios config
      const axiosConfig = {
        headers: getAuthHeaders()
      };
      console.log("Auth headers:", axiosConfig.headers);
      
      if (isEditing) {
        console.log(`Making PUT request to update record ${id}`);
        try {
          const response = await axios.put(`/api/lift-service-records/${id}`, apiSubmission, axiosConfig);
          console.log("Update successful:", response.data);
          toast.success('Lift service record updated successfully');
          navigate(`/lift-service?companyId=${values.company_id}`);
        } catch (error) {
          console.error("API Error details:", error);
          toast.error('Error updating lift service record: ' + (error.response?.data?.message || error.message));
          setSubmitting(false);
        }
      } else {
        console.log("Making POST request to create new record");
        try {
          console.log("API URL:", axios.defaults.baseURL + '/api/lift-service-records');
          console.log("Sending data:", JSON.stringify(apiSubmission));
          
          // Use fetch instead of axios for more direct control
          const apiUrl = axios.defaults.baseURL + '/api/lift-service-records';
          console.log("Fetching from:", apiUrl);
          
          const authHeader = user?.token ? `Bearer ${user.token}` : '';
          console.log("Auth header:", authHeader ? "Bearer token present" : "No auth token");
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader
            },
            body: JSON.stringify(apiSubmission)
          });
          
          console.log("Response status:", response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            
            // Try to parse JSON error message
            try {
              const errorData = JSON.parse(errorText);
              
              // Check for duplicate serial number error
              if (response.status === 409 && errorData.error === "Duplicate serial number") {
                // Show user-friendly error toast
                toast.error("This serial number already exists in the database. Please use a different serial number.", {
                  id: "duplicate-error",
                  duration: 7000
                });
                
                // Focus the serial number field
                const serialNumberInput = document.getElementById('serial_number');
                if (serialNumberInput) {
                  serialNumberInput.focus();
                  serialNumberInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                throw new Error(errorData.message || "Duplicate serial number detected");
              } else {
                // Handle other API errors
                toast.error(errorData.message || `Server error: ${response.status}`, {
                  id: "api-error",
                  duration: 5000
                });
                throw new Error(errorData.message || `Server responded with ${response.status}`);
              }
            } catch (parseError) {
              // Fallback if error isn't valid JSON
              toast.error(`Server error: ${response.status}`, {
                id: "api-error",
                duration: 5000
              });
              throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }
          }
          
          const data = await response.json();
          console.log("Create successful! Response:", data);
          
          toast.success('Lift service record created successfully');
          navigate(`/lift-service?companyId=${values.company_id}`);
        } catch (error) {
          console.error("API Error details:", error);
          
          // Error is already handled in the response.ok check above
          // Just make sure submitting state is reset
          setSubmitting(false);
        }
      }
      
      setSubmitting(false);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred. Please try again.', {
        id: 'unexpected-error',
        duration: 5000
      });
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
              type="button" 
              className="bg-[#21c15b] hover:bg-[#1ca54e] text-white"
              disabled={submitting}
              onClick={() => {
                console.log("Create button clicked");
                if (submitting) {
                  console.log("Already submitting, skipping");
                  return;
                }
                
                // Get current values directly
                const currentValues = form.getValues();
                console.log("Current form values:", currentValues);
                
                // Check each required field individually and show specific errors
                let hasError = false;
                
                if (!currentValues.company_id) {
                  toast.error("Company is required", {
                    id: "company-error",
                    duration: 4000
                  });
                  hasError = true;
                }
                
                if (!currentValues.product_category) {
                  toast.error("Lift Type is required", {
                    id: "lift-type-error",
                    duration: 4000
                  });
                  hasError = true;
                }
                
                if (!currentValues.model) {
                  toast.error("Model is required", {
                    id: "model-error",
                    duration: 4000
                  });
                  hasError = true;
                  // Try to focus the model field
                  document.getElementById('model')?.focus();
                }
                
                if (!currentValues.serial_number) {
                  toast.error("Serial Number is required", {
                    id: "serial-error",
                    duration: 4000
                  });
                  hasError = true;
                  // Only focus if model was not already focused
                  if (currentValues.model) {
                    document.getElementById('serial_number')?.focus();
                  }
                }
                
                if (!currentValues.engineer_name) {
                  toast.error("Engineer Name is required", {
                    id: "engineer-error",
                    duration: 4000
                  });
                  hasError = true;
                }
                
                if (hasError) {
                  console.log("Validation failed, stopping submission");
                  toast.error("Please fix the errors before submitting", {
                    id: "validation-summary",
                    duration: 5000
                  });
                  return;
                }
                
                // Manual submission without using form.handleSubmit
                console.log("Manually submitting with valid data");
                
                // Remove certificate_number for new records
                if (!isEditing) {
                  const { certificate_number, ...dataWithoutCert } = currentValues;
                  onSubmit(dataWithoutCert);
                } else {
                  onSubmit(currentValues);
                }
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
        {loading || isFetchingCompanyName ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <form id="lift-service-form" onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="equipment" className="w-full mb-6">
              <TabsList className="w-full grid grid-cols-6 mb-6">
                <TabsTrigger value="equipment" type="button">Equipment Details</TabsTrigger>
                <TabsTrigger value="inspections" type="button">Inspections</TabsTrigger>
                <TabsTrigger value="safety" type="button">Safety Features</TabsTrigger>
                <TabsTrigger value="mechanical" type="button">Mechanical</TabsTrigger>
                <TabsTrigger value="maintenance" type="button">Maintenance</TabsTrigger>
                <TabsTrigger value="engineer" type="button">Engineer</TabsTrigger>
              </TabsList>
              
              {/* Equipment Details Tab */}
              <TabsContent value="equipment">
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
                          onBlur={(e) => {
                            // Set value directly to ensure it's captured
                            form.setValue('model', e.target.value, { shouldValidate: true });
                            console.log("Model field value set to:", e.target.value);
                          }}
                          onChange={(e) => {
                            // Set value on each change too
                            form.setValue('model', e.target.value, { shouldValidate: true });
                          }}
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
                          onBlur={(e) => {
                            // Set value directly to ensure it's captured
                            form.setValue('serial_number', e.target.value, { shouldValidate: true });
                            console.log("Serial number field value set to:", e.target.value);
                          }}
                          onChange={(e) => {
                            // Set value on each change too
                            form.setValue('serial_number', e.target.value, { shouldValidate: true });
                          }}
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
                          placeholder="Will be generated upon saving"
                          disabled={!isEditing}
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-gray-100 text-gray-500 italic" : ""}
                        />
                        {!isEditing && (
                          <p className="text-xs text-gray-500">Certificate number will be automatically generated when the record is saved</p>
                        )}
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
                        <div className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-black font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium">
                          {form.watch('retest_date') ? format(form.watch('retest_date'), "PPP") : ""}
                        </div>
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={form.watch('status') || "pending"}
                        onValueChange={(value) => form.setValue('status', value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="pass">Pass</SelectItem>
                          <SelectItem value="fail">Fail</SelectItem>
                          <SelectItem value="remedial">Remedial</SelectItem>
                          <SelectItem value="serviceable">Serviceable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <BooleanCheckField 
                        label="Load Test Conducted" 
                        name="load_test_conducted" 
                        form={form} 
                      />
                      <BooleanCheckField 
                        label="Equipment Out of Action" 
                        name="equipment_out_of_action" 
                        form={form} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Inspections Tab */}
              <TabsContent value="inspections">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Load Testing & Tension Checks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between font-medium text-sm text-gray-500 pb-2 border-b">
                        <span>Test Item</span>
                        <span>Status</span>
                      </div>
                      <YesNoField label="Load Test - tested with a vehicle" name="load_test" form={form} />
                      <CheckField label="Tension Suspension Rope - check" name="tension_suspension_rope" form={form} />
                      <CheckField label="Tension Foundation Bolt - check" name="tension_foundation_bolt" form={form} />
                      <CheckField label="Tension Column Bolt - check" name="tension_column_bolt" form={form} />
                      <CheckField label="Tension Platform Bolt - check" name="tension_platform_bolt" form={form} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Safety Features Tab */}
              <TabsContent value="safety">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Safety Devices & Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between font-medium text-sm text-gray-500 pb-2 border-b">
                        <span>Test Item</span>
                        <span>Status</span>
                      </div>
                      <CheckField label="Limit Devices - Check Complete & Operational" name="limit_devices" form={form} />
                      <CheckField label="Arm Locks - Check Complete & Operational" name="arm_locks" form={form} />
                      <CheckField label="Safety Devices - Check Complete & Operational" name="safety_devices" form={form} />
                      <CheckField label="Clean Safety Rods - Check Complete & Operational" name="clean_safety_rods" form={form} />
                      <CheckField label="Auto Chocks & Fixed Stops - Check Complete & Operational" name="auto_chocks_fixed_stops" form={form} />
                      <CheckField label="Anti-toe chocks 50mm clear - Check Complete & Operational" name="anti_toe_chocks" form={form} />
                      <CheckField label="Lift Markings (SWL) - Check Complete & Operational" name="lift_markings_swl" form={form} />
                      <CheckField label="Air Safety Locks - Check Complete & Operational" name="air_safety_locks" form={form} />
                      <CheckField label="Dead Man Controls - Check Operation" name="dead_man_controls" form={form} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Mechanical Tab */}
              <TabsContent value="mechanical">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Mechanical Systems</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between font-medium text-sm text-gray-500 pb-2 border-b">
                        <span>Test Item</span>
                        <span>Status</span>
                      </div>
                      <CheckField label="Cable & Pulley - Inspect Lubricate & Adjust" name="cable_pulley" form={form} />
                      <CheckField label="Drive Belt Chains - Inspect Lubricate & Adjust" name="drive_belt_chains" form={form} />
                      <CheckField label="Lifting Arms & Pads - Inspect" name="lifting_arms_pads" form={form} />
                      <CheckField label="Column Alignment - Check" name="column_alignment" form={form} />
                      <CheckField label="Guards & Fixings - Check" name="guards_fixings" form={form} />
                      <CheckField label="Main Screw, Load & Safety Nuts - Check" name="main_screw_load_safety_nuts" form={form} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Lubrication & Maintenance Tab */}
              <TabsContent value="maintenance">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Lubrication & Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between font-medium text-sm text-gray-500 pb-2 border-b">
                        <span>Test Item</span>
                        <span>Status</span>
                      </div>
                      <CheckField label="Hydraulic Connections & hoses - Inspect" name="hydraulic_connections" form={form} />
                      <CheckField label="Oil Levels - Check" name="oil_levels" form={form} />
                      <CheckField label="Guide Rollers - Inspect + Lubricate" name="guide_rollers" form={form} />
                      <CheckField label="Wheel Free Systems - Inspect Lubricate & Adjust" name="wheel_free_systems" form={form} />
                      <CheckField label="Electrical Check - Check Terminals/contactors" name="electrical_check" form={form} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Engineer Info Tab */}
              <TabsContent value="engineer">
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
              </TabsContent>
            </Tabs>
          </form>
        )}
      </div>
    </>
  );
} 