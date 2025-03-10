import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  label?: string;
}

export function WhatsAppButton({
  phoneNumber,
  message = '',
  className = '',
  variant = 'default',
  size = 'default',
  showIcon = true,
  label = 'Contact via WhatsApp'
}: WhatsAppButtonProps) {
  // Format phone number (remove any non-digit characters)
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  
  // Handle click to open WhatsApp
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={`bg-[#25D366] hover:bg-[#128C7E] text-white ${className}`}
      onClick={handleClick}
    >
      {showIcon && <MessageSquare className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
}

export default WhatsAppButton; 