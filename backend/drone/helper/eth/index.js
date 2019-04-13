const Web3 = require('web3')

const constants = require('../../constants')
const provider = new Web3.providers.HttpProvider(constants.ETHEREUM_URL)
const web3 = new Web3(provider)

async function sendTx (account, tx) {
  const gas = await web3.eth.estimateGas(tx)
  let signedTx = await account.signTransaction({ ...tx, gas })

  return web3.eth.sendSignedTransaction(signedTx.rawTransaction)
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
    value: constants.TRANSFERRED_AMOUNT
  }

  await web3.eth.personal.sendTransaction(tx, '')

  return newAccount
}

async function _newAccountRich (newAccount) {
  // Owner account should also be rich
  const richAccount = web3.eth.accounts.privateKeyToAccount(constants.OWNER_PRIVATE_KEY)

  const tx = {
    to: newAccount.address,
    from: richAccount.address,
    nonce: await web3.eth.getTransactionCount(richAccount.address),
    value: constants.TRANSFERRED_AMOUNT
  }

  await sendTx(constants.OWNER_PRIVATE_KEY, tx)

  return newAccount
}

function ethFunctions (store, Drone, World) {
  function loadContract (contractName) {
    switch (contractName) {
      case 'drone':
        return new web3.eth.Contract(Drone.abi, Drone.address)
      case 'world':
        return new web3.eth.Contract(World.abi, World.address)
      default:
        throw new Error('Contract not defined')
    }
  }

  async function sendContract (contractName, method, ...args) {
    let contract = loadContract(contractName)

    const tx = {
      to: contract.options.address,
      from: store.account.address,
      data: contract.methods[method](...args).encodeABI(),
      nonce: await web3.eth.getTransactionCount(store.account.address),
      value: 0
    }

    return sendTx(store.account, tx)
  }

  function callContract (contractName, method, ...args) {
    let contract = loadContract(contractName)

    method = contract.methods[method](...args)
    return method.call({ from: store.account.address })
  }

  async function addWorldState (x, y, air, resources, nature, water) {
    let receipt = await sendContract('world', 'addWorldState', x, y, air, resources, nature, water)
    store.updateBlockNumber(receipt.blockNumber)

    return receipt
  }

  async function mineResources (x, y, air, resources, nature, water) {
    let receipt = await sendContract('world', 'mineResources', x, y, air, resources, nature, water)
    store.updateBlockNumber(receipt.blockNumber)

    return receipt
  }

  async function killDrone () {
    let receipt = await sendContract('drone', 'killDrone')
    store.updateBlockNumber(receipt.blockNumber)

    return receipt
  }

  async function createDrone (parent1, parent2, dna) {
    let receipt = await sendContract('drone', 'createDrone', parent1, parent2, web3.utils.utf8ToHex(dna))
    store.updateBlockNumber(receipt.blockNumber)

    return receipt
  }
  async function getDiscoveredWorldSize () {
    return callContract('world', 'getDiscoveredWorldSize')
  }

  async function WorldStateChecked (x, y) {
    return callContract('world', 'WorldStateChecked')
  }

  return {
    addWorldState, mineResources, killDrone, createDrone, getDiscoveredWorldSize, WorldStateChecked
  }
}

// TODO: export contract functions
module.exports = { newAccount, ethFunctions }
