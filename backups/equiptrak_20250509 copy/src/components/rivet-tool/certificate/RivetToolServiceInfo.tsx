import { format } from "date-fns";

interface RivetToolServiceInfoProps {
  testDate: string;
  retestDate: string;
  engineerName: string | null;
  equipmentName: string | null;
  serialNumber: string | null;
}

export function RivetToolServiceInfo({ 
  testDate, 
  retestDate, 
  engineerName,
  equipmentName,
  serialNumber
}: RivetToolServiceInfoProps) {
  return (
    <div className="space-y-4">
      <div className="border-l-2 border-gray-200 pl-4 space-y-2">
        <div>
          <h3 className="text-base font-semibold text-blue-600 mb-0.5">Equipment Name</h3>
          <p className="text-base">{equipmentName || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-blue-600 mb-0.5">Serial Number</h3>
          <p className="text-base">{serialNumber || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-blue-600 mb-0.5">Test Date</h3>
          <p className="text-base">{format(new Date(testDate), "dd/MM/yyyy")}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-blue-600 mb-0.5">Retest Date</h3>
          <p className="text-base">{format(new Date(retestDate), "dd/MM/yyyy")}</p>
        </div>
        {engineerName && (
          <div>
            <h3 className="text-base font-semibold text-blue-600 mb-0.5">Engineer</h3>
            <p className="text-base">{engineerName}</p>
          </div>
        )}
      </div>
    </div>
  );
}