import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Community from './Community';

const PopularCommunities = () => {
    const [communities, setCommunities] = useState([]);


    useEffect(() =>{
        axios.get("communities.json")
        .then(data => {
            console.log(data.data.data);
            const communities = data.data.data;
            setCommunities(communities);
        })
        .catch(error => {
            alert(error.message);
        })
    } ,[])

    return (
        <div className=' p-10 pl-0 space-y-5'>
            <h3 className='text-3xl font-bold text-[#831919]'>Popular Communities</h3>
            <p className='text-xl font-medium text-[#831919]'>It's all about location – here are some of the most sought after areas for off plan investment.</p>
            <div className='grid md:grid-cols-3 lg:grid-cols-6 gap-5 p-5'>
                {
                    communities.map((community, index) => <Community key={index} community={community} ></Community>)
                }
            </div>

        </div>
    );
};

export default PopularCommunities;