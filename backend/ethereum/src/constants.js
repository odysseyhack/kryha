module.exports.API_PORT = process.env.API_PORT || 9002
module.exports.MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/contracts'
module.exports.ETHEREUM_PROTOCOL = process.env.ETHEREUM_PROTOCOL || 'ws'
module.exports.ETHEREUM_HOST = process.env.ETHEREUM_HOST || 'localhost'
module.exports.ETHEREUM_PORT = process.env.ETHEREUM_PORT || 8545
module.exports.ETHEREUM_URL = process.env.ETHEREUM_URL || `${module.exports.ETHEREUM_PROTOCOL}://${module.exports.ETHEREUM_HOST}:${module.exports.ETHEREUM_PORT}`
module.exports.ETHEREUM_WEBSOCKETS = module.exports.ETHEREUM_PROTOCOL === 'ws'
module.exports.WORLD_SIZE = process.env.WORLD_SIZE || 100
