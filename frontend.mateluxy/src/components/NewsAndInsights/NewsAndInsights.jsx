import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NewsInsightCard from './components/NewsInsightCard';
import { FiArrowRight } from 'react-icons/fi';
import { getAllNews } from '../../services/newsService';

const NewsAndInsights = () => {
    const [visibleCount, setVisibleCount] = useState(3);
    const [newsInsights, setNewsInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    
    const categories = ['All', 'Real Estate', 'Investment', 'Lifestyle', 'Business', 'Policy', 'Sustainability'];
    
    useEffect(() => {
        fetchNews();
    }, [activeCategory]);
    
    const fetchNews = async () => {
        try {
            setLoading(true);
            const params = {};
            
            if (activeCategory !== 'All') {
                params.category = activeCategory;
            }
            
            const data = await getAllNews(params);
            setNewsInsights(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching news:', error);
            setError('Failed to load news. Please try again later.');
            setLoading(false);
            
            // Fallback to static data if API fails
            setNewsInsights([
                {
                    id: '1',
                    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                    title: "How easy is it to set up a business in Dubai?",
                    description: "As a global business hub, Dubai attracts entrepreneurs and investors from all over the world.",
                    date: "May 5, 2025",
                    category: "Business"
                },
                {
                    id: '2',
                    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                    title: "The latest trends in Dubai's luxury real estate market",
                    description: "Discover what's driving the luxury property market in Dubai and where the best investment opportunities lie.",
                    date: "May 2, 2025",
                    category: "Real Estate"
                },
                {
                    id: '3',
                    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                    title: "Top 5 neighborhoods for families in Dubai",
                    description: "Find out which Dubai neighborhoods offer the best amenities, schools, and lifestyle for families.",
                    date: "April 28, 2025",
                    category: "Lifestyle"
                }
            ]);
        }
    };
    
    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        setVisibleCount(3);
    };
    
    const handleLoadMore = () => {
        setVisibleCount(prevCount => Math.min(prevCount + 3, newsInsights.length));
    };
    
    const handleShowLess = () => {
        setVisibleCount(3);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className='py-0 sm:py-0 md:py-0'>
            <div className='mx-auto'>
                {/* Header Section */}
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 space-y-4 sm:space-y-0 px-4'>
                    <div>
                        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800'>News and Insights</h1>
                        <p className='text-gray-600 mt-2 max-w-xl'>Stay updated with the latest trends and insights in Dubai's real estate market</p>
                    </div>
                    <Link to="/news" className='text-[#FF2626] bg-[#FFF0F0] hover:bg-[#FFE0E0] transition-colors px-4 py-2 sm:px-5 sm:py-3 font-medium rounded-[10px] text-sm sm:text-base flex items-center'>
                        All News <FiArrowRight className='ml-2' />
                    </Link>
                </div>

                {/* Category Filters */}
                <div className='flex flex-wrap gap-2 mb-8 px-4 overflow-x-auto pb-2'>
                    {categories.map((category, index) => (
                        <button 
                            key={index}
                            className={`${
                                activeCategory === category 
                                ? 'bg-[#FF2626] text-white' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            } px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors`}
                            onClick={() => handleCategoryClick(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF2626]"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : (
                    <>
                        {/* News Cards Grid */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 px-4'>
                            {newsInsights.slice(0, visibleCount).map((newsInsight) => (
                                <NewsInsightCard 
                                    key={newsInsight._id || newsInsight.id} 
                                    newsInsight={{
                                        ...newsInsight,
                                        date: newsInsight.createdAt ? formatDate(newsInsight.createdAt) : newsInsight.date
                                    }}
                                />
                            ))}
                        </div>
                        
                        {/* Load More / Show Less Buttons */}
                        {newsInsights.length > 3 && (
                            <div className='flex justify-center mt-10'>
                                {visibleCount < newsInsights.length ? (
                                    <button 
                                        onClick={handleLoadMore}
                                        className='bg-white border border-[#FF2626] text-[#FF2626] hover:bg-[#FFF0F0] transition-colors px-6 py-3 rounded-[10px] font-medium flex items-center'
                                    >
                                        Load More <FiArrowRight className='ml-2' />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleShowLess}
                                        className='bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors px-6 py-3 rounded-[10px] font-medium'
                                    >
                                        Show Less
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NewsAndInsights;