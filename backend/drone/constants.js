module.exports = {
  POPSIZE: 50,
  CHILDREN: 10,
  PROCREATE_ATTEMPS: 5,
  TOURNAMENT_ATTACKERS: 1,
  DNA_SIZE: 7,
  MUTATION_RATE: parseFloat(process.env.MUTATION_RATE) || 0.01,
  MINUS_CHANCE: parseFloat(process.env.MINUS_CHANCE) || 0.5,
  PORT: Number(process.env.PORT) || 3000,
  DNA: process.env.DNA || 'eefdede',
  PARENT1: process.env.PARENT1 || '0x0000000000000000000000000000000000000000',
  PARENT2: process.env.PARENT2 || '0x0000000000000000000000000000000000000000',
  WORLD_URL: process.env.WORLD_URL || 'http://world:9001',
  CONTRACTS_URL: process.env.CONTRACTS_URL || 'http://contracts:9002',
  ETHEREUM_URL: process.env.ETHEREUM_URL || 'http://ganache:8545',
  TRANSFERRED_AMOUNT: Number(process.env.TRANSFERRED_AMOUNT) || 1000000000,
  OWNER_PRIVATE_KEY: process.env.OWNER_PRIVATE_KEY || '0x735bf515f3a8fc16aa634574dd4bb2bf2499ea924f461c4f620403a1e45b60fe'

}
