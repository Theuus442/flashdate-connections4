import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UsersProvider } from "@/context/UsersContext";
import { SelectionsProvider } from "@/context/SelectionsContext";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import AdminPanel from "./pages/AdminPanel";
import ClientDashboard from "./pages/ClientDashboard";
import EventUserSelection from "./pages/EventUserSelection";
import UserProfile from "./pages/UserProfile";
import LandingSimple from "./pages/LandingSimple";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UsersProvider>
        <SelectionsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/event-selection" element={<EventUserSelection />} />
              <Route path="/user-profile" element={<UserProfile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SelectionsProvider>
      </UsersProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
