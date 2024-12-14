import React, { useState, useEffect } from "react";
import ModalWrapper from "../modelWrapper";
import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import { useParams } from "react-router-dom";
import axios from "axios";
import SelectList from "./SelectList";

const LISTS = ["todo", "in progress", "completed"];
const PRIORITY = ["high", "medium", "normal", "low"];

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

const AddTask = ({ open, setOpen }) => {
  const { id } = useParams();

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [team, setTeam] = useState([]); // Array to store the selected user IDs (_id)
  const [stage, setStage] = useState(LISTS[0]);
  const [priority, setPriority] = useState(PRIORITY[2]);
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };
    loadUsers();
  }, []);

  const submitHandler = async (data) => {
    try {
      setUploading(true);
      const taskData = {
        title: data.title,
        team: team, // Use the team array with user _id
        stage,
        date: data.date,
        priority,
        assets: Array.from(assets).map((file) => file.name),
      };
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, unable to authenticate");
        return;
      }
      const response = await axios.post(
        `http://localhost:3000/createtask/${id}`,
        taskData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Task created successfully:", response.data);
      setUploading(false);
      setOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
      setUploading(false);
    }
  };

  const handleSelectUser = (e) => {
    const selectedUserId = e.target.value;
    if (selectedUserId !== "" && !team.includes(selectedUserId)) {
      setTeam((prevTeam) => [...prevTeam, selectedUserId]);
    }
  };

  const handleRemoveUser = (userId) => {
    setTeam((prevTeam) => prevTeam.filter((id) => id !== userId));
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen} hideCloseButton={true}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Dialog.Title as="h2" className="text-base font-bold leading-6 text-gray-900 mb-4">
          ADD TASK
        </Dialog.Title>
        <div className="mt-2 flex flex-col gap-6">
          {/* Task Title */}
          <Textbox
            placeholder="Task Title"
            type="text"
            name="title"
            className="w-full rounded"
            register={register("title", { required: "Title is required" })}
            error={errors.title ? errors.title.message : ""}
          />

          {/* Team Dropdown */}
          <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-700">
              Assign Team
            </label>
            <select
              id="team"
              className="mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={handleSelectUser}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name || `User ${user._id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Display Selected Users */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Selected Team</h3>
            <ul className="mt-2 space-y-2">
              {team.map((userId) => {
                const user = users.find((user) => user._id === userId);
                return (
                  <li key={userId} className="flex items-center justify-between">
                    <span>{user ? user.name : `User ${userId}`}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(userId)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex gap-4 mt-2">
            <SelectList label="Task Stage" lists={LISTS} selected={stage} setSelected={setStage} />
            <Textbox
              placeholder="Date"
              type="date"
              name="date"
              className="w-full rounded"
              register={register("date", { required: "Date is required!" })}
              error={errors.date ? errors.date.message : ""}
            />
          </div>

          <div className="flex gap-4 mt-2">
            <SelectList label="Priority Level" lists={PRIORITY} selected={priority} setSelected={setPriority} />
            <div className="w-full flex items-center justify-center mt-4">
              <label htmlFor="imgUpload" className="flex items-center gap-1 text-base cursor-pointer my-4">
                <input
                  type="file"
                  className="hidden"
                  id="imgUpload"
                  onChange={handleSelect}
                  accept=".jpg, .png, .jpeg"
                  multiple
                />
                <BiImages />
                <span>Add Assets</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4">
            {uploading ? (
              <span className="text-sm py-2 text-red-500">Uploading assets</span>
            ) : (
              <Button label="Submit" type="submit" className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto" />
            )}
            <Button
              type="button"
              className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
              onClick={() => setOpen(false)}
              label="Cancel"
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

// Textbox Component (inline)
const Textbox = ({ label, name, type, placeholder, register, error, className }) => (
  <div className="mt-[2.25rem]">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      placeholder={placeholder}
      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
      {...register}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default AddTask;
