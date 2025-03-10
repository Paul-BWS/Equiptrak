import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface BookEquipmentModalProps {
  equipmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookEquipmentModal({ equipmentId, open, onOpenChange }: BookEquipmentModalProps) {
  const [bookingDate, setBookingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!bookingDate) {
      toast({
        title: "Error",
        description: "Please select a booking date",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          booking_status: 'booked',
          booking_date: bookingDate,
          booking_notes: bookingNotes || null
        })
        .eq('id', equipmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Equipment has been booked for retest",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['all-equipment'] });
      queryClient.invalidateQueries({ queryKey: ['customer-equipment'] });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book equipment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Equipment for Retest</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="booking-date" className="text-right">
              Date
            </Label>
            <Input
              id="booking-date"
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="booking-notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="booking-notes"
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              className="col-span-3"
              placeholder="Optional notes about the booking"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Booking...' : 'Book Retest'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 