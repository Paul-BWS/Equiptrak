export interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  company_id?: string;
  status?: string;
  type?: string;
  next_test_date?: string;
  last_test_date?: string;
  created_at?: string;
  updated_at?: string;
  location?: string;
  manufacturer?: string;
  notes?: string;
  equipment_types?: {
    name: string;
    description: string | null;
  } | null;
} 