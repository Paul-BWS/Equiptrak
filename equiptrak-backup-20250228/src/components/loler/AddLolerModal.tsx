import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format, addDays } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ServiceEngineerSelect } from "@/components/service/components/ServiceEngineerSelect";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ENGINEERS = [
  "Paul Jones",
  "Danny Jennings",
  "Tommy Hannon",
  "Mark Allen",
  "Fernando Goulart",
  "Connor Hill",
  "Dominic TJ",
  "Mason Poulton",
  "Zack Collins"
];

const formSchema = z.object({
  certificate_number: z.string().min(1, "Certificate number is required"),
  test_date: z.string().min(1, "Test date is required"),
  name: z.string().min(1, "Name is required"),
  serial_number: z.string().min(1, "Serial number is required"),
  safe_working_load: z.string()
    .min(1, "Safe working load is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Safe working load must be a positive number"
    }),
  engineer_id: z.string().min(1, "Engineer is required"),
  platform_condition_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  platform_condition_notes: z.string().optional(),
  control_box_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  control_box_notes: z.string().optional(),
  hydraulic_system_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  hydraulic_system_notes: z.string().optional(),
  main_structure_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  main_structure_notes: z.string().optional(),
  oil_levels_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  oil_levels_notes: z.string().optional(),
  rollers_guides_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  rollers_guides_notes: z.string().optional(),
  safety_mechanism_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  safety_mechanism_notes: z.string().optional(),
  scissor_operation_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  scissor_operation_notes: z.string().optional(),
  securing_bolts_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  securing_bolts_notes: z.string().optional(),
  toe_guards_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  toe_guards_notes: z.string().optional(),
  lubrication_result: z.enum(["PASS", "REMEDIAL", "FAIL"]).optional().default("PASS"),
  lubrication_notes: z.string().optional(),
});

interface AddLolerModalProps {
  customerId: string;
}

