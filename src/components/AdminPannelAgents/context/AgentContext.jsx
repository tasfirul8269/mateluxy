import React, { createContext, useContext, useState } from 'react';

const sampleAgents = Array(9).fill(null).map((_, index) => ({
  id: `agent-${index + 1}`,
  username: `tanvir${index + 1}`,
  fullName: 'Tanvir Almas',
  email: 'agent@gmail.com',
  position: 'Managing Director',
  languages: ['English', 'Bengali'],
  avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
}));

const AgentContext = createContext(undefined);

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState(sampleAgents);
  const [filteredAgents, setFilteredAgents] = useState(sampleAgents);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);

  const addAgent = (agent) => {
    const newAgent = {
      ...agent,
      id: `agent-${Date.now()}`,
    };
    setAgents((prev) => [...prev, newAgent]);
    setFilteredAgents((prev) => [...prev, newAgent]);
  };

  const removeAgent = (id) => {
    setAgents((prev) => prev.filter((agent) => agent.id !== id));
    setFilteredAgents((prev) => prev.filter((agent) => agent.id !== id));
  };

  const editAgent = (id, updatedAgent) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === id ? { ...agent, ...updatedAgent } : agent))
    );
    setFilteredAgents((prev) =>
      prev.map((agent) => (agent.id === id ? { ...agent, ...updatedAgent } : agent))
    );
  };

  const searchAgents = (term) => {
    const filtered = agents.filter(
      (agent) =>
        agent.fullName.toLowerCase().includes(term.toLowerCase()) ||
        agent.email.toLowerCase().includes(term.toLowerCase()) ||
        agent.position.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredAgents(filtered);
  };

  return (
    <AgentContext.Provider
      value={{
        agents,
        filteredAgents,
        addAgent,
        removeAgent,
        editAgent,
        searchAgents,
        isAddAgentModalOpen,
        openAddAgentModal: () => setIsAddAgentModalOpen(true),
        closeAddAgentModal: () => setIsAddAgentModalOpen(false),
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};