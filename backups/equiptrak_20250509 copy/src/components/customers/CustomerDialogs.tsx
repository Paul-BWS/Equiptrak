import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const companyFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  telephone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
});

interface CustomerDialogsProps {
  isAddDialogOpen: boolean;
  companyToDelete: string | null;
  onAddDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (id: string | null) => void;
  onDeleteConfirm: (id: string) => void;
}

export function CustomerDialogs({
  isAddDialogOpen,
  companyToDelete,
  onAddDialogChange,
  onDeleteDialogChange,
  onDeleteConfirm,
}: CustomerDialogsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      company_name: "",
      telephone: "",
      address: "",
      city: "",
      county: "",
      postcode: "",
      country: "United Kingdom",
    },
  });

  const onSubmit = async (values: z.infer<typeof companyFormSchema>) => {
    try {
      const { error } = await supabase
        .from("companies")
        .insert({
          ...values,
          country: values.country || "United Kingdom",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company added successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["companies"] });
      onAddDialogChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={onAddDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telephone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="e.g. 01234 567890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>County</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Add Company</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!companyToDelete} onOpenChange={() => onDeleteDialogChange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This action cannot be undone.
              All associated contacts and equipment will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onDeleteDialogChange(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => companyToDelete && onDeleteConfirm(companyToDelete)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}