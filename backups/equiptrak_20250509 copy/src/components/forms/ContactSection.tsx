import { UseFormReturn } from "react-hook-form";
import { FormField } from "./FormField";

interface ContactSectionProps {
  form: UseFormReturn<any>;
}

export function ContactSection({ form }: ContactSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contact Person</h3>
      <FormField
        form={form}
        name="contact_name"
        label="Contact Name"
      />
      <FormField
        form={form}
        name="contact_email"
        label="Contact Email"
      />
    </div>
  );
}