const World = artifacts.require("World");
const Drone = artifacts.require("Drone");

// TODO: Add constants world size.
module.exports = function(deployer) {
    deployer.deploy(World, 50, 50).then(function(){
        return deployer.deploy(Drone, World.address);
    });
};