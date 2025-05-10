export type PullTestResult = 'pass' | 'fail' | null;
export type ConditionStatus = 'good' | 'worn' | 'needs_replacement' | null;

export interface RivetToolRecord {
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
  rivet_tool_model: string | null;
  pull_test_result: PullTestResult;
  mandrel_condition: ConditionStatus;
  jaw_condition: ConditionStatus;
  created_at: string;
}

export interface RivetToolFormData {
  engineer_name: string;
  test_date: string;
  retest_date: string;
  equipment_name: string;
  equipment_serial: string;
  rivet_tool_model: string;
  pull_test_result: PullTestResult;
  mandrel_condition: ConditionStatus;
  jaw_condition: ConditionStatus;
  notes: string;
} 