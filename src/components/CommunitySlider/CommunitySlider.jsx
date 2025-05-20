import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/navigation';

const CommunitySlider = ({ onCommunityClick }) => {
  const swiperRef = useRef(null);
  
  const communities = [
    { name: 'Downtown Dubai' },
    { name: 'Business Bay' },
    { name: 'Dubai Marina' },
    { name: 'Dubai Creek Harbour' },
    { name: 'Dubai Hills Estate' },
    { name: 'Emirates Living' },
    { name: 'Jumeirah Village Circle' },
    { name: 'Jumeirah Village Triangle' }
  ];

  return (
    <div className="w-full py-6 relative">
      <div className="max-w-7xl mx-auto relative px-4 md:px-10">
        <Swiper
          ref={swiperRef}
          slidesPerView={1}
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 }
          }}
          modules={[Navigation]}
          className="w-full"
        >
          {communities.map((community, index) => (
            <SwiperSlide key={index}>
              <div
                onClick={() => onCommunityClick(community.name)}
                className="p-2 cursor-pointer h-full"
              >
                <div className="border border-gray-200 hover:border-red-500 rounded-[10px] px-0 py-3 h-full flex items-center justify-center transition-colors duration-200">
                  <span className="text-sm text-gray-700 hover:text-red-600 transition-colors duration-200">
                    {community.name}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button 
          onClick={() => swiperRef.current?.swiper.slidePrev()}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-red-500 p-1 transition-colors duration-200"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>
        <button 
          onClick={() => swiperRef.current?.swiper.slideNext()}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-red-500 p-1 transition-colors duration-200"
          aria-label="Next slide"
        >
          <FiChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CommunitySlider;