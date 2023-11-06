import {dbService} from '../../services/db.service.js'
import {logger} from '../../services/logger.service.js'
import {asyncLocalStorage} from '../../services/als.service.js'
import mongodb from 'mongodb'
const {ObjectId} = mongodb

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('order')
        // const orders = await collection.find(criteria).toArray()
        var orders = await collection.aggregate([
            {
                $match: criteria
            },
            {
                $lookup:
                {
                    localField: 'byUserId',
                    from: 'users',
                    foreignField: '_id',
                    as: 'byUser'
                    
                }
            },
            {
                $unwind: '$byUser'
            },
            {
                $lookup:
                {
                    localField: 'aboutGigId',
                    from: 'gigs',
                    foreignField: '_id',
                    as: 'aboutGig'
                    
                }
            },
            {
                $unwind: '$aboutGig'
            }
        ]).toArray()
        orders = orders.map(order => {
            order.byUser = { _id: order.byUser._id, username: order.byUser.username }
            order.aboutGig = { _id: order.aboutGig._id, title: order.aboutGig.title }
            console.log('order1:', order)
            delete order.byUserId
            delete order.aboutGigId
            console.log('order2:', order)
            return order
        })

        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }

}

async function remove(orderId) {
    try {
        const store = asyncLocalStorage.getStore()
        console.log('store:', store)
        const { loggedinUser } = store
        const collection = await dbService.getCollection('order')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(orderId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const {deletedCount} = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}


async function add(order) {
    try {
        const orderToAdd = {
            byUserId: ObjectId(order.byUserId),
            aboutGigId: ObjectId(order.aboutGigId),
            txt: order.txt
        }
        const collection = await dbService.getCollection('order')
        await collection.insertOne(orderToAdd)
        console.log('orderToAdd4', orderToAdd)
        return orderToAdd
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.byUserId) criteria.byUserId = ObjectId(filterBy.byUserId)
    if (filterBy.aboutGigId) criteria.aboutGigId = ObjectId(filterBy.aboutGigId)
    return criteria
}

export const orderService = {
    query,
    remove,
    add
}


