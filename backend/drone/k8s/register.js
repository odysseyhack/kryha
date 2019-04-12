const Client = require('kubernetes-client').Client
const config = require('kubernetes-client').config
const serviceManifest = require('./service.json')

async function register (address) {
  try {
    let client
    if (process.env.CLUSTER === 'TRUE') { // within cluster
      client = new Client({ config: config.getInCluster() })
      await client.loadSpec()
    } else { // outside cluster
      client = new Client({
        config: config.fromKubeconfig(),
        version: '1.13'
      })
    }

    address = address.toLowerCase().slice(1, address.length)

    serviceManifest.metadata.name = address
    serviceManifest.metadata.labels['app'] = address
    let name = process.env.HOSTNAME.split('-', 1)[0]

    serviceManifest.spec.selector.app = name

    const create = await client.api.v1
      .namespaces('default')
      .services.post({ body: serviceManifest })

    console.log('Create: ', create)
  } catch (err) {
    console.error('Error: ', err)
  }
}

module.exports = register
