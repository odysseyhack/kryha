const express = require('express')
const app = express()

const register = require('./k8s/register')
const eth = require('./helper/eth')
const GeneticsFunction = require('./genetics')

const constants = require('./constants')

class Store {
  constructor (id, account) {
    this.id = id
    this.account = account
    this.blockNumber = null
    this.fitness = 0
    this.DNA = constants.DNA
    this.eth = eth.ethFunctions(this)
  }

  updateBlockNumber (blockNumber) {
    this.blockNumber = blockNumber

    console.log(this.blockNumber)

    // TODO: call callback when a certain number has been reached
  }
}

async function main () {
  let account = await eth.newAccount()

  // create the store
  let store = Store(account.address, account)

  // Register on k8s and blockchain
  register(account.address)
  store.eth.createDrone(account, constants.PARENT1, constants.PARENT2, store.DNA)

  const Genetics = GeneticsFunction(store)
  let geneticRoutes = require('./genetics/routes')(Genetics)

  app.use('/genetic/', geneticRoutes)
  app.get('/health', (req, res) => {
    res.send('Hello, World!')
  })

  app.listen(constants.PORT, (err) => {
    if (err) {
      console.err(err.stack)
    } else {
      console.log(`App listening on port ${constants.PORT} [${process.env.NODE_ENV} mode]`)
    }
  })

  console.log('Coming here')
}

main()
