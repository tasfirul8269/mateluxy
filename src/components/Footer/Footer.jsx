import React, { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      console.log("Subscribing email:", email);
      alert(`Thank you for subscribing with ${email}!`);
      setEmail("");
    }
  };

  return (
    <footer className="relative self-stretch flex w-full flex-col overflow-hidden items-stretch justify-center mt-12 py-[19px] rounded-[20px_20px_0px_0px] max-md:max-w-full max-md:mt-10">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
          alt="Footer background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#9a1111] to-[#d62222] opacity-90"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-[1440px] mx-auto items-start justify-between gap-[40px_100px] overflow-hidden text-base text-white font-medium flex-wrap px-6 sm:px-8 py-8 max-md:max-w-full">
        <div className="self-stretch min-w-60 overflow-hidden font-normal my-auto p-2.5 max-md:max-w-full">
          <h3 className="text-white text-2xl font-semibold">Stay in the loop</h3>
          <p className="font-medium mt-2.5 max-md:max-w-full">
            News and insight straight to your inbox. We don't spam.
          </p>
          <form onSubmit={handleSubscribe} className="mt-2.5">
            <div className="bg-white/20 backdrop-blur-sm flex max-w-full w-[444px] items-stretch gap-5 overflow-hidden text-white justify-between px-[22px] py-[21px] rounded-[15px] max-md:pr-5">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent outline-none flex-1 placeholder-white/70"
              />
              <button type="submit" className="text-white hover:text-white/80">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
          <p className="text-[11px] mt-2.5 max-md:max-w-full">
            <span className="font-medium">By clicking Submit, you agree to our </span>
            <a href="#" className="font-semibold text-white hover:underline">Terms & Conditions</a>
            <span className="font-medium"> and </span>
            <a href="#" className="font-semibold text-white hover:underline">Privacy Policy</a>
            <span className="font-medium">.</span>
          </p>
        </div>

       <div className="hidden md:flex lg:flex xl:flex justify-center items-center gap-5">
         <div className="self-stretch overflow-hidden my-auto p-2.5">
          <h3 className="text-white text-2xl font-semibold">Services</h3>
          <ul>
            {["Residential areas", "Residential leasing", "Off plan", "Commercial Properties", "Properties Management"].map((item, idx) => (
              <li key={idx} className="mt-2.5 hover:text-white/75 transition-colors">
                <a href="#">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        

        <div className="self-stretch overflow-hidden my-auto p-2.5">
          <h3 className="text-white text-2xl font-semibold">About</h3>
          <ul>
            {["Our Story", "Our team", "Client Reviews", "Careers", "Contact"].map((item, idx) => (
              <li key={idx} className="mt-2.5 hover:text-white/75 transition-colors">
                <a href="#">{item}</a>
              </li>
            ))}
          </ul>
        </div>
       </div>
      </div>

      <div className="relative z-10 border self-center min-h-0 w-full max-w-[1440px] mx-auto mt-6 border-white/20 border-solid" />

      <div className="relative z-10 flex w-full max-w-[1440px] mx-auto items-center gap-[40px_100px] overflow-hidden justify-between flex-wrap mt-6 px-6 sm:px-8 py-6 max-md:max-w-full">
        <div className="self-stretch min-w-60 overflow-hidden text-base text-white font-medium my-auto p-2.5 max-md:max-w-full">
          <address className="max-md:max-w-full not-italic">
            Bay Square - Office #601 - Building 13 - Business Bay <br />
            Dubai - United Arab Emirates
          </address>
          <div className="mt-2.5">Monday to Saturday: 9:00 AM – 6:00 PM</div>
          <div className="text-[11px] mt-2.5">©️ 2025 MateLuxy. All Rights Reserved.</div>
        </div>

        <div className="self-stretch flex gap-2.5 overflow-hidden my-auto">
          <a
            href="#"
            className="bg-white/20 backdrop-blur-sm flex items-center gap-2.5 w-11 h-11 p-2.5 rounded-[1000px] hover:bg-white/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="#" className="bg-white/20 backdrop-blur-sm flex items-center gap-2.5 w-11 h-11 p-2.5 rounded-[1000px] hover:bg-white/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
