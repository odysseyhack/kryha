import * as constants from './constants.js'
import app from './app.js'

app.listen(constants.API_PORT, () => {
  console.info(`http server listening on ${constants.API_PORT}...`)
})
