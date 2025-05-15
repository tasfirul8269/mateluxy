import React, { useState } from 'react';
import AgentCard from './AgentCard';
import { useAgents } from '../context/AgentContext';

const AgentList = () => {
  const { filteredAgents, removeAgent } = useAgents();
  const [currentPage, setCurrentPage] = useState(1);
  const agentsPerPage = 9;
  
  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = filteredAgents.slice(indexOfFirstAgent, indexOfLastAgent);
  const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);

  const handleEdit = (id) => {
    console.log('Edit agent:', id);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentAgents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onRemove={removeAgent}
            onEdit={handleEdit}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  currentPage === index + 1
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;