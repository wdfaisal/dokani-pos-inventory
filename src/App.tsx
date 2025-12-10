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
import Settings from "./pages/Settings";
import Shifts from "./pages/Shifts";
import Reports from "./pages/Reports";
import OnlineOrder from "./pages/OnlineOrder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/products" element={<Products />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/shifts" element={<Shifts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/order" element={<OnlineOrder />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
