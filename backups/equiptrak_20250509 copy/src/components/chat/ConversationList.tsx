import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Plus } from "lucide-react";
import { Conversation } from "@/types/chat";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewConversation,
  isLoading = false,
}: ConversationListProps) {
  return (
    <div className="w-full max-w-xs border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <Button
          onClick={onNewConversation}
          className="w-full"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant={selectedId === conversation.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelect(conversation)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <div className="flex flex-col items-start text-left">
                <div className="font-medium">{conversation.title}</div>
                <div className="text-xs text-muted-foreground">
                  {conversation.last_message_at
                    ? formatDistanceToNow(new Date(conversation.last_message_at), {
                        addSuffix: true,
                      })
                    : "No messages"}
                </div>
              </div>
            </Button>
          ))}

          {conversations.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-8">
              No conversations yet
            </div>
          )}

          {isLoading && (
            <div className="text-center text-muted-foreground py-8">
              Loading conversations...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 