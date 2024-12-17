import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileSidebar from "../components/MobileSidebar";
import MyworkOutlet from "../components/myworkOutlet";

const myWork = () => {

      const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    
      const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen((prev) => !prev);
      };
    
      const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
      };
  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="w-1/5 h-screen bg-white sticky top-0 hidden md:block">
        <Sidebar closeSidebar={() => {}} />
      </div>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 md:hidden">
          <div className="w-3/4 h-full bg-white">
            <MobileSidebar closeSidebar={closeMobileSidebar} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Navbar toggleSidebar={toggleMobileSidebar} />
        <div className="p-4 2xl:px-10">
        <MyworkOutlet />
        </div>
      </div>
    </div>
  )
}

export default myWork
