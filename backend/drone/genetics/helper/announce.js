const fetch = require('node-fetch')

async function announce (endpoint, actorIds, data) {
  let fetches = []
  for (let actor of actorIds) {
    // remove the 0
    let slicedActor = actor.slice(1)
    let uri = `http://${slicedActor}/${endpoint}`

    console.log(`Calling ${uri}`)
    fetches.push(fetch(uri, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(e => ({ success: false, response: false, id: actor, error: e }))
      .then(res => res.json())
      .catch(e => ({ success: false, response: true, id: actor, error: e }))
      .then(data => ({ success: data.success, response: true, id: actor, data }))
    )
  }

  let results = await Promise.all(fetches)
  let deadNodes = results.filter(v => !v.response)
  let aliveNodes = results.filter(v => v.response)

  for (const dead of deadNodes) {
    console.log(`Node: ${dead.id} is dead`)
  }

  for (const alive of aliveNodes) {
    if (!alive.success) {
      console.log(`Success false node: ${alive.id}; message: ${alive.message}`)
    }
  }

  return [aliveNodes, deadNodes]
}

module.exports = announce
