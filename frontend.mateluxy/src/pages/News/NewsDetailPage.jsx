import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsById, getNewsBySlug, getAllNews } from '../../services/newsService';
import { FiCalendar, FiTag, FiArrowLeft, FiShare2, FiClock, FiFacebook, FiTwitter, FiLinkedin } from 'react-icons/fi';
// import { Helmet } from 'react-helmet';

const NewsDetailPage = () => {
  const { slug } = useParams();
  const [newsArticle, setNewsArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log('NewsDetailPage rendered with slug:', slug);
  
  useEffect(() => {
    console.log('Fetching news article for slug:', slug);
    fetchNewsArticle();
  }, [slug]);
  
  const fetchNewsArticle = async () => {
    try {
      setLoading(true);
      let article;
      
      // Try to fetch by slug first
      try {
        console.log('Trying to fetch by slug:', slug);
        article = await getNewsBySlug(slug);
        console.log('Article fetched by slug:', article);
      } catch (error) {
        // If that fails, try to fetch by ID
        console.log('Fetching by slug failed, trying ID:', slug);
        article = await getNewsById(slug);
        console.log('Article fetched by ID:', article);
      }
      
      setNewsArticle(article);
      
      // Fetch related articles (same category)
      fetchRelatedArticles(article.category);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news article:', error);
      setError('Failed to load article. Please try again later.');
      setLoading(false);
    }
  };
  
  const fetchRelatedArticles = async (category) => {
    try {
      const articles = await getAllNews({ category, limit: 3 });
      // Filter out the current article
      const filtered = articles.filter(article => 
        article._id !== newsArticle?._id && article.slug !== slug
      );
      setRelatedArticles(filtered.slice(0, 3));
    } catch (error) {
      console.error('Error fetching related articles:', error);
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
  
  // Reading time estimate (assuming 200 words per minute)
  const calculateReadingTime = (content) => {
    if (!content) return '1 min read';
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };
  
  // Share functionality
  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: newsArticle?.title,
        text: newsArticle?.description,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  // Social sharing links
  const getFacebookShareUrl = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  };
  
  const getTwitterShareUrl = () => {
    return `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(newsArticle?.title)}`;
  };
  
  const getLinkedInShareUrl = () => {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
  };
  
  return (
    <>
      {/* SEO Metadata - Using document.title instead of Helmet temporarily */}
      {newsArticle && (
        <div style={{ display: 'none' }}>
          {document.title = `${newsArticle.title} | MateLuxy Real Estate News`}
        </div>
      )}
    
      <div className="max-w-[1440px] mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Link to="/news" className="inline-flex items-center text-gray-600 hover:text-[#FF2626] mb-6">
          <FiArrowLeft className="mr-2" />
          Back to News
        </Link>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF2626]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : newsArticle ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                {/* Category and Date */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiTag className="mr-1 text-[#FF2626]" />
                    <span>{newsArticle.category}</span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="mr-1 text-[#FF2626]" />
                    <span>{formatDate(newsArticle.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-1 text-[#FF2626]" />
                    <span>{calculateReadingTime(newsArticle.content)}</span>
                  </div>
                  {newsArticle.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                  {newsArticle.title}
                </h1>
                
                {/* Featured Image */}
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img 
                    src={newsArticle.image} 
                    alt={newsArticle.title} 
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                {/* Description */}
                <p className="text-lg font-medium text-gray-700 mb-6">
                  {newsArticle.description}
                </p>
                
                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-a:text-[#FF2626] prose-img:rounded-lg" 
                  dangerouslySetInnerHTML={{ __html: newsArticle.content }}
                />
                
                {/* Social Share Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between flex-wrap">
                    <div>
                      <h4 className="text-gray-700 font-medium mb-2">Share this article:</h4>
                      <div className="flex space-x-2">
                        <a 
                          href={getFacebookShareUrl()} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                        >
                          <FiFacebook />
                        </a>
                        <a 
                          href={getTwitterShareUrl()} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600"
                        >
                          <FiTwitter />
                        </a>
                        <a 
                          href={getLinkedInShareUrl()} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800"
                        >
                          <FiLinkedin />
                        </a>
                      </div>
                    </div>
                    <button 
                      onClick={shareArticle}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg mt-2 sm:mt-0"
                    >
                      <FiShare2 className="mr-2" />
                      Share Article
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/4">
              {/* Related Articles */}
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Related Articles</h3>
                
                {relatedArticles.length > 0 ? (
                  <div className="space-y-6">
                    {relatedArticles.map((article) => (
                      <div key={article._id} className="group">
                        <Link to={`/news/${article.slug || article._id}`} className="block">
                          <div className="mb-2 rounded-lg overflow-hidden">
                            <img 
                              src={article.image} 
                              alt={article.title} 
                              className="w-full h-36 object-cover group-hover:opacity-90 transition-opacity"
                            />
                          </div>
                          <h4 className="font-medium text-gray-800 group-hover:text-[#FF2626] transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <FiCalendar className="mr-1" />
                            <span>{formatDate(article.createdAt)}</span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No related articles found</p>
                )}
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link 
                    to="/news" 
                    className="text-[#FF2626] font-medium flex items-center hover:underline"
                  >
                    View all articles
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Article not found.</p>
            <Link to="/news" className="mt-4 inline-block text-[#FF2626] font-medium hover:underline">
              Return to News Page
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default NewsDetailPage; 