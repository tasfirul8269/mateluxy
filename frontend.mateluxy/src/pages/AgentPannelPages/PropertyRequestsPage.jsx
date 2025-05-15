import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/AdminPannel/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/AdminPannel/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/AdminPannel/ui/dialog";
import { Button } from "@/components/AdminPannel/ui/button";
import { Badge } from "@/components/AdminPannel/ui/UIComponents";
import { Input } from "@/components/AdminPannel/ui/input";
import { Textarea } from "@/components/AdminPannel/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/AdminPannel/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/AdminPannel/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/AdminPannel/ui/tabs";
import { 
  Check, 
  Clock, 
  Search, 
  Filter,
  RefreshCw,
  Calendar,
  Download,
  ExternalLink,
  Phone,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Eye,
  Trash2,
  ChevronDown
} from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const listItemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const PropertyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [agentData, setAgentData] = useState(null);
  const [agentProperties, setAgentProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [requestToUpdate, setRequestToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  // Load agent data first, then properties assigned to this agent, and finally property requests related to those properties
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/auth-status`, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch agent data');
        }
        
        const data = await res.json();
        setAgentData(data);
        
        // Fetch agent properties
        await fetchAgentProperties(data._id);
      } catch (error) {
        console.error('Error fetching agent data:', error);
        setError('Authentication error. Please login again.');
        toast.error('Authentication error. Please login again.');
        setLoading(false);
      }
    };
    
    fetchAgentData();
  }, []);

  // Fetch properties assigned to this agent
  const fetchAgentProperties = async (agentId) => {
    try {
      const propertiesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?agent=${agentId}`, {
        credentials: 'include',
      });
      
      if (!propertiesRes.ok) {
        throw new Error('Failed to fetch agent properties');
      }
      
      const propertiesData = await propertiesRes.json();
      setAgentProperties(propertiesData);
      
      // Now fetch property requests for these properties
      await fetchPropertyRequests(propertiesData);
    } catch (error) {
      console.error('Error fetching agent properties:', error);
      setError('Failed to load properties. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch property requests related to the agent's properties
  const fetchPropertyRequests = async (properties) => {
    try {
      setLoading(true);
      
      if (!properties || properties.length === 0) {
        // No properties to check requests for
        setRequests([]);
        setLoading(false);
        return;
      }
      
      // Get all property IDs assigned to this agent
      const propertyIds = properties.map(property => property._id);
      
      // Get API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Fetch all property requests
      const response = await fetch(`${apiUrl}/api/property-requests`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Filter requests to only include those for properties assigned to this agent
        const filteredRequests = data.data.filter(request => 
          propertyIds.includes(request.propertyInfo?.propertyId)
        );
        
        setRequests(filteredRequests);
        setTotalPages(Math.ceil(filteredRequests.length / 10) || 1);
      } else {
        throw new Error(data.message || "Failed to fetch property requests");
      }
    } catch (err) {
      console.error("Error fetching property requests:", err);
      setError(err.message);
      toast.error("Failed to load property requests");
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search term and active tab
  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === "" || 
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.propertyInfo?.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && request.status === activeTab;
  });

  // Pagination logic - get current page of requests
  const paginatedRequests = filteredRequests.slice((page - 1) * 10, page * 10);

  // Handle status update
  const updateRequestStatus = async () => {
    if (!requestToUpdate || !newStatus) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/property-requests/${requestToUpdate._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes
        })
      });
      
      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update the request in local state
        setRequests(prev => prev.map(req => 
          req._id === requestToUpdate._id ? { ...req, status: newStatus, notes: notes } : req
        ));
        
        // Update selected request if it's the same one
        if (selectedRequest && selectedRequest._id === requestToUpdate._id) {
          setSelectedRequest({ ...selectedRequest, status: newStatus, notes: notes });
        }
        
        // Close dialog and show success message
        setStatusUpdateOpen(false);
        toast.success("Request status updated successfully");
      } else {
        throw new Error(data.message || "Failed to update request status");
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error(error.message || "Failed to update request status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge color="blue">New</Badge>;
      case 'contacted':
        return <Badge color="yellow">Contacted</Badge>;
      case 'completed':
        return <Badge color="green">Completed</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateRelative = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleRefresh = () => {
    // Re-fetch everything
    setSearchTerm('');
    setActiveTab('all');
    fetchAgentProperties(agentData?._id);
  };

  const openStatusUpdate = (request) => {
    setRequestToUpdate(request);
    setNewStatus(request.status);
    setNotes(request.notes || '');
    setStatusUpdateOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading property requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-8 rounded-lg text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw size={16} />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={slideUp}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Property Requests</h1>
          <p className="text-gray-500">
            Manage inquiries about your properties
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </Button>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
        variants={slideUp}
      >
        <div className="border-b border-gray-100">
          <Tabs defaultValue={activeTab} className="p-4" onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="all">All Requests</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="contacted">Contacted</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 h-10 sm:w-[250px]"
                />
              </div>
            </div>
            
            <TabsContent value={activeTab} className="mt-0">
              {paginatedRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mb-3 bg-gray-100 h-12 w-12 rounded-full flex items-center justify-center text-gray-500 mx-auto">
                    <MessageSquare size={20} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No property requests found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm ? 
                      `No results for "${searchTerm}". Try a different search term.` : 
                      `You don't have any ${activeTab !== 'all' ? activeTab : ''} property requests yet.`}
                  </p>
                </div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client Name</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Received</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRequests.map((request) => (
                          <TableRow key={request._id} 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRequestDialog(true);
                            }}
                          >
                            <TableCell className="font-medium">{request.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-col max-w-[180px]">
                                <span className="text-xs text-gray-500 truncate">{request.email}</span>
                                <span className="text-xs truncate">{request.countryCode} {request.phone}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.propertyInfo?.propertyId ? (
                                <a 
                                  href={`/property-details/${request.propertyInfo.propertyId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline hover:text-blue-800 truncate max-w-[180px] inline-block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {request.propertyInfo.propertyTitle || "N/A"}
                                </a>
                              ) : (
                                <span className="truncate max-w-[180px] inline-block">
                                  {request.propertyInfo?.propertyTitle || "N/A"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs">{formatDate(request.createdAt)}</span>
                                <span className="text-xs text-gray-500">{formatDateRelative(request.createdAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(request.status)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRequest(request);
                                    setShowRequestDialog(true);
                                  }}>
                                    <Eye size={16} className="mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    openStatusUpdate(request);
                                  }}>
                                    <Clock size={16} className="mr-2" />
                                    Update Status
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="py-4 border-t border-gray-100">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setPage(p => Math.max(1, p - 1))} 
                              disabled={page === 1}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <PaginationItem key={p}>
                              <PaginationLink 
                                onClick={() => setPage(p)}
                                isActive={page === p}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                              disabled={page === totalPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
      
      {/* Property Request Dialog */}
      {selectedRequest && (
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Property Request Details</DialogTitle>
              <DialogDescription>
                Request from {selectedRequest.name} on {formatDate(selectedRequest.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(selectedRequest.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => openStatusUpdate(selectedRequest)}
                    >
                      Update
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Date Received</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Property</h3>
                {selectedRequest.propertyInfo?.propertyId ? (
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{selectedRequest.propertyInfo?.propertyTitle || "General Property Inquiry"}</p>
                    <a 
                      href={`/property-details/${selectedRequest.propertyInfo.propertyId}`}
                      className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="font-medium truncate">{selectedRequest.propertyInfo?.propertyTitle || "General Property Inquiry"}</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium truncate">{selectedRequest.email}</p>
                      <a 
                        href={`mailto:${selectedRequest.email}`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium">{selectedRequest.countryCode} {selectedRequest.phone}</p>
                      <a 
                        href={`tel:${selectedRequest.countryCode}${selectedRequest.phone}`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Marketing Consent</p>
                    <p className="font-medium">
                      {selectedRequest.marketingConsent ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedRequest.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                  <p className="text-sm whitespace-pre-line">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                Close
              </Button>
              <Button onClick={() => openStatusUpdate(selectedRequest)}>
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Status Update Dialog */}
      {requestToUpdate && (
        <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Request Status</DialogTitle>
              <DialogDescription>
                Change the status and add notes for this property request.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-sm font-medium text-right">Status</label>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
                  className="col-span-3"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-sm font-medium text-right pt-2">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this request or follow-up actions..."
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusUpdateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateRequestStatus}>
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};

export default PropertyRequestsPage; 