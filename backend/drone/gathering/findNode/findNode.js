// const fetch = require('fetch')
var functions = require('../functionsDefs.json')

function calculateDistance(x1, x2, y1, y2){
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function getWorld(){
    // return fetch('localhost:9001/world')
    //     .then(res => res.json())
    //     .then(res => {
    //         console.log(res)
    //         return res;
    //     });
    return null;
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

// function calculateFunctionScore(score, func, point){
//     point = normalizeVector(point);
//     func = normalizeVector(func)
    
//     newVec = {air: point.air + func.air * score, resources: point.resources + func.resources * score, water: point.water + func.water * score, nature: point.nature + func.nature * score}
//     console.log("newVec", normalizeVector(newVec));
//     console.log("Point", point)
//     console.log()
// }



function calculateFunctionScore(score, func, point){
    let totalResources = point.water + point.air + point.resources + point.nature;
    let calc = 0;
    let count = 0;
    console.log(normalizeVector(point));
    nomFunc = normalizeVector(func);
    nomPoint = normalizeVector(point);
    if (score === 0){
        return 0;
    }
    if (nomFunc.air < 0){
        if (nomPoint.air === 0 ){
            calc += nomPoint.air - (nomFunc.air * score)
        } else {
            calc += nomPoint.air - (nomFunc.air * score)
        }
        count += 1;
    } else if (nomFunc.air > 0) {
        if (nomPoint.air === 0) {
            calc += nomPoint.air + (nomFunc.air * score)
        } else {
            calc += nomPoint.air + (nomFunc.air * score)
        }
        count += 1;
    }
    if (nomFunc.resources < 0){
        if (nomPoint.resources === 0){
            calc += nomPoint.resources - (nomFunc.resources * score)
        } else {
            calc += nomPoint.resources - (nomFunc.resources * score)
        }
        count += 1;
    } else if (nomFunc.resources > 0) {
        if (nomPoint.resources === 0){
            calc += nomPoint.resources + (nomFunc.resources * score)
        } else {
            calc += nomPoint.resources + (nomFunc.resources * score)
        }
        count += 1;
    }
    if (func.water < 0){
        if (point.water == 0) {
            calc -= 1;
        } else {
            calc += func.water * score / point.water
        }
        count += 1;
    } else if (func.water > 0) {
        if (point.water == 0) {
            calc += 1;
        } else {
            calc += func.water * score / point.water
        }
        count += 1;
    }
    if (func.nature < 0){
        if (point.nature == 0){
            calc -= 1;
        } else {
            calc += func.nature * score / point.nature

        }
        count += 1;
    } else if (func.nature > 0) {
        if (point.nature == 0){
            calc += 1;
        } else {
            calc += func.nature * score / point.nature
        }
        count += 1;
    }
    console.log(calc)
    let fit = calc / count;
    return fit;
}

function findClosestNode(ownX, ownY, DNA){
    const worldPoints = getWorld();
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

console.log(calculateFunctionScore(1, {air: 200, resources: -200, water: 0, nature: 0}, {air: 100, resources: 10000, water: 0, nature: 0}))

module.exports = findClosestNode