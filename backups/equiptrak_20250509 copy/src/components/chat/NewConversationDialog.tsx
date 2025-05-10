import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Equipment } from "@/types/equipment";
import { NewConversation } from "@/types/chat";

interface NewConversationDialogProps {
  equipment: Equipment[];
  onSubmit: (conversation: NewConversation) => Promise<void>;
  companyId: string;
  trigger?: React.ReactNode;
}

export function NewConversationDialog({
  equipment,
  onSubmit,
  companyId,
  trigger,
}: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"support" | "service_request" | "general">("general");
  const [equipmentId, setEquipmentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        company_id: companyId,
        equipment_id: equipmentId || undefined,
        type,
        title: title.trim(),
        initial_message: message.trim(),
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setType("general");
    setEquipmentId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>New Conversation</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter conversation title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(value: typeof type) => setType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select conversation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="service_request">Service Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Related Equipment (Optional)</Label>
            <Select
              value={equipmentId}
              onValueChange={setEquipmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {equipment.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.serial_number} - {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Initial Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              required
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Start Conversation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 