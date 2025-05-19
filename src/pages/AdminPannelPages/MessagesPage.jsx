import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
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
  EllipsisVertical, 
  Trash2, 
  Mail, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Search, 
  PhoneCall, 
  MessageSquare,
  Filter,
  RefreshCw,
  Calendar,
  Send,
  Star,
  StarOff,
  AlertCircle,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  X,
  Reply,
  User,
  MailOpen,
  Inbox,
  Archive,
  CheckCheck,
  Eye,
  Columns as LayoutSplitIcon
} from "lucide-react";

// Animation variants for elements
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

// Custom badge component with animation
const AnimatedBadge = ({ status }) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'new':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <MailOpen className="h-3 w-3 mr-1" /> };
      case 'in-progress':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: <Clock className="h-3 w-3 mr-1" /> };
      case 'resolved':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCheck className="h-3 w-3 mr-1" /> };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: <MessageSquare className="h-3 w-3 mr-1" /> };
    }
  };

  const { bg, text, icon } = getStatusDetails();

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {icon}
      {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  );
};

// Custom message card component
const MessageCard = ({ message, onClick, isSelected, onReply }) => {
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  
  return (
    <motion.div
      variants={listItemVariant}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className={`p-4 rounded-lg mb-3 transition-all border cursor-pointer ${isSelected ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-red-200'}`}
      onClick={() => onClick(message)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{message.name}</h3>
            <p className="text-sm text-gray-500">{message.email}</p>
          </div>
        </div>
        <AnimatedBadge status={message.status} />
      </div>
      
      <div className="ml-13">
        <h4 className="text-sm font-medium text-gray-800 mb-1">{message.subject || "General Inquiry"}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
      </div>
      
      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
        <span>{timeAgo}</span>
        <div className="flex items-center gap-2">
          {message.preferredContact && (
            <div className="flex items-center gap-1">
              {Array.isArray(message.preferredContact) ? (
                message.preferredContact.map((contact, index) => (
                  <span key={index} className="flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
                    {contact === 'phone' ? 
                      <PhoneCall className="h-3 w-3 mr-1" /> : 
                      <Mail className="h-3 w-3 mr-1" />}
                    {contact}
                  </span>
                ))
              ) : (
                <span className="flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
                  {message.preferredContact === 'phone' ? 
                    <PhoneCall className="h-3 w-3 mr-1" /> : 
                    <Mail className="h-3 w-3 mr-1" />}
                  {message.preferredContact}
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2 ml-2">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onReply(message);
              }}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Reply to message"
            >
              <Reply className="h-3.5 w-3.5 text-gray-500" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MessagesPage = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("split"); // 'split', 'list', or 'detail'
  const [isComposing, setIsComposing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [messageToReply, setMessageToReply] = useState(null);
  const [replySubject, setReplySubject] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [showTopbar, setShowTopbar] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const messagesPerPage = 10;
  const mainContentRef = useRef(null);
  const messageListRef = useRef(null);

  // Handle scroll to hide/show topbar and load more messages
  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current) return;
      
      const scrollTop = mainContentRef.current.scrollTop;
      
      // Determine scroll direction for showing/hiding the topbar
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down & past threshold
        setShowTopbar(false);
      } else if (scrollTop < lastScrollTop || scrollTop < 50) {
        // Scrolling up or near top
        setShowTopbar(true);
      }
      
      setLastScrollTop(scrollTop);

      // Infinite scroll logic for message list
      if (messageListRef.current && !loadingMore && hasMore) {
        const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          // User has scrolled to within 100px of the bottom, load more messages
          loadMoreMessages();
        }
      }
    };

    const currentRef = mainContentRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [lastScrollTop, loadingMore, hasMore]);

  // Load more messages when scrolling down
  const loadMoreMessages = () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    
    // Simulate loading delay (in a real app, you'd fetch from API here)
    setTimeout(() => {
      const nextPage = page + 1;
      setPage(nextPage);
      
      // If we've loaded all messages, set hasMore to false
      if (nextPage * messagesPerPage >= filteredMessages.length) {
        setHasMore(false);
      }
      
      setLoadingMore(false);
    }, 800);
  };

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Get API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      console.log("Fetching messages from:", `${apiUrl}/api/messages`);
      
      // Make API request with credentials to send cookies
      const response = await fetch(`${apiUrl}/api/messages`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
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
      console.log("Messages data:", data);
      
      if (data.success) {
        setMessages(data.data);
        setTotalPages(Math.ceil(data.count / messagesPerPage) || 1);
      } else {
        throw new Error(data.message || "Failed to fetch messages");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.message);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchMessages();
  }, []);

  // Open message detail view
  const handleViewMessage = (message) => {
    setSelectedMessage(message);
  };

  // Open reply dialog
  const handleOpenReply = (message) => {
    setMessageToReply(message);
    setReplySubject(`Re: ${message.subject || "General Inquiry"}`);
    setReplyText(`Dear ${message.name},\n\nThank you for your message regarding "${message.subject || "your inquiry"}"...\n\nBest regards,\nThe MateLuxy Team`);
    setReplyDialogOpen(true);
  };

  // Handle reply text change
  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  // Handle reply subject change
  const handleSubjectChange = (e) => {
    setReplySubject(e.target.value);
  };

  // Filter messages based on search term and active tab
  const filteredMessages = messages.filter(message => {
    const matchesSearch = searchTerm === "" || 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && message.status === activeTab;
  });

  // Slice messages for current view based on the current page
  const displayedMessages = filteredMessages.slice(0, page * messagesPerPage);

  // Update message status
  const updateMessageStatus = async (id, status) => {
    try {
      // Get API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/messages/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update messages state with the new status
        setMessages(messages.map(msg => 
          msg._id === id ? { ...msg, status } : msg
        ));
        
        // Update selected message if it's the one being updated
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage({ ...selectedMessage, status });
        }
        
        toast.success(`Message marked as ${status}`);
      } else {
        throw new Error(data.message || "Failed to update message status");
      }
    } catch (err) {
      console.error("Error updating message status:", err);
      toast.error("Failed to update message status");
    }
  };

  // Handle dialog reply submission
  const handleDialogReply = () => {
    if (!messageToReply || !replyText.trim()) return;
    
    const replyData = {
      messageId: messageToReply._id,
      to: messageToReply.email,
      subject: replySubject,
      text: replyText,
      name: messageToReply.name
    };
    
    // Use the common email sending function
    sendEmailReply(replyData, () => {
      // Additional callback actions specific to dialog reply
      setReplyDialogOpen(false);
      setReplySubject("");
      setMessageToReply(null);
      
      // Update message status to in-progress if it was new
      if (messageToReply.status === 'new') {
        updateMessageStatus(messageToReply._id, 'in-progress');
      }
    });
  };

  // Delete message
  const deleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/messages/${messageToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        setError("Authentication required. Please log in again.");
        setDeleteDialogOpen(false);
        setMessageToDelete(null);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local messages state
        setMessages(prev => 
          prev.filter(msg => msg._id !== messageToDelete._id)
        );
        
        // If the deleted message is currently selected, close the dialog
        if (selectedMessage && selectedMessage._id === messageToDelete._id) {
          setShowMessageDialog(false);
          setSelectedMessage(null);
        }
        
        toast.success("Message deleted successfully");
      } else {
        throw new Error(data.message || "Failed to delete message");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message");
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  // Handle confirmation for message deletion
  const confirmDelete = (message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  // Get badge color based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge variant="warning">New</Badge>;
      case 'in-progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
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
  
  // Refresh messages
  const handleRefresh = () => {
    fetchMessages();
    toast.success("Messages refreshed");
  };
  
  // Export messages as CSV
  const exportMessages = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Phone", "Subject", "Message", "Preferred Contact", "Status", "Date"];
    const csvRows = [
      headers.join(","),
      ...filteredMessages.map(msg => {
        return [
          `"${msg.name || ''}"`,
          `"${msg.email || ''}"`,
          `"${msg.phone || ''}"`,
          `"${msg.subject || 'General Inquiry'}"`,
          `"${msg.message.replace(/"/g, '""') || ''}"`,
          `"${msg.preferredContact || 'email'}"`,
          `"${msg.status || 'new'}"`,
          `"${formatDate(msg.createdAt)}"`,
        ].join(",");
      })
    ];
    
    // Create and download CSV file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `messages_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Messages exported successfully");
  };

  // Scroll to bottom of messages when new ones are loaded
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Toggle view mode between split, list, and detail views
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Handle inline reply composition
  const handleInlineReply = () => {
    if (!replyText.trim()) return;
    
    // Use the same sendReply function but with inline context
    const inlineReplyData = {
      messageId: selectedMessage._id,
      to: selectedMessage.email,
      subject: `Re: ${selectedMessage.subject || "General Inquiry"}`,
      text: replyText,
      name: selectedMessage.name
    };
    
    // Call the API with the inline reply data
    sendEmailReply(inlineReplyData);
  };
  
  // Helper function to open Gmail with pre-filled fields for reply
  const sendEmailReply = (replyData, callback) => {
    try {
      setSendingReply(true);
      
      // Get the recipient email, subject, and body from replyData
      const { to, subject, text } = replyData;
      
      if (!to) {
        throw new Error("Recipient email is required");
      }
      
      // Encode the subject and body for the Gmail URL
      const encodedSubject = encodeURIComponent(subject || "Re: Your Inquiry");
      const encodedBody = encodeURIComponent(text || "");
      const encodedTo = encodeURIComponent(to);
      
      // Create the Gmail compose URL (this directly opens Gmail)
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`;
      
      // Open Gmail in a new tab
      window.open(gmailUrl, "_blank");
      
      toast.success("Gmail compose window opened");
      setReplyText("");
      
      // If this is from the inline compose form
      if (!callback) {
        setIsComposing(false);
        
        // Update message status to in-progress if it was new
        if (selectedMessage && selectedMessage.status === 'new') {
          updateMessageStatus(selectedMessage._id, 'in-progress');
        }
      } else {
        // Execute additional callback actions if provided
        callback();
      }
    } catch (err) {
      console.error("Error opening Gmail:", err);
      toast.error("Failed to open Gmail: " + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="h-[calc(100vh-80px)] overflow-hidden flex flex-col bg-gray-50 rounded-xl shadow-sm"
    >
      {/* Modern header with animated stats - now with transition for hiding */}
      <motion.div 
        initial={{ y: 0, opacity: 1 }} 
        animate={{ y: showTopbar ? 0 : '-100%', opacity: showTopbar ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-b border-gray-200 p-4 z-20 sticky top-0"
      >
        <motion.div 
          variants={slideUp}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center">
              <MessageSquare className="h-6 w-6 mr-2 text-red-500" />
              <span>Messages</span>
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
              Manage customer inquiries and communication
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
                  <Inbox className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Total</div>
                  <div className="text-lg font-bold text-gray-800">{messages.length}</div>
                </div>
              </motion.div>
              
              <motion.div variants={listItemVariant} className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200 flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <MailOpen className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">New</div>
                  <div className="text-lg font-bold text-gray-800">
                    {messages.filter(m => m.status === 'new').length}
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={listItemVariant} className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200 flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Resolved</div>
                  <div className="text-lg font-bold text-gray-800">
                    {messages.filter(m => m.status === 'resolved').length}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      {/* Modern search and filters bar - also with transition for hiding */}
      <motion.div 
        initial={{ y: 0, opacity: 1 }} 
        animate={{ y: showTopbar ? 0 : '-100%', opacity: showTopbar ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white border-b border-gray-200 p-4 z-10 sticky top-0"
      >
        <motion.div 
          variants={slideUp}
          className="flex flex-col gap-4 max-w-7xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96 transition-all duration-300 ease-in-out">
              <motion.div 
                initial={false}
                animate={isSearchFocused ? { width: '100%' } : { width: '100%' }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${isSearchFocused ? 'text-red-500' : 'text-gray-400'}`} />
                <Input
                  type="text"
                  placeholder="Search by name, email or message content..."
                  className="pl-10 py-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full transition-all"
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </motion.div>
            </div>
            
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportMessages}
                  className="border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </motion.div>
              
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <motion.button
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-red-50 text-red-600' : 'bg-white text-gray-500'}`}
                >
                  <Inbox className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleViewMode('split')}
                  className={`p-2 ${viewMode === 'split' ? 'bg-red-50 text-red-600' : 'bg-white text-gray-500'}`}
                >
                  <LayoutSplitIcon className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-gray-100 p-1 rounded-lg w-full flex justify-start overflow-x-auto">
                <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
                  All
                </TabsTrigger>
                <TabsTrigger value="new" className="rounded-md data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
                  New
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="rounded-md data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
                  In Progress
                </TabsTrigger>
                <TabsTrigger value="resolved" className="rounded-md data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
                  Resolved
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Main content area with scroll capability */}
      <div 
        ref={mainContentRef}
        className="flex-1 flex overflow-auto h-full"
      >
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="rounded-full h-12 w-12 border-2 border-red-500 border-t-transparent"
            />
            <p className="ml-4 text-gray-500">Loading messages...</p>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-center items-center p-8"
          >
            <MessageSquare className="h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">{error}</h3>
            <p className="text-red-600 mb-4 text-center max-w-md">There was a problem loading your messages.</p>
            {(error && error.includes("Authentication")) && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin-login')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Go to Login
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Message list panel */}
            <motion.div 
              initial={{ width: viewMode === 'detail' ? 0 : '100%' }}
              animate={{ 
                width: viewMode === 'detail' ? 0 : viewMode === 'split' ? '40%' : '100%',
                opacity: viewMode === 'detail' ? 0 : 1
              }}
              transition={{ duration: 0.3 }}
              className={`border-r border-gray-200 overflow-y-auto h-full ${viewMode === 'detail' ? 'hidden' : 'block'}`}
              ref={messageListRef}
            >
              {filteredMessages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col justify-center items-center p-8 text-center"
                >
                  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm ? "Try a different search term or filter to find what you're looking for." : "No contact messages have been received yet. When customers send inquiries, they'll appear here."}
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="p-4 h-full overflow-y-auto"
                >
                  {displayedMessages.map((message) => (
                    <MessageCard 
                      key={message._id} 
                      message={message} 
                      onClick={handleViewMessage}
                      onReply={handleOpenReply}
                      isSelected={selectedMessage && selectedMessage._id === message._id}
                    />
                  ))}
                  
                  {/* Loading indicator for infinite scroll */}
                  {loadingMore && (
                    <div className="flex justify-center items-center py-4">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"
                      />
                      <span className="ml-2 text-sm text-gray-500">Loading more...</span>
                    </div>
                  )}
                  
                  {/* End of results indicator */}
                  {!hasMore && filteredMessages.length > 0 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      End of messages
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </motion.div>

            {/* Message detail panel */}
            <motion.div 
              initial={{ width: viewMode === 'list' ? 0 : '100%' }}
              animate={{ 
                width: viewMode === 'list' ? 0 : viewMode === 'split' ? '60%' : '100%',
                opacity: viewMode === 'list' ? 0 : 1 
              }}
              transition={{ duration: 0.3 }}
              className={`bg-white ${viewMode === 'list' ? 'hidden' : 'block'} h-full flex flex-col overflow-hidden`}
            >
              {selectedMessage ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  {/* Message header */}
                  <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-white z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject || "General Inquiry"}</h2>
                        <AnimatedBadge status={selectedMessage.status} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>From: {selectedMessage.name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {viewMode === 'detail' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleViewMode('split')}
                          className="text-gray-500"
                        >
                          <LayoutSplitIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedMessage(null)}
                        className="text-gray-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Message content - Make this scrollable */}
                  <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex items-start mb-6">
                      <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <span className="font-medium text-gray-900">{selectedMessage.name}</span>
                              <span className="text-sm text-gray-500 ml-2">&lt;{selectedMessage.email}&gt;</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {format(new Date(selectedMessage.createdAt), "MMM d, yyyy • h:mm a")}
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap text-gray-700">
                            {selectedMessage.message}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <PhoneCall className="h-3 w-3 mr-1" />
                            {selectedMessage.phone || "No phone provided"}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Preferred contact: 
                            {Array.isArray(selectedMessage.preferredContact) ? (
                              <div className="flex gap-1 ml-1">
                                {selectedMessage.preferredContact.map((contact, index) => (
                                  <span key={index} className="bg-gray-100 px-1.5 py-0.5 rounded">
                                    {contact}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              selectedMessage.preferredContact || "Email"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reply section */}
                    <div className="mt-8">
                      <AnimatePresence>
                        {isComposing ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                              <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium text-gray-700">Reply to {selectedMessage.name}</h3>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setIsComposing(false)}
                                  className="text-gray-500 h-6 w-6 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <Textarea
                                value={replyText}
                                onChange={handleReplyChange}
                                placeholder={`Hi ${selectedMessage.name},\n\nThank you for your message...`}
                                className="min-h-[150px] border-gray-200 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              />
                              <div className="flex justify-end mt-4 gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setIsComposing(false)}
                                  className="border-gray-200"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => handleInlineReply()}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  disabled={!replyText.trim()}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Send Reply
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-between"
                          >
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsComposing(true)}
                                className="border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200"
                              >
                                <Reply className="h-4 w-4 mr-1" />
                                Reply
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant={selectedMessage.status === 'new' ? "default" : "outline"}
                                size="sm"
                                className={selectedMessage.status === 'new' ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "border-gray-200"}
                                onClick={() => updateMessageStatus(selectedMessage._id, 'new')}
                                disabled={selectedMessage.status === 'new'}
                              >
                                <MailOpen className="h-4 w-4 mr-1" />
                                New
                              </Button>
                              <Button
                                variant={selectedMessage.status === 'in-progress' ? "default" : "outline"}
                                size="sm"
                                className={selectedMessage.status === 'in-progress' ? "bg-red-500 hover:bg-red-600 text-white" : "border-gray-200"}
                                onClick={() => updateMessageStatus(selectedMessage._id, 'in-progress')}
                                disabled={selectedMessage.status === 'in-progress'}
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                In Progress
                              </Button>
                              <Button
                                variant={selectedMessage.status === 'resolved' ? "default" : "outline"}
                                size="sm"
                                className={selectedMessage.status === 'resolved' ? "bg-green-500 hover:bg-green-600 text-white" : "border-gray-200"}
                                onClick={() => updateMessageStatus(selectedMessage._id, 'resolved')}
                                disabled={selectedMessage.status === 'resolved'}
                              >
                                <CheckCheck className="h-4 w-4 mr-1" />
                                Resolved
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ) : viewMode !== 'list' && (
                <div className="h-full flex flex-col justify-center items-center p-8 text-center">
                  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Mail className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No message selected</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Select a message from the list to view its details
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
      
      {/* Modern pagination - now sticky at the bottom */}
      {!loading && !error && filteredMessages.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Pagination>
              <PaginationContent className="flex flex-wrap justify-center">
                <PaginationItem>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50 transition-colors"}
                    />
                  </motion.div>
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i} className={page === i + 1 ? "hidden sm:block" : totalPages > 5 && (i < page - 2 || i > page + 0) ? "hidden sm:block" : ""}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <PaginationLink
                        onClick={() => setPage(i + 1)}
                        isActive={page === i + 1}
                        className={page === i + 1 ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200 font-medium transition-colors" : "hover:bg-red-50 transition-colors"}
                      >
                        {i + 1}
                      </PaginationLink>
                    </motion.div>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className={page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50 transition-colors"}
                    />
                  </motion.div>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </motion.div>
        </div>
      )}
      
      {/* Message Detail Dialog - Enhanced with better styling */}
      {selectedMessage && (
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="sm:max-w-lg bg-white p-0 rounded-xl overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-red-50">
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <Mail className="h-5 w-5 text-red-500" />
                Contact Message
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Message details from {selectedMessage.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">
                      {formatDate(selectedMessage.createdAt)}
                    </span>
                  </div>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
                    <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-red-600 font-medium">{selectedMessage.email}</p>
                        <a 
                          href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject || 'Your inquiry'}`}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                    
                    {selectedMessage.phone && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{selectedMessage.phone}</p>
                          <a 
                            href={`tel:${selectedMessage.phone}`}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Subject</h3>
                    <p className="font-medium text-gray-900">{selectedMessage.subject || "General Inquiry"}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Preferred Contact Method</h3>
                    <p className="font-medium text-gray-900 capitalize">{selectedMessage.preferredContact || "Email"}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Message</h3>
                    <div className="mt-2 bg-white p-4 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-800">
                      {selectedMessage.message}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-3 gap-2 w-full mb-4">
                <Button
                  variant={selectedMessage.status === 'new' ? "default" : "outline"}
                  className={selectedMessage.status === 'new' ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500" : "border-gray-200"}
                  onClick={() => updateMessageStatus(selectedMessage._id, 'new')}
                  disabled={selectedMessage.status === 'new'}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  New
                </Button>
                <Button
                  variant={selectedMessage.status === 'in-progress' ? "default" : "outline"}
                  className={selectedMessage.status === 'in-progress' ? "bg-red-500 hover:bg-red-600 border-red-500" : "border-gray-200"}
                  onClick={() => updateMessageStatus(selectedMessage._id, 'in-progress')}
                  disabled={selectedMessage.status === 'in-progress'}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  In Progress
                </Button>
                <Button
                  variant={selectedMessage.status === 'resolved' ? "default" : "outline"}
                  className={selectedMessage.status === 'resolved' ? "bg-red-500 hover:bg-red-600 border-red-500" : "border-gray-200"}
                  onClick={() => updateMessageStatus(selectedMessage._id, 'resolved')}
                  disabled={selectedMessage.status === 'resolved'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolved
                </Button>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowMessageDialog(false)}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowMessageDialog(false);
                    confirmDelete(selectedMessage);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white p-0 rounded-xl overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-red-50">
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Reply className="h-5 w-5 text-red-500" />
              Reply to Message
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Send an email reply to {messageToReply?.name} at {messageToReply?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4">
            {messageToReply && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input
                    id="subject"
                    value={replySubject}
                    onChange={handleSubjectChange}
                    className="w-full border-gray-200 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <Textarea
                    id="reply"
                    value={replyText}
                    onChange={handleReplyChange}
                    className="min-h-[200px] w-full border-gray-200 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </motion.div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => setReplyDialogOpen(false)}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  disabled={sendingReply}
                >
                  Cancel
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="default"
                  onClick={handleDialogReply}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={!replyText.trim() || sendingReply}
                >
                  {sendingReply ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Enhanced with better styling */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white p-0 rounded-xl overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-red-50">
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4">
            {messageToDelete && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 p-4 rounded-lg mb-4 border border-red-100"
              >
                <p className="font-medium text-red-700 mb-1">Message from: {messageToDelete.name}</p>
                <p className="text-sm text-red-600 truncate">{messageToDelete.subject || "General Inquiry"}</p>
              </motion.div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="destructive"
                  onClick={deleteMessage}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Message
                </Button>
              </motion.div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default MessagesPage; 