import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message, NewMessage, NewConversation } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useChat(customerId?: string) {
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
        customer_id: newConversation.company_id,
        title: newConversation.title || "Support Chat",
        userId: session.user.id
      });
      
      // Create the conversation with minimal fields first
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          customer_id: newConversation.company_id,
          title: newConversation.title || "Support Chat",
          status: "active",
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

      console.log("Created conversation:", conversation);

      // Add both admin and customer as participants
      const { error: participantsError } = await supabase
        .from("conversation_participants")
        .insert([
          {
            conversation_id: conversation.id,
            user_id: session.user.id // Admin
          },
          {
            conversation_id: conversation.id,
            user_id: newConversation.company_id // Customer
          }
        ]);

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
          conversation_id: conversation.id,
          sender_id: session.user.id,
          content: newConversation.initial_message
        });

        const { error: messageError } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversation.id,
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
      setConversations(prev => [conversation, ...prev]);
      setCurrentConversation(conversation);
      
      return conversation;
    } catch (error) {
      console.error("Error in createConversation:", error);
      toast.error("Failed to create conversation");
      return null;
    }
  };

  // Fetch conversations for the current user and company
  useEffect(() => {
    if (!session?.user?.id || !customerId) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching conversations for:", {
          customerId,
          userId: session.user.id
        });

        // Fetch conversations with participants
        const { data, error } = await supabase
          .from("conversations")
          .select(`
            *,
            customer:customer_id (
              id,
              company_name,
              email
            ),
            participants:conversation_participants (
              user_id,
              profiles:user_id (
                id,
                company_name,
                email,
                role
              )
            )
          `)
          .or(`customer_id.eq.${customerId},conversation_participants.user_id.eq.${session.user.id}`)
          .order("last_message_at", { ascending: false });

        if (error) {
          console.error("Error fetching conversations:", {
            error,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return;
        }

        console.log("Fetched conversations:", data);

        setConversations(data || []);
        // Set the first conversation as current if exists
        if (data?.[0]) {
          setCurrentConversation(data[0]);
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
          filter: `customer_id=eq.${customerId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      conversationsSubscription.unsubscribe();
    };
  }, [session?.user?.id, customerId]);

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