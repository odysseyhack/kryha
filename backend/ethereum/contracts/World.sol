pragma solidity ^0.5.0;


contract World {

    uint xSize;
    uint ySize;

    uint private WorldSize;
    uint private DiscoveredNodes;

    int public WorldAir;
    int public WorldResources;
    int public WorldNature;
    int public WorldWater;

    event E_FoundResources(uint x, uint y, int air, int resources, int nature, int water);
    event E_MineResources(uint x, uint y, int air, int resources, int nature, int water);

    struct WorldState{
        int air;
        int resources;
        int nature;
        int water;
        bool exists;
    }

    mapping (uint => WorldState) public getWorldState;

    constructor(uint _xSize, uint _ySize) public{
        xSize = _xSize;
        ySize = _ySize;
        WorldAir = 0;
        WorldResources = 0;
        WorldNature = 0;
        WorldWater = 0;
        WorldSize = _xSize * _ySize;
        DiscoveredNodes = 0;
    }

    function transformCoordinates(uint _x, uint _y) internal view returns (uint){
        uint place = _x * ySize + _y;
        return place;
    }

    function addWorldState( uint _x, uint _y, int _air, int _resources, int _nature, int _water) external {
        
        uint place = transformCoordinates(_x, _y);
        require(getWorldState[place].exists == false, "WorldState already discoverd");
        getWorldState[place] = WorldState(_air, _resources, _nature, _water, true);
        WorldAir += _air;
        WorldResources += _resources;
        WorldNature += _nature;
        WorldWater += _water;
        DiscoveredNodes += 1;
        emit E_FoundResources(_x, _y, _air, _resources, _nature, _water);
    }

    function mineResources( uint _x, uint _y, int _air, int _resources, int _nature, int _water) external {
        uint place = transformCoordinates(_x, _y);
        WorldState storage worldState = getWorldState[place];
        require(worldState.exists == true, "No WorldState is found");
        int newAir = worldState.air + _air;
        require(newAir > 0, "After mining not enough air");
        int newResources = worldState.resources + _resources;
        require(newResources > 0, "After mining not enough resources");
        int newNature = worldState.nature + _nature;
        require(newNature > 0, "After mining not enough nature");
        int newWater = worldState.water + _water;
        require(newWater > 0, "After mining not enough water");
        worldState.air = newAir;
        worldState.resources = newResources;
        worldState.nature = newNature;
        worldState.water = newWater;
        WorldAir += newAir;
        WorldResources += newResources;
        WorldNature += newNature;
        WorldWater += newWater;
        emit E_MineResources(_x, _y, _air, _resources, _nature, _water);
    }

    function getDiscoveredWorldSize() external view returns (uint, uint) {
        return (DiscoveredNodes, WorldSize);
    }

}