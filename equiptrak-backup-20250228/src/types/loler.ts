export type LolerActionResult = 'PASS' | 'REMEDIAL' | 'FAIL';
export type LolerSafeToOperate = 'Yes' | 'No' | 'Remedial';

export interface LolerEquipment {
  id: string;
  name: string;
  serial_number: string;
  customer_id: string;
  type_id: string;
  next_test_date: string;
  last_test_date: string;
  status: "valid" | "upcoming" | "expired";
  profiles?: {
    company_name: string | null;
  };
  loler_service_records?: LolerServiceRecord[];
}

export interface LolerServiceRecord {
  id: string;
  created_at: string;
  updated_at: string;
  equipment_id: string;
  engineer_id: string;
  certificate_number: string;
  inspection_date: string;
  retest_date: string;
  capacity_kg: number;
  safe_to_operate: LolerSafeToOperate;

  // Action Results
  platform_condition_result: LolerActionResult;
  control_box_result: LolerActionResult;
  hydraulic_system_result: LolerActionResult;
  main_structure_result: LolerActionResult;
  oil_levels_result: LolerActionResult;
  rollers_guides_result: LolerActionResult;
  safety_mechanism_result: LolerActionResult;
  scissor_operation_result: LolerActionResult;
  securing_bolts_result: LolerActionResult;
  toe_guards_result: LolerActionResult;
  lubrication_result: LolerActionResult;

  // Action Notes
  platform_condition_notes?: string;
  control_box_notes?: string;
  hydraulic_system_notes?: string;
  main_structure_notes?: string;
  oil_levels_notes?: string;
  rollers_guides_notes?: string;
  safety_mechanism_notes?: string;
  scissor_operation_notes?: string;
  securing_bolts_notes?: string;
  toe_guards_notes?: string;
  lubrication_notes?: string;

  // Additional Fields
  observations?: string;
  qualifications: string;

  // Relationships
  engineers?: {
    name: string;
  };
  equipment?: {
    name: string;
    serial_number: string;
    customer_id: string;
    profiles?: {
      company_name: string | null;
      email: string | null;
      address: string | null;
      city: string | null;
      postcode: string | null;
    };
  };
}

export const LOLER_ACTION_ITEMS = [
  { label: 'Check Condition Of Platform', key: 'platform_condition' },
  { label: 'Check Condition Control Box', key: 'control_box' },
  { label: 'Check Condition Hydraulic System', key: 'hydraulic_system' },
  { label: 'Visual Inspection Of Main Structure', key: 'main_structure' },
  { label: 'Check Oil Levels', key: 'oil_levels' },
  { label: 'Check Rollers And Guides', key: 'rollers_guides' },
  { label: 'Check Safety Mechanism', key: 'safety_mechanism' },
  { label: 'Check Scissor Operation', key: 'scissor_operation' },
  { label: 'Check Securing Bolts', key: 'securing_bolts' },
  { label: 'Check Toe Guards', key: 'toe_guards' },
  { label: 'Check Lubrication Moving Parts', key: 'lubrication' }
] as const; 