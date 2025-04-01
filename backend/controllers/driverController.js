import driverModel from "../models/driverModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appoinmentModel.js";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await driverModel.findById(docId);

    if (!docData) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    await driverModel.findByIdAndUpdate(docId, { available: !docData.available });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log("Error changing availability:", error);
    res.json({ success: false, message: error.message });
  }
};

const driverList = async (req,res)=>{
    try {
        const drivers = await driverModel.find({}).select(['-password','-email'])
        res.json({success:true,drivers})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//Doctor login
const loginDriver = async (req,res) => {
  try {
    const {email, password} = req.body
    const driver = await driverModel.findOne({email})
    if (!driver) {
      return res.json({success:false,message:'Invalid credential'})
    }
    const isMatch = await bcrypt.compare(password, driver.password)

    if (isMatch) {
      const token = jwt.sign({id:driver._id},process.env.JWT_SECRET)
      res.json({success:true,token})
    }else{
      res.json({success:false,message:'Invalid credentials'})
    }

  } catch (error) {
    console.log(error);
        res.json({ success: false, message: error.message });
  }
}

//API to get driver appointments for driver panel
const appointmentsDriver = async (req,res) => {
  try {
    const {docId} =req.body
    const appointments = await appointmentModel.find({docId})

    res.json({success:true, appointments})

  } catch (error) {
    console.log(error);
        res.json({ success: false, message: error.message });
  }
}


//API to mark appointment completed fot driverpanel
const appointmentComplete = async (req,res) => {
  try {
    const {docId, appointmentId} = req.body

    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted: true})
      return res.json({success:true,message:'Appointment Completed'})
    } else{
      return res.json({success:false,message:'Mark failed'})
    }

  } catch (error) {
    console.log(error);
        res.json({ success: false, message: error.message });
  }
}
//API to cancel appointment completed fot driverpanel
const appointmentCancel = async (req,res) => {
  try {
    const {docId, appointmentId} = req.body

    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true})
      return res.json({success:true,message:'Appoinment Cancelled'})
    } else{
      return res.json({success:false,message:'cancel failed'})
    }

  } catch (error) {
    console.log(error);
        res.json({ success: false, message: error.message });
  }
}

//API to get dashboard data for driver panel
const driverDashboard = async (req,res) => {
  try {
    const {docId} = req.body
    const appointments = await appointmentModel.find({docId})

    let earnings = 0

    appointments.map((item)=>{
      if (item.isCompleted || item.payment) {
        earnings += item.amount
      }
    })

    let users = []
    appointments.map((item)=> {
      if (!users.includes(item.userId)) {
        users.push(item.userId)
      }
    })

    const dashData = {
      earnings,
      appointments: appointments.length,
      users : users.length,
      latestAppoinments: appointments.reverse().slice(0,5)
    }

    res.json({success:true, dashData})


  } catch (error) {
    console.log(error);
        res.json({ success: false, message: error.message });
  }
}

//API to get driver profile for driver panel
const driverProfile = async (req,res) => {
  try {
    const {docId} = req.body
    const profiledata = await driverModel.findById(docId).select('-password')

    res.json({ success: true, profileData: profiledata }) // ✅ correct key name

  } catch (error){
    console.log(error);
        res.json({ success: false, message: error.message });
        
  }
  }

  //APi to update driver profile data from driver panel
  const updateDriverProfile = async (req,res) => {
    try {
      const {docId, fees, address, available} = req.body

      await driverModel.findByIdAndUpdate(docId, {fees, address, available})
      res.json({success:true, message:'Profile updated'})
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  }


export { changeAvailability, 
  driverList, loginDriver, 
  appointmentsDriver, appointmentCancel, 
  appointmentComplete, driverDashboard,
  driverProfile, updateDriverProfile
};
