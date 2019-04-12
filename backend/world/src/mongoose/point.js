import mongoose from './mongoose.js'
import { Schema } from 'mongoose'

const pointSchema = new Schema({
  x: {
    type: mongoose.SchemaTypes.Number
  },
  y: {
    type: mongoose.SchemaTypes.Number
  },
  water: {
    type: mongoose.SchemaTypes.Number,
    default: () => Math.floor(Math.random() * 100)
  },
  oxygen: {
    type: mongoose.SchemaTypes.Number,
    default: () => Math.floor(Math.random() * 100)
  },
  flora: {
    type: mongoose.SchemaTypes.Number,
    default: () => Math.floor(Math.random() * 100)
  },
  resources: {
    type: mongoose.SchemaTypes.Number,
    default: () => Math.floor(Math.random() * 100)
  }
})

const Point = mongoose.model('Point', pointSchema, 'points')

export default Point
