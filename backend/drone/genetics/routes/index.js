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
    let { id, fitness } = req.body
    Genetics.registerFitness(id, fitness)

    res.status(200).send({
      success: true
    })
  })

  router.post('/childrenTokens', (req, res) => {
    let { id, childrenTokens } = req.body
    Genetics.registerChildrenTokens(id, childrenTokens)

    res.status(200).send({
      success: true
    })
  })

  return router
}
