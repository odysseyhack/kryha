const { Schema } = require('mongoose')
const mongoose = require('./mongoose.js')

const contractSchema = new Schema({
  name: String,
  networkId: String,
  address: String,
  abi: Object
})

module.exports = mongoose.model('Contract', contractSchema, 'contracts')
