async function findNodeToCheck (store) {
  for (var ix = store.x; ix < (ix + 50); ix++) {
    for (var iy = store.y; iy < (iy + 50); iy++) {
      let check = await store.eth.WorldStateCheck(ix % 50, iy % 50)
      if (check === false) {
        return { x: ix % 50, y: iy % 50 }
      }
    }
  }
  return null
}

module.exports = findNodeToCheck
