import Web3 from 'web3'
import axios from 'axios'
import * as constants from '../constants.js'
import Point from '../mongoose/point.js'
import Drone from '../mongoose/drone.js'

const web3 = new Web3(Web3.providers.WebsocketProvider(constants.ETHEREUM_URL))

export const registerListener = (contract, MyEvent, options, callback) => {
  const eventEmitter = contract.events[MyEvent](options)
  eventEmitter.on('data', callback)
  console.info(`added ${MyEvent} listener`)
  return eventEmitter
}

export async function setup () {
  const { data: worldJsonInterface } = await axios.get(`${constants.CONTRACTS_URL}/world`)
  const { data: droneJsonInterface } = await axios.get(`${constants.CONTRACTS_URL}/drone`)
  const worldContract = new web3.eth.Contract(worldJsonInterface.abi, worldJsonInterface.address)
  const droneContract = new web3.eth.Contract(droneJsonInterface.abi, droneJsonInterface.address)

  // got mine resources event, update point in mongo
  registerListener(worldContract, 'E_MineResources', {}, async (event) => {
    const { drone: address, x, y, air, resources, nature, water } = event.returnValues
    // find point
    const point = await Point.findOne({ x, y }).exec()
    // update point
    point.set('air', Number(point.air) + Number(air))
    point.set('resources', Number(point.resources) + Number(resources))
    point.set('nature', Number(point.nature) + Number(nature))
    point.set('water', Number(point.water) + Number(water))
    await point.save()
    console.info(`updated point ${x},${y}`)
    // todo: update drone involved
    const drone = await Drone.findOne({ address }).exec()
    drone.set('x', x)
    drone.set('y', y)
    await drone.save()
    console.info(`updated drone ${address}`)
  })

  registerListener(droneContract, 'NewDrone', {}, async (event) => {
    const { drone: address, parent1, parent2, dna } = event.returnValues
    await new Drone({ address, parent1, parent2, dna, fitness: 0 }).save()
    console.info(`drone ${address} added`)
  })

  registerListener(droneContract, 'DroneDies', {}, async (event) => {
    const { drone: address } = event.returnValues
    const drone = await Drone.findOne({ address }).exec()
    drone.set('alive', false)
    await drone.save()
    console.info(`drone ${address} died`)
  })
}

export default web3
