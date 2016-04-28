/// <reference path="../../typings/bluebird/bluebird.d.ts" />
/// <reference path="../../typings/request-promise/request-promise.d.ts" />

const Promise = require('bluebird');
const request = require('request-promise');

// helper function to determine if a web response looks good or not
function isGood(res) {
    return typeof(res) === "undefined" || res.statusCode === 404;
}

// all the supported availability checkers we support
// each checker should return a Promise<boolean>
const avails = {
    "github": (username) => {
        
        // check to see if github.com/username returns a 404, or something else.
        return request.get(`https://github.com/${username}`, {
            simple: false,
            transform: (b, res) => {
                return isGood(res);
            }
        });
    },
    "dot-com": (username) => {
        // check to see if username.com returns a 404, nothing, or something else.
        return request.get(`http://${username}.com`, {
            simple: false,
            transform: (b, res) => {
                return isGood(res);
            }
        }).catch((err) => {
            return false;
        });
    },
    "twitter": (username) => {
        // check to see if twitter.com/username returns a 404, nothing, or something else.
        return request.get(`https://twitter.com/${username}`, {
            simple: false,
            transform: (b, res) => {
                return isGood(res);
            }
        });
    },
    "linkedin": (username) => {
        // check to see if linkedin.com/in/username returns a 404, nothing, or something else.
        return request.get(`https://linkedin.com/in/${username}`, {
            simple: false,
            transform: (b, res) => {
                return isGood(res);
            }
        });
    },
    "facebook": (username) => {
        // check to see if facebook.com/username returns a 404, nothing, or something else.
        // since facebook blocks requests from non-browsers, we pretend to be chrome
        return request.get(`https://twitter.com/${username}`, {
            simple: false,
            transform: (b, res) => {
                return isGood(res);
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36'
            }
        });
    }
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
        
        // see huge comment below - looked weird up here.
        proms.push(avails[serviceName](value).then(
            (function (result) {
                var wrap = {};
                wrap[this] = result;
                return wrap;
            }).bind(serviceName)
        ));
        // this is a little hairy so let's break it down.
        // first, we see that we're going to add something to the proms array
        // that something is the result of the following:
        //      we lookup serviceName in the avails object
        //      it's a function, that we call, passing value
        //      all of those functions return a promise<boolean>
        // we attach some logic to run when that promise<boolean> is resolving
        // the attached logic is a function, where the value of `this` is bound
        // to a particular value of `serviceName` (a copy of serviceName at that point in time)
        // inside that function, we create an object literal, set a property on it where that
        // property is the value of this (which, recall, is a copy of serviceName at particular point in time)
        // and we set the value of that property to result (which is what the promise<boolean> resolves to)
        //
        // the end result will make proms an array of Promise<boolean>'s that resolve, and then become
        // Promise<Object> where the inner object has a property with a value
        // when it all comes together at runtime, this is roughly:
        /*
            [
                {
                    github: true
                }, {
                    facebook: true
                },
                ...
            ]
        */
        // when everything resolves. we process that structure below, inside the .then for the Promise.all call
    }
    
    // when all proms have resolved, process their data (see above)
    return Promise.all(proms).then((results) => {
        var resObj = {};
        
        // since each object in results looks like:
        /*
            {
                service: boolean
            }
        */
        // we want to create one value that looks like:
        /*
            {
                serviceOne: boolean,
                serviceTwo: boolean,
                ...
            }
        */
        // so we do that here
        results.forEach((res) => {
            for (var prop in res) {
                resObj[prop] = res[prop];
            }
        });
        
        // finally, we respond
        return {
            username: value,
            availability: resObj
        };
    });
}

// export our behavior
module.exports = exports = {
    isService : isService,
    serviceExists : serviceExists,
    queryAll : queryAll
};