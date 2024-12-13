import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileSidebar from "../components/MobileSidebar";
import Tasks from "../components/Outlet2";

const TaskPage = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isListView, setIsListView] = useState(false); // State for toggling list view

  // Toggle the mobile sidebar open/close
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  // Close the mobile sidebar
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Close the mobile sidebar if clicked outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-sidebar')) {
      closeMobileSidebar();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-slate-50" onClick={handleClickOutside}>
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
          <Tasks isListView={isListView} setIsListView={setIsListView} />
        </div>
      </div>
    </div>
  );
};

export default TaskPage;