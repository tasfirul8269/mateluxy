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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [requestToUpdate, setRequestToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  // Load property requests
  useEffect(() => {
    fetchRequests();
  }, [page, activeTab, searchTerm]);

  // Fetch requests from API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Get API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Prepare query parameters
      const params = new URLSearchParams({
        page,
        limit: 10,
        status: activeTab !== "all" ? activeTab : ""
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`${apiUrl}/api/property-requests?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      // Handle unauthorized
      if (response.status === 401) {
        console.error("Unauthorized: 401 response");
        toast.error("Session expired. Please log in again.");
        setError("Authentication required. Please log in again.");
        return;
      }
      
      // Handle other errors
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
        setTotalPages(data.totalPages || 1);
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
        // Update the request in the local state
        setRequests(requests.map(req => 
          req._id === requestToUpdate._id ? { ...req, status: newStatus, notes: notes } : req
        ));
        
        if (selectedRequest && selectedRequest._id === requestToUpdate._id) {
          setSelectedRequest({ ...selectedRequest, status: newStatus, notes: notes });
        }
        
        toast.success(`Request status updated to ${newStatus}`);
      } else {
        throw new Error(data.message || "Failed to update request status");
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request status");
    } finally {
      setStatusUpdateOpen(false);
      setRequestToUpdate(null);
      setNewStatus("");
      setNotes("");
    }
  };

  // Handle request deletion
  const deleteRequest = async () => {
    if (!requestToDelete) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/property-requests/${requestToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        setDeleteDialogOpen(false);
        setRequestToDelete(null);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update state to remove the deleted request
        setRequests(prev => prev.filter(req => req._id !== requestToDelete._id));
        
        // Close detail view if it's showing the deleted request
        if (selectedRequest && selectedRequest._id === requestToDelete._id) {
          setShowRequestDialog(false);
          setSelectedRequest(null);
        }
        
        toast.success("Property request deleted successfully");
      } else {
        throw new Error(data.message || "Failed to delete property request");
      }
    } catch (error) {
      console.error("Error deleting property request:", error);
      toast.error("Failed to delete property request");
    } finally {
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  // Get badge color based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge variant="warning">New</Badge>;
      case 'contacted':
        return <Badge variant="info">Contacted</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="warning">New</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy • h:mm a");
    } catch (err) {
      return "Invalid date";
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };
  
  // Refresh requests
  const handleRefresh = () => {
    fetchRequests();
    toast.success("Requests refreshed");
  };
  
  // Export requests as CSV
  const exportRequests = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Phone", "Country Code", "Property", "Status", "Date"];
    const csvRows = [
      headers.join(","),
      ...filteredRequests.map(req => {
        return [
          `"${req.name || ''}"`,
          `"${req.email || ''}"`,
          `"${req.phone || ''}"`,
          `"${req.countryCode || ''}"`,
          `"${req.propertyInfo?.propertyTitle || ''}"`,
          `"${req.status || 'new'}"`,
          `"${formatDate(req.createdAt)}"`,
        ].join(",");
      })
    ];
    
    // Create and download CSV file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `property_requests_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Requests exported successfully");
  };

  // Open status update dialog
  const openStatusUpdate = (request) => {
    setRequestToUpdate(request);
    setNewStatus(request.status);
    setNotes(request.notes || "");
    setStatusUpdateOpen(true);
  };

  // Confirm deletion
  const confirmDelete = (request) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="h-[calc(100vh-80px)] overflow-hidden flex flex-col bg-gray-50 rounded-xl shadow-sm"
    >
      {/* Header */}
      <motion.div 
        variants={slideUp}
        className="bg-white border-b border-gray-200 p-4 z-20 sticky top-0"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-red-500" />
              <span>Property Requests</span>
              {loading && (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="ml-3"
                >
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                </motion.div>
              )}
            </h1>
            <p className="text-gray-500 text-sm">
              Manage customer property requests and inquiries
            </p>
          </div>
          
          {!loading && !error && (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap md:flex-nowrap gap-3"
            >
              <motion.div variants={listItemVariant} className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200 flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Total</div>
                  <div className="text-lg font-bold text-gray-800">{requests.length}</div>
                </div>
              </motion.div>
              
              <motion.div variants={listItemVariant} className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200 flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">New</div>
                  <div className="text-lg font-bold text-gray-800">
                    {requests.filter(r => r.status === 'new').length}
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={listItemVariant} className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200 flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Completed</div>
                  <div className="text-lg font-bold text-gray-800">
                    {requests.filter(r => r.status === 'completed').length}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Search and Filters */}
      <motion.div 
        variants={slideUp}
        className="bg-white border-b border-gray-200 p-4 z-10 sticky top-0"
      >
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, phone or property..."
                className="pl-10 py-2 border-gray-200 rounded-lg w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportRequests}
                className="border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-gray-100 p-1 rounded-lg w-full flex justify-start overflow-x-auto">
              <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="new" className="rounded-md data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
                New
              </TabsTrigger>
              <TabsTrigger value="contacted" className="rounded-md data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
                Contacted
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-md data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="rounded-full h-12 w-12 border-2 border-red-500 border-t-transparent"
            />
            <p className="ml-4 text-gray-500">Loading property requests...</p>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-center items-center p-8"
          >
            <Calendar className="h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">{error}</h3>
            <p className="text-red-600 mb-4 text-center max-w-md">There was a problem loading the property requests.</p>
          </motion.div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No property requests found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm ? "Try different search terms or filters" : "When customers submit property requests, they will appear here."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
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
                          <span className="text-xs text-gray-500">{format(new Date(request.createdAt), "MMM d, yyyy")}</span>
                          <span className="text-xs">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-50">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequest(request);
                                setShowRequestDialog(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openStatusUpdate(request);
                              }}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              <span>Update Status</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(request);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => page > 1 && setPage(page - 1)}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => totalPages <= 5 || 
                        (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)))
                      .map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={page === p}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => page < totalPages && setPage(page + 1)}
                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Request Detail Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-500" />
              Property Request Details
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <span>Request from {selectedRequest.name} on {format(new Date(selectedRequest.createdAt), "MMMM d, yyyy")}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
                  <p className="font-medium truncate">{selectedRequest.name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-blue-600 truncate">{selectedRequest.email}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a 
                        href={`mailto:${selectedRequest.email}?subject=Regarding your property inquiry: ${selectedRequest.propertyInfo?.propertyTitle || 'Property'}&body=Dear ${selectedRequest.name},%0A%0AThank you for your interest in ${selectedRequest.propertyInfo?.propertyTitle || 'our property'}.%0A%0A`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="Send email with default mail app"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                      <a 
                        href={`https://mail.google.com/mail/u/0/?fs=1&to=${selectedRequest.email}&su=Regarding your property inquiry: ${selectedRequest.propertyInfo?.propertyTitle || 'Property'}&body=Dear ${selectedRequest.name},%0A%0AThank you for your interest in ${selectedRequest.propertyInfo?.propertyTitle || 'our property'}.%0A%0A&tf=cm`}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Compose in Gmail"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{selectedRequest.countryCode} {selectedRequest.phone}</p>
                    <a 
                      href={`tel:${selectedRequest.countryCode}${selectedRequest.phone}`}
                      className="text-gray-400 hover:text-green-600 transition-colors flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Marketing Consent</h3>
                <p className="font-medium">
                  {selectedRequest.marketingConsent ? "Yes, agreed to receive marketing" : "No marketing consent given"}
                </p>
              </div>
              
              {selectedRequest.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">{selectedRequest.notes}</p>
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Time</h3>
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <p className="text-gray-700 text-sm">{formatDate(selectedRequest.createdAt)}</p>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(selectedRequest.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-between pt-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRequestDialog(false)}
                >
                  Close
                </Button>
                
                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Reply <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-50">
                      <DropdownMenuItem
                        onClick={() => {
                          window.open(`mailto:${selectedRequest.email}?subject=Regarding your property inquiry: ${selectedRequest.propertyInfo?.propertyTitle || 'Property'}&body=Dear ${selectedRequest.name},%0A%0AThank you for your interest in ${selectedRequest.propertyInfo?.propertyTitle || 'our property'}.%0A%0A`, '_blank');
                        }}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Default Mail App</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          window.open(`https://mail.google.com/mail/u/0/?fs=1&to=${selectedRequest.email}&su=Regarding your property inquiry: ${selectedRequest.propertyInfo?.propertyTitle || 'Property'}&body=Dear ${selectedRequest.name},%0A%0AThank you for your interest in ${selectedRequest.propertyInfo?.propertyTitle || 'our property'}.%0A%0A&tf=cm`, '_blank');
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4 text-red-500">
                          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                        </svg>
                        <span>Gmail</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowRequestDialog(false);
                      openStatusUpdate(selectedRequest);
                    }}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Update
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowRequestDialog(false);
                      confirmDelete(selectedRequest);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Request Status</DialogTitle>
            <DialogDescription>
              Change the status and add notes to this property request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
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
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                id="notes"
                placeholder="Add notes about this request..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateRequestStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {requestToDelete && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 my-2">
              <p className="font-medium text-red-800">Request from: {requestToDelete.name}</p>
              <p className="text-sm text-red-700">
                Property: {requestToDelete.propertyInfo?.propertyTitle || "General Property Inquiry"}
              </p>
              <p className="text-sm text-red-700">
                Date: {format(new Date(requestToDelete.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteRequest}>
              Delete Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PropertyRequestsPage; 