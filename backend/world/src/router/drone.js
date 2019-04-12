import express from 'express'
import Drone from '../mongoose/drone.js'
import { droneContract, registerListener } from '../ethereum/web3.js'

const router = express.Router()

router.param('address', async (req, res, next, address) => {
  try {
    const drone = await Drone.findOne({ address }).exec()
    if (!drone) { return res.status(404).send('Drone Not Found') }
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
router.get('/alive', async (req, res, next) => {
  try {
    const drones = await Drone.find({ alive: true }).exec()
    return res.status(200).json(drones)
  } catch (error) {
    next(error)
  }
})

// get list of all dead drones
router.get('/dead', async (req, res, next) => {
  try {
    const drones = await Drone.find({ alive: false }).exec()
    return res.status(200).json(drones)
  } catch (error) {
    next(error)
  }
})

registerListener(droneContract, 'NewDrone', {}, async (error, event) => {
  if (error) {
    console.error(error)
  } else {
    const { drone: address, parent1, parent2, dna } = event.returnValues
    await new Drone({ address, parent1, parent2, dna, fitness: 0 }).save()
    console.info(`drone ${address} added`)
  }
})

registerListener(droneContract, 'DroneDies', {}, async (error, event) => {
  if (error) {
    console.error(error)
  } else {
    const { drone: address } = event.returnValues
    const drone = await Drone.findOne({ address }).exec()
    drone.set('alive', false)
    await drone.save()
    console.info(`drone ${address} died`)
  }
})

export default router
