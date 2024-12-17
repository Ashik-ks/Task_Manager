import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import PersonalTaskForm from "./taskComponents/personalTaskForm";

const MyWorkOutlet = () => {
    const [personalTasks, setPersonalTasks] = useState([]); // For task data
    const [tasksCount, setTasksCount] = useState(0); // For count of tasks
    const [showForm, setShowForm] = useState(false);

    const { id } = useParams(); // Get params from URL
    const token = localStorage.getItem(id); // Retrieve token from localStorage

    // Fetch personal tasks
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
                setPersonalTasks(response.data.task);
                setTasksCount(response.data.task.length);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchPersonalTasks();
    }, [id, token]);

    const today = new Date();
    const formattedDate = `${today.getDate()} ${today.toLocaleString("default", {
        month: "short",
    })} · Today · ${today.toLocaleDateString("en-US", { weekday: "long" })}`;

    return (
        <div className="max-w-5xl mx-auto p-4">
            {/* Today Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Today</h1>
                <p className="text-md text-gray-500">{tasksCount} tasks</p>
            </div>

            {/* Overdue Section */}
            <div className="flex justify-between items-center mt-4 border-t pt-2">
                <h2 className="text-lg font-semibold text-gray-700">Overdue</h2>
                <button className="text-red-500 text-md hover:underline">
                    Reschedule
                </button>
            </div>

            {/* Empty Task List */}
            <div className="border-t mt-2"></div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-6 text-md">
                <p className="text-gray-500 font-semibold">{formattedDate}</p>
                <button
                    className="flex items-center text-red-500 hover:underline"
                    onClick={() => setShowForm(true)} // Show the form when clicked
                >
                    <span className="mr-1 text-xl">+</span> Add task
                </button>
            </div>

            {/* Form Rendering */}
            {showForm && <PersonalTaskForm setShowForm={setShowForm} />}
        </div>
    );
};

export default MyWorkOutlet;
