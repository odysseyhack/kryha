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
    this.fitness = 0
    this.DNA = constants.DNA
    this.eth = undefined
    this.x = 0
    this.y = 0
    this.procreated = false
    this.dead = false

    this.miningAllowed = true

    this.broadcasts = 0

    this.callbackProcreate = () => {}
    this.callbackShare = () => {}
  }

  async setEth () {
    let Drone = await getContract('drone')
    let World = await getContract('world')

    this.eth = eth.ethFunctions(this, Drone, World)
  }

  updateBlockNumber (blockNumber) {
    this.blockNumber = blockNumber

    console.log('BLOCKNUMBER', this.blockNumber)
    if (!this.procreated && blockNumber % 100 > 0 && blockNumber % 100 < 10) {
      console.log('STARING PROCREATION')
      this.miningAllowed = false
      this.callbackProcreate()
      this.broadcasts = 0
      this.procreated = true
      this.miningAllowed = true
    }

    if (this.broadcasts < 10 && blockNumber % 100 > 10 * this.broadcasts && blockNumber % 100 < 100) {
      console.log('STARING SHARING')
      this.callbackShare()

      this.broadcasts++
      this.procreated = false
    }
  }
}

async function geneticsSharing (Genetics) {
  console.log('Genetic started')

  let n = 2

  await Genetics.setAgents()
  await Genetics.announceFitness()
  await sleep.sleep(n)

  await Genetics.announceChildrenTokens()
  await sleep.sleep(n)

  await Genetics.announcePairs()
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
  store.callbackShare = () => geneticsSharing(Genetics)
  store.callbackProcreate = async () => {
    fetch(`${constants.WORLD_URL}/drone/updateDrone`, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fitness: store.fitness,
        address: store.address
      })
    }, 5000, 'Timeout').catch(() => console.warn('Putting fitness failed'))

    store.dead = await Genetics.checkIfDead()
    if (store.dead) return
    await Genetics.procreate()

    // Reset the fitness after procreation to give kids a chance
    store.fitness = 0
  }

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

  // update initital location
  await store.eth.mineResources(store.x, store.y, 0, 0, 0, 0)

  while (1) {
    console.log('Fitness: ', store.fitness)
    // To have some delay
    await sleep.sleep(1)

    if (store.dead) break
    if (!store.miningAllowed) continue

    let discoveredWorld = await store.eth.getDiscoveredWorldSize()

    console.log('discovering')

    let undiscoverd = 1 - (discoveredWorld.DiscoveredNodes / discoveredWorld.WorldSize)
    let rand = Math.random()

    console.log(undiscoverd, rand, discoveredWorld.DiscoveredNodes, discoveredWorld.WorldSize)

    console.log('discovering done')

    if (rand < undiscoverd) {
      console.log('locating')
      let cor = await FindNodeCheck(store).catch(e => console.log('Find Node check'))

      store.x = cor.x
      store.y = cor.y
      await locate(store).catch(e => console.log('Locate 1 error: ', e.name))

      console.log('locating done')
    } else {
      let node = await FindNode(store.x, store.y, store.DNA)

      if (!node) continue
      if (node === null && undiscoverd !== 0) {
        let cor = await FindNodeCheck(store).catch(e => console.log('Find Node check'))

        store.x = cor.x
        store.y = cor.y
        await locate(store).catch(e => console.log('Locate 2 error: ', e.name))
      } else {
        console.log('mining')
        store.fitness += node.fit
        store.x = node.x
        store.y = node.y
        await mine(store).catch(e => console.log('Mine error: ', e.name, e))
      }

      console.log('mining done')
    }
  }
}

main()
