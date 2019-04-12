const express = require('express')
const app = express()

const register = require('./k8s/register')
const eth = require('./helper/eth')
const GeneticsC = require('./genetics')

const PORT = process.env.PORT || 3000
const DNA = process.env.DNA || 'DEFAULTDNA'

const PARENT1 = process.env.PARENT1 || '0x0000000000000000000000000000000000000000'
const PARENT2 = process.env.PARENT2 || '0x0000000000000000000000000000000000000000'

async function main () {
  let account = await eth.newAccount()

  // Register on k8s and blockchain
  register(account.address)
  eth.createDrone(account, PARENT1, PARENT2, DNA)

  const Genetics = new GeneticsC(account.address.slice(1), DNA, account)

  let geneticRoutes = require('./genetics/routes')(Genetics)

  app.use('/genetic/', geneticRoutes)

  app.get('/health', (req, res) => {
    res.send('Hello, World!')
  })

  app.listen(PORT, (err) => {
    if (err) {
      console.err(err.stack)
    } else {
      console.log(`App listening on port ${PORT} [${process.env.NODE_ENV} mode]`)
    }
  })
}

main()
