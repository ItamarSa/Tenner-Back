import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getGigs, getGigById, addGig, updateGig, removeGig, addGigMsg, removeGigMsg } from './gig.controller.js'

export const gigRoutes = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

gigRoutes.get('/', log, getGigs)
gigRoutes.get('/:id', getGigById)
gigRoutes.post('/', requireAuth, addGig)
gigRoutes.put('/', requireAuth, updateGig)
gigRoutes.delete('/:id', requireAuth, removeGig)

// router.delete('/:id', requireAuth, requireAdmin, removeGig)

gigRoutes.post('/:id/msg', requireAuth, addGigMsg)
gigRoutes.delete('/:id/msg/:msgId', requireAuth, removeGigMsg)