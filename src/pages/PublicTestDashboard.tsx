import { useParams } from "react-router-dom";

export default function PublicTestDashboard() {
  const { companyId } = useParams();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold">Public Test Dashboard</h1>
      <p>Company ID: {companyId}</p>
      <p>This is a public test page that doesn't require authentication.</p>
    </div>
  );
} 