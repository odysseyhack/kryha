/* global artifacts */
const World = artifacts.require('World')
const Drone = artifacts.require('Drone')
const Contract = require('../src/mongoose/contract.js')
const constants = require('../src/constants.js')
// grid size defined in js src
module.exports = deployer => {
  const { network_id: networkId } = deployer
  // deploy world contract
  return deployer.deploy(World, constants.WORLD_SIZE, constants.WORLD_SIZE).then(instance => {
    const { address, abi } = instance
    // store contract in mongo
    return new Contract({ name: 'world', networkId, address, abi }).save().then(contract => {
      // deploy drone contract
      return deployer.deploy(Drone, contract.address).then(instance => {
        const { address, abi } = instance
        // store contract in mongo
        return new Contract({ name: 'drone', networkId, address, abi }).save()
      })
    })
  })
}
