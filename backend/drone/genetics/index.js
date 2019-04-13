const sample = require('lodash.sample')

const constants = require('../constants')
const normalRandom = require('./helper/normalRandom')
const deployChild = require('../k8s/deploy')
const fetch = require('node-fetch')
const announce = require('./helper/announce')

const uuidv4 = require('uuid/v4')
const utils = require('web3-utils')

module.exports = function (store) {
  return new class Genetics {
    constructor () {
      this.isDead = false

      this.agents = {}
      this.childrenTokens = 0
      this.parents = []

      this.pairs = []
    }

    async setAgents () {
      let result = await fetch(`${constants.WORLD_URL}/drone/list/alive`)
        .then(res => res.json())
        .catch(e => {
          console.warn('Setting failed', e)
          return []
        })

      for (const a of result) {
        this.agents[a.address] = {
          dna: utils.hexToUtf8(a.dna[0]), // TODO: change it being an array in future; and not bytes
          id: a.address
        }
      }
    }

    _removeAgent (a) {
      delete this.agents[a.id]
    }

    _removeAgents (agent) {
      for (const a of agent) {
        this._removeAgent(a)
      }
    }

    async announceFitness () {
      console.log('Announcing fitness')
      let [, dead] = await announce('fitness', this.agents, { id: store.id, fitness: store.fitness })
      this._removeAgents(dead)
    }

    registerFitness (id, fitness) {
      this.agents[id] = {
        ...this.agents[id],
        fitness,
        id
      }
    }

    // TODO: kill pod
    async checkIfDead () {
      console.log('Checking if dead')
      let sortedFitness = Object.values(this.agents).sort((a, b) => a.fitness - b.fitness)
      let lastSurvivor = sortedFitness[constants.POPSIZE - constants.CHILDREN - 1]

      if (lastSurvivor && lastSurvivor.fitness > store.fitness) {
        console.log(`I'm dead: ${store.id} ${store.fitness}`)
        await store.eth.killDrone()
        return false
      }

      // remove dead agents from list
      let deadDrones = sortedFitness.slice(constants.POPSIZE - constants.CHILDREN)
      this._removeAgents(deadDrones)

      return true
    }

    // Adaption of tournament selections
    async announceChildrenTokens () {
      console.log('Announcing Children tokens')

      this.childrenTokens = 0
      for (let attempt = 0; attempt < constants.PROCREATE_ATTEMPS; attempt++) {
        let survided = true

        for (let tournament = 0; tournament < constants.TOURNAMENT_ATTACKERS; tournament++) {
          let attacker = sample(this.agents)

          if (attacker && store.fitness < attacker.fitness) {
            survided = false
            break
          }
        }

        if (survided) this.childrenTokens++
      }

      this.childrenTokens = 10

      let [, dead] = await announce('childrenTokens', this.agents, { id: store.id, childrenTokens: this.childrenTokens })
      this._removeAgents(dead)
    }

    registerChildrenTokens (id, childrenTokens) {
      for (let i = 0; i < childrenTokens; i++) {
        for (let j = 0; j < childrenTokens; j++) {
          if (!this.agents[id]) return
          this.parents.push(id)
        }
      }
    }

    async announcePairs () {
      console.log('Announcing pairs')
      let pairs = []

      for (let i = 0; i < this.childrenTokens; i++) {
        let parent2

        parent2 = sample(this.parents)

        // remove parent after selecting
        this.parents.splice(this.parents.indexOf(parent2), 1)

        pairs.push({
          id: uuidv4(),
          parent1: {
            id: store.id,
            DNA: store.DNA
          },
          parent2: {
            id: parent2,
            DNA: this.agents[parent2].dna
          }
        })
      }

      if (this.pairs.length === 0) {
        return
      }

      let [, dead] = await announce('pairs', this.agents, { pairs })
      this._removeAgents(dead)

      // Register your own pairs too
      this.registerPairs(pairs)
    }

    registerPairs (pairs) {
      this.pairs = [...this.pairs, ...pairs]

      if (this.pairs.length > 0) {
        this.procreate()
      }
    }

    procreate () {
      console.log('Procreating')
      if (this.pairs.length === 0) return

      let sortedPairs = Object.values(this.pairs).sort((a, b) => a.id - b.id)
      let lastSurvingPair = sortedPairs[constants.CHILDREN - 1]
      let yourPairs = this.pairs.filter(p => p.parent1.id === store.id)
      let survivingPairs = yourPairs.filter(p => !lastSurvingPair || p.id > lastSurvingPair)

      console.log(survivingPairs)

      let deployments = []
      for (const pair of survivingPairs) {
        let newDNA = this._mutation(this._binaryCrossover(pair.parent1.DNA, pair.parent2.DNA))
        console.log('NEW DNA, ', newDNA)

        deployments.push(() => {
          console.log('Creating new child')
          return deployChild(newDNA, pair.parent1.id, pair.parent2.id)
        })
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
