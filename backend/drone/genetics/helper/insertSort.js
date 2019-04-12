/**
 * https://en.wikipedia.org/wiki/Insertion_sort
 */
function insertSort (A, name) {
  let i = 1
  // let steps = 0

  while (i < A.length) {
    let j = i

    while (j > 0 && A[j - 1][name] < A[j][name]) {
      let lower = A[j]
      let upper = A[j - 1]

      A[j] = upper
      A[j - 1] = lower

      j--
      // steps++
    }

    i++
  }

  // console.log('STEPS DONE: ', steps)

  return A
}

module.exports = insertSort
