const express = require('express')
const router = express()

module.exports = function (Genetics) {
  router.get('/retrieve', (req, res) => {
    res.status(200).send({
      success: true,
      data: Genetics
    })
  })

  router.post('/fitness', (req, res) => {
    console.log('Fitness registration')
    let { id, fitness } = req.body
    Genetics.registerFitness(id, fitness)

    res.status(200).send({
      success: true
    })
  })

  router.post('/childrenTokens', (req, res) => {
    console.log('ChildrenTokens registration')
    let { id, childrenTokens } = req.body
    Genetics.registerChildrenTokens(id, childrenTokens)

    res.status(200).send({
      success: true
    })
  })

  router.post('/pairs', (req, res) => {
    console.log('Pairs registration')
    let { pairs } = req.body
    Genetics.registerPairs(pairs)

    res.status(200).send({
      success: true
    })
  })

  return router
}
