import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { useState, useEffect } from "react";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CompanyDetails from "@/pages/CompanyDetails";
import AdminDashboard from "@/pages/AdminDashboard";
import { Layout } from "@/components/Layout";
import EquipmentTypes from "@/pages/EquipmentTypes";
import CompressorList from "@/pages/CompressorList";
import SpotWelderList from "@/pages/SpotWelderList";
import { CompanyAllEquipment } from "@/pages/CompanyAllEquipment";
import ServiceCertificate from "@/pages/ServiceCertificate";
import ServicePage from "@/pages/Service";
import TestPage from "@/pages/TestPage";
import ApiUnavailable from "@/pages/ApiUnavailable";
import EquipmentListPage from "@/pages/EquipmentList";
import { PublicCertificateView } from "./pages/PublicCertificateView";
import QRCodePrintPage from "@/pages/QRCodePrintPage";
import LiftServiceList from '@/pages/LiftServiceList';
import LiftServiceForm from '@/pages/LiftServiceForm';
import LiftServiceDetail from '@/pages/LiftServiceDetail';
import LiftCertificate from '@/pages/LiftCertificate';
import PublicLiftCertificateView from '@/pages/PublicLiftCertificateView';

// Create a client
const queryClient = new QueryClient();

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="mb-4 text-xl font-bold text-red-700">Something went wrong</h2>
        <div className="mb-4 rounded bg-white p-2 text-left">
          <p className="font-mono text-sm text-red-500">{error.message}</p>
        </div>
        <p className="mb-4 text-sm text-gray-700">
          Please try refreshing the page or logging in again.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.href = '/login'}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Go to Login
          </button>
          <button
            onClick={resetErrorBoundary}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

// API Status Provider Component (doesn't use React Router)
const ApiStatusProvider = ({ children }) => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // First try the non-API health endpoint that doesn't require auth
        let response = await fetch('/health');
        
        if (response.ok) {
          console.log('API server base health check passed');
          setApiStatus('online');
          return; // If server is running, we're good to go
        }
        
        // If the first check fails, try the API health endpoint
        response = await fetch('/api/health');
        
        if (response.ok) {
          console.log('API server API health check passed');
          setApiStatus('online');
        } else if (response.status === 401 || response.status === 403) {
          // If we got an auth error, the server is still running
          console.log('API server is running but returned auth error');
          setApiStatus('online');
        } else if (response.status === 404) {
          // If we get a 404, the server is running but endpoint doesn't exist
          console.log('API server is running but health endpoint not found');
          setApiStatus('online');
        } else {
          console.error('API server health check failed with status:', response.status);
          setApiStatus('offline');
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus('offline');
      }
    };
    
    // Check immediately
    checkApiStatus();
    
    // Then check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // If we're still checking or if the API is online, render children
  if (apiStatus === 'checking' || apiStatus === 'online') {
    return <>{children}</>;
  }
  
  // Otherwise, show the API unavailable page
  return <ApiUnavailable />;
};

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'user' }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider defaultTheme="light" storageKey="equiptrak-theme">
        <QueryClientProvider client={queryClient}>
          <Router>
            <AuthProvider>
              <ApiStatusProvider>
                <Routes>
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/api-unavailable" element={<ApiUnavailable />} />
                  <Route path="/login" element={<Login />} />
                  
                  <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to="/admin" replace />} />
                    
                    <Route path="/admin" element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/company/:id" element={
                      <ProtectedRoute>
                        <CompanyDetails />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/equipment-types" element={
                      <ProtectedRoute>
                        <EquipmentTypes />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/equipment-list" element={
                      <ProtectedRoute requiredRole="admin">
                        <EquipmentListPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/compressors" element={
                      <ProtectedRoute>
                        <CompressorList />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/spot-welders" element={
                      <ProtectedRoute>
                        <SpotWelderList />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/company/:id/equipment" element={
                      <ProtectedRoute>
                        <CompanyAllEquipment />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/service-certificate/:id" element={
                      <ProtectedRoute>
                        <ServiceCertificate />
                      </ProtectedRoute>
                    } />
                    
                    {/* Add QR code routes */}
                    <Route path="/service-certificate/:recordId/qr" element={
                      <ProtectedRoute>
                        <QRCodePrintPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/certificate/:id/qr" element={
                      <ProtectedRoute>
                        <QRCodePrintPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/service" element={
                      <ProtectedRoute>
                        <ServicePage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Public route for viewing certificates via QR code - no authentication needed */}
                    <Route path="/public-certificate/:id" element={<PublicCertificateView />} />

                    {/* Lift Service Routes */}
                    <Route path="/lift-service" element={
                      <ProtectedRoute>
                        <LiftServiceList />
                      </ProtectedRoute>
                    } />

                    <Route path="/lift-service/new" element={
                      <ProtectedRoute>
                        <LiftServiceForm />
                      </ProtectedRoute>
                    } />

                    <Route path="/lift-service/edit/:id" element={
                      <ProtectedRoute>
                        <LiftServiceForm />
                      </ProtectedRoute>
                    } />

                    <Route path="/lift-service/:id" element={
                      <ProtectedRoute>
                        <LiftServiceDetail />
                      </ProtectedRoute>
                    } />

                    <Route path="/lift-certificate/:id" element={
                      <ProtectedRoute>
                        <LiftCertificate />
                      </ProtectedRoute>
                    } />

                    <Route path="/lift-certificate/:id/qr" element={
                      <ProtectedRoute>
                        <QRCodePrintPage />
                      </ProtectedRoute>
                    } />

                    {/* Public Certificate Routes */}
                    <Route path="/public/lift-certificate/:id" element={<PublicLiftCertificateView />} />
                  </Route>
                </Routes>
                <Toaster />
              </ApiStatusProvider>
            </AuthProvider>
          </Router>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;