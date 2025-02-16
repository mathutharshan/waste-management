import express from "express";
import upload from "../middlewares/multer.js";
import { addDriver, loginAdmin } from "../controllers/adminController.js";
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/add-driver",authAdmin, upload.single("image"), addDriver);
adminRouter.post('/login',loginAdmin)

export default adminRouter;
