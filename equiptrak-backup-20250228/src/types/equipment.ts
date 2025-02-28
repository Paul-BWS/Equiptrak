export interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  next_test_date: string;
  location?: string;
  manufacturer?: string;
  notes?: string;
  status: "valid" | "expired" | "upcoming";
  customer_id?: string;
  companies?: {
    company_name: string | null;
  } | null;
  equipment_types?: {
    name: string;
    description: string | null;
  } | null;
} 