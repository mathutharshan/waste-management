import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import driverModel from '../models/driverModel.js'
import appointmentModel from '../models/appoinmentModel.js'
import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config()

// API to register user
const registerUser = async (req,res) =>{
    try {
        const { name, email, password, phone } = req.body

        if (!name || !password || !email || !phone) {
            return res.json({success:false,message:"Missing Details"})
        }
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Enter a valid email"})
        }
        if (password.length < 8) {
            return res.json({success:false,message:"Password must be at least 8 characters"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = { name, email, password: hashedPassword, phone }
        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
        res.json({success:true,token})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for user login
const loginUser = async (req,res) =>{
    try {
        const {email,password} = req.body
        const user = await userModel.findOne({email})
        if (!user) return res.json({ success: false, message:'User does not exist' })

        const isMatch = await bcrypt.compare(password,user.password)
        if (isMatch) {
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile
const getProfile = async (req,res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')
        res.json({success:true,userData})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update profile
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
        })

        if (imageFile){
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL = imageUpload.secure_url
            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }

        res.json({success:true,message:"Profile Updated"})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment
const bookAppointment = async (req,res) => {
    try {
        const {userId, docId, slotDate, slotTime} = req.body
        const docData = await driverModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({success:false,message:'Driver not available'})
        }

        let slots_booked = docData.slots_booked || {}

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({success:false,message:'Slot not available'})
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = [slotTime]
        }

        const userData = await userModel.findById(userId).select('-password')

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()
        await driverModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:'Appointment booked'})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to list user appointments
const listAppointment = async (req,res) => {
    try {
        const {userId} = req.body
        const appointments = await appointmentModel.find({userId})
        res.json({success:true,appointments})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//  FIXED: cancelAppointment 
const cancelAppointment = async (req,res) => {
    try {
        const {userId, appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({success:false,message:'Appointment not found'})
        }

        if (appointmentData.userId.toString() !== userId.toString()) {
            return res.json({success:false,message:'Unauthorized action'})
        }

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
const stripeInstance = new Stripe(process.env.STRIPE_KEY_SECRET, {
    apiVersion: '2023-10-16' 
  })
  

// Replace paymentStripe function with this
const paymentStripe = async (req, res) => {
    try {
      const { appointmentId } = req.body;
      const appointmentData = await appointmentModel.findById(appointmentId).populate('docId');
  
      if (!appointmentData || appointmentData.cancelled) {
        return res.json({ success: false, message: "Appointment not found or cancelled" });
      }
  
      const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Driver Appointment',
                description: `${appointmentData.docId.name} - ${appointmentData.slotDate} at ${appointmentData.slotTime}`,
              },
              unit_amount: appointmentData.amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:5173/my-report?success=true',
        cancel_url: 'http://localhost:5173/my-report?canceled=true',
      });
  
      res.json({ success: true, url: session.url });
    } catch (error) {
      console.error("Stripe error:", error);
      res.json({ success: false, message: error.message });
    }
  };
  

//API to verify payment of stripe
const verifyStripe = async (req,res) => {
    try {
        const {stripe_order_id} = req.body
        const orderInfo = await stripeInstance.orders.fetch(stripe_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
            res.json({success:true,message:"Payment Successful"})
        } else{
            res.json({success:false,message:"Payment failed"})
        }
        
    } catch (error) {
        console.error(error);
    res.json({ success: false, message: error.message });
    }
}  
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      event = stripeInstance.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;
  
      if (appointmentId) {
        await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
      }
    }
  
    res.status(200).json({ received: true });
  };
export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentStripe,
    verifyStripe,
    
}
