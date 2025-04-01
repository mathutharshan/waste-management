import validator from "validator"
import bcrypt from "bcrypt"
import {v2 as cloudinary} from "cloudinary"
import driverModel from "../models/driverModel.js"
import multer from 'multer';
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appoinmentModel.js";
import userModel from "../models/userModel.js";




//API for adding driver
const addDriver = async (req, res) => {
    try {
        const { name, email, password, speciality, experience, about, fees, address, available } = req.body;
        const imageFile = req.file;

        console.log("Received Data:", { name, email, password, speciality, experience, about, fees, address, available }, imageFile);

        if (!name || !email || !password || !speciality || !experience || !about || !fees || !address || !available === undefined) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Enter Valid Email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Enter Strong Password (min 8 characters)" });
        }

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Image file is required" });
        }
         
          // Convert available to Boolean (Postman sends it as a string)
        const isAvailable = available === "true"; 

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        let parsedAddress;
        try {
            parsedAddress = JSON.parse(address);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid address format" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const driverData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            experience,
            about,
            fees,
            address: parsedAddress,
            available: isAvailable,
            date: Date.now(),
        };

        const newDriver = new driverModel(driverData);
        await newDriver.save();

        res.status(201).json({ success: true, message: "Driver Added Successfully", driver: newDriver });

    } catch (error) {
        console.error("Error in addDriver API:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

//api for admin login
const loginAdmin = async (req,res) =>{
    try {
        const {email,password} = req.body 
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
            return res.json({success:true,token})
        } else {
            return res.json({success:false,message:"Invalid email or password"})
        }   
    } catch (error) {
        console.error("Error in addDriver API:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

//API to get all driver list
const allDrivers = async (req,res) =>{
    try {
         
        const drivers = await driverModel.find({}).select('-password')
        res.json({success:true,drivers})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
        
    }
}

//API to get all appointment list
const appointmentsAdmin = async (req,res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({success:true,appointments})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}
//API for appointment cancel
const appointmentCancel = async (req,res) => {
    try {
        const { appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true})

        const {docId, slotDate, slotTime} = appointmentData
        const driverdata = await driverModel.findById(docId)
        let slots_booked = driverdata.slots_booked || {}

        if (!slots_booked[slotDate]) {
            return res.json({ success: false, message: `No slots found for ${slotDate}` })
        }

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
        if (slots_booked[slotDate].length === 0) {
            delete slots_booked[slotDate]
        }

        await driverModel.findByIdAndUpdate(docId, {slots_booked})

        res.json({success:true, message:'Appointment cancelled'})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//API to get dashboard data for admin panel
const adminDashboard = async (req,res) => {
    try {
        const drivers = await driverModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            drivers : drivers.length,
            appointments: appointments.length,
            users: users.length,
            latestAppointments:appointments.reverse().slice(0,5)
        }
        res.json({success:true,dashData})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export { addDriver,loginAdmin,allDrivers, appointmentsAdmin, appointmentCancel, adminDashboard };
