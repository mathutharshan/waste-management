import React, { useContext, useEffect } from "react";
import { DriverContext } from "../../context/DriverContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const DriverDashboard = () => {
  const { dToken, dashData, setDashData, getDashData, cancelAppointment, completeAppointment } =
    useContext(DriverContext);
  const { currency, slotDateFormat } = useContext(AppContext);
  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);

  return (
    dashData && (
      <div className="m-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.earning_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {currency}
                {dashData.earnings}
              </p>
              <p className="text-gray-400">Earnings</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.appointment_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.appointments}
              </p>
              <p className="text-gray-400">Appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.users_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.users}
              </p>
              <p className="text-gray-400">Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white">
          <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
            <img src={assets.list_icon} alt="" />
            <p className="font-semibold">Latest Booking</p>
          </div>
          <div className="pt-4 border border-top-0">
          {dashData.latestAppointments?.map((item, index) => (
  <div
    className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
    key={index}
  >
    <img
      className="rounded-full w-10"
      src={item.userData?.image || "/default-avatar.png"}
      alt="user"
    />
    <div className="flex-1 text-sm">
      <p className="text-gray-800 font-medium ">
        {item.userData?.name || "Unknown"}
      </p>
      <p className="text-gray-600 ">
        {item.slotDate ? slotDateFormat(item.slotDate) : "N/A"}
      </p>
    </div>
    {item.cancellled ? (
                  <p className='text-red-400 text-xs font-medium'>cancelled</p>
                ) : item.isCompleted ? (
                  <p className="text-green-500 text-xs font-medium">Completed</p>
                ) : (
                  <div className="flex">
                    <img
                      onClick={() => cancelAppointment(item._id)}
                      className="w-10 cursor-pointer"
                      src={assets.cancel_icon}
                      alt=""
                    />
                    <img
                      onClick={() => completeAppointment(item._id)}
                      className="w-10 cursor-pointer"
                      src={assets.tick_icon}
                      alt=""
                    />
                  </div>
                )}
  </div>
))}

          </div>
        </div>
      </div>
    )
  );
};

export default DriverDashboard;
