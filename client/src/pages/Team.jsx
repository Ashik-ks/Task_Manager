import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileSidebar from "../components/MobileSidebar";
import { getInitials } from "../utils";
import Title from "../components/taskComponents/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import clsx from "clsx";
import { useParams } from 'react-router-dom';


const Team = () => {
  const [users, setUsers] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
    role: "",
    title: "",
  });

  let token = localStorage.getItem(id)

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/getuser/${null}`);
      setUsers(Array.isArray(response.data) ? response.data : [response.data]);
      console.log("Fetched users:", response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/register",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      console.log("User added:", response.data);
      setFormData({
        name: "",
        email: "",
        password: "",
        isAdmin: false,
        role: "",
        title: "",
      });
  
      setOpen(false); 
      fetchUsers(); 
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/activateUserProfile/${userId}`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      console.log(response.data.message);
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };
  
  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Title</th>
        <th className="py-2">Email</th>
        <th className="py-2">Role</th>
        <th className="py-2">Status</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
      <td className="p-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700">
            <span className="text-xs md:text-sm text-center">
              {getInitials(user.name)}
            </span>
          </div>
          {user.name || "Unnamed User"}
        </div>
      </td>
      <td className="p-2">{user.title || "No Title"}</td>
      <td className="p-2">{user.email || "user@email.com"}</td>
      <td className="p-2">{user.role || "Unknown Role"}</td>
      <td className="p-2">
        <button
          onClick={() => toggleUserStatus(user._id)}
          className={clsx(
            "w-fit px-4 py-1 rounded-full",
            user.isActive ? "bg-blue-200" : "bg-yellow-100"
          )}
        >
          {user.isActive ? "Active" : "Blocked"}
        </button>
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
              <Title title="Team Members" />
              <Button
                label="Add New User"
                icon={<IoMdAdd className="text-lg" />}
                className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5"
                onClick={() => setOpen(true)}
              />
            </div>

            <div className="bg-white px-2 md:px-4 py-4 shadow-md rounded">
              <div className="overflow-x-auto">
                <table className="w-full mb-5">
                  <TableHeader />
                  <tbody>
                    {users.map((user, index) => (
                      <TableRow key={index} user={user} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-3 px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
