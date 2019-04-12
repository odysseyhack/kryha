const register = require('./k8s/register')

const eth = require('./helper/eth')

async function main () {
  let account = await eth.newAccount()

  // Register on k8s
  register(account.address)
}

main()
