import {logger} from '../../services/logger.service.js'
// import {socketService} from '../../services/socket.service.js'
import {userService} from '../user/user.service.js'
import {authService} from '../auth/auth.service.js'
import {orderService} from './order.service.js'
import { gigService } from '../gig/gig.service.js'
import { dbService } from '../../services/db.service.js'

export async function getOrders(req, res) {
    try {
        const orders = await orderService.query(req.query)
        res.send(orders)
    } catch (err) {
        logger.error('Cannot get orders', err)
        res.status(400).send({ err: 'Failed to get orders' })
    }
}
export async function getOrderById(req, res) {
    try {
        const orderId = req.params.id
        const order = await orderService.getById(orderId)
        res.json(order)
    } catch (err) {
        logger.error('Failed to get order', err)
        res.status(500).send({ err: 'Failed to get order' })
    }
}

export async function deleteOrder(req, res) {
    try {
        const deletedCount = await orderService.remove(req.params.id)
        if (deletedCount === 1) {
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove order' })
        }
    } catch (err) {
        logger.error('Failed to delete order', err)
        res.status(400).send({ err: 'Failed to delete order' })
    }
}
export async function addOrder(req, res) {
    // const { loggedinUser } = req

    try {
        const order = req.body
        const addedOrder = await orderService.add(order)

        res.json(addedOrder)
    } catch (err) {
        logger.error('Failed to add order', err)
        res.status(500).send({ err: 'Failed to add order' })
    }
}
export async function updateOrder(req, res) {
    try {

      const order = req.body;
      const updatedOrder = await updateStatus(order._id, order.status);
      res.json(updatedOrder);
    } catch (err) {
      logger.error('Failed to update order', err);
      res.status(500).send({ err: 'Failed to update order' });
    }
  }
export async function updateStatus(orderId, newStatus) {
    try {
      // Retrieve the existing order from the database using the order ID
      const existingOrder = await orderService.getById(orderId);
  
      if (!existingOrder) {
        // If the order doesn't exist, throw an error
        throw new Error(`Order with ID ${orderId} not found.`);
      }
  
      // Update the "status" property of the existing order
      existingOrder.status = newStatus;
  
      // Save the updated order back to the database
      const updatedOrder = await updateOrderStatus(existingOrder);
  
      // Return the updated order
      return updatedOrder;
    } catch (error) {
      // Handle any errors that may occur during the update process
      throw error;
    }
  }
  export async function updateOrderStatus(order) {
    try {
      const orderToSave = {
        _id: order._id,
        status: order.status,
        // Add other properties you want to update
      };
  
      const collection = await dbService.getCollection('order'); // Use 'order' or your correct collection name
      await collection.updateOne({ _id: order._id }, { $set: orderToSave });
      return orderToSave;
    } catch (err) {
      logger.error(`Failed to update order ${order._id}`, err);
      throw err;
    }
  }
  

// export async function addOrder(req, res) {
    
//     var {loggedinUser} = req
 
//     try {
//         var order = req.body
//         console.log('order4', order)
//         order.byUserId = loggedinUser._id
//         order = await orderService.add(order)
        
//         // prepare the updated order for sending out
//         order.aboutGig = await gigService.getById(order.aboutGigId)
//         console.log('hellow', order)
        
//         // Give the user credit for adding a order
//         // var user = await userService.getById(order.byUserId)
//         // user.score += 10
//         loggedinUser.score += 10

//         loggedinUser = await userService.update(loggedinUser)
//         order.byUser = loggedinUser

//         // User info is saved also in the login-token, update it
//         const loginToken = authService.getLoginToken(loggedinUser)
//         res.cookie('loginToken', loginToken)

//         delete order.aboutGigId
//         delete order.byUserId

//         // socketService.broadcast({type: 'order-added', data: order, userId: loggedinUser._id})
//         // socketService.emitToUser({type: 'order-about-you', data: order, userId: order.aboutUser._id})
        
//         // const fullUser = await userService.getById(loggedinUser._id)
//         // socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

//         res.send(order)

//     } catch (err) {
//         logger.error('Failed to add order', err)
//         res.status(400).send({ err: 'Failed to add order' })
//     }
// }

