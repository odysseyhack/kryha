import express from 'express'
import Drone from '../mongoose/drone.js'

const router = express.Router()

router.param('address', async (req, res, next, address) => {
  try {
    const drone = await Drone.findOne({ address }).exec()
    if (!drone) { return res.status(404).json({ success: false, message: 'Drone Not Found' }) }
    res.locals.drone = drone
    next()
  } catch (error) {
    next(error)
  }
})

// get single drone
router.get('/:address', async (req, res) => res.status(200).json(res.locals.drone))

// get list of all drones
router.get('/', async (req, res, next) => {
  try {
    const drones = await Drone.find().exec()
    return res.status(200).json(drones)
  } catch (error) {
    next(error)
  }
})

// get list of all alive drones
router.get('/list/alive', async (req, res, next) => {
  try {
    const drones = await Drone.find({ alive: true }).exec()
    return res.status(200).json(drones)
  } catch (error) {
    next(error)
  }
})

// get list of all dead drones
router.get('/list/dead', async (req, res, next) => {
  try {
    const drones = await Drone.find({ alive: false }).exec()
    return res.status(200).json(drones)
  } catch (error) {
    next(error)
  }
})

router.put('/updateDrone', async (req, res, next) => {
  try {
    const drone = await Drone.findOneAndUpdate({ address: req.body.address }, req.body, { upsert: true }).exec()
    return res.status(200).json(drone)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default router
