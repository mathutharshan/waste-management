import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import driverRouter from './routes/driverRoute.js'
import userRouter from './routes/userRoute.js'


dotenv.config();
//app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

//middlewares 
app.use(express.json())
app.use(cors())

//api endpoint
app.use('/api/admin',adminRouter)
app.use('/api/driver',driverRouter)
app.use('/api/user',userRouter)




app.get('/',(req,res)=>{
   res.send('API WORKING')
})

app.listen(port, ()=> console.log("Server Start",port))