// Simplified API constants with updated domain
const API_URL = 'https://backend-mateluxy.onrender.com/api';

// Simple agent API service
export const agentApi = {
  // Get all agents
  getAgents: async () => {
    try {
      const response = await fetch(`${API_URL}/agents`, {
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },

  // Create new agent
  createAgent: async (agentData) => {
    try {
      const response = await fetch(`${API_URL}/agents/add-agent`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(agentData),
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create agent: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error adding agent:', error);
      throw error;
    }
  },

  // Delete agent
  deleteAgent: async (id) => {
    try {
      const response = await fetch(`${API_URL}/agents/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to delete agent with id ${id}: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error deleting agent ${id}:`, error);
      throw error;
    }
  },
};