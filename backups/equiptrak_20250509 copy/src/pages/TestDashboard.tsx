import { useParams } from "react-router-dom";

export default function TestDashboard() {
  const { companyId } = useParams();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold">Test Dashboard</h1>
      <p>Company ID: {companyId}</p>
    </div>
  );
} 