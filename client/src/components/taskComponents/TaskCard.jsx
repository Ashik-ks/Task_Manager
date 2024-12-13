import React, { useState } from "react";
import clsx from "clsx";
import { MdAttachFile, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md";
import { BiMessageAltDetail } from "react-icons/bi";
import { FaList } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import AddSubTask from "./AddSubTask";
import axios from "axios";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const PRIORITY_COLORS = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-green-500",
};

const backgroundColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-gray-500",
];

const fetchUsers = async () => {
  try {
    const url = `http://localhost:3000/getuser/${null}`; // Adjust as needed
    const response = await axios.get(url);
    return Array.isArray(response.data) ? response.data : [response.data];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

const TaskCard = ({ task, user, isListView }) => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // State to track selected user

  const getFirstLetter = (text) => (text ? text[0].toUpperCase() : "");

  const completedSubTasks = task.subTasks.filter((subTask) => subTask.completed).length;

  // Handler to display user info
  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <>
      <div
        className={clsx(
          "bg-white shadow-md p-4 rounded mt-5 transition-all duration-300",
          isListView ? "w-full" : "w-[350px]"
        )}
      >
        {/* Priority */}
        <div className="w-full flex items-center gap-2">
          <span className={clsx("text-lg", PRIORITY_COLORS[task.priority])}>{ICONS[task.priority]}</span>
          <span className={clsx("uppercase font-medium", PRIORITY_COLORS[task.priority])}>
            {task.priority} Priority
          </span>
        </div>

        {/* Task Name and First Letter */}
        <div className="w-full flex items-center gap-2 mt-2">
          <div className={clsx("rounded-full  h-4", task.stage)} />
          <span className="bg-yellow-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {getFirstLetter(task.title)}
          </span>
          <h4 className="line-clamp-1 text-black font-semibold">{task.title}</h4>
        </div>

        {/* Date */}
        <div className="w-full mt-2 text-sm text-gray-600">{task.date}</div>

        <div className="w-full border-t border-gray-200 my-2" />

        {/* Task Stats */}
        <div className="w-full flex items-center gap-4 mb-2">
          <div className="flex gap-1 items-center text-sm text-gray-600">
            <BiMessageAltDetail />
            <span>{task.activities.length}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-600">
            <MdAttachFile />
            <span>{task.assets.length}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-600">
            <FaList />
            <span>{completedSubTasks}/{task.subTasks.length}</span>
          </div>
          <div className="flex ms-20  flex-row-reverse">
            {task?.team?.map((m, index) => (
              <div
                key={index}
                className={clsx(
                  "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                  backgroundColors[index % backgroundColors.length] // Apply a background color based on the index
                )}
                onClick={() => handleUserClick(m)} // Show user details on click
              >
                <span>{getFirstLetter(m.name)}</span> {/* Display first letter of user's name */}
              </div>
            ))}
          </div>
        </div>

        {/* Subtask */}
        {task.subTasks.length > 0 ? (
          <div className="py-4 border-t border-gray-200">
            <h5 className="text-base line-clamp-1 text-black">{task.subTasks[0].title}</h5>
            <div className="p-4 space-x-8">
              <span className="text-sm text-gray-600">{task.subTasks[0].date}</span>
              <span className="bg-blue-600/10 px-3 py-1 rounded-full text-blue-700 font-medium">
                {task.subTasks[0].tag}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-4 border-t border-gray-200 text-gray-500">No Sub Task</div>
        )}

        {/* Add Subtask Button */}
        <div className="w-full mt-2">
          <button
            onClick={() => setOpen(true)}
            className="w-full flex gap-4 items-center text-sm text-gray-500 font-semibold hover:text-gray-700"
          >
            <IoMdAdd className="text-lg" />
            <span>ADD SUBTASK</span>
          </button>
        </div>

        {/* Edit Task (for Admins) */}
        {user?.isAdmin && (
          <div className="w-full mt-2">
            <button className="text-sm text-blue-500 hover:underline">Edit Task</button>
          </div>
        )}
      </div>

      {/* Add Subtask Modal */}
      <AddSubTask open={open} setOpen={setOpen} taskId={task._id} />

      {/* Display Selected User Info */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="font-semibold text-xl">User Info</h3>
            <div className="mt-4">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Title:</strong> {selectedUser.title}</p>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
