const sample = require('lodash.sample')

const constants = require('../constants')
const sort = require('./helper/insertSort')

const uuidv4 = require('uuid/v4')

module.exports = function (store) {
  return new class Genetics {
    constructor () {
      this.isDead = false

      this.agents = {}
      this.childrenTokens = 0
      this.parents = []

      this.pairs = []

      this.sortPairs = () => sort(this.pairs, 'id')
    }

    // TODO: put on blockchain
    // PUBSUB ?
    announceFitness () {
      this._calculateFitness()
      return { id: store.id, fitness: store.fitness }
    }

    // TODO: register from blockchain
    // PUBSUB ?
    registerFitness (id, fitness) {
      this.agents[id] = {
        ...this.agents[id],
        fitness,
        id
      }
    }

    async checkIfDead () {
      let sortedFitness = Object.values(this.agents).sort((a, b) => a.fitness - b.fitness)
      let lastSurvivor = sortedFitness[constants.POPSIZE - constants.CHILDREN - 1]

      if (lastSurvivor.fitness > store.fitness) {
        console.log(`I'm dead: ${store.id} ${store.fitness}`)
        await store.eth.killDrone()
        return false
      }

      // remove dead agents from list
      let deadDrones = sortedFitness[constants.POPSIZE - constants.CHILDREN]
      for (const dead of deadDrones) {
        delete this.agents[dead.id]
      }

      return true
    }

    // Adaption of tournament selections
    _determineChildrenTokens () {
      this.childrenTokens = 0
      for (let attempt = 0; attempt < constants.PROCREATE_ATTEMPS; attempt++) {
        let survided = true

        for (let tournament = 0; tournament < constants.TOURNAMENT_ATTACKERS; tournament++) {
          let attacker = sample(this.agents)

          if (store.fitness < attacker.fitness) {
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

      return { id: store.id, childrenTokens: this.childrenTokens }
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
            id: store.id,
            DNA: store.DNA
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
  }()
}
