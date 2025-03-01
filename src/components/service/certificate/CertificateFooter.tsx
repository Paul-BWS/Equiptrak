import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Image from "@/components/ui/image";
import { ReactNode } from "react";
import { Signature } from "./Signature";
import { CertificateQRCode } from "./QRCode";

interface CertificateFooterProps {
  notes?: string;
  certificateId: string;
}

export function CertificateFooter({ notes, certificateId }: CertificateFooterProps) {
  console.log('Rendering footer with certificateId:', certificateId);
  
  return (
    <div className="mt-auto pt-8">
      {notes && (
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2">Notes</h3>
          <p className="whitespace-pre-line">{notes}</p>
        </div>
      )}
      
      <div className="flex justify-between items-end mt-12 mb-6">
        <div className="text-sm">
          <p className="font-bold">BWS LTD</p>
          <p>232 Briscoe Lane</p>
          <p>Manchester M40 2XG</p>
          <p>Tel: 0161 223 9843</p>
          <p>www.basicwelding.co.uk</p>
        </div>
        
        <div className="flex flex-col items-center">
          <CertificateQRCode certificateId={certificateId} />
          <p className="text-xs mt-1 text-gray-500">ID: {certificateId.substring(0, 8)}...</p>
        </div>
        
        <div className="flex flex-col items-center">
          <Signature />
          <p className="text-sm mt-1">Authorized Signature</p>
          <p className="text-xs">Basic Welding Services</p>
        </div>
      </div>
    </div>
  );
}