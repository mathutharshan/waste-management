import express from 'express'
import { driverList } from '../controllers/driverController.js'

const driverRouter = express.Router()

driverRouter.get('/list',driverList)

export default driverRouter