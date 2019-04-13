const mongoose = require('mongoose')
const constants = require('../constants.js')

mongoose.set('useCreateIndex', true)
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.connect(constants.MONGO_URL)

module.exports = mongoose
