import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login'
import Dashboard from './pages/Dashboard'
import Team from './pages/Team'
import Tasks from './pages/Tasks';
import Completed from './pages/Completed';
import Inprogress from './pages/InProgress';
import Todos from './pages/Todos';
import Trash from './pages/trash';
import TaskDetails from './pages/TaskDetails';

function App() {

  return (
    <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/dashboard/:id/:role" element={<Dashboard />} />
    <Route path="/users/:id/:role" element={<Team />} />
    <Route path="/tasks/:id/:role" element={<Tasks />} />
    <Route path="/completed/:id/:role/:status" element={<Completed />} />
    <Route path="/inprogress/:id/:role/:status" element={<Inprogress />} />
    <Route path="/todo/:id/:role/:status" element={<Todos />} />
    <Route path="/trash/:id/:role" element={<Trash />} />
    <Route path="/taskdetails/:id/:role/:tid" element={<TaskDetails />} />

  </Routes>
  )
}

export default App
