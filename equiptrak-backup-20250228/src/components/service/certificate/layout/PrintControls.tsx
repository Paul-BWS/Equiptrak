import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Mail, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

interface PrintControlsProps {
  onBack?: () => void;
  onClose?: () => void;
  onPrint: () => void;
  customerEmail?: string;
  certificateNumber?: string;
  customerName?: string;
  equipmentName?: string;
  isModal?: boolean;
  className?: string;
}

export function PrintControls({ 
  onBack, 
  onClose,
  onPrint, 
  customerEmail,
  certificateNumber,
  customerName,
  equipmentName,
  isModal,
  className
}: PrintControlsProps) {
  const { toast } = useToast();

  const handleEmailCertificate = async () => {
    if (!customerEmail || !certificateNumber || !customerName || !equipmentName) {
      toast({
        title: "Error",
        description: "Missing required information for sending email",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-certificate', {
        body: {
          to: customerEmail,
          certificateNumber,
          customerName,
          equipmentName,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Certificate has been sent via email",
      });
    } catch (error) {
      console.error('Error sending certificate:', error);
      toast({
        title: "Error",
        description: "Failed to send certificate via email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("w-full border-b", className)}>
      <div className="container mx-auto py-4 px-8">
        <div className="flex justify-between items-center">
          {onBack ? (
            <Button variant="ghost" onClick={onBack} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose} size="sm">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
          <div className="flex gap-2">
            <Button 
              onClick={onPrint}
              variant="outline"
              size="sm"
              className="dark:bg-[#a6e15a] dark:text-background dark:hover:bg-[#a6e15a]/90 dark:border-0"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Certificate
            </Button>
            {customerEmail && (
              <Button variant="outline" onClick={handleEmailCertificate} size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email Certificate
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}