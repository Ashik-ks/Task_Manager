import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditTaskModal = ({ task, onClose }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns "yyyy-MM-dd"
  };

  const [formData, setFormData] = useState({
    title: task.title,
    date: formatDate(task.date),  // Format the date to "yyyy-MM-dd"
    priority: task.priority,
    stage: task.stage,
    team: [],  // Initialize team as an empty array
    assets: task.assets || [],
  });

  const [availableUsers, setAvailableUsers] = useState([]);

  // Fetch users for the team selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getuser/${null}`);
        setAvailableUsers(response.data); // Assuming response.data contains an array of users
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    const updatedArray = [...formData[name]];

    if (updatedArray.includes(value)) {
      updatedArray.splice(updatedArray.indexOf(value), 1);
    } else {
      updatedArray.push(value);
    }

    setFormData({
      ...formData,
      [name]: updatedArray,  // Update team with only selected user IDs
    });
  };

  // Handle file upload for assets
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prevData) => ({
      ...prevData,
      assets: [...prevData.assets, ...files], // Add new files to assets array
    }));
  };

  // Remove a file from assets
  const removeAsset = (assetName) => {
    setFormData((prevData) => ({
      ...prevData,
      assets: prevData.assets.filter((file) => file.name !== assetName),
    }));
  };

  // Handle form submission to update task
  const handleSubmit = async () => {
    const updatedData = new FormData();
  
    updatedData.append('title', formData.title);
    updatedData.append('date', formData.date);
    updatedData.append('priority', formData.priority);
    updatedData.append('stage', formData.stage);
  
    // Send 'team' as an array within FormData (no need to stringify the array)
    updatedData.append('team', JSON.stringify(formData.team));
  
    // Append files to FormData
    formData.assets.forEach((file) => {
      updatedData.append('assets[]', file);
    });
  
    try {
      const response = await axios.put(`http://localhost:3000/updateTask/${task._id}`, updatedData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.data.status) {
        alert('Task updated successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task.');
    }
  };
  
  
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full sm:w-96 md:w-128 lg:w-1/2 xl:w-1/3">
        <h3 className="text-xl font-semibold mb-4">Edit Task</h3>

        {/* Title Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        {/* Date Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        {/* Priority Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Stage Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Stage</label>
          <select
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Team Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Team</label>
          <div className="mb-2">
            {/* Display selected team members */}
            {formData.team.length > 0 ? (
              <ul>
                {formData.team.map((userId) => {
                  const user = availableUsers.find((user) => user._id === userId);
                  return user ? <li key={user._id}>{user.name}</li> : null;
                })}
              </ul>
            ) : (
              <p>No team members selected.</p>
            )}
          </div>
          <select
            name="team"
            multiple
            value={formData.team}
            onChange={handleSelectChange}
            className="mt-1 p-2 w-full border rounded"
          >
            {availableUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assets Field - File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Assets</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-1 p-2 w-full border rounded"
          />
          <div className="mt-2">
            {formData.assets.length > 0 && (
              <ul>
                {formData.assets.map((file, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{file.name}</span>
                    <button
                      onClick={() => removeAsset(file.name)}
                      className="text-red-500 ml-2"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="text-sm text-gray-600">
            Cancel
          </button>
          <button onClick={handleSubmit} className="text-sm text-blue-500">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
