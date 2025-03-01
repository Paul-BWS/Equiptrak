import { format } from "date-fns";

interface CertificateServiceInfoProps {
  testDate?: string;
  retestDate?: string;
  engineerName?: string;
}

export function CertificateServiceInfo({ 
  testDate, 
  retestDate,
  engineerName 
}: CertificateServiceInfoProps) {
  return (
    <div className="space-y-4">
      <div className="border-l-2 border-gray-200 pl-4 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-blue-600 mb-1">Test Date</h3>
          <p className="text-base">{testDate ? format(new Date(testDate), "dd/MM/yyyy") : "N/A"}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-blue-600 mb-1">Retest Date</h3>
          <p className="text-base">{retestDate ? format(new Date(retestDate), "dd/MM/yyyy") : "N/A"}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-blue-600 mb-1">Engineer</h3>
          <p className="text-base">{engineerName || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}