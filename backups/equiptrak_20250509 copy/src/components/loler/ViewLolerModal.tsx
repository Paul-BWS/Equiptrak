import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { ServiceEngineerSelect } from "@/components/service/components/ServiceEngineerSelect";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { getStatus, getStatusColor } from "@/utils/serviceStatus";

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

interface ViewLolerModalProps {
  equipmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewLolerModal({
  equipmentId,
  open,
  onOpenChange,
}: ViewLolerModalProps) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["loler", equipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select(`
          *,
          companies:customer_id (
            company_name,
            email,
            address,
            city,
            postcode
          ),
          loler_service_records (
            *,
            engineers (
              name
            )
          )
        `)
        .eq("id", equipmentId)
        .single();

      if (error) throw error;

      // Sort service records by inspection date
      const sortedRecords = data.loler_service_records.sort(
        (a: any, b: any) =>
          new Date(b.inspection_date).getTime() -
          new Date(a.inspection_date).getTime()
      );

      return {
        ...data,
        loler_service_records: sortedRecords,
      };
    },
    enabled: open,
  });

  const latestRecord = equipment?.loler_service_records[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificate_number: latestRecord?.certificate_number || "",
      test_date: latestRecord?.inspection_date ? format(new Date(latestRecord.inspection_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      name: equipment?.name || "",
      serial_number: equipment?.serial_number || "",
      safe_working_load: latestRecord?.capacity_kg?.toString() || "",
      engineer_id: latestRecord?.engineer_id || "",
      platform_condition_result: latestRecord?.platform_condition_result || "PASS",
      platform_condition_notes: latestRecord?.platform_condition_notes || "",
      control_box_result: latestRecord?.control_box_result || "PASS",
      control_box_notes: latestRecord?.control_box_notes || "",
      hydraulic_system_result: latestRecord?.hydraulic_system_result || "PASS",
      hydraulic_system_notes: latestRecord?.hydraulic_system_notes || "",
      main_structure_result: latestRecord?.main_structure_result || "PASS",
      main_structure_notes: latestRecord?.main_structure_notes || "",
      oil_levels_result: latestRecord?.oil_levels_result || "PASS",
      oil_levels_notes: latestRecord?.oil_levels_notes || "",
      rollers_guides_result: latestRecord?.rollers_guides_result || "PASS",
      rollers_guides_notes: latestRecord?.rollers_guides_notes || "",
      safety_mechanism_result: latestRecord?.safety_mechanism_result || "PASS",
      safety_mechanism_notes: latestRecord?.safety_mechanism_notes || "",
      scissor_operation_result: latestRecord?.scissor_operation_result || "PASS",
      scissor_operation_notes: latestRecord?.scissor_operation_notes || "",
      securing_bolts_result: latestRecord?.securing_bolts_result || "PASS",
      securing_bolts_notes: latestRecord?.securing_bolts_notes || "",
      toe_guards_result: latestRecord?.toe_guards_result || "PASS",
      toe_guards_notes: latestRecord?.toe_guards_notes || "",
      lubrication_result: latestRecord?.lubrication_result || "PASS",
      lubrication_notes: latestRecord?.lubrication_notes || "",
    },
  });

  // Calculate retest date based on test date
  const testDate = form.watch("test_date");
  const formattedRetestDate = testDate 
    ? format(addDays(new Date(testDate), 364), "yyyy-MM-dd")
    : "";
  const displayRetestDate = formattedRetestDate 
    ? format(new Date(formattedRetestDate), "dd/MM/yyyy")
    : "";

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.safe_working_load || values.safe_working_load.trim() === '') {
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
      // Update equipment record
      const { error: equipmentError } = await supabase
        .from("equipment")
        .update({
          name: values.name,
          serial_number: values.serial_number,
          last_test_date: values.test_date,
          next_test_date: format(addDays(new Date(values.test_date), 364), "yyyy-MM-dd"),
          status: "valid"
        })
        .eq('id', equipmentId);

      if (equipmentError) throw equipmentError;

      // Update LOLER service record
      const { error: serviceError } = await supabase
        .from("loler_service_records")
        .update({
          engineer_id: values.engineer_id,
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
        })
        .eq('id', latestRecord?.id);

      if (serviceError) throw serviceError;

      await queryClient.invalidateQueries({ queryKey: ["loler"] });

      toast({
        title: "Success",
        description: "LOLER equipment has been updated successfully",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating LOLER equipment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update LOLER equipment",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (equipment && latestRecord) {
      form.reset({
        certificate_number: latestRecord.certificate_number,
        test_date: format(new Date(latestRecord.inspection_date), "yyyy-MM-dd"),
        name: equipment.name,
        serial_number: equipment.serial_number,
        safe_working_load: latestRecord.capacity_kg?.toString(),
        engineer_id: latestRecord.engineer_id,
        platform_condition_result: latestRecord.platform_condition_result,
        platform_condition_notes: latestRecord.platform_condition_notes,
        control_box_result: latestRecord.control_box_result,
        control_box_notes: latestRecord.control_box_notes,
        hydraulic_system_result: latestRecord.hydraulic_system_result,
        hydraulic_system_notes: latestRecord.hydraulic_system_notes,
        main_structure_result: latestRecord.main_structure_result,
        main_structure_notes: latestRecord.main_structure_notes,
        oil_levels_result: latestRecord.oil_levels_result,
        oil_levels_notes: latestRecord.oil_levels_notes,
        rollers_guides_result: latestRecord.rollers_guides_result,
        rollers_guides_notes: latestRecord.rollers_guides_notes,
        safety_mechanism_result: latestRecord.safety_mechanism_result,
        safety_mechanism_notes: latestRecord.safety_mechanism_notes,
        scissor_operation_result: latestRecord.scissor_operation_result,
        scissor_operation_notes: latestRecord.scissor_operation_notes,
        securing_bolts_result: latestRecord.securing_bolts_result,
        securing_bolts_notes: latestRecord.securing_bolts_notes,
        toe_guards_result: latestRecord.toe_guards_result,
        toe_guards_notes: latestRecord.toe_guards_notes,
        lubrication_result: latestRecord.lubrication_result,
        lubrication_notes: latestRecord.lubrication_notes,
      });
    }
  }, [equipment, latestRecord, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit LOLER Equipment</DialogTitle>
          <DialogDescription>
            Update LOLER inspection equipment details.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div>Loading...</div>
        ) : equipment ? (
          <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          control={form.control}
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
                          control={form.control}
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
                            {displayRetestDate}
                          </div>
                        </div>

                        <div>
                          <FormLabel className="text-[#94a3b8] font-medium">Status</FormLabel>
                          <div className="h-12 flex items-center">
                            <Badge className={`${getStatusColor(formattedRetestDate)} text-white`}>
                              {getStatus(formattedRetestDate).charAt(0).toUpperCase() + 
                               getStatus(formattedRetestDate).slice(1)}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
                          name="engineer_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#94a3b8] font-medium">Service Engineer</FormLabel>
                              <FormControl>
                                <ServiceEngineerSelect
                                  selectedEngineer={field.value}
                                  setSelectedEngineer={(value) => field.onChange(value)}
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
                          control={form.control}
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
                                control={form.control}
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
                                control={form.control}
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
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className={`${
                      theme === 'dark'
                        ? 'bg-[#a6e15a] text-black hover:bg-[#95cc51]'
                        : 'bg-[#7b96d4] text-white hover:bg-[#6a85c3]'
                    }`}
                  >
                    Update Equipment
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        ) : (
          <div>Equipment not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
} 