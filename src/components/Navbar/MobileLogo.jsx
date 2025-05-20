import React from 'react';
import { Building2, Link } from 'lucide-react';
import logo from "../../assets/logo.png";


const MobileLogo = () => {
  return (
    <div className="flex items-center gap-2">
            <div className="flex justify-center items-center">
              <img className="w-24" src={logo} alt="LOGO" />
            </div>
    </div>
  );
};

export default MobileLogo;