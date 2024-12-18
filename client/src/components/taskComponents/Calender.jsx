import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AiOutlineCalendar } from "react-icons/ai";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Calender = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personalTasks, setPersonalTasks] = useState([]);
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const { id } = useParams();
  const token = localStorage.getItem(id);

  // Open and close modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch tasks once
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
        console.log("Tasks fetched for calendar:", tasks);
        setPersonalTasks(tasks.reverse());
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchPersonalTasks();
  }, [id, token]);

  // Highlight due dates in the calendar
  const highlightDates = useCallback(
    ({ date }) => {
      const dueDates = personalTasks.map((task) =>
        new Date(task.dueDate).toDateString()
      );

      return dueDates.includes(date.toDateString()) ? "highlight" : null;
    },
    [personalTasks]
  );

  // Handle date selection to display tasks
  const handleDateClick = (date) => {
    const formattedDate = date.toDateString();
    const tasksForDate = personalTasks.filter(
      (task) => new Date(task.dueDate).toDateString() === formattedDate
    );
    setSelectedDate(formattedDate);
    setSelectedDateTasks(tasksForDate);
  };

  return (
    <div>
      {/* Calendar Icon */}
      <div className="flex justify-end text-2xl" onClick={openModal}>
        <AiOutlineCalendar />
      </div>

      {/* Modal */}
      <Modal open={isModalOpen} onClose={closeModal} center>
      <div 
  className="calendar-container mx-auto  p-4 rounded" 
  style={{ width: "100%", maxWidth: "550px" }}
>
  <h2 className="text-xl font-bold text-center mb-4 text-white">Your Calendar</h2>
  <Calendar
    className="responsive-calendar mx-auto" 
    style={{ width: "100%" }} 
    tileClassName={highlightDates} 
    onClickDay={handleDateClick}
  />
  {/* Display task details for the selected date */}
  {selectedDate && (
    <div
      className="task-details mt-4 p-4 bg-red-100 rounded shadow"
      style={{ width: "100%", maxWidth: "550px" }} 
    >
      <h3 className="text-lg font-bold mb-2">
        Tasks for {selectedDate}:
      </h3>
      {selectedDateTasks.length > 0 ? (
        <ul className="list-disc pl-6">
          {selectedDateTasks.map((task) => (
            <li key={task.id} className="mt-1 break-words">
              <span className="font-semibold">{task.title}</span> -{" "}
              {task.description || "No description"}
            </li>
          ))}
        </ul>
      ) : (
        <p className="break-words">No tasks for this date.</p>
      )}
    </div>
  )}
</div>

      </Modal>
    </div>
  );
};

export default Calender;
