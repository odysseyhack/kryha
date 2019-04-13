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
  for (let i = 0; i < funcs.length; i++) {
    await store.eth.mineResources(store.x, store.y, funcs[i].air * dnaNum[i], funcs[i].resources * dnaNum[i], funcs[i].nature * dnaNum[i], funcs[i].water * dnaNum[i])
  }
}

module.exports = mine
