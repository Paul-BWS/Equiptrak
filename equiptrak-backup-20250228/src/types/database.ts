export interface Profile {
  id: string;
  email: string;
  company_name: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  contact_name: string | null;
  contact_email: string | null;
  telephone: string | null;
  mobile: string | null;
  role: 'admin' | 'customer';
  created_at: string;
  updated_at: string;
  stored_password?: string;
}

export interface ServiceRecord {
  id: string;
  company_id: string;
  engineer_name: string;
  test_date: string;
  retest_date: string;
  status: string;
  certificate_number: string;
  notes: string;
  equipment1_name: string | null;
  equipment1_serial: string | null;
  equipment2_name: string | null;
  equipment2_serial: string | null;
  equipment3_name: string | null;
  equipment3_serial: string | null;
  equipment4_name: string | null;
  equipment4_serial: string | null;
  equipment5_name: string | null;
  equipment5_serial: string | null;
  equipment6_name: string | null;
  equipment6_serial: string | null;
  equipment7_name: string | null;
  equipment7_serial: string | null;
  equipment8_name: string | null;
  equipment8_serial: string | null;
  created_at: string;
  company?: {
    company_name: string;
    address: string;
    city: string;
    postcode: string;
  } | null;
}

export interface Engineer {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  company_name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  contact_name: string;
  contact_email: string;
  telephone: string;
  mobile: string;
  created_at: string;
  updated_at: string;
}
