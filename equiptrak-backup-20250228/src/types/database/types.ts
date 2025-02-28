export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      engineers: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          last_test_date: string
          name: string
          next_test_date: string
          serial_number: string
          status: string
          type_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          last_test_date: string
          name: string
          next_test_date: string
          serial_number: string
          status: string
          type_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          last_test_date?: string
          name?: string
          next_test_date?: string
          serial_number?: string
          status?: string
          type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "equipment_types"
            referencedColumns: ["id"]
          }
        ]
      }
      equipment_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          country: string | null
          county: string | null
          created_at: string
          email: string | null
          id: string
          mobile: string | null
          postcode: string | null
          role: Database["public"]["Enums"]["user_role"]
          telephone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          email?: string | null
          id: string
          mobile?: string | null
          postcode?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mobile?: string | null
          postcode?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_records: {
        Row: {
          certificate_number: string
          created_at: string
          engineer_id: string
          equipment_id: string
          equipment1_name: string
          equipment1_serial: string
          equipment2_name: string | null
          equipment2_serial: string | null
          equipment3_name: string | null
          equipment3_serial: string | null
          equipment4_name: string | null
          equipment4_serial: string | null
          equipment5_name: string | null
          equipment5_serial: string | null
          equipment6_name: string | null
          equipment6_serial: string | null
          equipment7_name: string | null
          equipment7_serial: string | null
          equipment8_name: string | null
          equipment8_serial: string | null
          id: string
          notes: string | null
          retest_date: string
          status: Database["public"]["Enums"]["service_status"]
          test_date: string
          updated_at: string
        }
        Insert: {
          certificate_number: string
          created_at?: string
          engineer_id: string
          equipment_id: string
          equipment1_name: string
          equipment1_serial: string
          equipment2_name?: string | null
          equipment2_serial?: string | null
          equipment3_name?: string | null
          equipment3_serial?: string | null
          equipment4_name?: string | null
          equipment4_serial?: string | null
          equipment5_name?: string | null
          equipment5_serial?: string | null
          equipment6_name?: string | null
          equipment6_serial?: string | null
          equipment7_name?: string | null
          equipment7_serial?: string | null
          equipment8_name?: string | null
          equipment8_serial?: string | null
          id?: string
          notes?: string | null
          retest_date: string
          status?: Database["public"]["Enums"]["service_status"]
          test_date: string
          updated_at?: string
        }
        Update: {
          certificate_number?: string
          created_at?: string
          engineer_id?: string
          equipment_id?: string
          equipment1_name?: string
          equipment1_serial?: string
          equipment2_name?: string | null
          equipment2_serial?: string | null
          equipment3_name?: string | null
          equipment3_serial?: string | null
          equipment4_name?: string | null
          equipment4_serial?: string | null
          equipment5_name?: string | null
          equipment5_serial?: string | null
          equipment6_name?: string | null
          equipment6_serial?: string | null
          equipment7_name?: string | null
          equipment7_serial?: string | null
          equipment8_name?: string | null
          equipment8_serial?: string | null
          id?: string
          notes?: string | null
          retest_date?: string
          status?: Database["public"]["Enums"]["service_status"]
          test_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_records_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          }
        ]
      }
      spot_welders: {
        Row: {
          cooling_system_type: string | null
          created_at: string
          electrode_force: number | null
          equipment_id: string
          id: string
          max_current: number | null
          updated_at: string
        }
        Insert: {
          cooling_system_type?: string | null
          created_at?: string
          electrode_force?: number | null
          equipment_id: string
          id?: string
          max_current?: number | null
          updated_at?: string
        }
        Update: {
          cooling_system_type?: string | null
          created_at?: string
          electrode_force?: number | null
          equipment_id?: string
          id?: string
          max_current?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spot_welders_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_certificate_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      service_status: "valid" | "upcoming" | "expired"
      user_role: "admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never