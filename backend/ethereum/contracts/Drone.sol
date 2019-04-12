pragma solidity ^0.4.23;

contract Drone{

    address WorldContract;
    address parent1;
    address parent2;
    bytes32[] dna;
    uint fitness;

    constructor(address _WorldContract, address _parent1, address _parent2, bytes32[] _dna, uint _fitness) public {
        WorldContract = _WorldContract;
        parent1 = _parent1;
        parent2 = _parent2;
        dna = _dna;
        fitness = _fitness;
    }
}