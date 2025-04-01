import React from 'react'
import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DriverContext } from '../context/DriverContext'

const Sidebar = () => {

        const {aToken} = useContext(AdminContext)
        const {dToken} = useContext(DriverContext)

  return (
    <div className='min-h-screen bg-white border-r'>
        {
            aToken && <ul className='text-teal-800 mt-5'>
                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-primary' : ''}`} to={'/admin-dashboard'}>
                    <img src={assets.home_icon} alt="" />
                    <p>Dashboard</p>
                </NavLink>
                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-primary' : ''}`} to={'/all-reports'}>
                    <img src={assets.appointment_icon} alt="" />
                    <p>Reports</p>
                </NavLink>
                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-primary' : ''}`} to={'/add-driver'}>
                    <img src={assets.add_icon} alt="" />
                    <p>Add Driver</p>
                </NavLink>
                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-primary' : ''}`} to={'/driver-list'}>
                    <img src={assets.people_icon} alt="" />
                    <p>Driver List</p>
                </NavLink>
            </ul>
        }
         {
            dToken && <ul className='text-teal-800 mt-5'>
                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-primary' : ''}`} to={'/driver-dashboard'}>
                    <img src={assets.home_icon} alt="" />
                    <p>Dashboard</p>
                </NavLink>
                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-primary' : ''}`} to={'/driver-appointments'}>
                    <img src={assets.appointment_icon} alt="" />
                    <p>Reports</p>
                </NavLink>
                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-primary' : ''}`} to={'/driver-profile'}>
                    <img src={assets.people_icon} alt="" />
                    <p>Profile</p>
                </NavLink>
            </ul>
        }
      
    </div>
  )
}

export default Sidebar
