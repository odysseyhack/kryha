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

// todo: list of points
router.get('/', async (req, res, next) => {
  const points = await Point.find().exec()
  return res.status(200).json(points)
})

export default router
