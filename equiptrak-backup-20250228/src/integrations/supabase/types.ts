export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          company_id: string
          equipment_id: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          title: string
          created_at: string
          updated_at: string
          status: string
          last_message_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          equipment_id?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          title: string
          created_at?: string
          updated_at?: string
          status?: string
          last_message_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          equipment_id?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          title?: string
          created_at?: string
          updated_at?: string
          status?: string
          last_message_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          status: Database["public"]["Enums"]["message_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          status?: Database["public"]["Enums"]["message_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          status?: Database["public"]["Enums"]["message_status"]
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          user_id: string
          joined_at: string
          last_read_at: string | null
        }
        Insert: {
          conversation_id: string
          user_id: string
          joined_at?: string
          last_read_at?: string | null
        }
        Update: {
          conversation_id?: string
          user_id?: string
          joined_at?: string
          last_read_at?: string | null
        }
      }
    }
    Enums: {
      conversation_type: "support" | "service_request" | "general"
      message_status: "sent" | "delivered" | "read"
    }
  }
}
