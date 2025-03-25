import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import driverModel from '../models/driverModel.js'
import appointmentModel from '../models/appoinmentModel.js'



//API to register to user
const registerUser = async (req,res) =>{
    try {
        const { name, email, password, phone } = req.body

        if (!name || !password || !email || !phone) {
            return res.json({success:false,message:"Missing Details"})
        }
        //valid email
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"enter the valid email Details"})
        }
       //valid password
        if (password.length < 8) {
            return res.json({success:false,message:"enter the strong password"})
        }
        //hashing user password 
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData ={
            name,
            email,
            password : hashedPassword,
            phone

        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)

        res.json({success:true,token})
        



    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
        
    }
}

//API for user login
const loginUser = async (req,res) =>{
    try {
        const {email,password} = req.body
        const user = await userModel.findOne({email})

        if (!user) {
            return res.json({ success: false, message:'User does not exist' });
        }
        
        const isMatch = await bcrypt.compare(password,user.password)

        if (isMatch) {
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
            res.json({success:true,token})
        }else{
            res.json({success:false,message:"Inavalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get user profile data
const getProfile = async (req,res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true,userData})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to update user profile
const updateProfile = async (req,res) => {
    try {
        const {userId, name, phone, address, dob, gender} = req.body
        const imageFile = req.imageFile

        if (!name || !phone || !dob || !gender) {
            return res.json({success:false,message:"Data Missing"})
        }
        await userModel.findByIdAndUpdate(userId, {
            name,
            phone,
            address: JSON.parse(address),
            dob,
            gender
          });
          

        if (imageFile){
            //upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }

        res.json({success:true,message:"Profile Updated"})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//API to book appoinment 
const bookAppointment = async (req,res) => {
    try {
        const {userId, docId, slotDate, slotTime} = req.body
        const docData = await driverModel.findById(docId).select('-password')

        if(!docData.available){
            return res.json({success:false,message:'Driver not available'})
        }
        let slots_booked = docData.slots_booked

        //checking for slot availability
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({success:false,message:'slot not available'})
            }else{
                slots_booked[slotDate].push(slotTime)
            }
        }else{
            slots_booked[slotDate] =[]
            slots_booked[slotDate].push(slotTime)

        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slot_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            date:Date.now()

        }
        const newAppointment = new appointmentModel(appointmentData )
        await newAppointment.save()

        // save new slots data in docdata
        await driverModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:'Appointment booked'})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
export {registerUser, loginUser, getProfile, updateProfile, bookAppointment }