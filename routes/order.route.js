import express from 'express'
import { createOrder, getOrders, getOrderById, repeatOrder } from '../controllers/orderController.js'

const orderRouter = express.Router()

orderRouter.post('/create', createOrder)
orderRouter.get('/list', getOrders)
orderRouter.get('/:id', getOrderById)
orderRouter.post('/repeat/:id', repeatOrder)

export default orderRouter
