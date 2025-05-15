import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const PropertySearchByFeature = () => {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      name: 'Private Pool',
      image: 'https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/icon_830d6c569a.svg',
    },
    {
      name: 'Upgraded',
      image: 'https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/icon_1_7cb65824a9.svg',
    },
    {
      name: 'Large Plot',
      image: 'https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/icon_2_c9489ad3ab.svg',
    },
    {
      name: 'Close to Park',
      image: 'https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/icon_3_0b1e433c6b.svg',
    },
    {
      name: 'Brand New',
      image: 'https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/icon_4_9bab1cf997.svg',
    },
    {
      name: 'Furnished',
      image: 'https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/icon_6_911cfdca10.svg',
    },
    {
      name: 'Vacant on Transfer',
      image: 'https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/icon_1d2b1f8eb2.svg',
    },
    {
      name: 'Water Views',
      image: 'https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/Frame_11_4962f65694.svg',
    },
  ];

  return (
    <div className=" p-6 bg-white rounded-lg shadow-md mb-10 animate__animated animate__fadeInUp">
      <h1 className="text-2xl font-bold text-gray-800 mb-2.5">Search properties by feature</h1>
      
      <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
        <TabList className="flex border-b border-gray-200 mb-6 justify-end">
          <Tab
            className={`py-2 px-4 font-medium cursor-pointer ${
              activeTab === 0
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rent
          </Tab>
          <Tab
            className={`py-2 px-4 font-medium cursor-pointer ${
              activeTab === 1
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sale
          </Tab>
        </TabList>

        {/* Rent Tab Panel */}
        <TabPanel>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="px-4 py-2 btn btn-outline rounded-md bg-gray-200 hover:bg-red-300 border-none transition  flex justify-center items-center gap-3">
                <img 
                    src={feature.image} 
                    alt={feature.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                    }}
                  />
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 hover:text-white">{feature.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </TabPanel>

        {/* Sale Tab Panel - Same content as Rent */}
        <TabPanel>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="px-4 py-2 btn btn-outline rounded-md bg-gray-200 hover:bg-red-300 border-none transition  flex justify-center items-center gap-3">
                <img 
                    src={feature.image} 
                    alt={feature.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                    }}
                  />
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 hover:text-white">{feature.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default PropertySearchByFeature;