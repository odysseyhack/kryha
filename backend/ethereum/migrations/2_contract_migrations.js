/* global artifacts */
const World = artifacts.require('World')
const Drone = artifacts.require('Drone')
const Contract = require('../src/mongoose/contract.js')
const constants = require('../src/constants.js')

const storeContract = async contractAbstraction => {
  const { name } = contractAbstraction
  const contract = await Contract.findOne({ name }).exec()

  if (!contract) {
    return new Contract(contractAbstraction).save()
  } else {
    return contract.update(contractAbstraction).exec()
  }
}

// grid size defined in js src
module.exports = deployer => {
  const { network_id: networkId } = deployer
  // deploy world contract
  return deployer.deploy(World, constants.WORLD_SIZE, constants.WORLD_SIZE).then(instance => {
    const { address, abi } = instance
    // check and store world contract in mongo
    storeContract({ name: 'world', networkId, address, abi })
    return deployer.deploy(Drone, World.address).then(instance => {
      const { address, abi } = instance
      // check and store drone contract in mongo
      storeContract({ name: 'drone', networkId, address, abi })
      return instance
    })
  })
}
