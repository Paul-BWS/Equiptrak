import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
    <ThemeProvider defaultTheme="light" storageKey="equiptrak-theme">
      <AuthProvider>
        <Router>
          <Routes>
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
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;