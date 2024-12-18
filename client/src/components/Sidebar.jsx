import React from "react";
import {
  MdDashboard,
  MdOutlineAddTask,
  MdOutlinePendingActions,
  MdSettings,
  MdTaskAlt,
} from "react-icons/md";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";

const linkData = [
  {
    label: "Dashboard",
    link: "dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "Tasks",
    link: "tasks",
    icon: <FaTasks />,
  },
  {
    label: "Completed",
    link: "completed/completed",
    icon: <MdTaskAlt />,
  },
  {
    label: "In Progress",
    link: "in-progress/in-progress",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "To Do",
    link: "todo/todo",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Team",
    link: "team",
    icon: <FaUsers />,
  },
  {
    label: "Trash",
    link: "trashed",
    icon: <FaTrashAlt />,
  },
  {
    label: "My Work",
    link: "my-work",
    icon: <FaTasks />,
  },
];

const Sidebar = ({ closeSidebar, isLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split("/")[1];
  const { id, role } = useParams();

  // Adjust links based on login status
  const filteredLinks =
    role === "Admin"
      ? linkData.filter((link) => link.label !== "My Work")
      : isLoggedIn
      ? linkData.filter(
          (link) => link.label !== "Team" && link.label !== "Trash"
        )
      : linkData.filter(
          (link) => link.label !== "Team" && link.label !== "Trash"
        );

  const NavLink = ({ el }) => {
    const handleNavigation = () => {
      if (el.label === "Tasks") {
        navigate(`/tasks/${id}/${role}`);
      } else if (el.label === "Dashboard") {
        navigate(`/dashboard/${id}/${role}`);
      } else if (el.label === "Completed") {
        let stage = "completed";
        navigate(`/completed/${id}/${role}/${stage}`);
      } else if (el.label === "In Progress") {
        let stage2 = "in progress";
        navigate(`/inprogress/${id}/${role}/${stage2}`);
      } else if (el.label === "To Do") {
        let stage3 = "todo";
        navigate(`/todo/${id}/${role}/${stage3}`);
      } else if (el.label === "Team") {
        navigate(`/users/${id}/${role}`);
      } else if (el.label === "Trash") {
        navigate(`/trash/${id}/${role}`);
      } else if (el.label === "My Work") {
        navigate(`/mywork/${id}/${role}`);
      }

      closeSidebar();
    };

    return (
      <button
        onClick={handleNavigation}
        className={clsx(
          "w-full lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-gray-800 text-base hover:bg-[#2564ed2d]",
          path === el.link.split("/")[0] ? "bg-red-500 text-neutral-100" : ""
        )}
      >
        {el.icon}
        <span className="hover:text-[#2564ed]">{el.label}</span>
      </button>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-5">
      <h1 className="flex gap-1 items-center">
        <p className="bg-red-500 p-2 rounded-full">
          <MdOutlineAddTask className="text-white text-2xl font-black" />
        </p>
        <span className="text-2xl font-bold text-black">TaskUp</span>
      </h1>

      <div className="flex-1 flex flex-col gap-y-5 py-8">
        {filteredLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>

      <div className="">
        <button
          className="w-full flex gap-2 p-2 items-center text-lg text-gray-800"
          onClick={closeSidebar}
        >
          <MdSettings />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
