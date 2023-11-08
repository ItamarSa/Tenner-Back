import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

async function query(filterBy = {}) {
    let criteria = {}

    try {
        if (filterBy.txt) {
            // const regex = new RegExp(filterBy.txt, 'i');
            // criteria.$or = [
            //     { title: { $regex: filterBy.txt, $options: 'i' } },
            //     { tags: { $elemMatch: { $regex: filterBy.txt, $options: 'i' } } }
            // ];

        }

        if (filterBy.tags && filterBy.tags.length > 0) {
            criteria.tags = { $in: filterBy.tags };
        }

        // if (filterBy.inStock !== undefined) {
        //     if (filterBy.inStock === 'true') {
        //         criteria.inStock = true 
        //     } else if (filterBy.inStock === 'false') {
        //         criteria.inStock = false 
        //     }
        // }

        const collection = await dbService.getCollection('gigs')
        // let gigs =  collection
        let gigs = await collection.find({}).toArray()
        if (filterBy.txt) {
            const regex = new RegExp(filterBy.txt, 'i');
            gigs = gigs.filter((gig) => {
                return (
                    gig.title.match(regex) || // Match by title
                    gig.tags.some((tag) => tag.match(regex)) // Match by tags
                );
            });
        }
        if (filterBy.tags) {
            gigs = gigs.filter((gig) => gig.tags.includes(filterBy.tags))
        }
        if (filterBy.userId) {
            gigs = gigs.filter((gig) => gig.owner._id === filterBy.userId);
        }
        if (filterBy.buyerId) {
            orders = orders.filter((order) => order.buyer._id === filterBy.buyerId);
        }

        return gigs
    } catch (err) {
        logger.error('cannot find gigs', err)
        throw err
    }
}

async function getById(gigId) {
    try {
        const collection = await dbService.getCollection('gigs')
        const gig = collection.findOne({ _id: new ObjectId(gigId) })
        return gig
    } catch (err) {
        logger.error(`while finding gig ${gigId}`, err)
        throw err
    }
}

async function remove(gigId) {
    try {
        const collection = await dbService.getCollection('gigs')
        await collection.deleteOne({ _id: ObjectId(gigId) })
    } catch (err) {
        logger.error(`cannot remove gig ${gigId}`, err)
        throw err
    }
}

async function add(gig) {
    try {
        const collection = await dbService.getCollection('gigs')
        await collection.insertOne(gig)
        return gig
    } catch (err) {
        logger.error('cannot insert gig', err)
        throw err
    }
}

async function update(gig) {
    try {
        const gigToSave = {
            _id: ObjectId(gig._id),
            imgUrl: gig.imgUrl,
            title: gig.title,
            about: gig.about,
            price: gig.price,
            rate: gig.rate,
            createdAt: gig.createdAt,
            tags: gig.tags,
            owner: gig.owner,


        }
        const collection = await dbService.getCollection('gigs')
        await collection.updateOne({ _id: ObjectId(gig._id) }, { $set: gigToSave })
        return gigToSave
    } catch (err) {
        logger.error(`cannot update gig ${gig}`, err)
        throw err
    }
}

async function addGigMsg(gigId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('gigs')
        await collection.updateOne({ _id: ObjectId(gigId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add gig msg ${gigId}`, err)
        throw err
    }
}

async function removeGigMsg(gigId, msgId) {
    try {
        const collection = await dbService.getCollection('gigs')
        await collection.updateOne({ _id: ObjectId(gigId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add gig msg ${gigId}`, err)
        throw err
    }
}

export const gigService = {
    remove,
    query,
    getById,
    add,
    update,
    addGigMsg,
    removeGigMsg
}
