// Dep == deployment; its creates the pod

const Client = require('kubernetes-client').Client
const config = require('kubernetes-client').config
const uuidv4 = require('uuid/v4')
const deploymentManifest = require('./startup-drone.json')

let POPSIZE = Number(require('./constants').POPSIZE)

function randomDna () {
  let s = ''
  for (let i = 0; i < 6; i++) {
    s = s.concat(String.fromCharCode(Math.round(Math.random() * 10) + 100))
  }

  return s
}

async function deploy () {
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
      value: randomDna()
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

  return name
}

for (let i = 0; i < POPSIZE; i++) {
  deploy().then(name => {
    console.log(`Deployed: ${name} index: ${i}`)
  }).catch(e => {
    console.log(`Failed to deploy; index: ${i}`)
  })
}
