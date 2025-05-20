import React from 'react';

const PropertyValuation = () => {
    return (
        <div className='flex flex-col md:flex-row justify-between items-center gap-8 bg-linear-to-b from-[#E00404] to-[#FF8383] p-20  px-[50px] mx-auto rounded-2xl mb-[20px]'>
            <div>
            <h3 className='text-3xl font-semibold text-white'>Get an instant property valuation</h3>
            <p className='text-xs font-medium text-gray-300'>Thinking of selling your home? Knowing its current price is a good place to start. Get an accurate, independent valuation and a detailed report here.</p>
        </div>
        <button className='py-3 px-5 rounded-2xl bg-[#FF6D6D] text-white hover:bg-red-500 cursor-pointer w-full md:w-1/4'>Get Started</button>
        </div>
    );
};

export default PropertyValuation;