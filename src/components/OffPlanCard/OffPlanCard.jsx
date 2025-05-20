import React from "react";
import {
  FaPhone,
  FaWhatsapp,

} from "react-icons/fa";
import "animate.css";

import locationImg from "../../assets/group-39519-2.svg";
import bath from "../../assets/ic_bath.svg";
import bed from "../../assets/ic_bed.svg";
import kitchen from "../../assets/vector-1.svg";
import divider from "../../assets/line-2.svg";
import { LiaBathSolid, LiaBedSolid } from "react-icons/lia";
import { useLocation } from "react-router-dom";

const OffPlanCard = ({ property }) => {

  const location = useLocation()


  return (
    <div className="w-[395px] p-[15px] my-5 md:my-0 border border-[#e6e6e6] rounded-[20px] animate__animated animate__fadeInUp]">
      <img src={property?.image ? property.image : property.mainImage} alt={property?.name} className="rounded-[15px] w-[380px] h-[214px]" />
      <div className="flex justify-between items-center mt-4">
        <h3 className="truncate text-[20px] font-medium">
          {property?.name ? property.name : property.title}
        </h3>
        {property.propertyType =="Villa" ? <button className="py-[5px] px-[10px] ml-[10px] bg-[#FFF5E7] text-[#FF9B17] rounded-[10px]">
          {property?.propertyType}
        </button> :  <button className="py-[5px] px-[10px] ml-[10px] bg-[#FFF0F0] text-[#FF2626] rounded-[10px]">
          {property?.propertyType ? property.propertyType : property.type}
        </button>}
       
      </div>

      {/* location container */}
      <div className="flex justify-start items-center gap-2">
        <img src={locationImg} alt={property?.location} />
        <p className="mt-[5px] text-[#999999] font-medium text-[14px]">{property?.location}</p>
      </div>

      {/* features container */}
      <div className={`${location.pathname === "/off-plan-properties" ? "hidden" : "flex"}  justify-start gap-[30px] items-center my-4`}>
        <div className="text-[#999999] flex justify-start items-center gap-3">
          <LiaBedSolid className="w-[20px] h-[20px] text-[2xl]" />
          <p className="font-medium text-[16px]">{property?.beds}</p>
        </div>

        <div class="h-3 w-[1.5px] bg-[#e6e6e6] mx-4"></div>

        <div className="text-[#999999] flex justify-start items-center gap-3">
        <LiaBathSolid  className="w-[20px] h-[20px] text-2xl" />
          <p className="font-medium text-[16px]">{property?.baths}</p>
        </div>

        <div class="h-3 w-[1.5px] bg-[#e6e6e6] mx-4"></div>


        <div className="text-[#999999] flex justify-start items-center gap-3">
         <img className="w-6  h-6" src={kitchen} alt="Kitchen" />
          <p className="font-medium text-[16px]">{property?.kitchens}</p>
        </div>
      </div>

      {/* Agent container */}
      <div className={`flex justify-between items-center my-4 gap-3 mb-5`}>
        <img
            className="w-13 h-13 rounded-full"
          src={property?.agentImage ? property.agentImage : property.mainImage}
          alt={property?.agentName ? property.agentName : property.agent.name}
        />

        {/* agent name ana languages container */}
        <div>
          <h3 className="text-md font-medium">
            {
                property?.agentName ? property?.agentName : property?.agent.name
            }
          </h3>
          <p className="text-[12px] text-gray-600">
            Speaks {property?.languages?.slice(0,2).join(", ")}
          </p>
        </div>
        <h2 className="text-[18px] font-medium">{property?.price}</h2>
      </div>

      <div class="h-[1px] w-80% bg-[#e6e6e6] my-4"></div>


      {/* buttons container */}
      <div className="flex items-center justify-between">
        <button  className="w-[80px] flex justify-center items-center gap-2 text-[#8D8D8D] bg-[#E6E6E6] px-16 py-[10px] rounded-[10px]">
          <span className="font-medium">Call</span>
        </button>
        <button className="w[auto] flex justify-center items-center gap-2 text-[#FF2626] bg-[#FFF0F0] hover:bg-[#FFE5E5] px-8 py-[10px] rounded-[10px]">
          <FaWhatsapp className="text-xl" />
          <span className="font-medium">Whatsapp</span>
        </button>
        <button  className={`w-[auto] ${location.pathname === "/off-plan-properties" ? "hidden" : "flex"}  justify-center items-center gap-2 text-[#FF2626] bg-[#FFF0F0] px-[20px] py-[10px] rounded-[10px] `}>
          <span className="font-medium">Book a view</span>
        </button>
      </div>
    </div>
  );
};

export default OffPlanCard;
