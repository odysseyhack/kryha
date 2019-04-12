import Web3 from 'web3'
import fs from 'fs'
import * as constants from '../constants.js'

const web3 = new Web3(Web3.providers.WebsocketProvider(constants.ETHEREUM_URL))
const worldJson = JSON.parse(fs.readFileSync('../../../ethereum/build/contracts/World.json'))
const droneJson = JSON.parse(fs.readFileSync('../../../ethereum/build/contracts/Drone.json'))

export const worldContract = new web3.eth.Contract(worldJson.abi, Object.values(worldJson.networks).pop().address)
export const droneContract = new web3.eth.Contract(droneJson.abi, Object.values(droneJson.networks).pop().address)

export const registerListener = (contract, MyEvent, options, callback) => contract.events[MyEvent](options, callback)

export default web3
