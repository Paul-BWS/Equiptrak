import { useParams } from "react-router-dom";

export default function StandaloneTest() {
  const { companyId } = useParams();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold">Standalone Test Page</h1>
      <p>Company ID: {companyId}</p>
      <p>This is a standalone test page that doesn't use the Layout component.</p>
    </div>
  );
} 