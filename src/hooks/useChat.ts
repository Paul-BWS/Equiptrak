import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message, NewMessage, NewConversation } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useChat(companyId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  // Create a new conversation
  const createConversation = async (newConversation: NewConversation) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to create a conversation");
      return null;
    }

    try {
      console.log("Creating new conversation:", {
        company_id: newConversation.company_id,
        title: newConversation.title || "Support Chat",
        userId: session.user.id
      });
      
      // Create the conversation with minimal fields first
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          company_id: newConversation.company_id,
          title: newConversation.title,
          status: 'active',
        })
        .select()
        .single();

      if (conversationError) {
        console.error("Error creating conversation:", {
          error: conversationError,
          details: conversationError.details,
          hint: conversationError.hint,
          code: conversationError.code
        });
        toast.error("Failed to create conversation: " + conversationError.message);
        return null;
      }

      console.log("Created conversation:", conversationData);

      // Add both admin and customer as participants
      const { data: conversationParticipants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          *,
          companies (
            name,
            email
          )
        `)
        .or(`company_id.eq.${newConversation.company_id},conversation_participants.user_id.eq.${session.user.id}`);

      if (participantsError) {
        console.error("Error adding participants:", {
          error: participantsError,
          details: participantsError.details,
          hint: participantsError.hint,
          code: participantsError.code
        });
        toast.error("Created conversation but failed to add participants");
      }

      // Add the initial message
      if (newConversation.initial_message) {
        console.log("Sending initial message:", {
          conversation_id: conversationData.id,
          sender_id: session.user.id,
          content: newConversation.initial_message
        });

        const { error: messageError } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationData.id,
            sender_id: session.user.id,
            content: newConversation.initial_message,
          });

        if (messageError) {
          console.error("Error sending initial message:", {
            error: messageError,
            details: messageError.details,
            hint: messageError.hint,
            code: messageError.code
          });
          toast.error("Created chat but failed to send first message");
        }
      }

      // Update local state
      setConversations(prev => [conversationData, ...prev]);
      setCurrentConversation(conversationData);
      
      return conversationData;
    } catch (error) {
      console.error("Error in createConversation:", error);
      toast.error("Failed to create conversation");
      return null;
    }
  };

  // Fetch conversations for the current user and company
  useEffect(() => {
    if (!session?.user?.id || !companyId) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching conversations for:", {
          companyId,
          userId: session.user.id
        });

        // Fetch conversations with participants
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .eq('company_id', companyId);

        if (conversationsError) {
          console.error("Error fetching conversations:", {
            error: conversationsError,
            details: conversationsError.details,
            hint: conversationsError.hint,
            code: conversationsError.code
          });
          return;
        }

        console.log("Fetched conversations:", conversations);

        setConversations(conversations || []);
        // Set the first conversation as current if exists
        if (conversations?.[0]) {
          setCurrentConversation(conversations[0]);
        }
      } catch (error) {
        console.error("Error in fetchConversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to conversation changes
    const conversationsSubscription = supabase
      .channel("conversations-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      conversationsSubscription.unsubscribe();
    };
  }, [session?.user?.id, companyId]);

  // Fetch messages for the current conversation
  useEffect(() => {
    if (!currentConversation?.id || !session?.user?.id) return;

    const fetchMessages = async () => {
      try {
        console.log("Fetching messages for conversation:", {
          conversationId: currentConversation.id,
          userId: session.user.id
        });

        const { data, error } = await supabase
          .from("messages")
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey (
              id,
              company_name,
              email
            )
          `)
          .eq("conversation_id", currentConversation.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", {
            error,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return;
        }

        console.log("Fetched messages:", data);

        setMessages(data || []);
      } catch (error) {
        console.error("Error in fetchMessages:", error);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel(`messages-${currentConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${currentConversation.id}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          setMessages(current => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [currentConversation?.id, session?.user?.id]);

  // Send a new message
  const sendMessage = async (newMessage: NewMessage) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to send messages");
      return;
    }

    try {
      console.log("Sending message:", {
        conversation_id: newMessage.conversation_id,
        sender_id: session.user.id,
        content: newMessage.content
      });

      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: newMessage.conversation_id,
          sender_id: session.user.id,
          content: newMessage.content,
        });

      if (error) {
        console.error("Error sending message:", {
          error,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error("Failed to send message: " + error.message);
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast.error("Failed to send message");
    }
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    createConversation,
    sendMessage,
  };
} 