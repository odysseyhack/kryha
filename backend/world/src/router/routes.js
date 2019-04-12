import express from 'express'
import world from './world.js'
import drone from './drone.js'

const router = express.Router()

router.use('/world', world)
router.use('/drone', drone)

export default router
