import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import {addOrder, getOrders, deleteOrder, updateOrder, getOrderById} from './order.controller.js'
const router = express.Router()

router.get('/', log, getOrders)
router.get('/:id', log, getOrderById)
router.post('/',  log, requireAuth, addOrder)
router.put('/',  log, requireAuth, updateOrder)
router.delete('/:id',  requireAuth, deleteOrder)

export const orderRoutes = router