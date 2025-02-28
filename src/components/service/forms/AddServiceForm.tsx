import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import ServiceEngineerSelect, { ENGINEERS } from "../components/ServiceEngineerSelect";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTheme } from "@/components/theme-provider";
import { useEffect } from "react";

interface ServiceEquipment {
  name: string;
  serial: string;
}

const formSchema = z.object({
  certificate_number: z.string()
    .min(1, "Certificate number is required")
    .startsWith("BWS-", "Certificate number must start with BWS-")
    .min(5, "Certificate number must be at least 5 characters"),
  test_date: z.string().min(1, "Test date is required"),
  engineer_name: z.string().min(1, "Engineer is required"),
  equipment: z.array(z.object({
    name: z.string().min(1, "Equipment name is required"),
    serial: z.string().min(1, "Serial number is required")
  })).min(1, "At least one piece of equipment is required").max(6, "Maximum 6 pieces of equipment allowed")
});

interface AddServiceFormProps {
  customerId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

async function getNextCertificateNumber() {
  const { data } = await supabase
    .from('service_records')
    .select('certificate_number')
    .order('certificate_number', { ascending: false })
    .limit(1);

  if (!data?.length) return 'BWS-1001';  // Start from 1001 if no records

  const lastNumber = parseInt(data[0].certificate_number.split('-')[1]);
  return `BWS-${lastNumber + 1}`;
}

export function AddServiceForm({ customerId, onSuccess, onCancel }: AddServiceFormProps) {
  const { theme } = useTheme();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificate_number: "BWS-",
      test_date: format(new Date(), "yyyy-MM-dd"),
      engineer_name: "",
      equipment: [{ name: "", serial: "" }]
    }
  });

  useEffect(() => {
    getNextCertificateNumber().then(number => {
      form.setValue('certificate_number', number);
    });
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("CustomerId received:", customerId);
    console.log("Form values:", JSON.stringify(values, null, 2));
    try {
      // First equipment (equipment1)
      const serviceData = {
        company_id: customerId,
        certificate_number: values.certificate_number,
        engineer_name: values.engineer_name,
        test_date: values.test_date,
        retest_date: format(addDays(new Date(values.test_date), 364), "yyyy-MM-dd"),
        equipment1_name: values.equipment[0].name,
        equipment1_serial: values.equipment[0].serial
      };

      // Additional equipment (equipment2 through equipment6)
      if (values.equipment.length > 1) {
        const additionalEquipment = values.equipment.slice(1).map((item, index) => ({
          company_id: customerId,
          certificate_number: values.certificate_number,
          engineer_name: values.engineer_name,
          test_date: values.test_date,
          retest_date: format(addDays(new Date(values.test_date), 364), "yyyy-MM-dd"),
          [`equipment${index + 2}_name`]: item.name,
          [`equipment${index + 2}_serial`]: item.serial
        }));

        const { error: additionalError } = await supabase
          .from("service_records")
          .insert(additionalEquipment);

        if (additionalError) {
          console.error("Error adding additional equipment:", additionalError);
          throw additionalError;
        }
      }

      const { data, error: serviceError } = await supabase
        .from("service_records")
        .insert(serviceData)
        .select()
        .single();

      if (serviceError) {
        console.error("Service error full details:", {
          message: serviceError.message,
          code: serviceError.code,
          details: serviceError.details,
          hint: serviceError.hint
        });
        throw serviceError;
      }

      toast({
        title: "Success",
        description: "Service record created successfully"
      });

      onSuccess();
    } catch (error) {
      console.error("Detailed error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service record",
        variant: "destructive"
      });
    }
  };

  // Calculate retest date
  const testDate = form.watch("test_date");
  const retestDate = testDate 
    ? format(addDays(new Date(testDate), 364), "dd/MM/yyyy")
    : "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Certificate Details Section */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="certificate_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#94a3b8] font-medium">Certificate Number</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12" readOnly />
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
                    <Input type="date" {...field} className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel className="text-[#94a3b8] font-medium">Retest Date</FormLabel>
              <div className="h-12 px-3 py-2 rounded-md border bg-muted">
                {retestDate}
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="engineer_name"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-[#94a3b8] font-medium">Engineer</FormLabel>
                <FormControl>
                  <ServiceEngineerSelect
                    selectedEngineer={field.value}
                    setSelectedEngineer={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Test Data Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Test Data</h3>
          <div className="space-y-4">
            {/* First equipment row WITH headers */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="equipment.0.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#94a3b8] font-medium">Equipment Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-12" placeholder="Equipment name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipment.0.serial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#94a3b8] font-medium">Serial Number</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-12" placeholder="Serial number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional equipment rows WITHOUT headers */}
            {form.watch("equipment").slice(1).map((_, index) => (
              <div key={index + 1} className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`equipment.${index + 1}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} className="h-12" placeholder="Equipment name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`equipment.${index + 1}.serial`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} className="h-12" placeholder="Serial number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            {/* Add Equipment button */}
            {form.watch("equipment").length < 6 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  const equipment = form.watch("equipment");
                  form.setValue("equipment", [...equipment, { name: "", serial: "" }]);
                }}
              >
                Add Equipment
              </Button>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit"
            className={
              theme === "light"
                ? "bg-white text-black border border-border hover:bg-gray-50"
                : "bg-[#a6e15a] text-black hover:bg-[#95cc51]"
            }
          >
            Save Service Record
          </Button>
        </div>
      </form>
    </Form>
  );
} 