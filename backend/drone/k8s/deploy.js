/* eslint no-console:0 */
//
// Demonstrate some of the basics.
//

const Client = require('kubernetes-client').Client
const config = require('kubernetes-client').config
const uuidv4 = require('uuid/v4')
const deploymentManifest = require('./pod.json')

let global = 'q'.concat(uuidv4().replace(/-/g, ''))

async function deploy () {
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

    //
    // Get all the Namespaces.
    //
    const namespaces = await client.api.v1.namespaces.get()
    console.log('Namespaces: ', namespaces)
    // console.log(client.apis.apps.v1.namespaces('default'))

    deploymentManifest.metadata.name = global
    deploymentManifest.metadata.labels.app = global
    deploymentManifest.spec.template.metadata.labels.app = global
    deploymentManifest.spec.selector.app = global
    deploymentManifest.spec.selector.matchLabels.app = global

    console.log(deploymentManifest.spec.template)
    // Create a new Deployment.

    const create = await client.apis.apps.v1
      .namespaces('default')
      .deployments.post({ body: deploymentManifest })
    console.log('Create: ', create)

    // Fetch the Deployment we just created.

    const deployment = await client.apis.apps.v1
      .namespaces('default')
      .deployments(deploymentManifest.metadata.name)
      .get()
    console.log('Deployment: ', deployment)
  } catch (err) {
    console.error('Error: ', err)
  }
}

module.exports = deploy
