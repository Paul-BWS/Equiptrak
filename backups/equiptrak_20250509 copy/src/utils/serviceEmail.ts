import { toast } from "@/hooks/use-toast";

export const sendServiceReminder = async (equipmentName: string, email: string) => {
  try {
    const response = await fetch('/api/send-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        equipmentName,
      }),
    });

    if (response.ok) {
      toast({
        title: "Reminder Sent",
        description: `Email reminder sent for ${equipmentName}`,
      });
    } else {
      throw new Error('Failed to send reminder');
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to send reminder email",
      variant: "destructive",
    });
  }
};