import { format } from "date-fns";

interface ServiceInfoProps {
  testDate: string;
  retestDate: string;
  engineerName: string;
}

export function CertificateServiceInfo({ 
  testDate, 
  retestDate, 
  engineerName 
}: ServiceInfoProps) {
  return (
    <div className="space-y-4">
      <div className="border-l-2 border-gray-200 pl-4 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-blue-600 mb-1">Test Date</h3>
          <p className="text-base">{format(new Date(testDate), "dd/MM/yyyy")}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-blue-600 mb-1">Retest Date</h3>
          <p className="text-base">{format(new Date(retestDate), "dd/MM/yyyy")}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-blue-600 mb-1">Engineer</h3>
          <p className="text-base">{engineerName}</p>
        </div>
      </div>
    </div>
  );
}