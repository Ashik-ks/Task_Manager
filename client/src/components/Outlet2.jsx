import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaList } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdGridView } from "react-icons/md";
import Loading from "./taskComponents/Loader";
import Title from "./taskComponents/Title";
import Tabs from "./taskComponents/Tabs";
import TaskTitle from "./taskComponents/TaskTitle";
import BoardView from "./taskComponents/BoardView";
import TaskCard from "./taskComponents/TaskCard";
import AddTask from "./taskComponents/Addtask";
import Button from "./Button";

// Task stages
const TASK_TYPE = {
  todo: "To Do",
  "in progress": "In Progress",
  completed: "Completed",
};

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const Tasks = ({ isListView, setIsListView }) => {
  const { status, role, id } = useParams(); // 
  const [selected, setSelected] = useState(0); 
  const [open, setOpen] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [tasks, setTasks] = useState([]); 
  const [filterStage, setFilterStage] = useState(status || "all"); 

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/gettasks");
      const taskData = response.data.tasks;

      // If role is "user", filter tasks where the user is in the task's team
      if (role === "User") {
        const filteredTasks = taskData.filter((task) =>
          task.team.some((member) => member._id === id)
        );
        setTasks(filteredTasks); // Store filtered tasks in state
      } else {
        setTasks(taskData); // If role is "admin", show all tasks
      }
      setLoading(false); // Stop loading after data fetch
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false); // Stop loading even if there's an error
    }
  };

  // Fetch tasks when the component mounts or when `status` or `role` changes
  useEffect(() => {
    fetchTasks();
  }, [status, role]); // Fetch tasks when URL status or role changes

  // Handle tab selection (Board View vs List View)
  const handleTabChange = (index) => {
    setSelected(index);
    setIsListView(index === 1); // If List View tab is selected
  };

  // Handle filter change (from child component)
  const handleFilterChange = (stage) => {
    setFilterStage(stage); // Update the filter state based on the selected stage
  };

  // Filter tasks based on the stage
  const filteredTasks = tasks.filter((task) => {
    // If the status param is present, filter tasks based on it
    if (status) {
      return task.stage === status; // Match tasks to the provided status
    }
    // Otherwise, filter based on the filterStage state (which is controlled by the user)
    return filterStage === "all" || task.stage === filterStage; // Show all tasks if filter is "all"
  });

  // Determine the title text based on filterStage
  const getTitle = () => {
    if (filterStage === "in-progress") {
      return "In Progress Tasks"; // Handle the space in the URL parameter
    }
    return filterStage !== "all" ? `${TASK_TYPE[filterStage]} Tasks` : "All Tasks";
  };

  return loading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 ">
        <Title title={getTitle()} /> {/* Dynamically set the title */}

        {/* Show create task button only if no status is selected and role is Admin */}
        {!status && role === "Admin" && (
          <Button
            onClick={() => setOpen(true)}
            label="Create Task"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5"
          />
        )}
      </div>

      {/* Tabs (Board View or List View) */}
      <Tabs tabs={TABS} setSelected={handleTabChange}>
        {/* Filter buttons - only show these if no status is in the URL */}
        {!status && (
          <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
            {Object.keys(TASK_TYPE).map((stage) => (
              <TaskTitle
                key={stage}
                label={TASK_TYPE[stage]} // Display the task stage label (e.g., To Do, In Progress, Completed)
                className={`bg-${stage === "todo" ? "blue" : stage === "in-progress" ? "red" : "green"}-600`} // Different background for each stage
                onClick={() => handleFilterChange(stage)} // Use the handler from the parent for filtering
              />
            ))}
            <TaskTitle
              label="All Tasks" // Show "All Tasks" filter option
              className="bg-gray-600"
              onClick={() => handleFilterChange("all")} // Reset filter to show all tasks
            />
          </div>
        )}

        {/* Display tasks based on selected view (Board or List) */}
        {selected === 0 ? (
          // Board View
          <BoardView tasks={filteredTasks} />
        ) : (
          // List View
          <div className="w-full space-y-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isListView={isListView} // Pass isListView to style TaskCard appropriately
                />
              ))
            ) : (
              <div>No tasks available</div> // Display a message if no tasks match the filter
            )}
          </div>
        )}
      </Tabs>

      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;
