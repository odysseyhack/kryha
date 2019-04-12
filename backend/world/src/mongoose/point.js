import { Schema } from 'mongoose'
import mongoose from './mongoose.js'
import { worldContract, registerListener } from '../ethereum/web3.js'

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

// got mine resources event, update point in mongo
registerListener(worldContract, 'E_MineResources', {}, async (error, event) => {
  if (error) {
    console.error(error)
  } else {
    // parse event values
    const { x, y, air, resources, nature, water } = event.returnValues
    // find point
    const point = await Point.findOne({ x, y }).exec()
    // update point
    point.set('air', Number(point.air) + Number(air))
    point.set('resources', Number(point.resources) + Number(resources))
    point.set('nature', Number(point.nature) + Number(nature))
    point.set('water', Number(point.water) + Number(water))
    await point.save()
  }
})

export default Point
