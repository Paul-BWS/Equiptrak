import React from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

// Simple Home component
function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Home Page</h1>
      <p>This is a minimal test app</p>
      <div>
        <Link to="/company/0cd307a7-c938-49da-b005-17746587ca8a">Go to Test Company Dashboard</Link>
      </div>
    </div>
  );
}

// Simple Company Dashboard component
function TestCompanyDashboard() {
  const { companyId } = useParams();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Company Dashboard</h1>
      <p>Company ID: {companyId}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}

// Main Test App component
export default function TestApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company/:companyId" element={<TestCompanyDashboard />} />
      </Routes>
    </BrowserRouter>
  );
} 