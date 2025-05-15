import React, { useState, useEffect } from 'react';
import { getAllNews, createNews, updateNews, deleteNews } from '../../services/newsService';
import { Button } from '@/components/AdminPannel/ui/button';
import { Input } from '@/components/AdminPannel/ui/input';
import { Textarea } from '@/components/AdminPannel/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/AdminPannel/ui/select';
import { Switch } from '@/components/AdminPannel/ui/switch';
import { Label } from '@/components/AdminPannel/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/AdminPannel/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/AdminPannel/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/AdminPannel/ui/dropdown-menu';
import { toast } from '@/components/AdminPannel/ui/sonner';
import { Edit, MoreVertical, Trash2, Plus, FileText, Calendar, Tag, Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Import ReactQuill dynamically to prevent rendering errors
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

const newsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  image: z.string().url("Image must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  author: z.string().optional(),
  featured: z.boolean().default(false),
});

const NewsManagementPage = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formLoading, setFormLoading] = useState(false);
  
  const categories = ['All', 'Real Estate', 'Investment', 'Lifestyle', 'Business', 'Policy', 'Sustainability'];
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      image: '',
      category: 'Real Estate',
      author: '',
      featured: false
    }
  });
  
  // Watch content field
  const contentValue = watch('content');
  
  // Load news data
  useEffect(() => {
    fetchNews();
  }, []);
  
  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews();
      setNews(data);
      setFilteredNews(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news items');
      setLoading(false);
    }
  };
  
  // Filter news based on search and category
  useEffect(() => {
    let result = [...news];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    setFilteredNews(result);
  }, [searchQuery, selectedCategory, news]);
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Open dialog to add/edit news
  const openNewsForm = (newsItem = null) => {
    if (newsItem) {
      // Editing existing news
      setEditingNews(newsItem);
      setValue('title', newsItem.title);
      setValue('description', newsItem.description);
      setValue('content', newsItem.content || '');
      setValue('image', newsItem.image);
      setValue('category', newsItem.category);
      setValue('author', newsItem.author || '');
      setValue('featured', newsItem.featured || false);
    } else {
      // Adding new news
      setEditingNews(null);
      reset();
    }
    setIsFormOpen(true);
  };
  
  // Save news (create or update)
  const saveNews = async (formData) => {
    try {
      setFormLoading(true);
      
      console.log('Saving news with data:', formData);
      
      let response;
      if (editingNews) {
        // Update existing news
        response = await updateNews(editingNews._id, formData);
        toast.success('News updated successfully!');
      } else {
        // Create new news
        response = await createNews(formData);
        toast.success('News created successfully!');
      }
      
      console.log('Server response:', response);
      
      // Refresh the news list
      fetchNews();
      
      // Close the form
      setIsFormOpen(false);
      setFormLoading(false);
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error(editingNews ? 'Failed to update news' : 'Failed to create news');
      setFormLoading(false);
    }
  };
  
  // Handle news deletion
  const handleDeleteNews = async (id) => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      try {
        await deleteNews(id);
        toast.success('News deleted successfully!');
        
        // Refresh the news list
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
        toast.error('Failed to delete news');
      }
    }
  };
  
  // Handle news duplication
  const duplicateNews = (newsItem) => {
    // Create a new form data based on the selected news item
    const duplicatedData = {
      title: `${newsItem.title} (Copy)`,
      description: newsItem.description,
      content: newsItem.content,
      image: newsItem.image,
      category: newsItem.category,
      author: newsItem.author || '',
      featured: newsItem.featured || false
    };
    
    // Show loading toast
    toast.loading('Duplicating news...');
    
    // Create new news with duplicated data
    createNews(duplicatedData)
      .then(response => {
        console.log('Duplicated news successfully:', response);
        toast.success('News duplicated successfully!');
        fetchNews(); // Refresh the news list
      })
      .catch(error => {
        console.error('Error duplicating news:', error);
        toast.error('Failed to duplicate news');
      });
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">News Management</h1>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="default" 
              onClick={() => openNewsForm()}
              className="bg-[#FF2626] hover:bg-[#E60000] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add News
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNews ? 'Edit News' : 'Add News'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(saveNews)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  placeholder="Enter news title" 
                  {...register('title')} 
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Summary) *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter a brief description" 
                  rows={3}
                  {...register('description')} 
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea 
                  id="content" 
                  placeholder="Enter the full content of the news article (supports HTML)" 
                  rows={10}
                  {...register('content')} 
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  You can use HTML tags for formatting: &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image URL *</Label>
                <Input 
                  id="image" 
                  placeholder="Enter image URL" 
                  {...register('image')} 
                />
                {errors.image && (
                  <p className="text-sm text-red-500">{errors.image.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  onValueChange={(value) => setValue('category', value)} 
                  defaultValue={editingNews?.category || "Real Estate"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== 'All').map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author (Optional)</Label>
                <Input 
                  id="author" 
                  placeholder="Enter author name" 
                  {...register('author')} 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="featured"
                  checked={watch('featured')}
                  onCheckedChange={(checked) => setValue('featured', checked)}
                />
                <Label htmlFor="featured">Featured article</Label>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#FF2626] hover:bg-[#E60000] text-white"
                  disabled={formLoading || !contentValue}
                >
                  {formLoading ? 'Saving...' : 'Save News'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={selectedCategory === category ? "bg-[#FF2626] hover:bg-[#E60000] text-white" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      
      {/* News Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF2626]"></div>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No news found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || selectedCategory !== 'All' 
              ? 'Try changing your search criteria'
              : 'Get started by adding your first news article'}
          </p>
          <div className="mt-6">
            <Button
              onClick={() => openNewsForm()}
              className="bg-[#FF2626] hover:bg-[#E60000] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add News
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNews.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      </div>
                      <span className="truncate max-w-[250px]">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Tag className="mr-1 h-3 w-3" />
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-sm text-gray-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(item.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.featured ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Featured
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openNewsForm(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => duplicateNews(item)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteNews(item._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default NewsManagementPage; 