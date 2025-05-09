import { UseFormReturn } from "react-hook-form";
import { FormField } from "./FormField";

interface AddressSectionProps {
  form: UseFormReturn<any>;
}

export function AddressSection({ form }: AddressSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Address</h3>
      <FormField
        form={form}
        name="address"
        label="Street Address"
        placeholder="Enter street address"
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          form={form}
          name="city"
          label="City"
          placeholder="Enter city"
        />
        <FormField
          form={form}
          name="county"
          label="County"
          placeholder="Enter county"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          form={form}
          name="postcode"
          label="Postcode"
          placeholder="Enter postcode"
        />
        <FormField
          form={form}
          name="country"
          label="Country"
          placeholder="Enter country"
        />
      </div>
    </div>
  );
}