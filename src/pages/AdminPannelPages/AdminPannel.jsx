import { Toaster } from "@/components/AdminPannel/ui/toaster";
import { Toaster as Sonner } from "@/components/AdminPannel/ui/sonner";
import { TooltipProvider } from "@/components/AdminPannel/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/AdminPannel/layout/MainLayout";
import PropertiesPage from "@/pages/AdminPannelPages/PropertiesPage";
import AgentsPage from "@/pages/AdminPannelPages/AgentsPage";
import AdminsPage from "@/pages/AdminPannelPages/AdminsPage";
import NotFound from "@/pages/AdminPannelPages/NotFound";
import { Outlet } from "react-router-dom";

const queryClient = new QueryClient();

const AdminPannelPage = () => {
  return (
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
};

export default AdminPannelPage;