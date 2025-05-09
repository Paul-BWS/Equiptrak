import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-2 mb-4",
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {isOwnMessage ? "Me" : message.sender?.company_name?.[0] || "U"}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {format(new Date(message.created_at), "HH:mm")}
        </span>
      </div>
    </div>
  );
} 