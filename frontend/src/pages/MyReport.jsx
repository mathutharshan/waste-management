import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import {useNavigate} from 'react-router-dom'
const MyReport = () => {
  const { backendUrl, token } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const months = ["","Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]



  const slotDateFormat = (slotDate) => {
const dateArray = slotDate.split('_')
return dateArray[0]+ " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }
  const navigate = useNavigate()
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/my-appointments`,
        
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (data.success) {
        setAppointments(data.appointments.reverse())
        console.log(data.appointments);
        
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load appointments")
    }
  }

  const cancelAppointment = async (appointmentId) =>{
    try {
      const {data} = await axios.post(backendUrl + '/api/user/cancel-appointment', {appointmentId},{headers: {
        Authorization: `Bearer ${token}`
      }})
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
      }else{
        toast.error(data.message)
      }
      
    } catch (error) {
      console.error(error)
      toast.error("Failed to load appointments")
    }
  }

  /*const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_STRIPE_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name:'Appointment Payment',
      description:'Appointment Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async(response) => {
        console.log(response);
        try {
          const {data} = await axios.post(backendUrl+'/api/user/verifyStripe',response,{headers: {
            Authorization: `Bearer ${token}`
          }})
          if (data.success) {
            getUserAppointments()
            navigate('/my-report')
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message)
          
        }
      }
    }
    const rzp = new window.Stripe(options)
    rzp.open()
  }*/
  const appointmentStripe = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-stripe`,
        { appointmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      if (data.success) {
        // ✅ Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment error");
    }
  };
  
  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])
    
    

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Reports</p>
      <div>
        {appointments.map((item, index) => (
          <div
            className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b'
            key={index}
          >
            <div>
              <img
                className='w-32 bg-indigo-50'
                src={item.docData.image || '/default-avatar.png'}
                alt='driver'
              />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-xs mt-1'>
                <span className='text-sm text-neutral-700 font-medium'>
                  Date & Time:
                </span> 
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              {!item.cancelled && item.payment && <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>Paid</button>}
              {!item.cancelled && !item.payment && <button onClick={()=>appointmentStripe(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300'>
                Pay Online
              </button> }
              {!item.cancelled && <button onClick={()=>cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300'>
                Cancel Appointment
              </button>}
              {item.cancelled && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appintment Cancelled</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyReport
