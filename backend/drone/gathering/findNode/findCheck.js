function findNodeToCheck (store) {
  for (var ix = store.x; ix < (ix + 50); ix++) {
    for (var iy = store.y; iy < (iy + 50); iy++) {
      let check = store.eth.WorldStateCheck(ix % 50, iy % 50)
      if (check === false) {
        return (ix % 50, iy % 50)
      }
    }
  }
  return null
}

module.exports = findNodeToCheck
