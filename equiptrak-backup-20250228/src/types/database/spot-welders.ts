type SpotWelderEngineer = {
  name: string;
};

type SpotWelderEquipmentProfile = {
  company_name?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  postcode?: string | null;
};

export type SpotWelderRecord = {
  id: string;
  company_id: string;
  engineer_name: string;
  test_date: string;
  retest_date: string;
  status: string;
  certificate_number: string;
  notes?: string | null;
  equipment_name: string;
  equipment_serial: string;
  voltage_max?: number | null;
  voltage_min?: number | null;
  air_pressure?: number | null;
  tip_pressure?: number | null;
  length?: number | null;
  diameter?: number | null;
  welding_time_1?: number | null;
  welding_time_2?: number | null;
  welding_time_3?: number | null;
  welding_time_4?: number | null;
  machine_time_1?: number | null;
  machine_time_2?: number | null;
  machine_time_3?: number | null;
  machine_time_4?: number | null;
  welding_current_1?: number | null;
  welding_current_2?: number | null;
  welding_current_3?: number | null;
  welding_current_4?: number | null;
  machine_current_1?: number | null;
  machine_current_2?: number | null;
  machine_current_3?: number | null;
  machine_current_4?: number | null;
  created_at?: string;
  company?: {
    company_name: string;
    address: string;
    city: string;
    postcode: string;
  } | null;
};

export type SpotWelderEquipment = {
  id: string;
  name: string;
  serial_number: string;
  next_test_date: string;
  status: 'valid' | 'expired' | 'upcoming';
  customer_id: string;
};

export type SpotWelderServiceRecord = SpotWelderRecord & {
  engineers?: SpotWelderEngineer | null;
};