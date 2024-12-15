import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import { MdAttachFile, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp }
  from "react-icons/md";
import { BiMessageAltDetail } from "react-icons/bi";
import { FaList } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { FaEdit, FaTrashAlt, FaCopy, FaEye } from "react-icons/fa";
import AddSubTask from "./AddSubTask";
import axios from "axios";
import EditTaskModal from "../Edittask"; // Import the modal

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
    const url = `http://localhost:3000/getuser/${null}`;
    const response = await axios.get(url);
    return Array.isArray(response.data) ? response.data : [response.data];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

const TaskCard = ({ task, user, isListView }) => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control modal visibility
  const navigate = useNavigate();
  const { id, role } = useParams();

  const getFirstLetter = (text) => (text ? text[0].toUpperCase() : "");

  const completedSubTasks = task.subTasks.filter((subTask) => subTask.completed).length;

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const toggleOptions = () => {
    setIsOptionsOpen((prev) => !prev);
  };

  const duplicateTask = async (taskId) => {
    try {
      const response = await axios.post(`http://localhost:3000/duplicateTask/${taskId}`);
      if (response.data.status) {
        alert("Task duplicated successfully.");
      }
    } catch (error) {
      console.error("Error duplicating task:", error);
      alert("An error occurred while duplicating the task.");
    }
  };

  const trashTask = async (taskId) => {
    try {
      const response = await axios.put(`http://localhost:3000/trashTask/${taskId}`);
      if (response.data.status) {
        alert("Task trashed successfully.");
      }
    } catch (error) {
      console.error("Error trashing task:", error);
      alert("An error occurred while trashing the task.");
    }
  };

  const openEditModal = () => {
    setIsEditModalOpen(true); // Open the edit task modal
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false); // Close the modal
  };

  return (
    <>
      <div
        className={clsx(
          "bg-white shadow-md p-4 rounded mt-5 transition-all duration-300",
          isListView ? "w-full" : "w-[350px]"
        )}
      >
        {/* Priority and Options */}
        <div className="w-full flex justify-between gap-2">
          <div className="flex items-center">
            <span className={clsx("text-lg", PRIORITY_COLORS[task.priority])}>
              {ICONS[task.priority]}
            </span>
            <span className={clsx("uppercase font-medium", PRIORITY_COLORS[task.priority])}>
              {task.priority} Priority
            </span>
          </div>
          <div className="relative">
            <BsThreeDots onClick={toggleOptions} className="cursor-pointer text-xl" />
            {isOptionsOpen && (

              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded p-4 transition-all duration-300 w-52">
                <button
                  className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 p-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent onClick from firing
                    navigate(`/taskdetails/${id}/${role}/${task._id}`); // Navigate to Task Details
                  }}
                >
                  <FaEye className="text-gray-600" /> Task Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent onClick from firing
                    openEditModal(); // Open Edit Task Modal
                  }}
                  className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 p-2"
                >
                  <FaEdit className="text-gray-600" /> Edit Task
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent onClick from firing
                    duplicateTask(task._id); // Duplicate Task
                  }}
                  className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 p-2"
                >
                  <FaCopy className="text-gray-600" /> Duplicate Task
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent onClick from firing
                    trashTask(task._id); // Trash Task
                  }}
                  className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 p-2"
                >
                  <FaTrashAlt className="text-red-600" /> Trash Task
                </button>
              </div>

            )}
          </div>
        </div>

        {/* Task Name and Details */}
        <div className="w-full flex items-center gap-2 mt-2">
          <div className={clsx("rounded-full h-4", task.stage)} />
          <span className="bg-yellow-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {getFirstLetter(task.title)}
          </span>
          <h4 className="line-clamp-1 text-black font-semibold">{task.title}</h4>
        </div>

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
          <div className="flex ms-20 flex-row-reverse">
            {task?.team?.map((m, index) => (
              <div key={index} className={clsx("w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1", backgroundColors[index % backgroundColors.length])}>
                <span>{getFirstLetter(m.name)}</span>
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
              <span className="bg-blue-600/10 px-3 py-1 rounded-full text-blue-700 font-medium">{task.subTasks[0].tag}</span>
            </div>
          </div>
        ) : (
          <div className="py-4 border-t border-gray-200 text-gray-500">No Sub Task</div>
        )}

        {/* Add Subtask Button */}
        <div className="w-full mt-2">
          <button onClick={() => setOpen(true)} className="w-full flex gap-4 items-center text-sm text-gray-500 font-semibold hover:text-gray-700">
            <IoMdAdd className="text-lg" />
            <span>ADD SUBTASK</span>
          </button>
        </div>
      </div>

      {/* Add Subtask Modal */}
      <AddSubTask open={open} setOpen={setOpen} taskId={task._id} />

      {/* Edit Task Modal */}
      {isEditModalOpen && <EditTaskModal task={task} onClose={closeEditModal} />}

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
            <button onClick={() => setSelectedUser(null)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
