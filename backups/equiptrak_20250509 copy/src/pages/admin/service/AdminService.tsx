import { useParams } from "react-router-dom";
import { ServiceTable } from "@/components/service/ServiceTable";
import { PageHeader } from "@/components/PageHeader";
import { AddServiceButton } from "@/components/service/AddServiceButton";

export function AdminService() {
  const { customerId } = useParams<{ customerId: string }>();
  
  if (!customerId) {
    return <div>Customer ID is required</div>;
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Service Records" />
        <AddServiceButton customerId={customerId} />
      </div>
      <ServiceTable customerId={customerId} />
    </div>
  );
} 