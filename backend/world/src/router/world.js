import express from 'express'
import Point from '../mongoose/point.js'

const router = express.Router()

const injectPoint = async (req, res, next) => {
  try {
    const { x, y } = req.body
    let point = await Point.findOne({ x, y }).exec()
    if (!point) { point = await new Point({ x, y }).save() }
    res.locals.point = point
    next()
  } catch (error) {
    next(error)
  }
}

router.get('/point', injectPoint, async (req, res, next) => {
  return res.status(200).json(res.locals.point)
})

router.put('/point', injectPoint, async (req, res, next) => {
  try {
    const update = await res.locals.point.updateOne(req.body).exec()
    return res.status(200).json(update)
  } catch (error) {
    next(error)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const points = await Point.find({}, { air: 1, resources: 1, nature: 1, water: 1, _id: 0 }).sort({ y: 1, x: 1 }).exec()
    return res.status(200).json(points)
  } catch (error) {
    next(error)
  }
})

export default router