export function AddLolerModal({ customerId }: AddLolerModalProps) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  console.log("AddLolerModal mounted with customerId:", customerId);

  // Query to get the next certificate number
  const { data: certificateNumber } = useQuery({
    queryKey: ["next-certificate-number"],
    queryFn: async () => {
      console.log("Fetching certificate number...");
      const { data, error } = await supabase
        .rpc('generate_certificate_number');

      if (error) throw error;
      console.log("Received certificate number:", data);
      return data;
    },
    enabled: open,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificate_number: "",
      test_date: format(new Date(), "yyyy-MM-dd"),
      name: "",
      serial_number: "",
      safe_working_load: "",
      engineer_id: "",
    },
  });

  const {
    formState: { isSubmitting, errors },
    handleSubmit,
    setValue,
    watch,
    control
  } = form;

  // Update certificate number when it's fetched
  React.useEffect(() => {
    if (certificateNumber) {
      setValue("certificate_number", certificateNumber);
    }
  }, [certificateNumber, setValue]);

  // Calculate retest date based on test date
  const testDate = watch("test_date");
  const retestDate = testDate 
    ? format(addDays(new Date(testDate), 364), "dd/MM/yyyy")
    : "";

  // Add this after form definition
  useEffect(() => {
    console.log("Form values:", form.getValues());
    console.log("Form errors:", form.formState.errors);
  }, [form.watch()]);

  // Update the onSubmit to log more details
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted with values:", values);
    console.log("Engineer ID:", values.engineer_id);
    console.log("Form state:", form.formState);

    // Validate all fields are filled
    const requiredFields = [
      'name',
      'serial_number',
      'engineer_id',
      'safe_working_load',
      'test_date'
    ];

    const missingFields = requiredFields.filter(field => !values[field as keyof typeof values]);
    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      toast({
        title: "Error",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    if (!values.safe_working_load || values.safe_working_load.trim() === '') {
      console.log("Missing safe working load");
      toast({
        title: "Error",
        description: "Please enter a safe working load",
        variant: "destructive",
      });
      return;
    }

    if (!values.engineer_id) {
      toast({
        title: "Error",
        description: "Please select a service engineer",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get equipment type ID for LOLER
      console.log("Fetching LOLER type ID");
      const { data: lolerType, error: typeError } = await supabase
        .from("equipment_types")
        .select("id")
        .eq("name", "loler")
        .single();

      if (typeError) {
        console.error("Error fetching LOLER type:", typeError);
        throw typeError;
      }
      console.log("Got LOLER type:", lolerType);

      // Create equipment record
      console.log("Creating equipment record with:", {
        name: values.name,
        serial_number: values.serial_number,
        customer_id: customerId,
        type_id: lolerType.id,
      });

      const { data: equipment, error: equipmentError } = await supabase
        .from("equipment")
        .insert({
          name: values.name,
          serial_number: values.serial_number,
          customer_id: customerId,
          type_id: lolerType.id,
          last_test_date: values.test_date,
          next_test_date: format(addDays(new Date(values.test_date), 364), "yyyy-MM-dd"),
          status: "valid"
        })
        .select()
        .single();

      if (equipmentError) {
        console.error("Error creating equipment:", equipmentError);
        throw equipmentError;
      }
      console.log("Created equipment:", equipment);

      // Create LOLER service record
      console.log("Creating LOLER service record");
      const { error: serviceError } = await supabase
        .from("loler_service_records")
        .insert({
          equipment_id: equipment.id,
          engineer_id: values.engineer_id,
          certificate_number: values.certificate_number,
          inspection_date: values.test_date,
          retest_date: format(addDays(new Date(values.test_date), 364), "yyyy-MM-dd"),
          capacity_kg: parseFloat(values.safe_working_load),
          safe_to_operate: "Yes" as const,
          platform_condition_result: values.platform_condition_result || "PASS",
          platform_condition_notes: values.platform_condition_notes || "",
          control_box_result: values.control_box_result || "PASS",
          control_box_notes: values.control_box_notes || "",
          hydraulic_system_result: values.hydraulic_system_result || "PASS",
          hydraulic_system_notes: values.hydraulic_system_notes || "",
          main_structure_result: values.main_structure_result || "PASS",
          main_structure_notes: values.main_structure_notes || "",
          oil_levels_result: values.oil_levels_result || "PASS",
          oil_levels_notes: values.oil_levels_notes || "",
          rollers_guides_result: values.rollers_guides_result || "PASS",
          rollers_guides_notes: values.rollers_guides_notes || "",
          safety_mechanism_result: values.safety_mechanism_result || "PASS",
          safety_mechanism_notes: values.safety_mechanism_notes || "",
          scissor_operation_result: values.scissor_operation_result || "PASS",
          scissor_operation_notes: values.scissor_operation_notes || "",
          securing_bolts_result: values.securing_bolts_result || "PASS",
          securing_bolts_notes: values.securing_bolts_notes || "",
          toe_guards_result: values.toe_guards_result || "PASS",
          toe_guards_notes: values.toe_guards_notes || "",
          lubrication_result: values.lubrication_result || "PASS",
          lubrication_notes: values.lubrication_notes || "",
          qualifications: "HNC Electrical Mechanical Engineering"
        });

      if (serviceError) {
        console.error("Error creating service record:", serviceError);
        throw serviceError;
      }
      console.log("LOLER service record created successfully");

      await queryClient.invalidateQueries({ queryKey: ["loler", customerId] });
      toast({
        title: "Success",
        description: "LOLER equipment has been added successfully",
      });

      setOpen(false);
    } catch (error: any) {
      console.error("Detailed submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create LOLER equipment",
        variant: "destructive",
      });
    }
  };

  console.log("Form errors:", errors);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Equipment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh]"
        >
          <DialogHeader>
            <DialogTitle>Add LOLER Equipment</DialogTitle>
            <DialogDescription>
              Add a new piece of LOLER inspection equipment to the system.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
            <Form {...form}>
              <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="space-y-6"
              >
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="inspection">Inspection</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-6 mt-4">
                    {/* Certificate Details Section */}
                    <div className="p-4 rounded-lg bg-card border border-border/50">
                      <h3 className="font-semibold mb-4">Certificate Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={control}
                          name="certificate_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#94a3b8] font-medium">Certificate Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled 
                                  className="h-12 text-lg"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name="test_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#94a3b8] font-medium">Test Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  className="h-12 text-lg"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <FormLabel className="text-[#94a3b8] font-medium">Retest Date</FormLabel>
                          <div className="h-12 px-3 py-2 rounded-md border border-input bg-background text-lg">
                            {retestDate}
                          </div>
                        </div>

                        <div>
                          <FormLabel className="text-[#94a3b8] font-medium">Status</FormLabel>
                          <div className="h-12 flex items-center">
                            <Badge className="bg-green-500 hover:bg-green-500/90 text-white">
                              Valid
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Equipment Info */}
                    <div className="p-4 rounded-lg bg-card border border-border/50">
                      <h3 className="font-semibold mb-4">Equipment Information</h3>
                      <div className="space-y-4">
                        <FormField
                          control={control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#94a3b8] font-medium">Equipment Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  className="h-12 text-lg"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name="serial_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#94a3b8] font-medium">Serial Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  className="h-12 text-lg"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name="engineer_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#94a3b8] font-medium">Service Engineer</FormLabel>
                              <FormControl>
                                <ServiceEngineerSelect
                                  selectedEngineer={field.value}
                                  setSelectedEngineer={field.onChange}
                                  hideLabel
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="inspection" className="space-y-6 mt-4">
                    {/* LOLER Specific Details */}
                    <div className="p-4 rounded-lg bg-card border border-border/50">
                      <h3 className="font-semibold mb-4">Safe Working Load</h3>
                      <div className="space-y-4">
                        <FormField
                          control={control}
                          name="safe_working_load"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#94a3b8] font-medium">Safe Working Load (SWL)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  className="h-12 text-lg"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  required
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || parseFloat(value) >= 0) {
                                      field.onChange(value);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Inspection Results */}
                    <div className="p-6 rounded-lg bg-card border border-border/50">
                      <h3 className="font-semibold mb-6 text-lg">Inspection Actions</h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-6 gap-6 mb-4 px-4">
                          <div className="col-span-5 text-[#94a3b8] font-medium">Action Notes</div>
                          <div className="text-[#94a3b8] font-medium">Result</div>
                        </div>
                        {[
                          { 
                            label: 'Check Condition Of Platform',
                            key: 'platform_condition'
                          },
                          { 
                            label: 'Check Condition Control Box',
                            key: 'control_box'
                          },
                          { 
                            label: 'Check Condition Hydraulic System',
                            key: 'hydraulic_system'
                          },
                          { 
                            label: 'Visual Inspection Of Main Structure',
                            key: 'main_structure'
                          },
                          { 
                            label: 'Check Oil Levels',
                            key: 'oil_levels'
                          },
                          { 
                            label: 'Check Rollers And Guides',
                            key: 'rollers_guides'
                          },
                          { 
                            label: 'Check Safety Mechanism',
                            key: 'safety_mechanism'
                          },
                          { 
                            label: 'Check Scissor Operation',
                            key: 'scissor_operation'
                          },
                          { 
                            label: 'Check Securing Bolts',
                            key: 'securing_bolts'
                          },
                          { 
                            label: 'Check Toe Guards',
                            key: 'toe_guards'
                          },
                          { 
                            label: 'Check Lubrication Moving Parts',
                            key: 'lubrication'
                          }
                        ].map((item) => (
                          <div key={item.key} className="space-y-2 px-4 py-3 hover:bg-accent/50 rounded-lg">
                            <div className="text-foreground font-medium">
                              {item.label}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-start">
                              <FormField
                                control={control}
                                name={`${item.key}_notes` as any}
                                render={({ field }) => (
                                  <FormItem className="md:col-span-5">
                                    <FormControl>
                                      <textarea
                                        {...field}
                                        className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={control}
                                name={`${item.key}_result` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <select
                                        {...field}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3"
                                      >
                                        <option value="PASS">Pass</option>
                                        <option value="REMEDIAL">Remedial</option>
                                        <option value="FAIL">Fail</option>
                                      </select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={
                      theme === "light"
                        ? "bg-white text-black border border-border hover:bg-gray-50"
                        : "bg-[#a6e15a] text-black hover:bg-[#95cc51]"
                    }
                  >
                    {isSubmitting ? "Adding..." : "Add Equipment"}
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
} 