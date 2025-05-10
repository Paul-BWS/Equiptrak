import type { Database } from "./types";

type ServiceRecordEngineer = {
  name: string;
};

export type ServiceRecord = Database["public"]["Tables"]["service_records"]["Row"] & {
  engineers?: ServiceRecordEngineer | null;
};

export type ServiceRecordInsert = Database["public"]["Tables"]["service_records"]["Insert"];
export type ServiceRecordUpdate = Database["public"]["Tables"]["service_records"]["Update"];