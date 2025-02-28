import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Image from "@/components/ui/image";

interface CertificateHeaderProps {
  certificateNumber: string;
  title?: string;
}

export function CertificateHeader({ certificateNumber, title = "Calibration Certificate" }: CertificateHeaderProps) {
  const { data: logo } = useQuery({
    queryKey: ["company-logo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_assets")
        .select("file_path")
        .eq("asset_type", "logo")
        .maybeSingle();

      if (error) {
        console.error("Error fetching logo:", error);
        return null;
      }

      if (!data) return null;

      const { data: { publicUrl } } = supabase.storage
        .from("company_assets")
        .getPublicUrl(data.file_path);

      return publicUrl;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20">
            <Image
              src={logo || "/lovable-uploads/54776c31-b134-4ff9-960d-761e70d94856.png"}
              alt="BWS Logo"
              width={80}
              height={80}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-600">{title}</h1>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600 mb-1">Certificate Number</p>
          <p className="text-lg font-bold text-blue-600">{certificateNumber}</p>
        </div>
      </div>
      <hr className="border-gray-200" />
    </div>
  );
}