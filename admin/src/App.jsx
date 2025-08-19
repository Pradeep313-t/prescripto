import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllApointments from './pages/Admin/AllApointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';

/*
  Why are all four routes not displayed?
  --------------------------------------
  In a React Router setup, only the component for the *current* route is rendered.
  The <Routes> component matches the current URL to a <Route> and renders its element.
  So, you will only see one of the route components (Dashboard, AllApointments, AddDoctor, DoctorsList) at a time,
  depending on the URL in the browser. If you want to see all four at once, you would need to render them directly,
  not via <Routes>/<Route>.

  If you want to navigate between them, use <Link> or <NavLink> to change the route.
  If you want to see all four at once for testing, you could temporarily render them all below.
*/

const App = () => {
  const { aToken } = useContext(AdminContext)

  return aToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<Navigate to="/admin-dashboard" replace />} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllApointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctors-list' element={<DoctorsList />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App