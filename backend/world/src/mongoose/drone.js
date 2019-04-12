import mongoose from './mongoose.js'
import { Schema } from 'mongoose'

const droneSchema = new Schema({
  address: String,
  parent1: String,
  parent2: String,
  dna: Array,
  fitness: Number,
  active: {
    type: Boolean,
    default: true
  }
})

const Point = mongoose.model('Drone', droneSchema, 'drones')

export default Point