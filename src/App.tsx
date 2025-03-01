import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AdminRoute } from "@/components/AdminRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import AdminService from "@/pages/AdminService";
import AdminCustomerDetails from "@/pages/AdminCustomerDetails";
import { EquipmentTypes } from "@/pages/EquipmentTypes";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import CustomerDetailsPage from "@/pages/CustomerDetailsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/admin/customer/:customerId" element={<AdminRoute><AdminCustomerDetails /></AdminRoute>} />
              <Route path="/admin/customer/:customerId/equipment-types" element={<AdminRoute><EquipmentTypes /></AdminRoute>} />
              <Route path="/admin/service/:customerId" element={<AdminRoute><AdminService /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;