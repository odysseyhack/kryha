pragma solidity ^0.4.23;

contract Drone{

    address WorldContract;
    address parent1;
    address parent2;
    bytes32[] dna;
    uint fitness;

    event NewDrone(address indexed drone, address parent1, address parent2, bytes32[] dna);
    event DroneDies(address indexed drone);

    struct DroneStruct{
        address parent1;
        address parent2;
        bytes32[] dna;
    }
    mapping(address => DroneStruct) public idToDrone;


    constructor(address _WorldContract) public {
        WorldContract = _WorldContract;
    }

    function createDrone(address _parent1, address _parent2, bytes32[] _dna) public {
        idToDrone[msg.sender] = DroneStruct(_parent1, _parent2, _dna);
        emit NewDrone(msg.sender, _parent1, _parent2, _dna);
    }
    
    function killDrone() public {
        delete idToDrone[msg.sender];
        emit DroneDies(msg.sender);
    }

    function getParent1(address _drone) public view returns(address){
        return idToDrone[_drone].parent1;
    }

    function getParent2(address _drone) public view returns(address){
        return idToDrone[_drone].parent2;
    }

    function getDna(address _drone) public view returns(bytes32[]){
        return idToDrone[_drone].dna;
    }
}