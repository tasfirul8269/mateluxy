import React, { useState, useEffect } from "react";
import { AgentCard } from "@/components/AdminPannel/agents/AgentCard";
import { FloatingActionButton } from "@/components/AdminPannel/ui/UIComponents";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/AdminPannel/ui/pagination";
import { AgentFormDialog } from "@/components/AdminPannel/agents/AgentFormDialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const AgentsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const itemsPerPage = 4;

  // Fetch properties and agents from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch agents
        const agentsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/agents`);
        if (!agentsResponse.ok) {
          throw new Error('Failed to fetch agents');
        }
        const agentsData = await agentsResponse.json();
        console.log("Agents data:", agentsData);
        
        // Fetch properties to count agent assignments
        const propertiesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`);
        if (!propertiesResponse.ok) {
          throw new Error('Failed to fetch properties');
        }
        const propertiesData = await propertiesResponse.json();
        console.log("Properties data:", propertiesData);
        setProperties(propertiesData);
        
        // Count how many properties each agent has
        const agentPropertyCounts = {};
        
        // Debug log for agent IDs
        const agentIds = agentsData.map(agent => agent._id);
        console.log("Agent IDs for reference:", agentIds);
        
        propertiesData.forEach(property => {
          // Log each property's agent value to debug
          console.log(`Property ${property._id} has agent:`, property.agent);
          
          if (property.agent) {
            // Increment the count for this agent
            // Make sure to compare with string IDs if needed
            const agentId = typeof property.agent === 'object' ? property.agent._id : property.agent;
            agentPropertyCounts[agentId] = (agentPropertyCounts[agentId] || 0) + 1;
          }
        });
        
        console.log("Agent property counts:", agentPropertyCounts);
        
        // Transform agent data and include property counts
        const transformedAgents = agentsData.map(agent => {
          const agentId = agent._id;
          const propertyCount = agentPropertyCounts[agentId] || 0;
          console.log(`Agent ${agentId} (${agent.fullName}) has ${propertyCount} properties`);
          
          return {
            id: agentId,
            username: agent.username,
            fullName: agent.fullName,
            profileImage: agent.profileImage,
            position: agent.position,
            email: agent.email,
            contactNumber: agent.contactNumber,
            whatsapp: agent.whatsapp || "",
            department: agent.department || "",
            vcard: agent.vcard || "",
            languages: agent.languages || [],
            aboutMe: agent.aboutMe || "",
            address: agent.address || "",
            socialLinks: agent.socialLinks || [],
            listings: propertyCount,
          };
        });
        
        setAgents(transformedAgents);
        setFilteredAgents(transformedAgents);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Listen for search event from Header
  useEffect(() => {
    const handleSearch = (event) => {
      setSearchQuery(event.detail);
      setCurrentPage(1); // Reset to first page on search
    };

    window.addEventListener("search", handleSearch);
    return () => window.removeEventListener("search", handleSearch);
  }, []);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredAgents(agents);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = agents.filter(
        agent =>
          agent.fullName.toLowerCase().includes(lowercasedQuery) ||
          agent.email.toLowerCase().includes(lowercasedQuery) ||
          agent.position.toLowerCase().includes(lowercasedQuery) ||
          agent.contactNumber.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredAgents(filtered);
    }
  }, [searchQuery, agents]);

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);

  const currentAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddAgent = () => {
    setIsFormOpen(true);
  };

  const handleAgentAdded = (newAgent) => {
    // Add the new agent with 0 listings initially
    const agentWithListings = {
      ...newAgent,
      listings: 0
    };
    setAgents(prevAgents => [agentWithListings, ...prevAgents]);
  };

  const handleAgentUpdated = (updatedAgent) => {
    setAgents(prevAgents => 
      prevAgents.map(agent => {
        if (agent.id === updatedAgent.id) {
          // Preserve the listings count when updating an agent
          return { ...updatedAgent, listings: agent.listings };
        }
        return agent;
      })
    );
  };

  const handleAgentDeleted = (deletedAgentId) => {
    setAgents(prevAgents => 
      prevAgents.filter(agent => agent.id !== deletedAgentId)
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Real Estate Agents</h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Agents Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {currentAgents.map((agent) => (
                <motion.div 
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <AgentCard 
                    agent={agent} 
                    onAgentUpdated={handleAgentUpdated}
                    onAgentDeleted={handleAgentDeleted}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* No results */}
        {!isLoading && currentAgents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-medium text-gray-700">No agents found</h3>
            <p className="text-gray-500 mt-1">Try changing your search or add new agents.</p>
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && filteredAgents.length > 0 && totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <AgentFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onAgentAdded={handleAgentAdded}
      />

      <FloatingActionButton
        label="Add Agent"
        onClick={handleAddAgent}
      />
    </div>
  );
};

export default AgentsPage;