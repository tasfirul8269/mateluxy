import React from 'react';
import { MessageSquare } from 'lucide-react';
import Button from '../ui/Button';

const AgentCard = ({ agent, onRemove, onEdit }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-yellow-400">
            <img 
              src={agent.avatar} 
              alt={agent.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{agent.fullName}</h3>
            <p className="text-sm text-gray-500">{agent.position}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              {agent.email}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center text-gray-500">
          <MessageSquare size={16} className="mr-1" />
          <span className="text-sm">Speaks {agent.languages.join(', ')}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 divide-x border-t">
        <Button 
          variant="danger" 
          className="py-3 rounded-none text-red-600 hover:bg-red-50" 
          onClick={() => onRemove(agent.id)}
        >
          Remove
        </Button>
        <Button 
          variant="secondary" 
          className="py-3 rounded-none text-blue-600 hover:bg-blue-50" 
          onClick={() => onEdit(agent.id)}
        >
          Edit
        </Button>
      </div>
    </div>
  );
};

export default AgentCard;