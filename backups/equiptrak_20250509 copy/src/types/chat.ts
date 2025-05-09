import { Database } from "@/integrations/supabase/types";
import { Equipment } from "@/types/equipment";
import { Profile } from "@/types/database";

export type ConversationType = Database["public"]["Enums"]["conversation_type"];
export type MessageStatus = Database["public"]["Enums"]["message_status"];

export interface Conversation {
  id: string;
  customer_id: string;
  equipment_id?: string;
  type: ConversationType;
  title: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'archived';
  last_message_at: string;
  equipment?: Equipment;
  customer?: {
    id: string;
    company_name: string;
    email: string;
  };
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    company_name: string;
    email: string;
  };
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  created_at: string;
}

// Helper type for creating a new conversation
export interface NewConversation {
  company_id: string;
  equipment_id?: string;
  type?: ConversationType;
  title?: string;
  initial_message?: string;
}

// Helper type for sending a new message
export interface NewMessage {
  conversation_id: string;
  content: string;
} 