import React, { useState, useEffect } from "react";
import "../../components/Navbar/colors.css";
import { getBannersByType } from "../../services/bannerService";
import { Link } from "react-router-dom";
import { convertS3UrlToProxyUrl } from "../../utils/s3UrlConverter";

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Single placeholder slide when no data is available
  const placeholderSlide = {
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
    title: "MateLuxy",
    subtitle: "Real Estate",
    description: "Discover your dream property with MateLuxy. We offer a complete service for buying, selling, and renting properties with a modern approach.",
    buttonText1: "Learn More",
    buttonLink1: "#",
    buttonText2: "Explore Properties",
    buttonLink2: "/properties"
  };

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await getBannersByType('home');
        if (data && data.length > 0) {
          setSlides(data);
        } else {
          // Use a single placeholder slide instead of multiple dummy slides
          setSlides([placeholderSlide]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching home banners:', err);
        setError('Failed to load banners');
        setSlides([placeholderSlide]);
        setLoading(false);
      }
    };
    
    fetchBanners();
  }, []);

  // Initialize with placeholder slide immediately to prevent rendering errors
  useEffect(() => {
    if (slides.length === 0) {
      setSlides([placeholderSlide]);
    }
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Handle manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Shimmer loading animation component
  const ShimmerLoading = () => (
    <div className="mx-auto w-full overflow-hidden relative rounded-[30px] shadow-2xl">
      <div className="relative min-h-[650px] md:min-h-[650px] bg-gray-200 overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-gray-200 via-white to-gray-200"></div>
        
        {/* Content placeholders */}
        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 py-12">
          <div className="max-w-xl">
            {/* Subtitle placeholder */}
            <div className="h-4 w-40 bg-gray-300 rounded-md mb-4"></div>
            
            {/* Title placeholders */}
            <div className="h-12 w-72 bg-gray-300 rounded-md mb-3"></div>
            <div className="h-12 w-48 bg-gray-300 rounded-md mb-6"></div>
            
            {/* Description placeholder */}
            <div className="h-24 w-full max-w-md bg-gray-300 rounded-md mb-8"></div>
            
            {/* Button placeholders */}
            <div className="flex flex-wrap gap-4">
              <div className="h-12 w-32 bg-gray-300 rounded-full"></div>
              <div className="h-12 w-40 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Slide indicators placeholders */}
        <div className="absolute bottom-8 right-8 flex space-x-2 z-20">
          <div className="w-8 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );

  // Add keyframes for shimmer animation to the document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeInUp {
        animation: fadeInUp 0.8s ease-out forwards;
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  // Helper function to get the correct image URL
  const getImageUrl = (imageUrl) => {
    // Check if it's a base64 image
    if (imageUrl && imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // Otherwise convert S3 URL to proxy URL
    return convertS3UrlToProxyUrl(imageUrl);
  };

  if (loading) {
    return <ShimmerLoading />;
  }

  if (error) {
    return (
      <div className="mx-auto mb-11 w-full overflow-hidden relative rounded-[30px] shadow-2xl">
        <div className="relative min-h-[650px] md:min-h-[650px] flex items-center justify-center">
          <p className="text-red-500 text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-11 w-full overflow-hidden relative rounded-[30px] shadow-2xl sm:rounded-[30px] sm:mx-auto sm:w-full rounded-none mx-0">
      {/* Main banner container */}
      <div className="relative aspect-[16/9] sm:aspect-auto sm:min-h-[650px] md:min-h-[650px] w-screen left-1/2 right-1/2 -translate-x-1/2 sm:w-full sm:left-0 sm:right-0 sm:translate-x-0">
        {/* Image slider with transition effects */}
        <div className="absolute inset-0 w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${getImageUrl(slide.image)})` }}
              >
              </div>
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
            </div>
          ))}
        </div>

        {/* Content overlay */}
        <>
          {/* Mobile layout: absolute bottom center */}
          <div className="sm:hidden absolute bottom-0 left-1/2 w-full flex flex-col items-center justify-end pb-6 px-4 transform -translate-x-1/2 bg-gradient-to-t from-black/70 via-black/10 to-transparent">
            <h1 className="text-white text-lg font-bold text-center">
              {slides[currentSlide]?.title}
            </h1>
            <p className="text-white text-xs text-center mt-1">
              {slides[currentSlide]?.subtitle}
            </p>
          </div>
          {/* Desktop layout: vertically centered as before */}
          <div className="hidden sm:flex flex-col justify-center h-full relative z-10">
            <div className="max-w-2xl px-8 md:px-16 py-12">
              <div className="overflow-hidden mb-0 sm:mb-4">
                <h1 className="hidden sm:block text-3xl md:text-5xl font-bold text-white animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                  {slides[currentSlide]?.title}
                </h1>
              </div>
              <span className="text-[#FF2626] sm:inline">{slides[currentSlide]?.subtitle}</span>
              <div className="overflow-hidden mb-8">
                <p className="text-white/80 text-base md:text-lg max-w-md animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                  {slides[currentSlide]?.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                <Link to={slides[currentSlide]?.buttonLink1 || '#'} className="px-6 py-3 text-sm md:text-base font-medium rounded-full border-2 border-white text-white hover:bg-white hover:text-[#FF2626] transition-all duration-300 backdrop-blur-sm">
                  {slides[currentSlide]?.buttonText1}
                </Link>
                <Link to={slides[currentSlide]?.buttonLink2 || '/properties'} className="px-6 py-3 text-sm md:text-base font-medium rounded-full bg-[#FF2626] text-white hover:bg-[#FF4040] transition-all duration-300">
                  {slides[currentSlide]?.buttonText2}
                </Link>
              </div>
            </div>
          </div>
        </>
        {/* Slide indicators - hide on mobile */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 flex space-x-2 z-20 hidden sm:flex">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-[#FF2626] w-8' : 'bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;