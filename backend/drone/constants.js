module.exports = {
  POPSIZE: 100,
  CHILDREN: 20,
  PROCREATE_ATTEMPS: 5,
  TOURNAMENT_ATTACKERS: 3,
  PORT: process.env.PORT || 3000,
  DNA: process.env.DNA || 'DEFAULTDNA',
  PARENT1: process.env.PARENT1 || '0x0000000000000000000000000000000000000000',
  PARENT2: process.env.PARENT2 || '0x0000000000000000000000000000000000000000',
  WORLD_URL: process.env.WORLD_URL || 'http://world:9001'
}
