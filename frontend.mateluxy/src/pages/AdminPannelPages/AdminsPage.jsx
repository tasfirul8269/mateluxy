import React, { useState, useEffect } from "react";
import { FloatingActionButton } from "@/components/AdminPannel/ui/UIComponents";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/AdminPannel/ui/pagination";
import { AdminFormDialog } from "@/components/AdminPannel/admins/AdminFormDialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MoreVertical, Edit, Trash2, X, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/AdminPannel/ui/dropdown-menu";
import { format, formatDistanceToNow, differenceInMinutes } from "date-fns";
import { convertS3UrlToProxyUrl } from "../../utils/s3UrlConverter";

const AdminsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const itemsPerPage = 10;

  // Fetch admins from API
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        
        // Add credentials to fetch real data from the server
        // Update the endpoint to match how it's registered in backend/index.js
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/`, {
          method: 'GET',
          credentials: 'include', // Important for authentication cookies
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`Failed to fetch admins: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error('Unexpected data format:', data);
          throw new Error('Received invalid data format from server');
        }
        
        // Transform data to match our frontend structure
        const transformedAdmins = data.map(admin => ({
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          username: admin.username,
          profileImage: admin.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.fullName)}&background=random`,
          createdAt: admin.createdAt ? new Date(admin.createdAt) : new Date(),
          adminId: admin.adminId || `ADM${Math.floor(1000 + Math.random() * 9000)}`
        }));
        
        console.log('Fetched admins:', transformedAdmins);
        setAdmins(transformedAdmins);
        setFilteredAdmins(transformedAdmins);
      } catch (error) {
        console.error('Error fetching admins:', error);
        toast.error('Failed to load admins: ' + error.message);

        // For development only - remove or comment this out for production
        // ONLY show mock data during development for UI testing
        if (import.meta.env.DEV) {
          console.warn('Using mock data in development mode');
          const mockAdmins = [
            {
              id: "1",
              fullName: "John Smith",
              email: "john.smith@realestate.com",
              username: "johnsmith",
              profileImage: `https://ui-avatars.com/api/?name=John+Smith&background=random`,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
              adminId: "ADM001"
            },
            {
              id: "2",
              fullName: "Jessica Lee",
              email: "jessica.lee@realestate.com",
              username: "jessicalee",
              profileImage: `https://ui-avatars.com/api/?name=Jessica+Lee&background=random`,
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
              adminId: "ADM002"
            },
            {
              id: "3",
              fullName: "Robert Johnson",
              email: "robert.j@realestate.com",
              username: "robertj",
              profileImage: `https://ui-avatars.com/api/?name=Robert+Johnson&background=random`,
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago 
              adminId: "ADM003"
            },
          ];
          
          setAdmins(mockAdmins);
          setFilteredAdmins(mockAdmins);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdmins();
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
      setFilteredAdmins(admins);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = admins.filter(
        admin =>
          admin.fullName.toLowerCase().includes(lowercasedQuery) ||
          admin.email.toLowerCase().includes(lowercasedQuery) ||
          admin.username.toLowerCase().includes(lowercasedQuery) ||
          admin.adminId.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredAdmins(filtered);
    }
  }, [searchQuery, admins]);

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  const currentAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setIsFormOpen(true);
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setIsFormOpen(true);
  };

  const handleAdminAdded = (newAdmin) => {
    setAdmins(prevAdmins => [newAdmin, ...prevAdmins]);
  };

  const handleAdminUpdated = (updatedAdmin) => {
    setAdmins(prevAdmins => 
      prevAdmins.map(admin => 
        admin.id === updatedAdmin.id ? updatedAdmin : admin
      )
    );
  };

  const handleAdminDeleted = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      // Find the admin before deletion
      const adminToDelete = admins.find(admin => admin.id === adminId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${adminId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete admin');
      }

      toast.success('Admin deleted successfully');
      
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== adminId));
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(error.message || 'Failed to delete admin');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Format date for display
  const formatDate = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (date >= yesterday) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else if (now.getFullYear() === date.getFullYear()) {
      return format(date, 'MMM d, h:mm a');
    } else {
      return format(date, 'MMM d, yyyy, h:mm a');
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Users</h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Admin Table */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-gray-800">Admin</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-800">Email</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-800">Account Created</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-800 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence mode="popLayout">
                    {currentAdmins.map((admin) => (
                      <motion.tr 
                        key={admin.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full overflow-hidden text-center flex items-center justify-center relative">
                              {admin.profileImage ? (
                                <img 
                                  src={convertS3UrlToProxyUrl(admin.profileImage)} 
                                  alt={admin.fullName}
                                  className="h-10 w-10 object-cover" 
                                />
                              ) : (
                                <span className="text-lg font-medium text-gray-600">
                                  {admin.fullName.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{admin.fullName}</div>
                              <div className="text-xs text-gray-500">ID: {admin.adminId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{admin.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{formatDate(admin.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                              onClick={() => handleEditAdmin(admin)}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                              onClick={() => handleAdminDeleted(admin.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {/* Empty State */}
            {currentAdmins.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-700">No admins found</h3>
                <p className="text-gray-500 mt-1">Try changing your search or add new admins.</p>
              </div>
            )}
            
            {/* Footer with Pagination */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {Math.max(totalPages, 1)}
              </div>
              
              {filteredAdmins.length > 0 && totalPages > 1 && (
                <Pagination>
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
          </div>
        )}
      </div>

      <AdminFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onAdminAdded={handleAdminAdded}
        onAdminUpdated={handleAdminUpdated}
        admin={editingAdmin}
        isEditing={!!editingAdmin}
      />

      <FloatingActionButton
        label="Add Admin"
        onClick={handleAddAdmin}
      />
    </div>
  );
};

export default AdminsPage;