import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

async function query(user = {}) {
    try {
        const collection = await dbService.getCollection('order')
        let orders = await collection.find({}).toArray()
        if (user.buyerId) {
            orders = orders.filter((order) => order.buyer._id === user.buyerId);
        }
        if (user.sellerId) {
            orders = orders.filter((order) => order.seller._id === user.sellerId);
        }
        return orders
    }catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
    

    // }
    // try {
    //     const criteria = _buildCriteria(user)
    //     console.log('criteria:', criteria)
    //     const collection = await dbService.getCollection('order')
    //     // const orders = await collection.find(criteria).toArray()
    //     var orders = await collection.aggregate([
    //         {
    //             $match: criteria
    //         },
    //         {
    //             $lookup: {
    //                 localField: 'buyerId',
    //                 from: 'users',
    //                 foreignField: '_id',
    //                 as: 'buyer'
    //             }
    //         },
    //         {
    //             $unwind: '$buyer'
    //         },
    //         {
    //             $lookup: {
    //                 localField: 'sellerId',
    //                 from: 'users',
    //                 foreignField: '_id',
    //                 as: 'seller'
    //             }
    //         },
    //         {
    //             $unwind: '$seller'
    //         },
    //         {
    //             $lookup: {
    //                 localField: 'aboutGigId',
    //                 from: 'gigs',
    //                 foreignField: '_id',
    //                 as: 'aboutGig'
    //             }
    //         },
    //         {
    //             $unwind: '$aboutGig'
    //         }
    //     ]).toArray()
    //     orders = orders.map(order => {
    //         order.buyerId = {_id:buyerId._id,username: order.buyerId.username };
    //         order.sellerId = { _id: order.sellerId._id, username: order.sellerId.username };
    //         order.aboutGigId = { description: order.gig.title, ordered:order.createdAt,price:gig.price,status:order.status};
    //         // delete order.byUserId
    //         // delete order.aboutGigId
    //         console.log('order2:', order)
    //         return order
    //     })

    //     console.log('orders:', orders)
    //     return orders
    // } catch (err) {
    //     logger.error('cannot find orders', err)
    //     throw err
    // }

}


async function remove(orderId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('order')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(orderId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}


// async function add(order) {
//     try {
//         const orderToAdd = {
//             sellerId: ObjectId(order.seller._id),
//             buyerId: ObjectId(order.buyer._id),
//             aboutGigId: ObjectId(order.gig._id),
//             // txt: order.txt
//         }
//         const collection = await dbService.getCollection('order')
//         await collection.insertOne(orderToAdd)
//         console.log('orderToAdd4', orderToAdd)
//         return orderToAdd
//     } catch (err) {
//         logger.error('cannot insert order', err)
//         throw err
//     }
// }
async function add(order) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.insertOne(order)
        return order
    } catch (err) {
        logger.error('cannot insert gig', err)
        throw err
    }
}

function _buildCriteria(user) {
    const criteria = {}
    if (user.buyerId) {
        criteria.buyer = ObjectId(user.buyerId)
    }
    if (user.sellerId) {
        criteria.seller = ObjectId(user.sellerId)
    }
    if (user.aboutGigId) { criteria.aboutGig = ObjectId(user.aboutGigId) }
    console.log('criteria:', criteria)
    return criteria
}
async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const order = collection.findOne({ _id: new ObjectId(orderId) })
        return order
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err)
        throw err
    }
}

export const orderService = {
    query,
    remove,
    add,
    getById
}


