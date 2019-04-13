import * as constants from './constants.js'
import app from './app.js'
import { setup } from './ethereum/web3.js'
import Point from './mongoose/point.js'

setup()

const injectPoint = async (x, y) => {
  try {
    let point = await Point.findOne({ x, y }).exec()
    if (!point) { point = await new Point({ x, y }).save() }
    return point
  } catch (error) {
    console.error(error)
    return null
  }
}
// initialise array if necessary
for (let i = 0; i < constants.WORLD_SIZE; ++i) {
  for (let j = 0; j < constants.WORLD_SIZE; ++j) {
    injectPoint(i, j)
  }
}

app.listen(constants.API_PORT, () => {
  console.info(`http server listening on ${constants.API_PORT}...`)
})
