import React, { useState } from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import Button from '../ui/Button';
import { useAgents } from '../context/AgentContext';

const TopBar = () => {
  const { openAddAgentModal, searchAgents } = useAgents();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (e) => {
    searchAgents(e.target.value);
  };

  return (
    <div className="bg-white px-4 md:px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="lg:hidden">
            <svg viewBox="0 0 100 100" className="w-8 h-8">
              <path d="M50 0 L100 30 L100 70 L50 100 L0 70 L0 30 Z" fill="#e11d48" />
              <path d="M20 40 L50 20 L80 40 L80 60 L50 80 L20 60 Z" fill="white" />
            </svg>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold">Agents</h1>
          </div>
          <div className="hidden lg:block relative">
            <input 
              type="text"
              placeholder="Search agent..."
              onChange={handleSearch}
              className="ml-6 pl-10 pr-4 py-2 bg-[#F8F9FD] border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
            />
            <Search size={16} className="absolute left-9 top-2.5 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <Search size={20} />
          </button>

          <div className="hidden lg:block">
            <Button
              variant="primary"
              onClick={openAddAgentModal}
              className="bg-red-600 hover:bg-red-700"
            >
              Add Agent
            </Button>
          </div>

          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Bell size={20} />
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden bg-yellow-400">
            <img
              src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="lg:hidden mt-4">
          <input
            type="text"
            placeholder="Search agent..."
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-[#F8F9FD] border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search size={16} className="absolute left-7 top-[4.2rem] text-gray-400" />
        </div>
      )}

      <button
        onClick={openAddAgentModal}
        className="lg:hidden fixed right-4 bottom-20 w-14 h-14 flex items-center justify-center bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default TopBar;