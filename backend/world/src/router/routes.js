import express from 'express'
import world from './world.js'

const router = express.Router()

router.use('/world', world)

export default router
