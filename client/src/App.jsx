import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'


function App() {

  return (
    <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/dashboard/:id/:role" element={<Dashboard />} />
    <Route path="/users/:id/:role" element={<Users />} />
  </Routes>
  )
}

export default App
