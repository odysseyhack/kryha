const Web3 = require('web3')

// TODO: add abi
const DroneABI = require('../../contracts/Drone.json')
const WorldABI = require('../../contracts/World.json')

const DroneAddress = process.env.DRONE_ADDRESS
const WorldAddress = process.env.WORLD_ADDRESS

const RPC = process.env.APP_RPC || 'http://localhost:8545'

const provider = new Web3.providers.HttpProvider(RPC)
const web3 = new Web3(provider)

const TRANSFERRED_AMOUNT = Number(process.env.TRANSFERRED_AMOUNT) || 1000000000

function loadContract (contractName) {
  switch (contractName) {
    case 'drone':
      return new web3.eth.Contract(DroneABI.abi, DroneAddress)
    case 'world':
      return new web3.eth.Contract(WorldABI.abi, WorldAddress)
    default:
      throw new Error('Contract not defined')
  }
}

async function sendTx (account, tx) {
  const gas = await web3.eth.estimateGas(tx)
  let signedTx = await account.signTransaction({ ...tx, gas })

  return web3.eth.sendSignedTransaction(signedTx.rawTransaction)
}

async function sendContract (account, contractName, method, ...args) {
  let contract = loadContract(contractName)

  const tx = {
    to: contract.options.address,
    from: account.address,
    data: contract.methods[method](...args).encodeABI(),
    nonce: await web3.eth.getTransactionCount(account.address),
    value: 0
  }

  return sendTx(account, tx)
}

function callContract (account, contractName, method, ...args) {
  let contract = loadContract(contractName)

  method = contract.methods[method](...args)
  return method.call({ from: account.address })
}

async function newAccount () {
  let newAccount = web3.eth.accounts.create()

  switch (process.env.NOT_PERSONAL) {
    case 'true':
    case 'TRUE':
      return _newAccountRich(newAccount)
    default:
      return _newAccountPersonal(newAccount)
  }
}

async function _newAccountPersonal (newAccount) {
  let rich = (await web3.eth.personal.getAccounts())[0]
  await web3.eth.personal.unlockAccount(rich)

  const tx = {
    to: newAccount.address,
    from: rich,
    value: TRANSFERRED_AMOUNT
  }

  await web3.eth.personal.sendTransaction(tx, '')

  return newAccount
}

async function _newAccountRich (newAccount) {
  // Owner account should also be rich
  const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || '0x735bf515f3a8fc16aa634574dd4bb2bf2499ea924f461c4f620403a1e45b60fe'
  const richAccount = web3.eth.accounts.privateKeyToAccount(OWNER_PRIVATE_KEY)

  const tx = {
    to: newAccount.address,
    from: richAccount.address,
    nonce: await web3.eth.getTransactionCount(richAccount.address),
    value: TRANSFERRED_AMOUNT
  }

  await sendTx(OWNER_PRIVATE_KEY, tx)

  return newAccount
}

async function addWorldState (account, x, y, air, resources, nature, water) {
  return sendContract(account, 'world', 'addWorldState', x, y, air, resources, nature, water)
}

async function mineResources (account, x, y, air, resources, nature, water) {
  return sendContract(account, 'world', 'mineResources', x, y, air, resources, nature, water)
}

async function killDrone (account) {
  return sendContract(account, 'drone', 'killDrone')
}

async function createDrone (account, parent1, parent2, dna) {
  return sendContract(account, 'drone', 'createDrone', parent1, parent2, web3.utils.utf8ToHex(dna))
}

// TODO: export contract functions
module.exports = { newAccount, addWorldState, mineResources, killDrone, createDrone }
