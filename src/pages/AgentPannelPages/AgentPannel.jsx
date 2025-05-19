import { Toaster } from "@/components/AdminPannel/ui/toaster";
import { Toaster as Sonner } from "@/components/AdminPannel/ui/sonner";
import { TooltipProvider } from "@/components/AdminPannel/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "@/components/AgentPannel/layout/MainLayout";
import PropertiesPage from "@/pages/AgentPannelPages/PropertiesPage";
import NotFound from "@/pages/AdminPannelPages/NotFound";
import { Outlet } from "react-router-dom";

const queryClient = new QueryClient();

const AgentPannelPage = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MainLayout>
        <Outlet />  
      </MainLayout>
    </TooltipProvider>
  </QueryClientProvider>
);

export default AgentPannelPage; 