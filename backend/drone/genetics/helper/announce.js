const fetch = require('fetch-timeout')

async function announce (endpoint, actors, data) {
  let actorIds = Object.keys(actors)

  let fetches = []

  for (let actor of actorIds) {
    // remove the 0
    let slicedActor = actor.slice(1).toLowerCase()
    let uri = `http://${slicedActor}:3000/genetic/${endpoint}`

    console.log(`Calling ${uri} with ${data}`)
    fetches.push(fetch(uri, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, 5000, 'Timeout')
      .then(async res => {
        if (res.status !== 200) throw new Error('Not OK')
        let data = await res.json()
        return { success: data.success, response: true, id: actor, data }
      })
      .catch(e => ({ success: false, response: false, id: actor, error: e }))
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
