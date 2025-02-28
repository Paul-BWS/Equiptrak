import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Image from "@/components/ui/image";
import { ReactNode } from "react";

interface CertificateFooterProps {
  notes?: string | null;
  children?: ReactNode;
}

export function CertificateFooter({ notes, children }: CertificateFooterProps) {
  const { data: signature } = useQuery({
    queryKey: ["company-signature"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_assets")
        .select("file_path")
        .eq("asset_type", "signature")
        .maybeSingle();

      if (error) {
        console.error("Error fetching signature:", error);
        return null;
      }

      if (!data) return null;

      const { data: { publicUrl } } = supabase.storage
        .from("company_assets")
        .getPublicUrl(data.file_path);

      console.log("Signature URL:", publicUrl);
      return publicUrl;
    },
  });

  return (
    <div className="mt-8 space-y-6">
      {notes && (
        <div className="space-y-1 mb-4">
          <h3 className="font-medium">Additional Notes</h3>
          <p className="text-sm text-muted-foreground">{notes}</p>
        </div>
      )}
      
      <div className="flex justify-between items-start pt-4">
        <div className="text-sm">
          <p className="font-semibold">BWS LTD</p>
          <p>232 Briscoe Lane</p>
          <p>Manchester M40 2XG</p>
          <p>Tel: 0161 223 1843</p>
          <p>www.basicwelding.co.uk</p>
        </div>
        <div className="text-right">
          {signature && (
            <div className="h-12 flex items-end justify-end mb-2">
              <img
                src={signature}
                alt="Digital Signature"
                width={150}
                height={48}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Authorized Signature</p>
              <p className="text-xs text-muted-foreground">Basic Welding Services</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}