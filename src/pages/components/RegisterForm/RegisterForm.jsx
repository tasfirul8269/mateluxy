import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import { MdOutlineEmail } from 'react-icons/md';
import { RiInformationLine } from 'react-icons/ri';

const RegisterForm = () => {


    const phoneCountryCodes = [
        "+971",   //UAe
        "+44",  // UK
        "+91",  // India
        "+61",  // Australia
        "+81",  // Japan
        "+49",  // Germany
        "+33",  // France
        "+86",  // China
        "+39",  // Italy
        "+7",   // Russia
        "+34",  // Spain
        "+55",  // Brazil
        "+27",  // South Africa
        "+82",  // South Korea
        "+46",  // Sweden
        "+31",  // Netherlands
        "+41",  // Switzerland
        "+64",  // New Zealand
        "+90",  // Turkey
        "+62",  // Indonesia
        "+63",  // Philippines
        "+60",  // Malaysia
        "+65",  // Singapore
        "+20",  // Egypt
        "+52",  // Mexico
        "+45",  // Denmark
        "+47",  // Norway
        "+48",  // Poland
        "+420", // Czech Republic
        "+66",  // Thailand
        "+372", // Estonia
        "+370", // Lithuania
        "+371", // Latvia
        "+1-809", // Dominican Republic
        "+234", // Nigeria
        "+256", // Uganda
        "+254", // Kenya
        "+213", // Algeria
        "+212", // Morocco
        "+964", // Iraq
        "+353", // Ireland
        "+358", // Finland
        "+43",  // Austria
        "+977", // Nepal
        "+880", // Bangladesh
        "+92",  // Pakistan
        "+998", // Uzbekistan
      ];
      

    
    
    
    
      return (
        <div className='bg-blue-900 text-white flex flex-col md:flex-row items-center justify-center gap-3 '>
            {/* register form text section */}
            <div className='space-y-4 p-10'>
                <h3 className='text-3xl font-bold '>Register your interest in the acres by Meraas</h3>
                <p className='text-sm font-medium'>
                    To find out about availability, contact a member of our team or fill out the form and we’ll be in touch
                </p>
                <button className='flex items-center py-10 gap-3 cursor-pointer hover:underline px-4 rounded-lg transition-all'>
                    <FaWhatsapp className='text-[#FF2626]' /> 
                    {"  "} Click to Whatsapp
                </button>
                <div className="border border-0.5 border-gray-200 my-6 md:my-5"></div>

                <button className='flex items-center py-5 gap-3 hover:underline cursor-pointer px-4 rounded-lg transition-all'>
                    <MdOutlineEmail className='text-white' />
                    {"  "} info@mateluxy.com
                </button>

                {/* DLD permit section */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-[#d4d4d4] p-5 rounded-lg shadow-md">
                    <img
                        src="https://ggfx-handh3.s3.eu-west-2.amazonaws.com/i/qr_code/JPJ250558_71662574903_109717.png"
                        className="w-16"
                        alt="DLD Permit QR Code"
                    />
                    <div className="space-y-2">
                        <h3 className="text-md font-bold flex text-black items-center gap-2">
                            DLD Permit Information{" "}
                            <button
                                className="tooltip tooltip-right cursor-pointer"
                                data-tip="The Dubai Land Department strongly advises all customers and investors to only engage with real estate advertisements that feature the QR Code"
                            >
                                <RiInformationLine className="cursor-pointer" />
                            </button>
                        </h3>
                        <p className="text-sm font-medium text-black">
                            DLD-PERMIT-123456
                        </p>
                        <p className="text-sm font-light text-gray-600">
                            This property listing has been reviewed and verified by Dubai
                            Land Department
                        </p>
                    </div>
                </div>
            </div>
            
            {/* register form section */}
            <div className="animate__animated animate__fadeInUp min-h-[20vh] m-10 w-full md:w-3/5  flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-md w-full  p-20 transform transition-all duration-300 hover:shadow-lg "> 
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center shadow-sm pb-2">
                        Register Your Interest
                    </h2>

                    <form className="space-y-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className="w-full px-4 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm border-[#d4d4d4] text-black "
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className="w-full px-4  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm py-4 border-[#d4d4d4] text-black "
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-4 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm  border-[#d4d4d4] text-black "
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="flex shadow-sm">
                                <select className="inline-flex items-center px-5 border rounded-l-lg bg-gray-50 text-gray-500 text-sm py-4 border-[#d4d4d4]">
                                    {
                                        phoneCountryCodes.map((code, index) => <option key={index} value={code}>{code}</option>)
                                    }
                                </select>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="w-full px-4 py-4 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border-[#d4d4d4] text-black "
                                    placeholder="50 123 4567"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Have you invested in Dubai real estate before?
                            </label>
                            <div className="relative shadow-sm">
                                <select 
                                    name="investmentExperience"
                                    className="w-full px-4 py-4 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border-[#d4d4d4] text-black "
                                >
                                    <option value="">Select an option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                                <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                How many properties do you currently own?
                            </label>
                            <input
                                type="number"
                                name="propertiesOwned"
                                className="w-full px-4 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm border-[#d4d4d4] text-black "
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Are you interested in?
                            </label>
                            <div className="relative shadow-sm">
                                <select 
                                    name="interest"
                                    className="w-full px-4 py-4 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border-[#d4d4d4] text-black "
                                >
                                    <option value="">Select an option</option>
                                    <option value="residential">Residential Properties</option>
                                    <option value="commercial">Commercial Properties</option>
                                </select>
                                <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">My message is...</label>
                            <textarea
                                name="message"
                                className="w-full px-4 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 shadow-sm border-[#d4d4d4] text-black "
                                placeholder="Type your message here..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md cursor-pointer"
                        >
                            Register your Interest
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By clicking Submit, you agree to our{' '}
                            <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and{' '}
                            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;