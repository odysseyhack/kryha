const sample = require('lodash.sample')

const constants = require('../constants')
const normalRandom = require('./helper/normalRandom')
const deployChild = require('../k8s/deploy')

const uuidv4 = require('uuid/v4')

module.exports = function (store) {
  return new class Genetics {
    constructor () {
      this.isDead = false

      this.agents = {}
      this.childrenTokens = 0
      this.parents = []

      this.pairs = []
    }

    // TODO: put on blockchain
    // PUBSUB ?
    announceFitness () {
      this._calculateFitness()
      return { id: store.id, fitness: store.fitness }
    }

    // TODO: register from blockchain
    // PUBSUB ?
    registerFitness (id, fitness, DNA) {
      this.agents[id] = {
        ...this.agents[id],
        fitness,
        id,
        DNA
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

        parent2 = sample(this.parents)

        // remove parent after selecting
        this.parents.splice(this.parents.indexOf(parent2), 1)

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

    procreate () {
      let sortedPairs = Object.values(this.pairs).sort((a, b) => a.id - b.id)
      let lastSurvingPair = sortedPairs[constants.CHILDREN - 1]
      let yourPairs = this.pairs.filter(p => p.parent1.id === store.id)
      let survivingPairs = yourPairs.filter(p => p.id > lastSurvingPair)

      let deployments = []
      for (const pair of survivingPairs) {
        let newDNA = this._mutation(this._binaryCrossover(pair.parent1.DNA, pair.parent2.DNA))
        deployments.push(deployChild(newDNA))
      }

      return Promise.all(deployments)
    }

    _binaryCrossover (DNA1, DNA2) {
      if (DNA1.length !== DNA2.length) throw new Error('DNA strings have unequal size')

      let childDNA = ''
      for (let i = 0; i < DNA1.length; i++) {
        let element1 = DNA1[i]
        let element2 = DNA2[i]

        if (Math.random() > 0.5) {
          childDNA += element1
        } else {
          childDNA += element2
        }
      }

      return childDNA
    }

    _mutation (DNA) {
      DNA = DNA.split('')

      for (let i = 0; i < DNA.length; i++) {
        let chance = Math.random()

        if (chance > constants.MUTATION_RATE) {
          continue
        }

        let value = DNA[i].charCodeAt(0) / 10

        let minus = Math.random() > constants.MINUS_CHANCE
        let r = normalRandom()

        if (minus) value -= r
        else value += r

        if (value < 0) value = 0
        if (value > 10) value = 10

        DNA[i] = String.fromCharCode(Math.floor(value) * 10)
      }

      return DNA.join('')
    }
  }()
}
