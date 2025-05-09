import { z } from "zod";

export type Customer = {
  id: string;
  company_name: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  telephone: string | null;
  role: 'admin' | 'customer';
};

export const customerFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  telephone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_email: z.string().email("Invalid email address").min(1, "Contact email is required"),
  role: z.enum(["admin", "customer"]).default("customer"),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;