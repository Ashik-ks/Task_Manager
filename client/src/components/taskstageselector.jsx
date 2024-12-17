import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";



const TaskStageSelector = ({ taskId }) => {
  const [isOpen, setIsOpen] = useState(false); // To toggle the visibility of the radio buttons
  const [selectedStage, setSelectedStage] = useState(""); // To store the selected stage
  const { tid } = useParams(); // Get task ID from URL params

  const handleSubmit = async () => {
    if (!selectedStage) return;
  
    try {
      // Send the taskId and the selected stage to the backend
      const response = await axios.put(
        `http://localhost:3000/taskstageupdate/${tid}/${selectedStage}`
      );
  
      // Handle the response
      if (response.status === 200) {
        alert("Task stage updated successfully");
      } else {
        alert(response.data.message || "Error updating task stage");
      }
    } catch (error) {
      console.error("Error updating task stage:", error);
      alert("An error occurred while updating the task stage");
    }
  };

  return (
<div>
  <div
    onClick={() => setIsOpen(!isOpen)} // Toggle the visibility of the radio buttons
    className="cursor-pointer text-blue-600 text-lg font-semibold " // Increased text size for "Change Stage"
  >
    update task Stage
  </div>

  {/* Display radio buttons when isOpen is true */}
  {isOpen && (
    <div className="mt-3"> {/* Added margin-top for spacing */}
      <div className="space-y-3"> {/* Added vertical spacing between the radio buttons */}
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="todo"
            checked={selectedStage === "todo"}
            onChange={() => setSelectedStage("todo")}
            className="mr-2" // Added margin-right to space the radio button and text
          />
          Todo
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="in progress"
            checked={selectedStage === "in progress"}
            onChange={() => setSelectedStage("in progress")}
            className="mr-2" // Added margin-right to space the radio button and text
          />
          In Progress
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="completed"
            checked={selectedStage === "completed"}
            onChange={() => setSelectedStage("completed")}
            className="mr-2" // Added margin-right to space the radio button and text
          />
          Completed
        </label>
      </div>

      {/* Submit button to send the selected stage */}
      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300" // Increased padding and styling
      >
        Submit
      </button>
    </div>
  )}
</div>

  );
};

export default TaskStageSelector;
