/// <reference path="../../typings/bluebird/bluebird.d.ts" />

const Promise = require('bluebird');

// all the supported availability checkers we support
// each checker should return a Promise<boolean>
const avails = {
    "github": () => {}
}

/**
 * Checks if the given request object has a valid service
 * parameter set
 */
function isService (req, res, next) {
    if (typeof(req.params.service) !== "undefined" && Object.keys(avails).indexOf() > -1) {
        next();
    } else {
        next(new Error("Invalid service " + req.params.service));
    }
}

/**
 * Checks for existence of a given username in a given service
 * 
 * @param {string} serviceName the name of the service
 * @param {string} value the username value to check
 * returns {Promise<boolean>} if the value exists in the service
 */
function serviceExists (serviceName, value) {
    return avails[serviceName](value);
}

/**
 * Checks for existence of a given username in all services
 * 
 * @param {string} serviceName the name of the service
 * @param {string} value the username value to check
 * returns {Promise<{string:boolean}>} of serviceName : existence
 */
function queryAll(value) {
    // create an array of promises
    let proms = [];
    
    // iterate all the avails
    for (var serviceName in avails) {
        let prom = avails[serviceName](value).then((res) => {
            let resObj = {};
            resObj[serviceName] = res;
            return resObj;
        });
        
        proms.push(prom);
    }
    
    // when all proms have resolved
    return Promise.all(proms).then((avail) => {
        return {
            username: value,
            availability: avail
        };
    });
}

// export our behavior
module.exports = exports = {
    isService : isService,
    serviceExists : serviceExists,
    queryAll : queryAll
};