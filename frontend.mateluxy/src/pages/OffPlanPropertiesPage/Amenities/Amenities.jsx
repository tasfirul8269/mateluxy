import React from 'react';

const Amenities = () => {
    const amenities = [
        {
            title: "Swimming pool",
            image: "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/swimming_9fe46c8553.svg"
        },
        {
            title: "Club lounge and creative zone",
            image: "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/house_rooms_b71d8c1b31.svg"
        },
        {
            title: "Fully equipped gym",
            image: "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/gym_704876a269.svg"
        },
        {
            title: "Cinema",
            image: "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/cinema_old_c0567f4d7c.svg"
        },
        {
            title: "Retail shops",
            image: "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/hh_Icons_retail_shops_7e09600870.svg"
        },
        {
            title: "Padel",
            image: "https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/hh_Icons_retail_shops_7e09600870.svg"
        }
    ];

    return (
        <div className='container mx-auto px-4 py-8'>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6'>
                {amenities.map((item, index) => (
                    <div 
                        className='flex flex-col items-center space-y-2 md:space-y-3 p-2 md:p-4' 
                        key={index}
                    >
                        <img 
                            src={item.image} 
                            alt={item.title} 
                            className='w-12 h-12 md:w-16 md:h-16 object-contain'
                        />
                        <h3 className='text-xs md:text-sm font-semibold text-gray-800 text-center'>
                            {item.title}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Amenities;