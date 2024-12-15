import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useParams } from 'react-router-dom';
import { MdAdminPanelSettings, MdEdit, MdKeyboardDoubleArrowUp, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import { FaArrowsToDot } from 'react-icons/fa6';
import { FaNewspaper } from 'react-icons/fa';  // Icon for TOTAL TASK
import clsx from 'clsx';
import moment from 'moment';
import { PRIOTITYSTYELS, TASK_TYPE, BGS } from "../utils";

const Outlet = () => {
  const [tasks, setTasks] = useState([]);
  const [totalTaskCount, setTotalTaskCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [totals, setTotals] = useState({ completed: 0, "in progress": 0, todo: 0 });
  const { id } = useParams();

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/gettasks');
      const taskData = response.data.tasks;
      console.log("all tasks : ",taskData)
      setTasks(taskData);
      setTotalTaskCount(taskData.length)

      // Grouping tasks by priority
      const priorityCounts = taskData.reduce((acc, task) => {
        acc[task.priority] = acc[task.priority] ? acc[task.priority] + 1 : 1;
        return acc;
      }, {});

      // Structure the chart data
      const taskPriorityData = [
        { name: 'Low', total: priorityCounts['low'] || 0 },
        { name: 'Medium', total: priorityCounts['medium'] || 0 },
        { name: 'High', total: priorityCounts['high'] || 0 }
      ];
      setChartData(taskPriorityData);

      // Set totals for tasks
      const completed = taskData.filter(task => task.stage === 'completed').length;
      const inProgress = taskData.filter(task => task.stage === 'in progress').length;
      const todo = taskData.filter(task => task.stage === 'todo').length;
      setTotals({ completed, "in progress": inProgress, todo });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Fetch the last 5 tasks
  const fetchLast5Tasks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/gettasks', {
        params: { limit: 5 },
      });
      setTasks(response.data.tasks.slice(0, 5)); // Ensure only the last 5 tasks are shown
    } catch (error) {
      console.error('Error fetching last 5 tasks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Force id to null in the API request
      const url = `http://localhost:3000/getuser/${null}`;
      const response = await axios.get(url);
      setUsers(Array.isArray(response.data) ? response.data : [response.data]);
      console.log("response:", response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchLast5Tasks();
    fetchUsers();
  }, [id]);

  const stats = [
    {
      _id: "1",
      label: "TOTAL TASK",
      total: totalTaskCount || 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8]",
    },
    {
      _id: "2",
      label: "COMPLETED TASK",
      total: totals["completed"] || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
    },
    {
      _id: "3",
      label: "TASK IN PROGRESS",
      total: totals["in progress"] || 0,
      icon: <MdEdit />,
      bg: "bg-[#f59e0b]",
    },
    {
      _id: "4",
      label: "TODOS",
      total: totals["todo"] || 0,
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]",
    }
  ];

  // Icons for priorities
  const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
  };

  // Task Table Row
  const TableRow = ({ task }) => (
    <tr className="border-b border-gray-300 text-gray-600 hover:bg-gray-300/10">
      <td className="py-3 text-sm md:text-base">
        <div className="flex items-center gap-2">
          <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
          <p className="text-base text-black">{task.title}</p>
        </div>
      </td>
      <td className="py-3 text-sm md:text-base">
        <div className="flex gap-1 items-center">
          <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
            {ICONS[task.priority]}
          </span>
          <span className="capitalize">{task.priority}</span>
        </div>
      </td>
      <td className="py-3 text-sm md:text-base">
        <div className="flex">
          {task.team.map((m, index) => (
            <div
              key={index}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS.length]
              )}
            >
              {/* Generate initials based on first letters of each name part */}
              <span>
                {m.name
                  ?.split(" ") // Split name into parts
                  .map((part) => part[0]?.toUpperCase()) // Take the first letter of each part
                  .join("")} {/* Join the initials */}
              </span>
            </div>
          ))}
        </div>
      </td>
      <td className="py-3 text-sm md:text-base hidden md:block">
        <span className="text-base text-gray-600">
          {moment(task?.date).fromNow()}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="container mx-auto p-4">
      {/* Statistics Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat._id}
            className="bg-white text-black rounded-lg p-5 flex items-center justify-between w-full shadow-md"
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-800">{stat.label}</p>
              <p className="text-2xl text-gray-900">{stat.total}</p>
            </div>

            <div
              className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center text-white",
                {
                  "bg-blue-500": stat.bg === "bg-[#1d4ed8]", // Blue for Total Task
                  "bg-green-500": stat.bg === "bg-[#0f766e]", // Green for Completed Task
                  "bg-orange-500": stat.bg === "bg-[#f59e0b]", // Orange for In Progress
                  "bg-red-500": stat.bg === "bg-[#be185d]" // Red for Todo
                }
              )}
            >
              {/* Icon with white color */}
              {stat.icon}
            </div>
          </div>
        ))}
      </div>


      {/* Chart Section */}
      <div className="w-full shadow-md bg-white mb-10 rounded-lg p-5 mt-10"> {/* Added mt-10 for space */}
        <span className="text-center text-lg md:text-xl font-semibold mb-6 block">Task by Priority</span>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Task and User Tables Section */}
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Task Table Section */}
        <div className="w-full md:w-2/3 bg-white px-4 py-4 shadow-md rounded-lg">
          <table className="w-full">
            <thead className="border-b border-gray-300">
              <tr className="text-black text-left">
                <th className="py-3 text-sm md:text-base">Task Title</th>
                <th className="py-3 text-sm md:text-base">Priority</th>
                <th className="py-3 text-sm md:text-base">Team</th>
                <th className="py-3 text-sm md:text-base hidden md:block">Created At</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, id) => (
                <TableRow key={id} task={task} />
              ))}
            </tbody>
          </table>
        </div>

        {/* User Table Section */}
        <div className="w-full md:w-1/3 bg-white px-4 py-4 shadow-md rounded-lg">
          <table className="w-full mb-5">
            <thead className="border-b border-gray-300">
              <tr className="text-black text-left">
                <th className="py-3 text-sm md:text-base">Full Name</th>
                <th className="py-3 text-sm md:text-base">Status</th>
                <th className="py-3 text-xs md:text-base">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index + user?._id} className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
                  <td className="py-3 text-sm md:text-base">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700">
                        <span className="text-center">{user?.name?.[0]}</span> {/* Initials */}
                      </div>
                      <div>
                        <p>{user.name}</p>
                        <span className="text-xs text-black">{user?.title}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p
                      className={clsx(
                        'w-fit px-3 py-1 rounded-full text-sm',
                        user?.isActive ? 'bg-blue-200' : 'bg-yellow-100'
                      )}
                    >
                      {user?.isActive ? 'Active' : 'Disabled'}
                    </p>
                  </td>
                  <td className="py-3 text-sm md:text-base">{moment(user?.createdAt).fromNow()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Outlet;
