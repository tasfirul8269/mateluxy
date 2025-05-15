import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { PropertyFormDialog } from '@/components/AgentPannel/PropertyFormDialog';
import { FloatingActionButton } from "@/components/AdminPannel/ui/UIComponents";

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/auth-status`, {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          setAgentData(data);
        } else {
          navigate('/agent-login');
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
        navigate('/agent-login');
      }
    };
    
    fetchAgentData();
  }, [navigate]);

  const handleAddProperty = () => {
    setIsFormDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsFormDialogOpen(false);
    navigate('/agent-pannel/properties');
  };

  const handlePropertySubmitted = (property) => {
    console.log("Property added:", property);
    
    // Force a refresh of the properties page by adding a timestamp to the URL
    // This will ensure the PropertiesPage component fetches the latest data
    navigate('/agent-pannel/properties?refresh=' + Date.now());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/agent-pannel/properties')}
            className="p-2 mr-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Properties
          </h1>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold text-gray-700">Add a New Property</h2>
          <p className="text-gray-500 mt-2">Click the button below to add a new property listing</p>
          <button
            onClick={handleAddProperty}
            className="mt-6 py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <Plus size={20} className="mr-2" /> Add Property
          </button>
        </div>
      </div>

      <PropertyFormDialog 
        isOpen={isFormDialogOpen} 
        onClose={handleCloseDialog} 
        agentData={agentData}
        onPropertyAdded={handlePropertySubmitted}
      />
    </div>
  );
};

export default AddPropertyPage; 