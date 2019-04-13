const fetch = require('node-fetch')
var functions = require('../functionsDefs.json')
const constants = require('../../constants')


function calculateDistance(x1, x2, y1, y2){
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function calculateDistanceAreaVector(vec1, vec2){
    return Math.sqrt(Math.pow(vec1.air - vec2.air, 2) + 
                     Math.pow(vec1.resources - vec2.resources, 2) +
                     Math.pow(vec1.nature - vec2.nature, 2) + 
                     Math.pow(vec1.water - vec2.water, 2))
}

async function getWorld(){
    return await fetch(`http://localhost:9001/world`)
        .then(res => res.json())
        .then(res => {
            console.log(res[1])
            return res;
        });
}

function getDnaNumbers(DNA){
    let DNAnumbers = [];
    for(var i = 0; i < DNA.length; i++){
        DNAnumbers.push(DNA.charCodeAt(i) / 10);
    }
    return DNAnumbers;

}

function normalizeVector(vec){
    nomFac = Math.sqrt(Math.pow(vec.air, 2) + Math.pow(vec.water, 2) + Math.pow(vec.nature, 2) + Math.pow(vec.resources, 2))
    vec.air = vec.air / nomFac
    vec.water = vec.water / nomFac
    vec.resources = vec.resources / nomFac
    vec.nature = vec.nature / nomFac
    return vec;
}

function calculateFunctionScore(score, func, point){
    point = normalizeVector(point);
    func = normalizeVector(func)
    idealVec = { air: 1, resources: 1, water: 1, nature: 1 }

    
    newVec = {air: point.air + func.air * score, resources: point.resources + func.resources * score, water: point.water + func.water * score, nature: point.nature + func.nature * score}

    let a = calculateDistanceAreaVector(newVec, idealVec);
    let b = calculateDistanceAreaVector(point, idealVec);

    return b - a
}



// function calculateFunctionScore(score, func, point){
//     let totalResources = point.water + point.air + point.resources + point.nature;
//     let calc = 0;
//     let count = 0;
//     // console.log(normalizeVector(point));
//     nomFunc = func
//     nomPoint = point
//     if (score === 0){
//         return 0;
//     }
//     if (nomFunc.air < 0){
//         if (nomPoint.air === 0 ){
//             calc += nomPoint.air - (nomFunc.air * score)
//         } else {
//             calc += nomPoint.air - (nomFunc.air * score)
//         }
//         count += 1;
//     } else if (nomFunc.air > 0) {
//         if (nomPoint.air === 0) {
//             calc += nomPoint.air + (nomFunc.air * score)
//         } else {
//             calc += nomPoint.air + (nomFunc.air * score)
//         }
//         count += 1;
//     }
//     if (nomFunc.resources < 0){
//         if (nomPoint.resources === 0){
//             calc += nomPoint.resources - (nomFunc.resources * score)
//         } else {
//             calc += nomPoint.resources - (nomFunc.resources * score)
//         }
//         count += 1;
//     } else if (nomFunc.resources > 0) {
//         if (nomPoint.resources === 0){
//             calc += nomPoint.resources + (nomFunc.resources * score)
//         } else {
//             calc += nomPoint.resources + (nomFunc.resources * score)
//         }
//         count += 1;
//     }
//     if (func.water < 0){
//         if (point.water == 0) {
//             calc -= 1;
//         } else {
//             calc += func.water * score / point.water
//         }
//         count += 1;
//     } else if (func.water > 0) {
//         if (point.water == 0) {
//             calc += 1;
//         } else {
//             calc += func.water * score / point.water
//         }
//         count += 1;
//     }
//     if (func.nature < 0){
//         if (point.nature == 0){
//             calc -= 1;
//         } else {
//             calc += func.nature * score / point.nature

//         }
//         count += 1;
//     } else if (func.nature > 0) {
//         if (point.nature == 0){
//             calc += 1;
//         } else {
//             calc += func.nature * score / point.nature
//         }
//         count += 1;
//     }
//     // console.log(calc)
//     let fit = calc / count;
//     return fit;
// }

async function findClosestNode(ownX, ownY, DNA){
    const worldPoints = await getWorld();
    const DNAnumbers = getDnaNumbers(DNA);
    let pointFitness = [];
    worldPoints.forEach(point => {
        let funcCalc = 0;
        let distance = calculateDistance(ownX / 50, point.x / 50, ownY / 50, point.y / 50)
        let totalResources = point.water + point.air + point.resources + point.nature;
        for(var i = 0; i < functions.length; i++){
            funcCalc += calculateFunctionScore(DNAnumbers[i], functions[i], point);
        }
        let fitness = (funcCalc / functions.length) - (distance * 0.01);
        pointFitness.push({fit: fitness, x: point.x, y: point.y})
    });
    var maxFit = 0;
    var maxObj = null;

    pointFitness.map(function(obj){
        if (obj.fit > maxFit) maxObj = obj;
    })

    return maxObj;
}

console.log(findClosestNode(10, 10, 'asdsdsds'))
console.log(calculateFunctionScore(1, {air: 0, resources: 0, water: -100, nature: 200}, {air: 0, resources: 0, water: 300, nature: 1000000}))

module.exports = findClosestNode