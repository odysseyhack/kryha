const sample = require('lodash.sample')

const constants = require('../constants')
const normalRandom = require('./helper/normalRandom')
const deployChild = require('../k8s/deploy')
const fetch = require('fetch-timeout')
const announce = require('./helper/announce')

const firstBy = require('thenby')
const utils = require('web3-utils')

// TODO: remove this workaround
function randomDna () {
  let s = ''
  for (let i = 0; i < 6; i++) {
    s = s.concat(String.fromCharCode(Math.round(Math.random() * 10) + 100))
  }

  return s
}

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
      let result = await fetch(`${constants.WORLD_URL}/drone/list/alive`, { method: 'get' }, 5000, 'Timout')
        .then(res => res.json())
        .catch(e => {
          console.warn('Setting failed', e)
          return []
        })

      for (const a of result) {
        let dna = a.dna[0]

        if (!dna) dna = randomDna()
        else utils.hexToUtf8(dna)

        this.agents[a.address] = {
          dna, // TODO: change it being an array in future; and not bytes
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
      let sortedFitness = Object.values(this.agents).sort(
        firstBy((a, b) => b.fitness - a.fitness)
          .thenBy((a, b) => b.id - a.id)
      )

      let lastSurvivor = sortedFitness[constants.POPSIZE - constants.CHILDREN - 1]

      if (lastSurvivor && lastSurvivor.fitness > store.fitness) {
        console.log(`I'm dead: ${store.id} ${store.fitness}`)
        await store.eth.killDrone()
        return true
      }

      // remove dead agents from list
      let deadDrones = sortedFitness.slice(constants.POPSIZE - constants.CHILDREN)
      this._removeAgents(deadDrones)

      console.log('Check if dead done')
      return false
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

      console.log('Children tokens: ', this.childrenTokens)

      let [, dead] = await announce('childrenTokens', this.agents, { id: store.id, childrenTokens: this.childrenTokens })
      this._removeAgents(dead)

      console.log('Announce children tokens done')
    }

    registerChildrenTokens (id, childrenTokens) {
      console.log('Register children tokens')
      for (let i = 0; i < childrenTokens; i++) {
        for (let j = 0; j < childrenTokens; j++) {
          if (!this.agents[id]) return
          this.parents.push(id)
        }
      }
      console.log('Register children tokens done')
    }

    async announcePairs () {
      console.log('Announcing pairs')
      let pairs = []

      for (let i = 0; i < this.childrenTokens; i++) {
        let parent2

        parent2 = sample(this.parents)

        if (!parent2) continue
        // remove parent after selecting
        this.parents.splice(this.parents.indexOf(parent2), 1)

        if (!this.agents[parent2]) continue

        pairs.push({
          id: Math.floor(Math.random() * 100000000),
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

      if (pairs.length === 0) {
        console.log('Announce pairs tokens done')
        return
      }

      let [, dead] = await announce('pairs', this.agents, { pairs })
      this._removeAgents(dead)

      // Register your own pairs too
      this.registerPairs(pairs)

      console.log('Announce pairs tokens done')
    }

    registerPairs (pairs) {
      this.pairs = [...this.pairs, ...pairs]
      console.log('Register pairs tokens done')
    }

    procreate () {
      console.log('Procreating')
      if (this.pairs.length === 0) return

      let sortedPairs = Object.values(this.pairs).sort((a, b) => b.id - a.id)
      let aliveParents = sortedPairs.filter(p => this.agents[p.parent2.id])
      let lastSurvingPair = aliveParents[constants.CHILDREN - 1]
      let yourPairs = this.pairs.filter(p => p.parent1.id === store.id)

      let survivingPairs = yourPairs.filter(p => !lastSurvingPair || p.id > lastSurvingPair.id)

      let deployments = []
      for (const pair of survivingPairs) {
        let newDNA = this._mutation(this._binaryCrossover(pair.parent1.DNA, pair.parent2.DNA))
        deployments.push(() => {
          console.log('Creating new child')
          return deployChild(newDNA, pair.parent1.id, pair.parent2.id)
        })
      }

      console.log('Procreate pairs tokens done')
      return Promise.all(deployments.map(f => f()))
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

        let value = (DNA[i].charCodeAt(0) - 100) / 10

        let minus = Math.random() > constants.MINUS_CHANCE
        let r = normalRandom()

        if (minus) value -= r
        else value += r

        if (value < 0) value = 0
        if (value > 10) value = 10

        DNA[i] = String.fromCharCode(Math.floor(value) * 10 + 100)
      }

      return DNA.join('')
    }
  }()
}
