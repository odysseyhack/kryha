import mongoose from 'mongoose'
import * as constants from '../constants.js'

mongoose.set('useCreateIndex', true)
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.connect(constants.MONGO_URL)

export default mongoose
