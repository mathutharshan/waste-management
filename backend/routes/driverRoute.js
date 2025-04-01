import express from 'express'
import { driverList, loginDriver, appointmentsDriver, appointmentCancel,appointmentComplete, driverDashboard, driverProfile, updateDriverProfile } from '../controllers/driverController.js'
import authDriver from '../middlewares/authDriver.js'

const driverRouter = express.Router()

driverRouter.get('/list',driverList)
driverRouter.post('/login',loginDriver)
driverRouter.get('/appointments',authDriver,appointmentsDriver)
driverRouter.post('/complete-appointment', authDriver, appointmentComplete)
driverRouter.post('/cancel-appointment', authDriver, appointmentCancel)
driverRouter.get('/dashboard', authDriver, driverDashboard)
driverRouter.get('/profile', authDriver, driverProfile)
driverRouter.post('/update-profile',authDriver,updateDriverProfile)

export default driverRouter