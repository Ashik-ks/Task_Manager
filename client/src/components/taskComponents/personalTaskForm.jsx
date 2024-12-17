import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PersonalTaskForm = ({ setShowForm }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        stage: 'todo',
        priority: 'medium',
        notes: [], // Notes array
    });
    const [showStageOptions, setShowStageOptions] = useState(false);
    const [showPriorityOptions, setShowPriorityOptions] = useState(false);
    const [newNote, setNewNote] = useState(''); // State for new note input
    const [error, setError] = useState(null);

    const { id } = useParams(); // Get params from URL
    const token = localStorage.getItem(id); // Retrieve token from localStorage

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle Stage selection
    const handleStageChange = (e) => {
        setFormData({ ...formData, stage: e.target.value });
        setShowStageOptions(false); // Close dropdown after selection
    };

    // Handle Priority selection
    const handlePriorityChange = (e) => {
        setFormData({ ...formData, priority: e.target.value });
        setShowPriorityOptions(false); // Close dropdown after selection
    };

    // Handle Due Date change
    const handleDueDateChange = (e) => {
        setFormData({ ...formData, dueDate: e.target.value });
    };

    // Automatically update notes array as user types
    const handleNoteChange = (e) => {
        const newNoteContent = e.target.value;
        setNewNote(newNoteContent);

        // Update notes array with each new note, including the content and optional properties
        setFormData({
            ...formData,
            notes: [{ content: newNoteContent, createdAt: new Date() }],
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.title || !formData.description || !formData.dueDate) {
            setError('All fields are required');
            return;
        }

        console.log("Submitting form data:", formData);  // Log the entire form data including notes

        try {
            const response = await axios.post(
                `http://localhost:3000/createPersonaltask/${id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response.data);  // Log the response from the backend
            setShowForm(false);  // Close the form after successful submission
        } catch (err) {
            setError(err.message);  // Set error state if something goes wrong
            console.error(err);  // Log error in console
        }
    };

    return (
        <div className="mt-5 min-h-screen">
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-5xl">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Title Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full text-lg font-semibold text-gray-800 border-none focus:ring-0"
                            placeholder="Title"
                            required
                        />
                    </div>

                    {/* Description Textarea */}
                    <div className="mb-4">
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full text-sm text-gray-500 border-none focus:ring-0"
                            placeholder="Description"
                            required
                        ></textarea>
                    </div>

                    {/* Due Date and Stage/Priority Selection */}
                    <div className="flex items-center gap-5 space-x-4 mb-4">
                        {/* Due Date */}
                        <div className="flex-1 mb-4">
                            <label className="block text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleDueDateChange}
                                className="w-full text-gray-700 focus:ring-0 border-none"
                                required
                            />
                        </div>

                        {/* Stage Section with Heading */}
                        <div className="relative flex-1 mb-4">
                            <span className="block text-gray-500 mb-1">Stage</span>
                            <button
                                type="button"
                                onClick={() => setShowStageOptions(!showStageOptions)}
                                className="flex items-center space-x-1 px-3 py-1 border rounded-md text-sm text-gray-700 w-full"
                            >
                                <span>{formData.stage}</span>
                            </button>
                            {showStageOptions && (
                                <div className="absolute top-8 left-0 w-full bg-white shadow-lg rounded-md z-10">
                                    <button
                                        type="button"
                                        onClick={handleStageChange}
                                        value="todo"
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                                    >
                                        To-Do
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleStageChange}
                                        value="in progress"
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                                    >
                                        In Progress
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleStageChange}
                                        value="completed"
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                                    >
                                        Completed
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Priority Section with Heading */}
                        <div className="relative flex-1 mb-4">
                            <span className="block text-gray-500 mb-1">Priority</span>
                            <button
                                type="button"
                                onClick={() => setShowPriorityOptions(!showPriorityOptions)}
                                className="flex items-center space-x-1 px-3 py-1 border rounded-md text-sm text-gray-700 w-full"
                            >
                                <span>{formData.priority}</span>
                            </button>
                            {showPriorityOptions && (
                                <div className="absolute top-8 left-0 w-full bg-white shadow-lg rounded-md z-10">
                                    <button
                                        type="button"
                                        onClick={handlePriorityChange}
                                        value="high"
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                                    >
                                        High
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePriorityChange}
                                        value="medium"
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                                    >
                                        Medium
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePriorityChange}
                                        value="low"
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                                    >
                                        Low
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Notes</label>
                        <input
                            type="text"
                            className="w-full p-2 mb-2 border rounded"
                            value={newNote}  // Controlled value
                            onChange={handleNoteChange}  // Update note directly as user types
                            placeholder="Add a note"
                        />
                    </div>

                    {/* Error Message */}
                    {error && <p className="text-red-500">{error}</p>}

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm text-gray-500 bg-gray-200 rounded-md"
                            onClick={() => setShowForm(false)} // Cancel the form
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm text-white bg-red-400 rounded-md"
                        >
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PersonalTaskForm;
