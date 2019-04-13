const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const sleep = require('sleep')

app.use(bodyParser.json({
  limit: '100mb'
}))
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '100mb'
}))

const fetch = require('fetch-timeout')

const register = require('./k8s/register')
const eth = require('./helper/eth')
const GeneticsFunction = require('./genetics')
const FindNode = require('./gathering/findNode/findNode')
const FindNodeCheck = require('./gathering/findNode/findCheck')
const mine = require('./gathering/mineAndLocate/mine')
const locate = require('./gathering/mineAndLocate/locate')

const constants = require('./constants')

class Store {
  constructor (id, account) {
    this.id = id
    this.account = account
    this.blockNumber = null
    this.fitness = Math.floor(Math.random() * 10000) // TODO: replace with real fitness
    this.DNA = constants.DNA
    this.eth = undefined
    this.x = 0
    this.y = 0
    this.doneBroadcast = false

    this.callback = () => {}
  }

  async setEth () {
    let Drone = await getContract('drone')
    let World = await getContract('world')

    this.eth = eth.ethFunctions(this, Drone, World)
  }

  updateBlockNumber (blockNumber) {
    this.blockNumber = blockNumber

    console.log('BLOCKNUMBER', this.blockNumber)
    if (this.doneBroadcast === true && blockNumber % 1000 > 0 && blockNumber % 1000 < 100) {
      this.doneBroadcast = false
    }

    if (this.doneBroadcast === false && blockNumber % 1000 > 900 && blockNumber % 1000 < 1000) {
      // TODO: call genetics
      this.doneBroadcast = true
      this.callback()
    }
  }
}

async function geneticsSharing (Genetics) {
  console.log('Genetic started')

  let n = 2

  await Genetics.setAgents()
  await Genetics.announceFitness()
  await sleep.sleep(n)

  await Genetics.checkIfDead()
  await Genetics.announceChildrenTokens()
  await sleep.sleep(n)

  await Genetics.announcePairs()
  await sleep.sleep(n)
}

async function getContract (name) {
  return fetch(`${constants.CONTRACTS_URL}/${name}`, { method: 'get' }, 5000, 'timeout')
    .then(res => res.json())
}

async function main () {
  let account = await eth.newAccount()

  // create the store
  let store = new Store(account.address, account)
  await store.setEth()

  // Register on k8s and blockchain
  await register(account.address)
  await store.eth.createDrone(constants.PARENT1, constants.PARENT2, store.DNA)

  const Genetics = GeneticsFunction(store)
  store.callback = Genetics.procreate

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

  let counter = 0
  while (1) {
    if (counter % 1 === 0) {
      await geneticsSharing(Genetics)
    }

    await sleep.sleep(1)

    if (counter % 10 === 0) {
      await Genetics.procreate()
    }
    // let discoveredWorld = store.eth.getDiscoverdWorldSize(store.account)
    // let undiscoverd = 1 - (discoveredWorld.DiscoveredNodes / discoveredWorld.WorldSize)
    // let rand = Math.random()
    // if (rand > undiscoverd) {
    //   let cor = FindNodeCheck(store.x, store.y)
    //   store.x = cor.x
    //   store.y = cor.y
    //   locate(store)
    // } else {
    //   // TODO find node to Mine
    //   let node = FindNode(store.x, store.y, store.DNA)
    //   if (node === null && undiscoverd !== 0) {
    //     let cor = FindNodeCheck(store.x, store.y)
    //     store.x = cor.x
    //     store.y = cor.y
    //     locate(store)
    //   } else {
    //     store.fitness += node.fitness
    //     store.x = node.x
    //     store.y = node.y
    //     mine(store)
    //   }
    // }

    counter++
  }
}

main()
