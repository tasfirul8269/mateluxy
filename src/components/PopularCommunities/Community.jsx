import React from 'react';

const Community = ({community}) => {
    console.log(community)
    return (
        <div className='p-5 space-y-4 shadow-md'>
            <img src={community?.imgUrl} className='rounded-md w-full' alt={community?.imgAlt} />
            <div className='pt-4'>
                <h4 className='font-bold text-[#831919] text-xl'>{community?.areaName}</h4>
                <p className='text-[#831919]'>{community?.propertyCount}{" "} Properties</p>
            </div>
        </div>
    );
};

export default Community;