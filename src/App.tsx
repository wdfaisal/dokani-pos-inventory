import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OfflineProvider } from "@/contexts/OfflineContext";
import { MainLayout } from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import Shifts from "./pages/Shifts";
import Reports from "./pages/Reports";
import Sales from "./pages/Sales";
import Store from "./pages/Store";
import OnlineOrders from "./pages/OnlineOrders";
import Suppliers from "./pages/Suppliers";
import Inventory from "./pages/Inventory";
import Purchases from "./pages/Purchases";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OfflineProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Auth Route */}
                <Route path="/auth" element={<Auth />} />
                
                {/* External Store Page - No Layout */}
                <Route path="/store" element={<Store />} />
                
                {/* Admin Routes with MainLayout */}
                <Route path="/" element={
                  <ProtectedRoute requiredModule="dashboard">
                    <MainLayout><Index /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/pos" element={
                  <ProtectedRoute requiredModule="pos">
                    <MainLayout><POS /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute requiredModule="products">
                    <MainLayout><Products /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/categories" element={
                  <ProtectedRoute requiredModule="categories">
                    <MainLayout><Categories /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/expenses" element={
                  <ProtectedRoute requiredModule="expenses">
                    <MainLayout><Expenses /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute requiredModule="settings">
                    <MainLayout><Settings /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/shifts" element={
                  <ProtectedRoute requiredModule="shifts">
                    <MainLayout><Shifts /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute requiredModule="reports">
                    <MainLayout><Reports /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/sales" element={
                  <ProtectedRoute requiredModule="sales">
                    <MainLayout><Sales /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/online-orders" element={
                  <ProtectedRoute requiredModule="sales">
                    <MainLayout><OnlineOrders /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/suppliers" element={
                  <ProtectedRoute requiredModule="suppliers">
                    <MainLayout><Suppliers /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/inventory" element={
                  <ProtectedRoute requiredModule="inventory">
                    <MainLayout><Inventory /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/purchases" element={
                  <ProtectedRoute requiredModule="purchases">
                    <MainLayout><Purchases /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute requiredModule="users">
                    <MainLayout><Users /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </OfflineProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
