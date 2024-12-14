import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileSidebar from "../components/MobileSidebar";
import Button from "../components/Button";  // Assuming you have a Button component
import { MdOutlineRestore, MdDelete } from "react-icons/md"; // For restore and delete icons
import clsx from "clsx"; // Assuming clsx is used for conditional classnames

const Trash = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);  // Store the trashed tasks
  const [loading, setLoading] = useState(true);  // Track loading state

  // Function to toggle the mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  // Function to close the mobile sidebar
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const getFirstLetter = (text) => (text ? text[0].toUpperCase() : "");

  // Fetch trashed tasks on component mount
  useEffect(() => {
    const fetchTrashedTasks = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getTasks", {
          params: { isTrashed: true },
        });
        setTasks(response.data.tasks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    };

    fetchTrashedTasks();
  }, []);

  // Function to restore a task
  const restoreClick = async (taskId) => {
    try {
      await axios.delete(`http://localhost:3000/deleteRestoreTask/${taskId}`, {
        params: { actionType: "restore" },
      });
      setTasks(tasks.filter(task => task._id !== taskId)); // Remove the restored task from the state
    } catch (error) {
      console.error("Error restoring task:", error);
    }
  };

  // Function to delete a task
  const deleteClick = async (taskId) => {
    try {
      await axios.delete(`http://localhost:3000/deleteRestoreTask/${taskId}`,{
        params: { actionType: "delete" },
      });
      setTasks(tasks.filter(task => task._id !== taskId)); // Remove the deleted task from the state
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Function to restore all tasks
  const restoreAllClick = async () => {
    try {
      await axios.delete("http://localhost:3000/deleteRestoreTask/${taskId}", {
        params: { actionType: "restoreAll" },
      });
      setTasks(tasks.filter(task => task.isTrashed === false)); // Remove all restored tasks from the state
    } catch (error) {
      console.error("Error restoring all tasks:", error);
    }
  };

  // Function to delete all trashed tasks
  const deleteAllClick = async () => {
    try {
      await axios.delete("http://localhost:3000/deleteRestoreTask/${taskId}", {
        params: { actionType: "deleteAll" },
      });
      setTasks([]); // Remove all tasks from the state after deletion
    } catch (error) {
      console.error("Error deleting all tasks:", error);
    }
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Task Title</th>
        <th className="py-2">Priority</th>
        <th className="py-2">Stage</th>
        <th className="py-2 line-clamp-1">Modified On</th>
      </tr>
    </thead>
  );

  const TableRow = ({ item }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div className={clsx("w-4 h-4 rounded-full", item.stage)} />
          <span className="bg-yellow-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {getFirstLetter(item.title)}
                    </span>
                    <h4 className="line-clamp-1 text-black font-semibold">{item.title}</h4>
        </div>
      </td>

      <td className="py-2 capitalize">
        <div className="flex gap-1 items-center">
          <span className={clsx("text-lg", item.priority)}>{item.priority}</span>
        </div>
      </td>

      <td className="py-2 capitalize text-center md:text-start">{item?.stage}</td>
      <td className="py-2 text-sm">{new Date(item?.date).toDateString()}</td>

      <td className="py-2 flex gap-1 justify-end">
        <Button
          icon={<MdOutlineRestore className="text-xl text-gray-500" />}
          onClick={() => restoreClick(item._id)}
        />
        <Button
          icon={<MdDelete className="text-xl text-red-600" />}
          onClick={() => deleteClick(item._id)}
        />
      </td>
    </tr>
  );

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
          <div className="w-full md:px-1 px-0 mb-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold">Trashed Tasks</h2>

              <div className="flex gap-2 md:gap-4 items-center">
                <Button
                  label="Restore All"
                  icon={<MdOutlineRestore className="text-lg hidden md:flex" />}
                  className="flex flex-row-reverse gap-1 items-center text-black text-sm md:text-base rounded-md 2xl:py-2.5"
                  onClick={restoreAllClick}
                />
                <Button
                  label="Delete All"
                  icon={<MdDelete className="text-lg hidden md:flex" />}
                  className="flex flex-row-reverse gap-1 items-center text-red-600 text-sm md:text-base rounded-md 2xl:py-2.5"
                  onClick={deleteAllClick}
                />
              </div>
            </div>
            <div className="bg-white px-2 md:px-6 py-4 shadow-md rounded">
              <div className="overflow-x-auto">
                <table className="w-full mb-5">
                  <TableHeader />
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-4 text-center">Loading...</td>
                      </tr>
                    ) : tasks.length > 0 ? (
                      tasks.map((task, index) => <TableRow key={index} item={task} />)
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center">No trashed tasks available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trash;
