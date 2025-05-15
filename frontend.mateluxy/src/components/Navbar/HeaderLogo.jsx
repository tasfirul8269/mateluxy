import React, { useState, useEffect } from 'react';
import { Building2, Link } from 'lucide-react';
import logo from "../../assets/logo.png";


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

const HeaderLogo = () => {
    const isMobile = useIsMobile();

    return (
        <div onClick={() => window.location.href = "/"} className="flex cursor-pointer items-center gap-2">
            {isMobile ? (<div className="flex justify-center items-center">
                <img className="w-15" src={logo} alt="LOGO" />
                <div>
                    <h3 className={`text-[15px] font-bold tracking-tight text-[#000000]`}>
                        MATELUXY
                    </h3>
                    <p className={`text-[15px] uppercase tracking-widest text-black`}>
                        REAL ESTATE
                    </p>
                </div>
            </div>): (<div className="flex justify-center items-center">
                <img className="w-24" src={logo} alt="LOGO" />
                <div>
                    <h3 className={`text-2xl font-bold tracking-tight text-[#000000]`}>
                        MATELUXY
                    </h3>
                    <p className={`text-lg uppercase tracking-widest text-black`}>
                        REAL ESTATE
                    </p>
                </div>
            </div>)}
        </div>
    );
};

export default HeaderLogo;