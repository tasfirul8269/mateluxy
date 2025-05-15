import React from "react";
import Banner from "../../components/Banner/Banner";
import SearchField from "../../components/PropertySearch/PropertySearch";
import Services from "../../components/Services/Services";
import TopProperties from "../../components/TopProperties/TopProperties";
import FindConsultant from "../../components/FindConsultant/FindConsultant";
import LocationCategory from "../../LocationBasedProperty/locationCategory";
import FeaturesAmenities from "../../components/FeaturesAmenities/FeaturesAmenities";
import NewsAndInsights from "../../components/NewsAndInsights/NewsAndInsights";

const Home = () => {
  return (
    <div className="mb-6 pt-6">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
        {/* Banner and Search Section */}
        <div className="relative">
          <Banner></Banner>
          <div className="sm:absolute sm:-bottom-12 sm:left-1/2 sm:transform sm:-translate-x-1/2 w-full max-w-4xl px-3 sm:px-4 bg-white rounded-[20px] shadow-lg mx-auto z-40 p-3 sm:p-4">
            <SearchField></SearchField>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="mt-8 sm:mt-10 md:mt-12 sm:px-3 md:px-4 lg:px-5 mx-auto">
          {/* Services Section */}
          <div className="mb-6 sm:mb-7 md:mb-8">
            <Services></Services>
          </div>
          
          {/* Find Consultant Section */}
          <div className="mb-6 sm:mb-7 md:mb-8">
            <FindConsultant></FindConsultant>
          </div>
          
          {/* Top Properties Section */}
          <div className="mb-6 sm:mb-7 md:mb-8">
            <TopProperties></TopProperties>
          </div>
          
          {/* Location Category Section */}
          <div className="mb-6 sm:mb-7 md:mb-8">
            <LocationCategory></LocationCategory>
          </div>
          
          {/* Features and Amenities Section */}
          <div className="mb-6 sm:mb-7 md:mb-8">
            <FeaturesAmenities></FeaturesAmenities>
          </div>
          
          {/* News and Insights Section */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <NewsAndInsights></NewsAndInsights>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
