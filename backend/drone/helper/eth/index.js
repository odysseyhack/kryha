const Web3 = require('web3')

// TODO: add abi
const abi;

const RPC = process.env.APP_RPC || 'http://localhost:8545'

const provider = new Web3.providers.HttpProvider(RPC)
const web3 = new Web3(provider)

// Owner account should also be rich

const TRANSFERRED_AMOUNT = Number(process.env.TRANSFERRED_AMOUNT) || 2000000

// FIXME: find better method to do this
function findContractAddress (abi) {
  return Object.values(abi.networks)[0].address
}

function loadContract () {
  return new web3.eth.Contract(abi.abi, findContractAddress(abi))
}

async function sendTx (account, tx) {
  const gas = await web3.eth.estimateGas(tx)
  let signedTx = await account.signTransaction({ ...tx, gas })

  return web3.eth.sendSignedTransaction(signedTx.rawTransaction)
}

async function sendContract (account, method, ...args) {
  let contract = loadContract()

  const tx = {
    to: contract.options.address,
    from: account.address,
    data: contract.methods[method](...args).encodeABI(),
    nonce: await web3.eth.getTransactionCount(account.address),
    value: 0
  }

  return sendTx(account, tx)
}

function callContract (account, method, ...args) {
  let contract = loadContract()

  method = contract.methods[method](...args)
  return method.call({ from: account.address })
}

async function newAccount () {
  let newAccount = web3.eth.accounts.create()

  // rich account
  let richAccount = web3.account.personal.getAccounts()[0]
  await web3.eth.personal.unlockAccount(richAccount)
  await web3.eth.sendTransaction({
    from: richAccount,
    to: newAccount.address,
    value: TRANSFERRED_AMOUNT    
  })


  return newAccount
}

//TODO: export contract functions

module.exports = { newAccount }
