const fetch = require('node-fetch')
const constants = require('../../constants')
const { URL, URLSearchParams } = require('url')

async function getPoint (x, y) {
  let param = { x: x, y: y }
  let url = new URL(`${constants.WORLD_URL}/world/point/`)
  url.search = new URLSearchParams(param)
  return fetch(url)
    .then(res => res.json())
    .then(res => {
      return res
    })
}

async function locate (store) {
  const point = await getPoint(store.x, store.y)
  await store.eth.addWorldState(store.x, store.y, point.air, point.resources, point.nature, point.water)
}

module.exports = locate
