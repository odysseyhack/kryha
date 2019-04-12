const sample = require('lodash.sample')

const constants = require('../constants')
const sort = require('./helper/insertSort')

class Genetics {
  constructor (id, account) {
    this.fitness = 0
    this.isDead = false
    this.account = account
    this.id = id

    this.agents = []
    this.childrenTokens = 0
    this.parents = []

    this.sortFitness = () => sort(this.agents)
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

  // TODO: announce death on blockchain
  checkIfDead () {
    let lastSurvivor = this.agents[constants.POPSIZE - constants.CHILDREN - 1]

    if (lastSurvivor.fitness > this.fitness) {
      console.log(`I'm dead: ${this.id} ${this.fitness}`)
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
  // TODO: announce each token individually
  // PUBSUB ?
  announceChildrenTokens () {
    this._determineChildrenTokens()

    return { id: this.id, childrenTokens: this.childrenTokens }
  }

  // TODO: register from blockchain / pubsub
  registerChildrenTokens (id, childrenTokens) {
    for (let i = 0; i < childrenTokens; i++) {
      this.parents.push(id)
    }
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
