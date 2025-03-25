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

const App = () => {

  const {aToken} = useContext(AdminContext)

  return aToken ? (
    <div className='bg-[#F8F9FD]'>
    <ToastContainer/>
    <Navbar/>
    <div className='flex items-start'>
      <Sidebar/>
      <Routes>
        <Route path='/' element={<></>}/>
        <Route path='/admin-dashboard' element={<Dashboard/>}/>
        <Route path='/all-reports' element={<AllReports/>}/>
        <Route path='/add-driver' element={<AddDriver/>}/>
        <Route path='/driver-list' element={<DriverList/>}/>
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
