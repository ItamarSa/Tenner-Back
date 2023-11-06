import {dbService} from '../../services/db.service.js'
import {logger} from '../../services/logger.service.js'
import {asyncLocalStorage} from '../../services/als.service.js'
import mongodb from 'mongodb'
const {ObjectId} = mongodb

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('review')
        // const reviews = await collection.find(criteria).toArray()
        var reviews = await collection.aggregate([
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
        reviews = reviews.map(review => {
            review.byUser = { _id: review.byUser._id, username: review.byUser.username }
            review.aboutGig = { _id: review.aboutGig._id, title: review.aboutGig.title }
            console.log('review1:', review)
            delete review.byUserId
            delete review.aboutGigId
            console.log('review2:', review)
            return review
        })

        return reviews
    } catch (err) {
        logger.error('cannot find reviews', err)
        throw err
    }

}

async function remove(reviewId) {
    try {
        const store = asyncLocalStorage.getStore()
        console.log('store:', store)
        const { loggedinUser } = store
        const collection = await dbService.getCollection('review')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(reviewId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const {deletedCount} = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}


async function add(review) {
    try {
        const reviewToAdd = {
            byUserId: ObjectId(review.byUserId),
            aboutGigId: ObjectId(review.aboutGigId),
            txt: review.txt
        }
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)
        console.log('reviewToAdd4', reviewToAdd)
        return reviewToAdd
    } catch (err) {
        logger.error('cannot insert review', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.byUserId) criteria.byUserId = ObjectId(filterBy.byUserId)
    if (filterBy.aboutGigId) criteria.aboutGigId = ObjectId(filterBy.aboutGigId)
    return criteria
}

export const reviewService = {
    query,
    remove,
    add
}


