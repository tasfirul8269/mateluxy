import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    );

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
}


const WhatsAppButton = () => {
    const isMobileScreen = useIsMobile();

  return (
    <div>{isMobileScreen ? (<a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-0 bg-transparent
                   text-[#25D366] px-0 py-0 rounded-full transition-all duration-300 
                   transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden md:inline">WhatsApp</span>
      </a>) : (<a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E]
                   text-white px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg 
                   transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden md:inline">WhatsApp</span>
      </a>)}
      </div>
  );
};

export default WhatsAppButton;