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
import { addMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEngineers } from "@/hooks/engineers/useEngineers";
import { RivetToolRecord } from "@/types/database/rivet-tools";

const formSchema = z.object({
  engineer_name: z.string().min(1, "Engineer name is required"),
  test_date: z.string().min(1, "Test date is required"),
  equipment_name: z.string().min(1, "Equipment name is required"),
  equipment_serial: z.string().min(1, "Serial number is required"),
  rivet_tool_model: z.string().min(1, "Model is required"),
  pull_test_result: z.enum(["pass", "fail"]).nullable(),
  mandrel_condition: z.enum(["good", "worn", "needs_replacement"]).nullable(),
  jaw_condition: z.enum(["good", "worn", "needs_replacement"]).nullable(),
  notes: z.string().optional(),
});

interface EditRivetToolFormProps {
  customerId: string;
  record: RivetToolRecord;
  onSuccess?: () => void;
}

export function EditRivetToolForm({
  customerId,
  record,
  onSuccess,
}: EditRivetToolFormProps) {
  const { toast } = useToast();
  const { data: engineers } = useEngineers();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      engineer_name: record.engineer_name,
      test_date: record.test_date.split("T")[0],
      equipment_name: record.equipment_name,
      equipment_serial: record.equipment_serial,
      rivet_tool_model: record.rivet_tool_model || "",
      pull_test_result: record.pull_test_result,
      mandrel_condition: record.mandrel_condition,
      jaw_condition: record.jaw_condition,
      notes: record.notes || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const retest_date = addMonths(new Date(values.test_date), 3)
        .toISOString()
        .split("T")[0];

      const { error } = await supabase
        .from("rivet_tool_records")
        .update({
          ...values,
          retest_date,
        })
        .eq("id", record.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rivet tool record has been updated",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error updating rivet tool record:", error);
      toast({
        title: "Error",
        description: "Failed to update rivet tool record",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
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
        </div>

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

        <FormField
          control={form.control}
          name="rivet_tool_model"
          render={({ field }) => (
            <FormItem className="bg-muted/30 p-4 rounded-lg">
              <FormLabel className="text-[#94a3b8]">Model</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="pull_test_result"
            render={({ field }) => (
              <FormItem className="bg-muted/30 p-4 rounded-lg">
                <FormLabel className="text-[#94a3b8]">Pull Test Result</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mandrel_condition"
            render={({ field }) => (
              <FormItem className="bg-muted/30 p-4 rounded-lg">
                <FormLabel className="text-[#94a3b8]">Mandrel Condition</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="worn">Worn</SelectItem>
                    <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jaw_condition"
            render={({ field }) => (
              <FormItem className="bg-muted/30 p-4 rounded-lg">
                <FormLabel className="text-[#94a3b8]">Jaw Condition</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="worn">Worn</SelectItem>
                    <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          Update Rivet Tool
        </Button>
      </form>
    </Form>
  );
} 