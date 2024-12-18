import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import PersonalTaskForm from "./taskComponents/personalTaskForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calender from "./taskComponents/Calender";

const MyWorkOutlet = () => {
    const [personalTasks, setPersonalTasks] = useState([]);
    const [tasksCount, setTasksCount] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [reminderDate, setReminderDate] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [showArchiveButton, setShowArchiveButton] = useState(null);
    const [showArchivedTasks, setShowArchivedTasks] = useState(false);

    const { id } = useParams();
    const token = localStorage.getItem(id);

    useEffect(() => {
        const fetchPersonalTasks = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3000/getAllPersonaltask/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const tasks = response.data.task.filter((task) => !task.isArchive);
                setPersonalTasks(tasks.reverse());
                setTasksCount(tasks.length);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchPersonalTasks();
    }, [id, token]);

    const handleSetReminder = async () => {
        if (!reminderDate || !activeTaskId) {
            alert("Please select a date and time for the reminder.");
            return;
        }
        try {
            await axios.put(
                `http://localhost:3000/setReminder/${activeTaskId}`,
                { reminder: reminderDate },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("Reminder set successfully!");
            setReminderDate(null);
            setActiveTaskId(null);
            setPersonalTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === activeTaskId
                        ? { ...task, reminder: reminderDate }
                        : task
                )
            );
        } catch (error) {
            console.error("Error setting reminder:", error);
        }
    };

    const handleEditTask = async () => {
        if (!editingTask) return;

        try {
            await axios.put(
                `http://localhost:3000/updatePersonaltask/${editingTask._id}`,
                editingTask,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("Task updated successfully!");
            setEditingTask(null); // Close modal
            setPersonalTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === editingTask._id ? { ...task, ...editingTask } : task
                )
            );
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleDoubleClick = (taskId) => {
        setShowArchiveButton(taskId);
    };

    const handleArchive = async (taskId) => {
        try {

            const response = await axios.put(
                `http://localhost:3000/archivePersonalTask/${taskId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                alert(response.data.message);
                setShowArchiveButton(null);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error archiving task:', error);
            alert('Failed to archive task');
        }
    };

    const handleDelete = async (taskId) => {
        try {
            const response = await axios.delete(
                `http://localhost:3000/deletePersonaltask/${taskId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Pass the token here for authorization
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                alert(response.data.message); // Show success message
            } else {
                alert(response.data.message); // Show error message if any
            }
            console.log('Deleting task:', taskId);
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task');
        }
    };


    const today = new Date();
    const formattedDate = `${today.getDate()} ${today.toLocaleString("default", {
        month: "short",
    })} · Today · ${today.toLocaleDateString("en-US", { weekday: "long" })}`;

    return (
        <>
      <div className="calendar-container">
        <Calender />
      </div>

            <div className="max-w-5xl mx-auto p-4">
                {/* Today Header */}
                <div className="flex justify-between items-center flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-800">Today</h1>
                    <p className="text-md text-gray-500">{tasksCount} tasks</p>
                </div>


                {/* Overdue Section */}
                <div className="flex justify-between items-center mt-4 border-t pt-2">
                    <h2 className="text-lg font-semibold text-gray-700">Overdue</h2>
                    <button
                        className="text-red-500 text-md hover:underline"
                        onClick={() => setShowArchivedTasks(!showArchivedTasks)} // Toggle archived tasks view
                    >
                        Archived
                    </button>

                </div>

                {/* Empty Task List */}
                <div className="border-t mt-2"></div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-6 text-md flex-wrap">
                    <p className="text-gray-500 font-semibold">{formattedDate}</p>
                    <button
                        className="flex items-center text-red-500 hover:underline mt-2 md:mt-0"
                        onClick={() => setShowForm(true)}
                    >
                        <span className="mr-1 text-xl">+</span> Add task
                    </button>
                </div>

                {/* Form Rendering */}
                {showForm && <PersonalTaskForm setShowForm={setShowForm} />}

                {/* Task Cards Section */}
                <div className="mt-8 space-y-4">
    {personalTasks
        .filter((task) => showArchivedTasks ? task.isArchived : !task.isArchived) // Show based on archived status
        .map((task) => (
            <div
                key={task._id}
                className="flex flex-col border-t py-3 space-y-3 md:flex-row md:space-y-0 md:items-start"
                onDoubleClick={() => handleDoubleClick(task._id)} // Trigger double-click action
            >
                <div className="flex-shrink-0">
                    <i className="far fa-circle text-red-500 text-2xl"></i>
                </div>
                <div className="w-full">
                    <h2 className="text-lg pb-1 font-semibold text-gray-800">{task.title}</h2>
                    <p className="text-gray-500">{task.description}</p>
                    {/* <p className="text-gray-500">{task.priority}  Priority</p> */}
                    <div className="flex items-center mt-2">
                        <i className="far fa-calendar-alt text-red-500"></i>
                        <span className="text-red-500">
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    weekday: "long",
                                })
                                : "No Due Date"}
                        </span>
                    </div>

                    {/* Reminder Display */}
                    {task.reminder && new Date(task.reminder) > new Date() && (
                        <div className="mt-2 rounded-md transition-opacity text-red-700 border border-red-700 opacity-100 px-2 inline-block">
                            Reminder set for: {new Date(task.reminder).toLocaleString()}
                        </div>
                    )}

                    {/* Buttons for Edit, Reminder, Archive, and Delete */}
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                        {/* Only show these buttons if the task is not archived */}
                        {!task.isArchived && (
                            <>
                                <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() => setEditingTask(task)}
                                >
                                    <i className="fas fa-edit"></i> Edit
                                </button>
                                <button
                                    className="text-red-500 hover:underline"
                                    onClick={() => {
                                        setActiveTaskId(task._id);
                                        setReminderDate(new Date()); // Default to current date
                                    }}
                                >
                                    <i className="far fa-clock"></i> Set Reminder
                                </button>
                                <button
                                    className="text-red-700 hover:underline"
                                    onClick={() => handleDelete(task._id)} // Handle delete click
                                >
                                    <i className="fas fa-trash"></i> Delete
                                </button>
                            </>
                        )}

                        {/* Archive Button (toggle visibility on double-click) */}
                        {showArchiveButton === task._id && !task.isArchived && (
                            <button
                                className="text-gray-500 hover:underline"
                                onClick={() => handleArchive(task._id)} // Handle archive click
                            >
                                <i className="fas fa-archive"></i> Archive
                            </button>
                        )}

                        {/* Unarchive Button (only show when task is archived) */}
                        {task.isArchived && (
                            <button
                                className="text-green-500 hover:underline"
                                onClick={() => handleArchive(task._id)} // Handle unarchive click
                            >
                                <i className="fas fa-undo"></i> Unarchive
                            </button>
                        )}
                    </div>

                    {/* Reminder Date Picker */}
                    {activeTaskId === task._id && (
                        <div className="mt-3">
                            <DatePicker
                                selected={reminderDate}
                                onChange={(date) => setReminderDate(date)}
                                showTimeSelect
                                dateFormat="Pp"
                                className="border p-2 rounded w-full"
                            />
                            <button
                                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={handleSetReminder}
                            >
                                Save Reminder
                            </button>
                        </div>
                    )}
                </div>
            </div>
        ))}
</div>



            </div>

            {/* Edit Task Modal */}
            {editingTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Edit Task
                        </h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                placeholder="Title"
                                value={editingTask.title}
                                onChange={(e) =>
                                    setEditingTask({ ...editingTask, title: e.target.value })
                                }
                            />
                            <textarea
                                className="w-full border rounded p-2"
                                placeholder="Description"
                                value={editingTask.description}
                                onChange={(e) =>
                                    setEditingTask({
                                        ...editingTask,
                                        description: e.target.value,
                                    })
                                }
                            />
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                placeholder="Stage"
                                value={editingTask.stage || ""}
                                onChange={(e) =>
                                    setEditingTask({ ...editingTask, stage: e.target.value })
                                }
                            />
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                placeholder="Priority"
                                value={editingTask.priority || ""}
                                onChange={(e) =>
                                    setEditingTask({ ...editingTask, priority: e.target.value })
                                }
                            />
                            <textarea
                                className="w-full border rounded p-2"
                                placeholder="Note"
                                value={editingTask.note || ""}
                                onChange={(e) =>
                                    setEditingTask({ ...editingTask, note: e.target.value })
                                }
                            />
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={() => setEditingTask(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={handleEditTask}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyWorkOutlet;