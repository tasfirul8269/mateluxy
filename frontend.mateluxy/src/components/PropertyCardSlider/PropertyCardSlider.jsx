import axios from 'axios';
import React, { useState, useEffect } from 'react';
import ProCard from '../ProCard/ProCard';

const PropertyCardSlider = () => {
  const [index, setIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(1);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const gap = 10;

  useEffect(() => {

    axios.get("properties.json")
    .then(data => {
        setProperties(data.data)
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching slides:', error);
      setLoading(false);
    })
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) setVisibleSlides(5);
      else if (width >= 992) setVisibleSlides(4);
      else if (width >= 768) setVisibleSlides(3);
      else if (width >= 500) setVisibleSlides(2);
      else setVisibleSlides(1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const slideTo = (newIndex) => {
    setIndex(Math.max(0, Math.min(newIndex, properties.length - visibleSlides)));
  };

  const isLeftDisabled = index === 0 || loading;
  const isRightDisabled = index >= properties.length - visibleSlides || loading;

  const slidePercentage = 100 / visibleSlides;
  const slideStyle = {
    flex: `0 0 calc(${slidePercentage}% - ${gap}px)`,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
        <div className="text-xl">Loading slides...</div>
      </div>
    );
  }

  return (
    <div className="flex  items-center justify-center bg-transparent mt-6 p-5">
      <div className="relative w-full max-w-[1200px] px-[30px] mx-auto">
        <button
          className={`absolute top-1/2 left-[10px] w-10 h-10 bg-white text-black text-2xl 
          rounded-full shadow-md z-10 flex items-center justify-center -translate-y-1/2
          transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-default
          ${!isLeftDisabled && 'hover:bg-red-500'}`}
          onClick={() => slideTo(index - 1)}
          disabled={isLeftDisabled}
        >
          ‹
        </button>

        <div className="w-full overflow-hidden rounded-lg shadow-md bg-transparent">
          <div 
            className="flex transition-transform duration-400 ease-in-out"
            style={{ transform: `translateX(-${index * (100 / visibleSlides)}%)` }}
          >
            {properties.map((property) => (
              <div 
                key={property?.id}
                className="flex items-center justify-center bg-white border border-gray-300 rounded-md mr-7 last:mr-0 text-2xl select-none h-[30%]"
                
              >
               <ProCard property={property}></ProCard>
             
              </div>
            ))}
          </div>
        </div>

        <button
          className={`absolute top-1/2 right-[10px] w-10 h-10 bg-white text-black text-2xl 
          rounded-full shadow-md z-10 flex items-center justify-center -translate-y-1/2
          transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-default
          ${!isRightDisabled && 'hover:bg-red-500'}`}
          onClick={() => slideTo(index + 1)}
          disabled={isRightDisabled}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default PropertyCardSlider;