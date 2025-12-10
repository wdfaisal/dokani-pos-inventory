import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* External Store Page - No Layout */}
            <Route path="/store" element={<Store />} />
            
            {/* Admin Routes with MainLayout */}
            <Route path="/" element={<MainLayout><Index /></MainLayout>} />
            <Route path="/pos" element={<MainLayout><POS /></MainLayout>} />
            <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
            <Route path="/categories" element={<MainLayout><Categories /></MainLayout>} />
            <Route path="/expenses" element={<MainLayout><Expenses /></MainLayout>} />
            <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
            <Route path="/shifts" element={<MainLayout><Shifts /></MainLayout>} />
            <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
            <Route path="/sales" element={<MainLayout><Sales /></MainLayout>} />
            <Route path="/online-orders" element={<MainLayout><OnlineOrders /></MainLayout>} />
            <Route path="/suppliers" element={<MainLayout><Suppliers /></MainLayout>} />
            <Route path="/inventory" element={<MainLayout><Inventory /></MainLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
