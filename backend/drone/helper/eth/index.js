const Web3 = require('web3')

// TODO: add abi
const DroneABI = require('../../contracts/Drone.json')
const WorldABI = require('../../contracts/World.json')

const DroneAddress = process.env.DRONE_ADDRESS
const WorldAddress = process.env.WORLD_ADDRESS

const RPC = process.env.APP_RPC || 'http://localhost:8545'

const provider = new Web3.providers.HttpProvider(RPC)
const web3 = new Web3(provider)

// Owner account should also be rich

// TODO: make sure that there is a rich account
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || '0x735bf515f3a8fc16aa634574dd4bb2bf2499ea924f461c4f620403a1e45b60fe'
const richAccount = web3.eth.accounts.privateKeyToAccount(OWNER_PRIVATE_KEY)
const TRANSFERRED_AMOUNT = Number(process.env.TRANSFERRED_AMOUNT) || 2000000

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

  const tx = {
    to: newAccount.address,
    from: richAccount.address,
    nonce: await web3.eth.getTransactionCount(richAccount.address),
    value: TRANSFERRED_AMOUNT
  }

  await sendTx(OWNER_PRIVATE_KEY, tx)

  return newAccount
}

// TODO: export contract functions
module.exports = { newAccount }
