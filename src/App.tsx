import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import ProductsList from "@/pages/ProductsList";
import ProductDetailsPage from "@/pages/ProductDetailsPage";
import WorkOrdersList from "@/pages/WorkOrdersList";
import NewWorkOrder from "@/pages/NewWorkOrder";
import EquipmentListPage from "@/pages/EquipmentList";

// Create a client
const queryClient = new QueryClient();

// Root redirect component
const RootRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? "/admin" : "/dashboard"} replace />;
};

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'user' }) => {
  const { user, isLoading } = useAuth();
  console.log('ProtectedRoute - User:', user?.email, 'Role:', user?.role, 'Required Role:', requiredRole);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check it
  if (requiredRole) {
    if (user.role !== requiredRole) {
      console.log('ProtectedRoute - Wrong role, redirecting to appropriate dashboard');
      // Redirect admin to admin dashboard, users to user dashboard
      return <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="equiptrak-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<Layout />}>
                <Route path="/" element={<RootRedirect />} />
                
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRole="user">
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
                
                <Route path="/equipment-list" element={
                  <ProtectedRoute requiredRole="admin">
                    <EquipmentListPage />
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
                
                <Route path="/products" element={
                  <ProtectedRoute requiredRole="admin">
                    <ProductsList />
                  </ProtectedRoute>
                } />
                
                <Route path="/products/:productId" element={
                  <ProtectedRoute requiredRole="admin">
                    <ProductDetailsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/service-certificate/:id" element={
                  <ProtectedRoute>
                    <ServiceCertificate />
                  </ProtectedRoute>
                } />
                
                <Route path="/service" element={
                  <ProtectedRoute>
                    <ServicePage />
                  </ProtectedRoute>
                } />
                
                <Route path="/work-orders" element={
                  <ProtectedRoute>
                    <WorkOrdersList />
                  </ProtectedRoute>
                } />
                
                <Route path="/work-orders/new" element={
                  <ProtectedRoute>
                    <NewWorkOrder />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App; 