const register = require('./k8s/register')
const Web3 = require('web3')
const web3 = Web3(Web3.providers.HttpProvider(process.env.GANACHE || 'ws://localhost:8545'))

let account = web3.eth.account.create()

// Register on k8s
register(account.address)
