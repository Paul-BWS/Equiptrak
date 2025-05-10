import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEngineers } from "@/hooks/engineers/useEngineers";
import { useEffect } from "react";

const formSchema = z.object({
  engineer_name: z.string().min(1, "Engineer name is required"),
  test_date: z.string().min(1, "Test date is required"),
  retest_date: z.string().min(1, "Retest date is required"),
  equipment_name: z.string().min(1, "Equipment name is required"),
  equipment_serial: z.string().min(1, "Serial number is required"),
  rivet_tool_model: z.string().min(1, "Model is required"),
  machine_reading_1: z.string().optional(),
  actual_reading_1: z.string().optional(),
  machine_reading_2: z.string().optional(),
  actual_reading_2: z.string().optional(),
  machine_reading_3: z.string().optional(),
  actual_reading_3: z.string().optional(),
  machine_reading_4: z.string().optional(),
  actual_reading_4: z.string().optional(),
  notes: z.string().optional(),
});

interface AddRivetToolFormProps {
  customerId: string;
  onSuccess?: () => void;
}

export function AddRivetToolForm({ customerId, onSuccess }: AddRivetToolFormProps) {
  const { toast } = useToast();
  const { data: engineers } = useEngineers();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      engineer_name: "",
      test_date: new Date().toISOString().split("T")[0],
      retest_date: addDays(new Date(), 364).toISOString().split("T")[0],
      equipment_name: "",
      equipment_serial: "",
      rivet_tool_model: "",
      machine_reading_1: "",
      actual_reading_1: "",
      machine_reading_2: "",
      actual_reading_2: "",
      machine_reading_3: "",
      actual_reading_3: "",
      machine_reading_4: "",
      actual_reading_4: "",
      notes: "",
    },
  });

  // Update retest date when test date changes
  useEffect(() => {
    const testDate = new Date(form.getValues("test_date"));
    const retestDate = addDays(testDate, 364).toISOString().split("T")[0];
    form.setValue("retest_date", retestDate);
  }, [form.watch("test_date")]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase.from("rivet_tool_records").insert([
        {
          company_id: customerId,
          ...values,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rivet tool record has been created",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error creating rivet tool record:", error);
      toast({
        title: "Error",
        description: "Failed to create rivet tool record",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
        {/* Test Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="test_date"
            render={({ field }) => (
              <FormItem className="bg-muted/30 p-4 rounded-lg">
                <FormLabel className="text-[#94a3b8]">Test Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="retest_date"
            render={({ field }) => (
              <FormItem className="bg-muted/30 p-4 rounded-lg">
                <FormLabel className="text-[#94a3b8]">Retest Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Equipment Details */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="equipment_name"
            render={({ field }) => (
              <FormItem className="bg-muted/30 p-4 rounded-lg">
                <FormLabel className="text-[#94a3b8]">Equipment Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="equipment_serial"
            render={({ field }) => (
              <FormItem className="bg-muted/30 p-4 rounded-lg">
                <FormLabel className="text-[#94a3b8]">Serial Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Engineer */}
        <FormField
          control={form.control}
          name="engineer_name"
          render={({ field }) => (
            <FormItem className="bg-muted/30 p-4 rounded-lg">
              <FormLabel className="text-[#94a3b8]">Engineer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select engineer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {engineers?.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.name}>
                      {engineer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Readings Section */}
        <div className="bg-muted/30 p-4 rounded-lg space-y-4">
          <h3 className="font-medium text-[#94a3b8]">Readings (Dan)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="machine_reading_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#94a3b8]">Machine Reading 1</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="machine_reading_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#94a3b8]">Machine Reading 2</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="machine_reading_3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#94a3b8]">Machine Reading 3</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="machine_reading_4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#94a3b8]">Machine Reading 4</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="actual_reading_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#94a3b8]">Actual Reading 1</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actual_reading_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#94a3b8]">Actual Reading 2</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actual_reading_3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#94a3b8]">Actual Reading 3</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actual_reading_4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#94a3b8]">Actual Reading 4</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="bg-muted/30 p-4 rounded-lg">
              <FormLabel className="text-[#94a3b8]">Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-[#a6e15a] hover:bg-[#a6e15a]/90 text-black"
        >
          Add Rivet Tool
        </Button>
      </form>
    </Form>
  );
} 