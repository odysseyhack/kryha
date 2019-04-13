import express from 'express'
import cors from 'cors'
import Contract from './mongoose/contract.js'

const app = express()

app.use(cors())
app.use(express.json())

app.param('contractName', async (req, res, next, name) => {
  try {
    const contract = await Contract.findOne({ name }).exec()
    if (!contract) { return res.status(404).send('Contract Not Found') }
    res.locals.contract = contract
    next()
  } catch (error) {
    next(error)
  }
})

app.get('/:contractName', (req, res, next) => res.status(200).json(res.locals.contract))
app.get('/:contractName/networkId', (req, res, next) => res.status(200).send(res.locals.contract.networkId))
app.get('/:contractName/address', (req, res, next) => res.status(200).send(res.locals.contract.address))
app.get('/:contractName/abi', (req, res, next) => res.status(200).send(res.locals.contract.abi))

export default app
