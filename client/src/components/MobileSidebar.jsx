import React from "react";
import { Link } from "react-router-dom";

const MobileSidebar = ({ closeSidebar }) => {
  const links = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Tasks", path: "/tasks" },
    // Add more links here
  ];

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <button onClick={closeSidebar} className="self-end text-red-600">
        Close
      </button>
      {links.map((link) => (
        <Link
          key={link.label}
          to={link.path}
          onClick={closeSidebar}
          className="text-lg text-blue-600"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default MobileSidebar;
