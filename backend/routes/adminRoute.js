import express from "express";
import upload from "../middlewares/multer.js";
import { addDriver, allDrivers, loginAdmin, appointmentsAdmin, appointmentCancel, adminDashboard } from "../controllers/adminController.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/driverController.js";

const adminRouter = express.Router();

adminRouter.post("/add-driver",authAdmin, upload.single("image"), addDriver);
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-drivers',authAdmin,allDrivers)
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.get('/appointments', authAdmin, appointmentsAdmin)
adminRouter.post('/cancel-appointment', authAdmin,appointmentCancel)
adminRouter.get('/dashboard',authAdmin,adminDashboard)




export default adminRouter;
