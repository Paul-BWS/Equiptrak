import { useRouter } from "next/router";
import { useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ChatPage() {
  const router = useRouter();
  const { companyId } = router.query;
  const { session } = useAuth();
  
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    createConversation,
    sendMessage,
  } = useChat(companyId as string);

  useEffect(() => {
    // Create a new conversation if none exists
    const initializeChat = async () => {
      if (!loading && conversations.length === 0 && companyId) {
        const conversation = await createConversation({
          company_id: companyId as string,
          title: "Support Chat",
        });

        if (!conversation) {
          toast.error("Failed to create chat conversation");
        }
      }
    };

    initializeChat();
  }, [loading, conversations.length, companyId, createConversation]);

  const handleSendMessage = async (content: string) => {
    if (!currentConversation) {
      toast.error("No active conversation");
      return;
    }

    await sendMessage({
      conversation_id: currentConversation.id,
      content,
    });
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Please log in to access chat</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isAdmin={message.sender_id === session.user.id}
          />
        ))}
      </div>
      <div className="border-t p-4">
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
} 