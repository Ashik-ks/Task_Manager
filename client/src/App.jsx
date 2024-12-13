import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Tasks from './pages/Tasks';
import Completed from './pages/Completed';
import Inprogress from './pages/InProgress';
import Todos from './pages/Todos';
function App() {

  return (
    <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/dashboard/:id/:role" element={<Dashboard />} />
    <Route path="/users/:id/:role" element={<Users />} />
    <Route path="/tasks/:id/:role" element={<Tasks />} />
    <Route path="/completed/:id/:role/:status" element={<Completed />} />
    <Route path="/inprogress/:id/:role/:status" element={<Inprogress />} />
    <Route path="/todo/:id/:role/:status" element={<Todos />} />

  </Routes>
  )
}

export default App
