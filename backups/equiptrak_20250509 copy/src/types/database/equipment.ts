import type { Database } from "./types";

export type Equipment = Database["public"]["Tables"]["equipment"]["Row"];
export type EquipmentInsert = Database["public"]["Tables"]["equipment"]["Insert"];
export type EquipmentUpdate = Database["public"]["Tables"]["equipment"]["Update"];
export type EquipmentType = Database["public"]["Tables"]["equipment_types"]["Row"];
export type EquipmentTypeInsert = Database["public"]["Tables"]["equipment_types"]["Insert"];
export type EquipmentTypeUpdate = Database["public"]["Tables"]["equipment_types"]["Update"];