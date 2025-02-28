export type CompressorRecord = {
  id: string;
  company_id: string;
  engineer_name: string;
  test_date: string;
  retest_date: string;
  status: string;
  certificate_number: string;
  notes: string | null;
  equipment_name: string;
  equipment_serial: string;
  pressure_test_result: string | null;
  safety_valve_test: string | null;
  oil_level: string | null;
  belt_condition: string | null;
  compressor_model: string | null;
  created_at: string;
  company?: {
    company_name: string;
    address: string;
    city: string;
    postcode: string;
  } | null;
};

export type CompressorServiceRecord = CompressorRecord; 