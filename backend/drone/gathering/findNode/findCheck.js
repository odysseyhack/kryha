async function findNodeToCheck (store) {
  let i = 0
  while (true) {
    let x = Math.round(Math.random() * 100)
    let y = Math.round(Math.random() * 100)

    let check = await store.eth.WorldStateChecked(x, y)

    if (!check) {
      return { x, y }
    }

    i++

    if (i > 200) {
      break
    }
  }

  return { x: store.x, y: store.y }
}

module.exports = findNodeToCheck
