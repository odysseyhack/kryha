import express from 'express'
import Point from '../mongoose/point.js'

const router = express.Router()

router.use(async (req, res, next) => {
  try {
    const { x, y } = req.body
    let point = await Point.findOne({ x, y }).exec()
    if (!point) { point = await new Point({ x, y }).save() }
    res.locals.point = point
    next()
  } catch (error) {
    next(error)
  }
})

router.get('/point', async (req, res, next) => {
  return res.status(200).json(res.locals.point)
})

router.put('/point', async (req, res, next) => {
  try {
    const point = res.locals.point
    return res.status(200).json(await point.updateOne(req.body).exec())
  } catch (error) {
    next(error)
  }
})

export default router
