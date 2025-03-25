import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";


export const AdminContext = createContext()



const AdminContextProvider = (props) => {

    const [aToken,setAToken] = useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'):'')
    const [drivers,setDrivers] = useState([])

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const getAllDrivers = async () => {
        try {
          const { data } = await axios.post(backendUrl + '/api/admin/all-drivers', {}, {
            headers: {
              Authorization: `Bearer ${aToken}`
            }
          });
      
          if (data.success) {
            setDrivers(data.drivers);
            console.log(data.drivers);
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          toast.error(error.response?.data?.message || error.message);
        }
      };
      
      const changeAvailability = async (docId) => {
        try {
          // Optimistically update
          setDrivers((prev) =>
            prev.map((driver) =>
              driver._id === docId ? { ...driver, available: !driver.available } : driver
            )
          );
      
          const { data } = await axios.post(
            backendUrl + "/api/admin/change-availability",
            { docId },
            {
              headers: {
                Authorization: `Bearer ${aToken}`,
              },
            }
          );
      
          if (data.success) {
            toast.success(data.message);
          } else {
            toast.error(data.message);
            // Optional: rollback if failed
            getAllDrivers();
          }
        } catch (error) {
          toast.error(error.message);
          getAllDrivers(); // rollback on error
        }
      };
      

    const value ={
        aToken,setAToken,
        backendUrl,drivers,
        getAllDrivers, changeAvailability,

    }
    return(
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider