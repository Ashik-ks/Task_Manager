import React, { useState, useEffect } from "react";
import clsx from "clsx";
import moment from "moment";
import { FaBug, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt,
} from "react-icons/md";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Tabs from "./taskComponents/Tabs";
import { PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import Loading from "../components/taskComponents/Loader";
import Button from "./Button";
import axios from "axios"; // Import axios for fetching users

const Outlet3 = () => {
  const { tid } = useParams(); // Get task ID from URL params
  const [task, setTask] = useState(null); // Store task data
  const [selected, setSelected] = useState(0); // For Tabs
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);

  const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
  };

  const bgColor = {
    high: "bg-red-200",
    medium: "bg-yellow-200",
    low: "bg-blue-200",
  };

  const TABS = [
    { title: "Task Detail", icon: <FaTasks /> },
    { title: "Activities/Timeline", icon: <MdOutlineMessage /> },
  ];





  // Fetch users and set them in the state
  const fetchUsers = async () => {
    try {
      const url = `http://localhost:3000/getuser/${null}`; // Change the URL to your actual API endpoint
      const response = await axios.get(url);
      setUsers(response.data); // Store users in the state
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch task details on component mount
  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      try {
        // Replace with your API endpoint
        const response = await fetch(`http://localhost:3000/gettask/${tid}`);
        if (!response.ok) {
          throw new Error("Failed to fetch task data.");
        }
        const data = await response.json();
        // console.log("task data : ", data.task.title); // Check task data
        setTask(data);
        setActivities(data.task.activities);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
    fetchUsers(); // Fetch users when component mounts
  }, [tid]);

  if (isLoading) {
    return <Loading />;
  }

  if (!task) {
    return <div className="text-center text-gray-500">Task not found.</div>;
  }
  console.log("task : ", task);
  return (
    <div>
      <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden">
        <h1 className="text-2xl text-gray-600 font-bold">{task.task.title}</h1>

        <Tabs tabs={TABS} setSelected={setSelected}>
          {selected === 0 ? (
            <>
              <div className="w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow-md p-8 overflow-y-auto">
                {/* LEFT */}
                <div className="w-full md:w-1/2 space-y-8">
                  <div className="flex items-center gap-5">
                    <div
                      className={clsx(
                        "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                        PRIOTITYSTYELS[task.task.priority],
                        bgColor[task.task.priority]
                      )}
                    >
                      <span className="text-lg">{ICONS[task.task.priority]}</span>
                      <span className="uppercase">{task.task.priority} Priority</span>
                    </div>

                    <div className={clsx("flex items-center gap-2")}>
                      <div
                        className={clsx(
                          "w-4 h-4 rounded-full",
                          TASK_TYPE[task.task.stage]
                        )}
                      />
                      <span className="text-black uppercase">{task.task.stage}</span>
                    </div>
                  </div>

                  <p className="text-gray-500">
                    Created At: {new Date(task.task.date).toDateString()}
                  </p>

                  <div className="flex items-center gap-8 p-4 border-y border-gray-200">
                    <div className="space-x-2">
                      <span className="font-semibold">Assets :</span>
                      <span>{task.task.assets?.length}</span>
                    </div>

                    <span className="text-gray-400">|</span>

                    <div className="space-x-2">
                      <span className="font-semibold">Sub-Task :</span>
                      <span>{task.task.subTasks?.length}</span>
                    </div>
                  </div>

                  <div className="space-y-4 py-6">
                    <p className="text-gray-600 font-semibold text-sm">TASK TEAM</p>
                    <div className="space-y-3">
                      {task.task.team?.map((m, index) => {
                        const user = users.find((user) => user.id === m.id);
                        return (
                          <div
                            key={index}
                            className="flex gap-4 py-2 items-center border-t border-gray-200"
                          >
                            <div
                              className="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600"
                            >
                              <span className="text-center">
                                {getInitials(user?.name)}
                              </span>
                            </div>

                            <div>
                              <p className="text-lg font-semibold">{user?.name}</p>
                              <span className="text-gray-500">{user?.title}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 py-6">
                    <p className="text-gray-500 font-semibold text-sm">SUB-TASKS</p>
                    <div className="space-y-8">
                      {task.task.subTasks?.map((el, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50-200">
                            <MdTaskAlt className="text-violet-600" size={26} />
                          </div>

                          <div className="space-y-1">
                            <div className="flex gap-2 items-center">
                              <span className="text-sm text-gray-500">
                                {new Date(el.date).toDateString()}
                              </span>

                              <span className="px-2 py-0.5 text-center text-sm rounded-full bg-violet-100 text-violet-700 font-semibold">
                                {el.tag}
                              </span>
                            </div>

                            <p className="text-gray-700">{el.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* RIGHT */}
                <div className="w-full md:w-1/2 space-y-8">
                  <p className="text-lg font-semibold">ASSETS</p>

                  <div className="w-full grid grid-cols-2 gap-4 bg">
                    {task.task.assets?.map((el, index) => (
                     <img
                     key={index}
                     src={`http://localhost:3000/${el}`} // Construct the full URL for the image
                     alt={task.title}
                     className="w-full rounded h-28 md:h-36 2xl:h-52 cursor-pointer transition-all duration-700 hover:scale-125 hover:z-50"
                   />
                   
                    ))}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <Activities activity={task.task.activities} taskId={tid} />
          )}
        </Tabs>
      </div>
    </div>
  );
};

const Activities = ({ activity, taskId, setActivities }) => {
  const [selectedType, setSelectedType] = useState("Started");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();

  const act_types = [
    "Started",
    "Completed",
    "In Progress",
    "Commented",
    "Bug",
    "Assigned",
  ];

  const TASKTYPEICON = {
    commented: (
      <div className='w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white'>
        <MdOutlineMessage />
      </div>
    ),
    started: (
      <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white'>
        <FaThumbsUp size={20} />
      </div>
    ),
    assigned: (
      <div className='w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white'>
        <FaUser size={14} />
      </div>
    ),
    bug: (
      <div className='text-red-600'>
        <FaBug size={24} />
      </div>
    ),
    completed: (
      <div className='w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white'>
        <MdOutlineDoneAll size={24} />
      </div>
    ),
    "in progress": (
      <div className='w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white'>
        <GrInProgress size={16} />
      </div>
    ),
  };

  const handleSubmit = async () => {
    if (!selectedType || !text.trim()) {
      alert("Please select an activity type and provide details.");
      return;
    }

    setIsLoading(true);
    try {
      const activityData = {
        type: selectedType.toLowerCase(),
        activity: text,
      };

      // Post the activity
      const response = await axios.post(
        `http://localhost:3000/postTaskActivity/${id}/${taskId}`,
        activityData
      );

      console.log("Response received:", response); // Log the full response

      // Check if the response status is 200
      if (response.status === 200) {
        alert("Activity posted successfully!");
        window.location.reload();
        // Set the selected tab to Activities (tab index 1)
        setSelected(1); // Switch to the "Activities" tab

        setText(""); // Clear the text field
      } else {
        // If the response doesn't have status 200, show an alert
        alert("Failed to post activity. Status: " + response.status);
      }
    } catch (error) {
      console.error("Error details:", error); // Log the error to the console
    } finally {
      setIsLoading(false);
    }
  };



  const Card = ({ item }) => (
    <div className="flex space-x-4">
      {/* Icon Section */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full">
          {TASKTYPEICON[item?.type]}
        </div>
        {/* Connecting line to the next icon */}
        <div className="w-0.5 bg-gray-300 h-8 mt-2"></div> {/* Vertical line */}
      </div>

      {/* Activity Content */}
      <div className="flex flex-col gap-y-1 mb-8">
        <p className="font-semibold">{item?.by?.name}</p>
        <div className="text-gray-500 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="capitalize">{item?.type}</span>
            <span className="text-sm">{moment(item?.date).fromNow()}</span>
          </div>
        </div>
        <div className="text-gray-700">{item?.activity}</div>
      </div>
    </div>


  );

  return (
    <div className="w-full flex gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto">
      {/* Left Side: Activities List */}
      <div className="w-full md:w-1/2">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">Activities</h4>
        <div className="w-full">
          {activity?.map((el, index) => (
            <Card key={index} item={el} isConnected={index < activity.length - 1} />
          ))}
        </div>
      </div>

      {/* Right Side: Add New Activity */}
      <div className="w-full md:w-1/3">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">Add Activity</h4>
        <div className="w-full flex flex-wrap gap-5">
          {/* Activity Type Selection (Radio Buttons) */}
          {act_types.map((item) => (
            <div key={item} className="flex gap-2 items-center">
              <input
                type="radio"
                className="w-4 h-4"
                checked={selectedType === item}
                onChange={() => setSelectedType(item)}
              />
              <p>{item}</p>
            </div>
          ))}

          {/* Text Area for Description */}
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type ......"
            className="bg-white w-full mt-4 border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500"
          ></textarea>

          {/* Submit Button */}
          {isLoading ? (
            <Loading />
          ) : (
            <Button
              type="button"
              label="Submit"
              onClick={handleSubmit}
              className="bg-blue-600 text-white rounded"
            />
          )}
        </div>
      </div>
    </div>

  );
};

export default Outlet3;
