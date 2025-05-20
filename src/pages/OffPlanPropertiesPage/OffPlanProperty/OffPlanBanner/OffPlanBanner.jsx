import React from "react";
import "../../../../components/Navbar/colors.css";

const OffPlanBanner = () => {
  return (
    <div
      className="hero min-h-screen w-full mb-11  overflow-hidden"  
      style={{
        backgroundImage:
          "url(https://www.hausandhaus.com/static/3f7ad20689be7438e2efe05dbba1809f/b501b/home_banner.webp)",
      }}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center">
        <div>
          <h1 className="mb-5 text-4xl md:text-5xl w-full font-bold text-white">Fairmont Residences Solara Tower</h1>
          <p className="mb-5">
          by Sol Properties


          </p>
         <div className="flex items-center justify-center gap-3">
         <button className="px-7 py-2 border-none font-bold rounded-full text-gray-200 hover:text-white  bg-red-400 hover:bg-red-700 p-2 cursor-pointer">Register Interest</button>
         <button className="px-7 py-3  font-bold rounded-full text-gray-200 hover:text-white  btn btn-outline border border-white hover:bg-red-700 p-2 cursor-pointer">Download Brochure</button>
         </div>
        </div>
      </div>
    </div>
  );
};

export default OffPlanBanner;
