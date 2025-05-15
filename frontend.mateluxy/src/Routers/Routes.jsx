import { createBrowserRouter, Navigate } from "react-router-dom";
import React from "react";
import Layout from "../Layout/Layout";
import Home from "../pages/Home/Home";
import Buy from "../pages/Buy/Buy";
import Rent from "../pages/Rent/Rent";
import CommercialBuy from "../pages/CommercialBuy/CommercialBuy";
import CommercialRent from "../pages/CommercialRent/CommercialRent";
import Properties from "../pages/Properties/Properties";
import MapView from "../pages/MapView/MapView";
import PropertyDetails from "../pages/PropertyDetails/PropertyDetails";
import AgentProfileCard from "../components/AgentProfileCard/AgentProfileCard";
import Contact from "../components/Contact/Contact";
import TeamPage from "../components/TeamMembers/TeamPage";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import OffPlanSinglePage from "../pages/OffPlanSingle/OffPlanSInglePage";
import OffPlanListingPage from "../pages/OffPlanProperties/OffPlanPropertyListingPage";
import AdminSIgnInPage from "../pages/AdminSIgnInPage/AdminSignInPage";
import AgentSignInPage from "../pages/AgentSignInPage/AgentSignInPage";
import ResetPasswordPage from "../pages/ResetPasswordPage/ResetPasswordPage";
import { ProtectedAdminRoute, PublicRoute } from "../pages/AdminPannel/ProtectedAdminRoute";
import { ProtectedAgentRoute, PublicAgentRoute } from "../pages/AgentPannel/ProtectedAgentRoute";
import AdminPannelPage from "@/pages/AdminPannelPages/AdminPannel";
import AgentPannelPage from "@/pages/AgentPannelPages/AgentPannel";
import PropertiesPage from "../pages/AdminPannelPages/PropertiesPage";
import AgentPropertiesPage from "../pages/AgentPannelPages/PropertiesPage";
import AddPropertyPage from "../pages/AgentPannelPages/AddPropertyPage";
import AgentsPage from "@/pages/AdminPannelPages/AgentsPage";
import AdminsPage from "@/pages/AdminPannelPages/AdminsPage";
import MessagesPage from "../pages/AdminPannelPages/MessagesPage";
import BannerPage from "../pages/AdminPannelPages/BannerPage";
import PropertyRequestsPage from "../pages/AdminPannelPages/PropertyRequestsPage";
import { AgentProvider } from '@/components/AdminPannelAgents/context/AgentContext';
import NewsPage from "../pages/News/NewsPage";
import NewsDetailPage from "../pages/News/NewsDetailPage";
import NewsManagementPage from "../pages/AdminPannelPages/NewsManagementPage";
import ProfilePage from "../pages/AgentPannelPages/ProfilePage";
import SettingsPage from "../pages/AgentPannelPages/SettingsPage";

// For debugging
const DebugMessagesPage = () => {
  console.log("Rendering MessagesPage component");
  return <MessagesPage />;
};

const router = createBrowserRouter([

    {
        path: "/",
        element: <Layout></Layout>,
        errorElement: <ErrorPage></ErrorPage>,
        children: [
            {
                path: "/",
                element: <Home></Home>
            },
            {
                path: "/buy",
                element: <Buy></Buy>
            },
            {
                path: "/rent",
                element: <Rent></Rent>
            },
            {
                path: "/commercial/buy",
                element: <CommercialBuy></CommercialBuy>
            },
            {
                path: "/commercial/rent",
                element: <CommercialRent></CommercialRent>
            },
            {
                path: "/properties",
                element: <Properties></Properties>
            },
            {
                path: "/property-details/:id",
                loader: ({params}) => fetch(`${import.meta.env.VITE_API_URL}/api/properties/${params.id}`),
                element: <PropertyDetails></PropertyDetails>
            },
            {
                path: "/off-plan-properties",
                loader:  () => fetch(`${import.meta.env.VITE_API_URL}/api/properties`),
                element: <OffPlanListingPage></OffPlanListingPage>
            },
            {
                path: "/news",
                element: <NewsPage></NewsPage>
            },
            {
                path: "/news/:slug",
                element: <NewsDetailPage></NewsDetailPage>
            },
            {
                path: "/contact",
                element: <Contact></Contact>
            },
            {
                path: "/agent/:id",
                loading: async ({params}) => {
                    try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${params.id}`);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch agent: ${response.status}`);
                        }
                        return await response.json();
                    } catch (error) {
                        // You might want to handle this error in your component
                        console.error("Loader error:", error);
                        throw error; // Re-throw to let the router handle it
                    }
                },
                element: <AgentProfileCard></AgentProfileCard>
            },
            {
                path: "/our-team",
                element: <TeamPage></TeamPage>
            },
            {
                path: "/off-plan-single/:id",
                loader: ({params}) => fetch(`${import.meta.env.VITE_API_URL}/api/properties/${params.id}`),
                element: <OffPlanSinglePage></OffPlanSinglePage>
            },
            {
                path: "/map-view/:category",
                element: <MapView />
            }
        ]
    },
    {
        element: <ProtectedAdminRoute />,
        children: [
            {
                path: "/admin-pannel",
                element: <AdminPannelPage />,
                children: [
                    {
                        index: true, // 👈 default path under /admin-pannel
                        element: <Navigate to="properties" replace />
                    },
                    {
                        path: "properties",
                        element: <PropertiesPage></PropertiesPage>
                    },
                    {
                        path: "agents",
                        element: <AgentProvider><AgentsPage /></AgentProvider>  
                    },
                    {
                        path: "admins",
                        element: <AdminsPage></AdminsPage>
                    },
                    {
                        path: "messages",
                        element: <DebugMessagesPage /> // Using the debug wrapper
                    },
                    {
                        path: "banners",
                        element: <BannerPage />
                    },
                    {
                        path: "property-requests",
                        element: <PropertyRequestsPage />
                    },
                    {
                        path: "news",
                        element: <NewsManagementPage />
                    }
                ]
            },
        ]
    },
    {
        element: <ProtectedAgentRoute />,
        children: [
            {
                path: "/agent-pannel",
                element: <AgentPannelPage />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="properties" replace />
                    },
                    {
                        path: "properties",
                        element: <AgentPropertiesPage />
                    },
                    {
                        path: "add-property",
                        element: <AddPropertyPage />
                    },
                    {
                        path: "property-requests",
                        element: <PropertyRequestsPage />
                    },
                    {
                        path: "profile",
                        element: <ProfilePage />
                    },
                    {
                        path: "settings",
                        element: <SettingsPage />
                    }
                ]
            },
        ]
    },
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/admin-login",
                element: <AdminSIgnInPage></AdminSIgnInPage>
            },
            {
                path: "/reset-password/:token",
                element: <ResetPasswordPage />
            }
        ]
    },
    {
        element: <PublicAgentRoute />,
        children: [
            {
                path: "/agent-login",
                element: <AgentSignInPage></AgentSignInPage>
            }
        ]
    }
])

export default router;