import React from "react";
import OffPlanBanner from "./OffPlanBanner/OffPlanBanner";
import ImageCarousel from "./ImageCarousel/ImageCarousel";
import RightStructure from "../RightStructure/RightStructure";
import Amenities from "../Amenities/Amenities";
import SimpleMap from "../../../components/SimpleMap/SimpleMap";
import { GoDotFill } from "react-icons/go";
import RegisterForm from "../../components/RegisterForm/RegisterForm";

const OffPlanProperty = () => {
  const info = [
    {
      title: "Handover Date",
      caption: "Q3, 2027",
      image:
        "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/F1_afbdd45a85.svg",
    },
    {
      title: "Prices from",
      caption: "2,900,000 AED",
      image:
        "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/f2_aac56dc208.svg",
    },
    {
      title: "Developer",
      caption: "Sol Properties",
      image:
        "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/f3_cd0fe4016e.svg",
    },
    {
      title: "Location",
      caption: "Downtown Dubai",
      image:
        "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/f4_45a11a99e7.svg",
    },
    {
      title: "Document Type",
      caption: "1, 2, 3, 4 bedroom apartments and spacious duplex penthouses",
      image:
        "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/f5_3280fc9634.svg",
    },
  ];

  const coordinates = [25.1975, 55.2744];

  const locationTimes = [
    "5 mins to Dubai Mall",
    "5 mins to Burj Khalifa",
    "5 mins to Dubai Opera",
    "15 mins to Jumeirah Beach",
  ];

  return (
    <div className="mb-10">
      <div className="relative">
        <OffPlanBanner></OffPlanBanner>
      </div>
      <h3 className="text-3xl font-semibold text-center my-20 w-2/3 mx-auto">
        Experience Dubai like never before at this luxurious tower branded by
        Fairmont Hotels & Resorts
      </h3>
      <div className="grid grid-cols-4 gap-3 max-w-5xl mx-auto my-10">
        {info.map((item, index) => (
          <div
            className="flex flex-col items-center space-y-3 mt-5"
            key={index}
          >
            <img src={item.image} alt={item.title} />
            <h3 className="text-sm font-semibold text-gray-800">
              {item.title}
            </h3>
            <p className="text-sm font-light text-gray-500">{item.caption}</p>
          </div>
        ))}
      </div>
      <ImageCarousel></ImageCarousel>
      <RightStructure></RightStructure>
      <div className="text-center my-10">
        <h4 className="text-3xl font-semibold text-gray-500">Amenities</h4>

        <Amenities></Amenities>
      </div>
      <div className="grid md:grid-cols-2  max-w-3/4 mx-auto my-10">
        <SimpleMap coordinates={coordinates} />
        <div className="p-10">
          <h3 className="text-3xl font-semibold text-center">
            The Perfect Location
          </h3>
          <div className="grid grid-cols-2 text-center">
            {locationTimes.map((items, index) => (
              <p
                key={index}
                className="text-sm font-medium text-gray-500 py-3 flex items-center gap-2"
              >
                <GoDotFill /> {"  "}
                {items}
              </p>
            ))}
          </div>
        </div>
      </div>
      <RightStructure></RightStructure>

      {/* payment plan */}
      <div>
        <h2 className="text-3xl font-bold text-center my-10">Payment Plan</h2>
        <div className="grid md:grid-cols-2 gap-10 max-w-3/4 mx-auto my-10">
          <div className="px-8 py-1 shadow-md">
            <h2 className="text-3xl font-bold text-center  mt-10">60%</h2>
            <p className="text-center pb-10">During construction</p>
          </div>
          <div className="px-8 py-1 shadow-md">
            <h2 className="text-3xl font-bold text-center mt-10">40%</h2>
            <p className="text-center pb-10">On completion</p>
          </div>
        </div>
      </div>

      <RegisterForm></RegisterForm>
    </div>
  );
};

export default OffPlanProperty;
