import { useNavigate, useParams } from "react-router-dom";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { useCompany } from "@/hooks/useCompany";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";

export function ChatPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = session?.user.user_metadata.role === 'admin';
  
  // For admin view, we use the customerId from params
  // For customer view, we use their own id
  const effectiveCustomerId = isAdmin ? customerId : session?.user.id;
  
  const { company, isLoading: isLoadingCompany } = useCompany(effectiveCustomerId);
  const { 
    messages, 
    currentConversation,
    sendMessage,
    createConversation,
    loading: isLoadingChat 
  } = useChat(effectiveCustomerId);

  console.log("Chat Page State:", {
    customerId: effectiveCustomerId,
    company,
    currentConversation,
    messagesCount: messages?.length,
    isLoadingCompany,
    isLoadingChat,
    isAdmin
  });

  const handleBack = () => {
    if (isAdmin) {
      navigate(`/admin/customer/${effectiveCustomerId}/details`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleEdit = () => {
    // Will implement later
  };

  const handleSendMessage = async (content: string) => {
    console.log("Sending message:", { content, currentConversation });
    
    try {
      if (!currentConversation) {
        // Create a new conversation if none exists
        console.log("Creating new conversation...");
        const conversation = await createConversation({
          company_id: effectiveCustomerId!,
          title: "Support Chat",
          initial_message: content
        });
        console.log("Created conversation:", conversation);
        if (!conversation) return;
      } else {
        // Send message to existing conversation
        console.log("Sending to existing conversation...");
        await sendMessage({
          conversation_id: currentConversation.id,
          content
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoadingCompany || isLoadingChat) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading chat...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Company not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyHeader
        companyName={company.company_name}
        onBack={handleBack}
        onEdit={isAdmin ? handleEdit : undefined}
        hideChatButton={true}
      />

      <div className="border rounded-lg">
        <div className="flex flex-col h-[600px]">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages?.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages?.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={message.sender_id === session?.user.id}
                />
              ))
            )}
          </div>

          {/* Input area */}
          <div className="border-t p-4">
            <ChatInput onSend={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage; 