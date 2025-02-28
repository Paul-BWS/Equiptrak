import type { Database } from "./types";

export type Engineer = Database["public"]["Tables"]["engineers"]["Row"];
export type EngineerInsert = Database["public"]["Tables"]["engineers"]["Insert"];
export type EngineerUpdate = Database["public"]["Tables"]["engineers"]["Update"];