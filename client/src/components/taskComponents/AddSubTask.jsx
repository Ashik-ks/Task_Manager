import React, { useState, useEffect, Fragment } from "react";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import Button from "../Button";
import { Listbox, Transition } from "@headlessui/react";
import { BsChevronExpand } from "react-icons/bs";
import { MdCheck } from "react-icons/md";

const AddSubTask = ({ open, setOpen, taskId }) => {
  // Use the taskId passed as a prop
  const [subTaskData, setSubTaskData] = useState({
    title: "",
    tag: "Normal",
    date: "",
    assignedUsers: [], // to hold the selected users
  });
  const [users, setUsers] = useState([]);  // to store the fetched users
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the users from the backend (assuming the API exists)
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getuser/${null}`);  // Replace with actual endpoint
        setUsers(response.data);  // Assuming response is an array of users
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setSubTaskData({
      ...subTaskData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserSelection = (selectedUser) => {
    const isAlreadySelected = subTaskData.assignedUsers.includes(selectedUser);
    if (isAlreadySelected) {
      setSubTaskData({
        ...subTaskData,
        assignedUsers: subTaskData.assignedUsers.filter(user => user !== selectedUser),
      });
    } else {
      setSubTaskData({
        ...subTaskData,
        assignedUsers: [...subTaskData.assignedUsers, selectedUser],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset any previous error message

    // Basic form validation
    if (!subTaskData.title || !subTaskData.date) {
      setError("Title and Date are required fields.");
      setLoading(false);
      return;
    }

    // Get the token from local storage
    const token = localStorage.getItem("token");  // Replace 'token' with your token key

    try {
      const response = await axios.put(
        `http://localhost:3000/createSubTask/${taskId}`, // Use taskId prop here
        {
          ...subTaskData,
          assignedUsers: subTaskData.assignedUsers, // Pass the selected users as an array
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        }
      );
      if (response.status === 200) {
        alert("Subtask added successfully");
        setOpen(false);
      }
    } catch (error) {
      console.error("Error adding subtask", error);
      setError("Failed to add subtask. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 z-10 flex items-center justify-center">
        <Dialog.Panel className="bg-white p-6 rounded-lg max-w-sm w-full">
          <Dialog.Title className="text-lg font-semibold">Add Subtask</Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4">
            {error && (
              <div className="mb-4 text-red-600">
                <span>{error}</span>
              </div>
            )}
            {/* Title input field */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={subTaskData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            {/* Tag selection */}
            <div className="w-full mt-4">
              <p className="text-slate-900 dark:text-gray-500">Tag</p>
              <Listbox value={subTaskData.tag} onChange={(selected) => setSubTaskData({ ...subTaskData, tag: selected })}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded bg-white pl-3 pr-10 text-left px-3 py-2.5 2xl:py-3 border border-gray-300 sm:text-sm">
                    <span className="block truncate">{subTaskData.tag}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <BsChevronExpand className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                      {["High", "Medium", "Low", "Normal"].map((list) => (
                        <Listbox.Option
                          key={list}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-amber-100 text-amber-900" : "text-gray-900"}` 
                          }
                          value={list}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                {list}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                  <MdCheck className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>

            {/* Due Date input field */}
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={subTaskData.date}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            {/* Assign Users section */}
            <div className="mt-4">
              <p className="text-slate-900 dark:text-gray-500">Assign Users</p>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user._id}>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={subTaskData.assignedUsers.includes(user._id)}
                        onChange={() => handleUserSelection(user._id)}
                        className="form-checkbox"
                      />
                      <span className="ml-2">{user.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit and Cancel buttons */}
            <div className="mt-4 flex gap-4">
              <Button
                type="submit"
                className="bg-blue-600 text-white"
                disabled={loading}
                label={loading ? "Submitting..." : "Submit"}
              />
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="bg-gray-300"
                label="Cancel"
              />
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddSubTask;
