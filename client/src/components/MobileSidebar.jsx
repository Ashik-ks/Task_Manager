import React from "react";
import { Link } from "react-router-dom";
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

const MobileSidebar = ({ closeSidebar, isLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split("/")[1];
  const { id, role } = useParams();

  // Filter links based on role
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

  const handleNavigation = (link) => {
    if (link.label === "Tasks") {
      navigate(`/tasks/${id}/${role}`);
    } else if (link.label === "Dashboard") {
      navigate(`/dashboard/${id}/${role}`);
    } else if (link.label === "Completed") {
      let stage = "completed";
      navigate(`/completed/${id}/${role}/${stage}`);
    } else if (link.label === "In Progress") {
      let stage2 = "in progress";
      navigate(`/inprogress/${id}/${role}/${stage2}`);
    } else if (link.label === "To Do") {
      let stage3 = "todo";
      navigate(`/todo/${id}/${role}/${stage3}`);
    } else if (link.label === "Team") {
      navigate(`/users/${id}/${role}`);
    } else if (link.label === "Trash") {
      navigate(`/trash/${id}/${role}`);
    } else if (link.label === "My Work") {
      navigate(`/mywork/${id}/${role}`);
    }

    closeSidebar();
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <button onClick={closeSidebar} className="self-end text-red-600">
        Close
      </button>
      {filteredLinks.map((link) => (
        <button
          key={link.label}
          onClick={() => handleNavigation(link)}
          className="flex items-center gap-2 text-lg text-red-500"
        >
          {link.icon}
          {link.label}
        </button>
      ))}
    </div>
  );
};

export default MobileSidebar;
