const sample = require('lodash.sample')

const constants = require('../constants')
const sort = require('./helper/insertSort')
const eth = require('../helper/eth')

const uuidv4 = require('uuid/v4')

class Genetics {
  constructor (id, DNA, account) {
    this.fitness = 0
    this.isDead = false
    this.account = account

    this.DNA = DNA
    this.id = id

    this.agents = []
    this.childrenTokens = 0
    this.parents = []

    this.pairs = []

    this.sortFitness = () => sort(this.agents, 'fitness')
    this.sortPairs = () => sort(this.pairs, 'id')
  }

  // TODO: make a real fitness calc
  _calculateFitness () {
    this.fitness = Math.round(Math.random() * 10000)
  }

  // TODO: put on blockchain
  // PUBSUB ?
  announceFitness () {
    this._calculateFitness()
    return { id: this.id, fitness: this.fitness }
  }

  // TODO: register from blockchain
  // PUBSUB ?
  registerFitness (id, fitness) {
    this.agents.push({ id, fitness })
    this.sortFitness()
  }

  checkIfDead () {
    let lastSurvivor = this.agents[constants.POPSIZE - constants.CHILDREN - 1]

    if (lastSurvivor.fitness > this.fitness) {
      console.log(`I'm dead: ${this.id} ${this.fitness}`)
      eth.killDrone(this.account)
      return false
    }

    // remove dead agents from list
    this.agents = this.agents.slice(0, constants.POPSIZE - constants.CHILDREN)
    return true
  }

  // Adaption of tournament selections
  _determineChildrenTokens () {
    this.childrenTokens = 0
    for (let attempt = 0; attempt < constants.PROCREATE_ATTEMPS; attempt++) {
      let survided = true

      for (let tournament = 0; tournament < constants.TOURNAMENT_ATTACKERS; tournament++) {
        let attacker = sample(this.agents)

        if (this.fitness < attacker.fitness) {
          survided = false
          break
        }
      }

      if (survided) this.childrenTokens++
    }
  }

  // TODO: put on blockchain
  // PUBSUB ?
  announceChildrenTokens () {
    this._determineChildrenTokens()

    return { id: this.id, childrenTokens: this.childrenTokens }
  }

  // TODO: register from blockchain / pubsub
  registerChildrenTokens (id, childrenTokens) {
    for (let i = 0; i < childrenTokens; i++) {
      for (let j = 0; j < childrenTokens; j++) {
        this.parents.push(id)
      }
    }
  }

  announcePairs () {
    let pairs = []
    for (let i = 0; i < this.childrenTokens; i++) {
      let parent2

      while (this.parents.length > 0) {
        parent2 = sample(this.parents)

        // remove parent after selecting
        this.parents.splice(this.parents.indexOf(parent2), 1)

        // TODO: check if parent has available paring
        // TODO: retrieve DNA

        break
      }

      pairs.push([{
        id: uuidv4(),
        parent1: {
          id: this.id,
          DNA: this.DNA
        },
        parent2: {
          id: parent2,
          DNA: ''
        }
      }])
    }

    return pairs
  }

  registerPairs (pairs) {
    this.pairs = [...this.pairs, pairs]
    this.sortPairs()
  }

  // TODO: mix dna
  // TODO: publish kids
  // TODO: mutations
  procreate () {
    for (let child = 0; child < this.childrenTokens; child++) {

    }
  }
}

module.exports = Genetics
