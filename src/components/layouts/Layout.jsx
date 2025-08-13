import React from 'react';
import { Header } from '../Header';
import { Outlet } from "react-router-dom";

export const Layout = () => {
    return (
        <>
            {/* Common Menubar Component */}
            <Header />

            <div className="main-content-wrapper">
                <Outlet />
            </div>
        </>
    )
}
