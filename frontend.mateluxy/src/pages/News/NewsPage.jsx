import React, { useState, useEffect } from 'react';
import { getAllNews } from '../../services/newsService';
import NewsInsightCard from '../../components/NewsAndInsights/components/NewsInsightCard';
import { FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';

const NewsPage = () => {
  const [newsArticles, setNewsArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = ['All', 'Real Estate', 'Investment', 'Lifestyle', 'Business', 'Policy', 'Sustainability'];
  
  useEffect(() => {
    fetchNews();
  }, []);
  
  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews();
      setNewsArticles(data);
      setFilteredArticles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to load news. Please try again later.');
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Filter articles based on search and category
  useEffect(() => {
    let result = [...newsArticles];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(article => article.category === selectedCategory);
    }
    
    setFilteredArticles(result);
  }, [searchQuery, selectedCategory, newsArticles]);
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">News and Insights</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stay updated with the latest trends, insights, and news in Dubai's real estate market
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2626] focus:border-transparent"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Filter Toggle (Mobile) */}
          <button
            className="md:hidden flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="mr-2" />
            Filters
            <FiChevronDown className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Desktop Filters */}
          <div className="hidden md:flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-[#FF2626] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Mobile Filters */}
        {showFilters && (
          <div className="md:hidden mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-[#FF2626] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* News Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF2626]"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No news articles found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {filteredArticles.map((article) => (
            <NewsInsightCard
              key={article._id || article.id}
              newsInsight={{
                ...article,
                date: article.createdAt ? formatDate(article.createdAt) : article.date
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsPage; 