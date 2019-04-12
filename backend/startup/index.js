// Dep == deployment; its creates the pod

const Client = require('kubernetes-client').Client
const config = require('kubernetes-client').config
const uuidv4 = require('uuid/v4')
const deploymentManifest = require('./startup-drone.json')

let globalname = 'q'.concat(uuidv4().replace(/-/g, ''))

let POPSIZE = Number(require('./constants').POPSIZE)

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

    deploymentManifest.metadata.name = globalname
    deploymentManifest.metadata.labels.app = globalname
    deploymentManifest.spec.template.metadata.labels.app = globalname
    deploymentManifest.spec.selector.app = globalname
    deploymentManifest.spec.selector.matchLabels.app = globalname

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

  return globalname
}

for (let i = 0; i < POPSIZE; i++) {
  deploy().then(name => {
    console.log(`Deployed: ${name} index: ${i}`)
  }).catch(e => {
    console.log(`Failed to deploy; index: ${i}`)
  })
}
