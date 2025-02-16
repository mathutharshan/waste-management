import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'


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
//localhost:4000/api/admin//add-driver



app.get('/',(req,res)=>{
   res.send('API WORKING')
})

app.listen(port, ()=> console.log("Server Start",port))