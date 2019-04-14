var functions = require('../functionsDefs.json')

function getDnaNumbers (DNA) {
  let DNAnumbers = []
  for (var i = 0; i < DNA.length; i++) {
    DNAnumbers.push((DNA.charCodeAt(i) - 100) / 10)
  }
  return DNAnumbers
}

async function mine (store) {
  let dnaNum = getDnaNumbers(store.DNA)
  const funcs = functions.array
  let newState = { air: 0, resources: 0, nature: 0, water: 0 }
  for (let i = 0; i < funcs.length; i++) {
    newState.air += Math.ceil(funcs[i].air * dnaNum[i])
    newState.resources += Math.ceil(funcs[i].resources * dnaNum[i])
    newState.nature += Math.ceil(funcs[i].nature * dnaNum[i])
    newState.water += Math.ceil(funcs[i].water * dnaNum[i])
  }

  console.log(newState)

  await store.eth.mineResources(store.x, store.y, newState.air, newState.resources, newState.nature, newState.water)
}

module.exports = mine
