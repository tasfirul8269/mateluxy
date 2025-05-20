import React, { useState } from 'react';

const tabs = [
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Location', href: '#location' },
  { label: 'Payment Plan', href: '#payment-plan' }
];

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('About');

  const handleTabClick = (tab) => {
    setActiveTab(tab.label);
    const element = document.querySelector(tab.href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mb-8 ">
      <div className=" flex flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabClick(tab)}
            className={`py-3 px-6 font-medium transition-colors ${
              activeTab === tab.label
                ? 'text-red-500 bg-[#ff252511] ml-[5px] rounded-[15px] '
                : 'text-gray-500 bg-[#fff] ml-[5px] border border-[#f1f1f1] rounded-[15px] hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;