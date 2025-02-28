import { format } from "date-fns";
import { Link } from "react-router-dom";

interface ServiceMobileListProps {
  certificates: any[];
}

export function ServiceMobileList({ certificates }: ServiceMobileListProps) {
  if (!certificates || certificates.length === 0) {
    return <div className="text-center py-8">No service records found.</div>;
  }

  return (
    <div className="space-y-4 md:hidden">
      {certificates.map((certificate) => {
        // Determine if certificate is active or expired
        const isActive = certificate.status === "Active";
        const issueDate = certificate.issue_date ? new Date(certificate.issue_date) : null;
        const retestDate = certificate.retest_date ? new Date(certificate.retest_date) : null;
        
        return (
          <Link 
            key={certificate.id} 
            to={`/admin/service/certificate/${certificate.id}`}
            className="block"
          >
            <div className="bg-background border rounded-lg overflow-hidden">
              <div className="flex items-center p-4 border-b">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'} mr-3`}></div>
                <div className="flex-1">
                  <div className="text-lg font-medium">
                    {issueDate ? format(issueDate, "dd/MM/yyyy") : "N/A"}
                  </div>
                  <div className="text-muted-foreground">
                    {certificate.equipment?.[0]?.name || "Unknown Equipment"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium">
                    {retestDate ? format(retestDate, "d MMM yyyy") : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
} 