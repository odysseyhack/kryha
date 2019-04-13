Gathering and moving functions; depending on DNA enabled
TODO:
Jump sometimes to undiscoverd nodes.
Jump to undiscoverd nodes, if fitness is negative.

| Function                 | Air | Water | Resources | Nature |
|--------------------------|-----|-------|-----------|--------|
| AirFromNature            | +   |       |           | -      |
| PlantFromWaterAndAir     | -   | -     |           | ++     |
| WaterFromResources       |     | ++    | -         |        |
| AirFromWater             | +   | -     |           |        |
| AirFromResources         | +   |       | -         |        |
| ResourcesFromNature      |     |       | +         | --     |
| WaterFromNature          |     | +     |           | -      |
|                          |     |       |           |        |
|                          |     |       |           |        |
|                          |     |       |           |        |