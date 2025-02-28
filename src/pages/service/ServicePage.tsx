import { useParams } from "react-router-dom";
import { ServiceTable } from "@/components/service/ServiceTable";
import { PageHeader } from "@/components/PageHeader";
import { NewServiceRecord } from "@/components/service/modals/NewServiceRecord";

export function ServicePage() {
  const { customerId } = useParams<{ customerId: string }>();
  
  if (!customerId) {
    return <div>Customer ID is required</div>;
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Service Records" />
        <NewServiceRecord 
          customerId={customerId} 
          onSuccess={() => {
            // Refresh the table data
            window.location.reload();
          }} 
        />
      </div>
      <ServiceTable customerId={customerId} />
    </div>
  );
} 