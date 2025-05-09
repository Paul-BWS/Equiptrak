import { useParams } from "react-router-dom";

export default function SimpleCompanyDashboard() {
  const { companyId } = useParams();
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Simple Company Dashboard
      </h1>
      <p>Company ID: {companyId}</p>
      <p>This is a simple company dashboard with minimal dependencies.</p>
      
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <p><strong>Debug Info:</strong></p>
        <p>Current URL: {window.location.href}</p>
        <p>Pathname: {window.location.pathname}</p>
      </div>
    </div>
  );
} 