const fetch = require('node-fetch')
var functions = require('../functionsDefs.json')
const constants = require('../../constants')

function calculateDistance (x1, x2, y1, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function calculateDistanceAreaVector (vec1, vec2) {
  return Math.sqrt(Math.pow(vec1.air - vec2.air, 2) +
                     Math.pow(vec1.resources - vec2.resources, 2) +
                     Math.pow(vec1.nature - vec2.nature, 2) +
                     Math.pow(vec1.water - vec2.water, 2))
}

async function getWorld () {
  return fetch(`${constants.WORLD_URL}/world/discovered`)
    .then(res => res.json())
    .then(res => {
      return res
    })
}

function getDnaNumbers(DNA){
    let DNAnumbers = [];
    for(var i = 0; i < DNA.length; i++){
        DNAnumbers.push((DNA.charCodeAt(i) - 100) / 10);
    }
    return DNAnumbers;

}

function normalizeVector (vec) {
  let nomFac = Math.sqrt(Math.pow(vec.air, 2) + Math.pow(vec.water, 2) + Math.pow(vec.nature, 2) + Math.pow(vec.resources, 2))
  vec.air = vec.air / nomFac
  vec.water = vec.water / nomFac
  vec.resources = vec.resources / nomFac
  vec.nature = vec.nature / nomFac
  return vec
}

function calculateFunctionScore (score, func, point) {
  point = normalizeVector(point)
  func = normalizeVector(func)
  let idealVec = { air: 0.5, resources: 0.5, water: 0.5, nature: 0.5 }
  let newVec = { air: point.air + func.air * score, resources: point.resources + func.resources * score, water: point.water + func.water * score, nature: point.nature + func.nature * score }

  let a = calculateDistanceAreaVector(newVec, idealVec)
  let b = calculateDistanceAreaVector(point, idealVec)

  return b - a
}

async function findClosestNode (ownX, ownY, DNA) {
  const worldPoints = await getWorld()
  const DNAnumbers = getDnaNumbers(DNA)
  let pointFitness = []
  let funcVar = functions.array
  worldPoints.forEach(point => {
    let funcCalc = 0
    let totalResources = point.water + point.air + point.resources + point.nature
    for (var i = 0; i < funcVar.length; i++) {
      funcCalc += calculateFunctionScore(DNAnumbers[i], funcVar[i], point)
    }
    let fitness = (funcCalc / funcVar.length)

    pointFitness.push({ fit: fitness, x: point.x, y: point.y })
  })
  var maxFit = 0
  var maxObj = null

  pointFitness.map(function (obj) {
    if (obj.fit > maxFit) maxObj = obj
  })

  return maxObj
}

console.log(findClosestNode(0, 0, 'fgjdddd'))

module.exports = findClosestNode
