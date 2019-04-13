import { Schema } from 'mongoose'
import mongoose from './mongoose.js'

const pointSchema = new Schema({
  x: {
    type: mongoose.SchemaTypes.Number
  },
  y: {
    type: mongoose.SchemaTypes.Number
  },
  air: {
    type: mongoose.SchemaTypes.Number,
    default: () => Math.floor(Math.random() * 100)
  },
  resources: {
    type: mongoose.SchemaTypes.Number,
    default: () => Math.floor(Math.random() * 100)
  },
  nature: {
    type: mongoose.SchemaTypes.Number,
    default: () => Math.floor(Math.random() * 100)
  },
  water: {
    type: mongoose.SchemaTypes.Number,
    default: () => Math.floor(Math.random() * 100)
  }
})

const Point = mongoose.model('Point', pointSchema, 'points')

export default Point
