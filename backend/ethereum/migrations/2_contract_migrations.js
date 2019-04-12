const World = artifacts.require("World");

// TODO: Add constants world size.
module.exports = function(deployer) {
    deployer.deploy(World, 50, 50);
};