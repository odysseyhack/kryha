const fetch = require('fetch')
import * as functions from '../functionsDefs.json'

function calculateDistance(x1, x2, y1, y2){
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function getWorld(){
    return fetch('localhost:9001/world')
        .then(res => res.json())
        .then(res => {
            console.log(res)
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

function calculateFunctionScore(score, func, point){
    let totalResources = point.water + point.air + point.resources + point.nature;
    let calc = 0;
    let count = 0;
    if (func.air < 0){
        if (point.air == 0 ){
            calc -= 1;
        } else {
            calc += func.air * score / point.air
        }
        count += 1;
    } else if (func.air > 0) {
        if (point.air == 0) {
            calc += 1;
        } else {
            calc += func.air * score / point.air
        }
        
        count += 1;
    }
    if (func.resources < 0){
        calc -= func.resources * score / point.resources
        count += 1;
    } else if (func.resources > 0) {
        calc += func.resources * score / point.air
        count += 1;
    }
    if (func.water < 0){
        calc -= func.water * score / point.water
        count += 1;
    } else if (func.air > 0) {
        calc += func.water * score / point.water
        count += 1;
    }
    if (func.nature < 0){
        calc -= func.nature * score / point.nature
        count += 1;
    } else if (func.nature > 0) {
        calc += func.nature * score / point.nature
        count += 1;
    }
    return calc / count;
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

module.exports = findClosestNode