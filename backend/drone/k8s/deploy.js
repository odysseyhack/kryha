/* eslint no-console:0 */
//
// Demonstrate some of the basics.
//

const Client = require('kubernetes-client').Client
const config = require('kubernetes-client').config
const uuidv4 = require('uuid/v4')
const deploymentManifest = require('./pod.json')

async function deploy (DNA, parent1, parent2) {
  let name = 'q'.concat(uuidv4().replace(/-/g, ''))
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

    deploymentManifest.metadata.name = name
    deploymentManifest.metadata.labels.app = name
    deploymentManifest.spec.template.metadata.labels.app = name
    deploymentManifest.spec.selector.app = name
    deploymentManifest.spec.selector.matchLabels.app = name

    let env = deploymentManifest.spec.template.spec.containers[0].env
    env = env.filter(e => ['DNA', 'PARENT1', 'PARENT2'].indexOf(e.name) < 0)

    deploymentManifest.spec.template.spec.containers[0].env = [...env, {
      name: 'DNA',
      value: DNA
    }, {
      name: 'PARENT1',
      value: parent1
    }, {
      name: 'PARENT2',
      value: parent2
    }]

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
