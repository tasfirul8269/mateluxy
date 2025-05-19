import React from 'react';
import { SidebarProvider } from '../../components/AdminPannelAgents/context/SidebarContext';
import { AgentProvider } from '../../components/AdminPannelAgents/context/AgentContext';
import Layout from '../../components/AdminPannelAgents/layout/Layout';
import AgentsPage from '../../components/AdminPannelAgents/AgentsPage';

function AdminPannelAgents() {
  return (
    <SidebarProvider>
      <AgentProvider>
        <Layout>
          <AgentsPage />
        </Layout>
      </AgentProvider>
    </SidebarProvider>
  );
}

export default AdminPannelAgents;