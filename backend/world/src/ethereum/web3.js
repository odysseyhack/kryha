import Web3 from 'web3'
import * as constants from '../constants.js'

const web3 = new Web3(Web3.providers.WebsocketProvider(constants.ETHEREUM_URL))

// todo: get abi
const jsonInterface = ['']
const contract = new web3.eth.Contract(jsonInterface)

export const registerListener = (MyEvent, options, callback) => {
  contract.events[MyEvent](options, callback)
}

export default web3
