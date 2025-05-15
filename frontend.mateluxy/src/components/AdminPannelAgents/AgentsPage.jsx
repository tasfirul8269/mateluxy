import React from 'react';
import AgentList from './agents/AgentList';
import AddAgentModal from './agents/AddAgentModal';

const AgentsPage = () => {
  return (
    <div>
      <AgentList />
      <AddAgentModal />
    </div>
  );
};

export default AgentsPage;