async function findNodeToCheck (store) {
  for (var ix = store.x; ix < (ix + 100); ix++) {
    for (var iy = store.y; iy < (iy + 100); iy++) {
      let check = await store.eth.WorldStateCheck(ix % 100, iy % 100)
      if (check === false) {
        return { x: ix % 100, y: iy % 100 }
      }
    }
  }
  return null
}

module.exports = findNodeToCheck
