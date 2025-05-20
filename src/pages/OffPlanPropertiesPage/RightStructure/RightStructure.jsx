import React from 'react';

const RightStructure = () => {
    const info = [
        {
            image: "https://i.ibb.co.com/xSfmXX5Y/jason-dent-w3e-Fhq-Xjk-ZE-unsplash.jpg",
            title: "Hotel style living",
            description: "Welcome to Fairmont Residences Solara Tower – a luxurious 55-storey landmark in Downtown Dubai offering 1 to 4 bedroom apartments and spacious duplex penthouses. From state-of-the-art finishes to branded services by Fairmont Hotels & Resorts, this lavish collection aims to redefine the living experience. Let us show you around."
        },
        {
            image: "https://i.ibb.co.com/xSfmXX5Y/jason-dent-w3e-Fhq-Xjk-ZE-unsplash.jpg",
            title: "Excitement awaits",
            description: "It can be hard to decide on a location for your new home, maybe you want to be close to the beach or stay connected to the central business hubs. That's the beauty of Downtown – you can live in a major community while staying close to Dubai's hotspots.From world class facilities at your doorstep to exceptional entertainment, there's something extraordinary about living in the heart of the city."
        },
    ];

    return (
        <div className='flex flex-col items-center justify-center gap-6 md:gap-10 p-4 sm:p-6 md:p-10'>
            {info.map((item, index) => (
                <div 
                    className={`grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl ${index !== info.length - 1 ? 'mb-6 md:mb-10' : ''}`} 
                    key={index}
                >
                    <img 
                        src={item.image} 
                        className={`w-full h-auto md:h-full object-cover ${index % 2 !== 0 ? "md:order-2" : ""}`} 
                        alt={item.title} 
                    />
                    <div className={`text-start ${index % 2 !== 0 ? "md:order-1" : ""}`}>
                        <h3 className='text-lg md:text-xl font-semibold text-gray-800 px-4 md:px-10 py-3 md:py-5'>
                            {item.title}
                        </h3>
                        <p className='text-sm font-light text-gray-500 px-4 md:px-10'>
                            {item.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RightStructure;