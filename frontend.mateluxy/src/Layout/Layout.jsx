import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import Header from '../components/Navbar';

const Layout = () => {
    return (
        <>
           <div>
            <Header></Header>
           <Outlet></Outlet>
           <Footer></Footer>
           </div>
        </>
    );
};

export default Layout;