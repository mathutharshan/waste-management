import React from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import { useContext } from 'react'
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Routes, Route} from 'react-router-dom'
import Dashboard from './pages/Admin/Dashboard';
import AllReports from './pages/Admin/AllReports';
import AddDriver from './pages/Admin/AddDriver';
import DriverList from './pages/Admin/DriverList';
import { DriverContext } from './context/DriverContext';
import DriverDashboard from './pages/Driver/DriverDashboard'
import DriverAppointments from './pages/Driver/DriverAppointments';
import DriverProfile from './pages/Driver/DriverProfile';

const App = () => {

  const {aToken} = useContext(AdminContext)
  const {dToken} = useContext(DriverContext)

  return aToken || dToken ? (
    <div className='bg-[#F8F9FD]'>
    <ToastContainer/>
    <Navbar/>
    <div className='flex items-start'>
      <Sidebar/>
      <Routes>
        {/* Admin Route*/}
        <Route path='/' element={<></>}/>
        <Route path='/admin-dashboard' element={<Dashboard/>}/>
        <Route path='/all-reports' element={<AllReports/>}/>
        <Route path='/add-driver' element={<AddDriver/>}/>
        <Route path='/driver-list' element={<DriverList/>}/>

         {/* Driver Route*/}
        <Route path='/driver-dashboard' element={<DriverDashboard/>}/>
        <Route path='/driver-appointments' element={<DriverAppointments/>}/>
        <Route path='/driver-profile' element={<DriverProfile/>}/>
      </Routes>
    </div>
    </div>
  ) : (
    <>
     <Login />
     <ToastContainer/>
    </>
  )
}

export default App
